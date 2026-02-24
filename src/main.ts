import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

// Import UI5 web components
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Bar.js";
import "@ui5/webcomponents/dist/DateTimePicker.js";
import "@ui5/webcomponents-icons/dist/menu2.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/Option.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";
import "@ui5/webcomponents-fiori/dist/SideNavigation.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents-icons/dist/employee.js";
import "@ui5/webcomponents-icons/dist/image-viewer.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-icons/dist/media-play.js";
import "@ui5/webcomponents-icons/dist/time-entry-request.js";
import "@ui5/webcomponents-icons/dist/time-account.js";
import "@ui5/webcomponents-icons/dist/stop.js";
import "@ui5/webcomponents-icons/dist/refresh.js";
import "@ui5/webcomponents-icons/dist/search.js";
import "@ui5/webcomponents-icons/dist/navigation-down-arrow.js";
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableGrowing.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents-icons/dist/hint.js";
import "@ui5/webcomponents-icons/dist/fob-watch.js";
import "@ui5/webcomponents-icons/dist/play.js";
import "@ui5/webcomponents-icons/dist/past.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents/dist/Text.js";
import "@ui5/webcomponents/dist/Slider.js";
import "@ui5/webcomponents/dist/TextArea.js";
import "@ui5/webcomponents-icons/dist/information.js";
import "@ui5/webcomponents/dist/SegmentedButton.js";
import "@ui5/webcomponents/dist/SegmentedButtonItem.js";
import "@ui5/webcomponents-icons/dist/bold-text.js";
import "@ui5/webcomponents-icons/dist/underline-text.js";
import "@ui5/webcomponents-icons/dist/italic-text.js";
import "@ui5/webcomponents-icons/dist/undo.js";
import "@ui5/webcomponents-icons/dist/redo.js";
import "@ui5/webcomponents-icons/dist/future.js";
import "@ui5/webcomponents-icons/dist/date-time.js";
import "@ui5/webcomponents-icons/dist/pending.js";
import "@ui5/webcomponents/dist/Menu.js";
import "@ui5/webcomponents/dist/MenuItem.js";
import "@ui5/webcomponents/dist/MenuSeparator.js";
import "@ui5/webcomponents-icons/dist/edit.js";
import "@ui5/webcomponents-icons/dist/delete.js";
import "@ui5/webcomponents/dist/Dialog.js";
import "@ui5/webcomponents/dist/Toolbar.js"
import "@ui5/webcomponents/dist/ToolbarButton.js"
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/decline.js";
import "@ui5/webcomponents/dist/Switch";


bootstrapApplication(App, {
  providers: [
    provideRouter([])
  ]
}).catch(err => console.error(err));


