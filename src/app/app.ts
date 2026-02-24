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
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import moment from 'moment';
import { Machine } from './machines/machine';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule } from '@angular/forms';
import { ViewChild, ElementRef } from '@angular/core';
import { log } from 'console';

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
  // moment clock
  currentTime = '';

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
    private ngZone: NgZone
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

  newMachine:any = { name: '', custom_id: '', is_active: true, is_imported_from_erp: false };
  openDialog() {
    this.newMachineDialog.nativeElement.open = true;
  }

  closeDialog() {
    this.newMachineDialog.nativeElement.open = false;
  }

onMachineNameInput(event: Event) {
  const inputEvent = event as CustomEvent<{ value: string }>;
  this.newMachine.name = inputEvent.detail.value;
}

onMachineCustomIdInput(event: Event) {
  const inputEvent = event as CustomEvent<{ value: string }>;
  this.newMachine.custom_id = inputEvent.detail.value;
}

addMachine(e: any) {
  console.log(e);
  
  // if (!this.newMachine.name || !this.newMachine.custom_id) return;

  const payload = {
    name: this.newMachine.name,
    custom_id: this.newMachine.custom_id,
    is_active: this.newMachine.is_active,
    is_imported_from_erp: this.newMachine.is_imported_from_erp
  };

  console.log('Trying to add machine:', payload);

  // this.machineMachines.addMachine(payload).subscribe({
  //   next: (res: any) => {
  //     console.log('Machine added successfully', res);
  //     this.machineList.update((list) => [...list, res]);

  //     this.cdr.detectChanges();

  //     this.newMachine = { name: '', custom_id: '', is_active: true , is_imported_from_erp: false};

  //     this.closeDialog();
  //   },
  //   error: (err) => console.error('Failed to add machine', err),
  // });
}

  // delete row
  deleteMachine(machine: any) {
    this.machineMachines.deleteMachine(machine.id).subscribe(() => {
      this.refreshMachines();
    });
  }

 refreshMachines() {
  this.machineMachines.getMachineList().subscribe({
    next: (data: any) => {
      console.log('Fetched machines:', data.value || []);
      this.machineList.set(data.value || []);
    },
    error: (err) => console.error('Failed to fetch machines', err),
  });
}

  // switch change
//  onSwitchChange(event: Event) {
//   const customEvent = event as CustomEvent<{ checked: boolean }>;
//   this.newMachine.is_active = customEvent.detail.checked;
// }

// onImportedChange(event: Event) {
//   const switchEvent = event as CustomEvent<{ checked: boolean }>;
//   this.newMachine.is_imported_from_erp = switchEvent.detail.checked;
// }
}
