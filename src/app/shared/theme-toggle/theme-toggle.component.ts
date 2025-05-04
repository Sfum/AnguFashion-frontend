import { Component } from '@angular/core';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button class="padding--md" (click)="toggleTheme()">Toggle Dark Mode</button>
  `,
  styleUrls: ['./theme-toggle.component.sass'],
})
export class ThemeToggleComponent {
  darkMode = false;

  toggleTheme() {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}
