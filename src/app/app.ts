import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  OnInit,
  computed,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import moment from 'moment';
import { Machine } from './machines/machine';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { FormsModule } from '@angular/forms';

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
  ) {}

  // Browser-only CKEditor load + API fetch
  async ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const ClassicEditor = await import('@ckeditor/ckeditor5-build-classic');
      this.Editor = ClassicEditor.default;
    }

    // Fetch machine list
    this.machineMachines.getMachineList().subscribe((data: any) => {
      this.machineList.set(data.value || []);
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // Only run in browser

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
      machine.Name?.toLowerCase().includes(this.searchText().toLowerCase()),
    );
  });

  firstTableMachines = computed(() => this.filteredMachineList().slice(0, 40));
  secondTableMachines = computed(() => this.filteredMachineList().slice(40, 80));

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
}
