import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  OnInit,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import moment from 'moment';
import { Machine } from './machines/machine';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule, NgForm } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import { log } from 'console';
// import { Ui5WebcomponentsModule } from '@ui5/webcomponents-ngx';

interface UI5InputEvent extends Event {
  detail: { value: string };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, CKEditorModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App implements AfterViewInit, OnInit {
  @ViewChild('createOrUpdateForm') form?: NgForm;
  currentTime = '';
  // inside App component
  public newMachine = {
    name: '',
    custom_id: '',
    is_active: true,
    is_imported_from_erp: false,
  };

  updateTime() {
    this.currentTime = moment().format('DD.MM.YYYY, HH:mm');
    this.cdr.detectChanges();
  }

  // menu button
  @ViewChild('btnOpenBasic', { static: false })
  btnRef!: ElementRef;

  @ViewChild('menuBasic', { static: false })
  menuRef!: ElementRef;

  openMenu() {
    const btn = this.btnRef.nativeElement;
    const menu = this.menuRef.nativeElement;

    if (btn && menu) {
      menu.showAt(btn);
    }
  }
  // Signals
  protected readonly title = signal('Statusboard');
  machineList = signal<any[]>([]);
  searchText = signal('');

  // CKEditor
  public Editor: any = null;
  //  public data: string = `Abram Elias: This task focuses on analyzing requirements and implementing the <br> necessary design and functional updates to improve overall system usability and clarity. <br> The goal is to ensure the task aligns with business objectives while maintaining with <br> existing design standards and workflows.<br> <br> The work includes reviewing current screen processes, identifying gaps or usability <br> issues, and proposing clear, user-friendly solutions. Coordination with stakeholders and <br> developers may be required to validate assumptions, finalize specifications, and ensure <br> smooth implementation within the defined timeline.<br> <br> Here are some points we discussed: <br> <br> • Support developers during implementation if clarification is needed <br> • Analyze current workflow system behavior.` ;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private machineMachines: Machine,
    private cdr: ChangeDetectorRef,
  ) {}

  // Browser-only CKEditor load + API fetch
  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const ClassicEditor = await import('@ckeditor/ckeditor5-build-classic');
      this.Editor = ClassicEditor.default;
    }

    // Fetch machine list
    this.refreshMachines();

    // moment datepicker
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const menuButton = document.getElementById('menuButton') as HTMLElement | null;
    const myMenu = document.getElementById('myMenu') as HTMLElement | null;
    if (!menuButton || !myMenu) return;

    type UI5ButtonElement = HTMLElement & { accessibilityAttributes: any };
    type UI5MenuElement = HTMLElement & { opener?: HTMLElement; open?: boolean };

    const menuBtn = menuButton as UI5ButtonElement;
    const menuEl = myMenu as UI5MenuElement;

    function openMenu(menu: UI5MenuElement, opener: UI5ButtonElement) {
      opener.accessibilityAttributes = { hasPopup: 'menu', expanded: true };
      menu.opener = opener;
      menu.open = true;
    }

    function closeMenu(opener: UI5ButtonElement) {
      opener.accessibilityAttributes = { hasPopup: 'menu', expanded: false };
      opener.focus();
    }

    menuBtn.addEventListener('click', () => openMenu(menuEl, menuBtn));
    menuBtn.addEventListener('keydown', (event: KeyboardEvent) => {
      const F4Key =
        !event.altKey && !event.shiftKey && !event.metaKey && !event.ctrlKey && event.key === 'F4';
      const AltArrowDownKey = event.altKey && event.key === 'ArrowDown';
      const AltArrowUpKey = event.altKey && event.key === 'ArrowUp';

      if (F4Key || AltArrowDownKey || AltArrowUpKey) {
        openMenu(menuEl, menuBtn);
      }
    });

    menuEl.addEventListener('close', () => closeMenu(menuBtn));
  }

  // Computed machine lists
  filteredMachineList = computed(() => {
    if (!this.searchText()) return this.machineList();
    return this.machineList().filter((machine) =>
      machine.name?.toLowerCase().includes(this.searchText().toLowerCase()),
    );
  });

  firstTableMachines = computed(() => this.filteredMachineList().slice(0, 20));
  secondTableMachines = computed(() => this.filteredMachineList().slice(0, 20));

  // Search input
  onSearchInput(event: Event) {
    const ui5Event = event as UI5InputEvent;
    this.searchText.set(ui5Event.detail.value);
  }

  // Date & time helpers
  getFormattedDate(date?: string): string {
    if (!date) return '';
    return moment.utc(date).local().format('DD.MM.YY, hh:mm');
  }

  getElapsedTime(start?: string): string {
    if (!start) return '00:00 Hrs';

    const startMoment = moment(start);
    const now = moment();

    const startTime = moment({ hour: startMoment.hour(), minute: startMoment.minute() });
    const nowTime = moment({ hour: now.hour(), minute: now.minute() });

    let diffMinutes = nowTime.diff(startTime, 'minutes');
    if (diffMinutes < 0) diffMinutes = 0;

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} Hrs`;
  }

  getStartTime(date?: string): string {
    if (!date) return '00:00 Hrs';
    return moment.utc(date).local().format('HH:mm') + 'Hrs';
  }

  // dialog
  @ViewChild('newMachineDialog', { static: false })
  newMachineDialog!: ElementRef<any>;

  selectedMachineId: number | null = null;

  openDialog(machine?: any) {
    if (machine) {
      this.selectedMachineId = machine.id;
      this.newMachine = {
        name: machine.name,
        custom_id: machine.custom_id,
        is_active: machine.is_active,
        is_imported_from_erp: machine.is_imported_from_erp,
      };
    } else {
      this.selectedMachineId = null;
      this.newMachine = { name: '', custom_id: '', is_active: true, is_imported_from_erp: false };
    }

    this.cdr.detectChanges();
    this.newMachineDialog.nativeElement.open = true;
  }

  closeDialog() {
    this.selectedMachineId = null;
    this.newMachineDialog.nativeElement.open = false;
  }

  // onNameInput(event: any) {
  //   this.newMachine.name = (event.target as any).value;
  // }

  // onCustomIdInput(event: any) {
  //   this.newMachine.custom_id = (event.target as any).value;
  // }

  onNameInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.newMachine.name = target.value;
  }

  onCustomIdInput(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.newMachine.custom_id = target.value;
  }

  onSave() {
    (this.form as any).onSubmit(undefined);
  }

  onSubmit(form: NgForm) {
    if (this.selectedMachineId) {
      this.updateMachineData();
    } else {
      this.addMachine();
    }
  }

  // updateMachine
  updateMachineData() {
    const payload = {
      name: this.newMachine.name?.trim(),
      custom_id: this.newMachine.custom_id?.trim(),
      is_active: this.newMachine.is_active,
      is_imported_from_erp: this.newMachine.is_imported_from_erp,
    };

    if (!this.selectedMachineId) return;

    this.machineMachines.updateMachine(this.selectedMachineId, payload).subscribe({
      next: () => {
        this.refreshMachines();
        this.selectedMachineId = null;
        this.closeDialog();
      },
      error: (err) => console.error('Update failed:', err),
    });
  }

  // addMAchine
  addMachine() {
    const payload = {
      name: this.newMachine.name?.trim(),
      custom_id: this.newMachine.custom_id?.trim(),
      is_active: this.newMachine.is_active,
      is_imported_from_erp: this.newMachine.is_imported_from_erp,
    };

    console.log('Payload before sending:', payload);

    if (!payload.name || !payload.custom_id) {
      console.warn('Name or Custom ID missing');
      return;
    }

    this.machineMachines.addMachine(payload).subscribe({
      next: (res: any) => {
        this.machineList.update((list) => [...list, res]);
        this.newMachine = { name: '', custom_id: '', is_active: true, is_imported_from_erp: false };
        this.closeDialog();
      },
      error: (err) => console.error('Failed to add machine:', err),
    });
  }
  // delete row
  deleteMachine(machine: any) {
    this.machineMachines.deleteMachine(machine.id).subscribe(() => {
      this.refreshMachines();
    });
  }

  // delete dialog
  @ViewChild('deleteConfirmDialog', { static: false })
  deleteConfirmDialog!: ElementRef<any>;

  machineToDelete: any = null;

  openDeleteDialog(machine: any) {
    this.machineToDelete = machine;
    this.deleteConfirmDialog.nativeElement.open = true;
  }

  closeDeleteDialog() {
    this.machineToDelete = null;
    this.deleteConfirmDialog.nativeElement.open = false;
  }

  confirmDelete() {
    if (!this.machineToDelete) return;

    this.machineMachines.deleteMachine(this.machineToDelete.id).subscribe(() => {
      this.refreshMachines();
      this.closeDeleteDialog();
    });
  }

  refreshMachines() {
    this.machineMachines.getMachineList().subscribe({
      next: (data: any) => {
        console.log('Fetched machines:', data.value || []);
        this.machineList.set(data.value || []);
      },
    });
  }

  // switch change
  //  onSwitchChange(event: Event) {
  //   const customEvent = event as CustomEvent<{ checked: boolean }>;
  //   this.newMachine.is_active = (customEvent.target as any).checked;
  // }

  // onImportedChange(event: Event) {
  //   const switchEvent = event as CustomEvent<{ checked: boolean }>;
  //   this.newMachine.is_imported_from_erp = (switchEvent.target as any).checked;
  // }

  onSwitchChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.newMachine.is_active = target.checked;
  }

  onImportedChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) this.newMachine.is_imported_from_erp = target.checked;
  }
}
