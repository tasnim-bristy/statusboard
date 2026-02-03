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
import { Machine } from './machines/machine';

interface UI5InputEvent extends Event {
  detail: {
    value: string;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App implements AfterViewInit, OnInit {
  protected readonly title = signal('Statusboard');
  machineList = signal<any[]>([]); // Machine array

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private machineMachines: Machine,
  ) {}

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

  ngOnInit() {
    this.machineMachines.getMachineList().subscribe((data: any) => {
      console.log(data);
      this.machineList.set(data.value || []);
    });
  }
  filteredMachineList = computed(() => {
    if (!this.searchText()) {
      return this.machineList();
    }
    return this.machineList().filter((machine) =>
      machine.Name?.toLowerCase().includes(this.searchText().toLowerCase()),
    );
  });

  firstTableMachines = computed(() => {
    return this.filteredMachineList().slice(1, 40);
  });

  secondTableMachines = computed(() => {
    return this.filteredMachineList().slice(40, 80);
  });
  searchText = signal('');
  onSearchInput(event: Event) {
    const ui5Event = event as UI5InputEvent;
    this.searchText.set(ui5Event.detail.value);
  }
}
