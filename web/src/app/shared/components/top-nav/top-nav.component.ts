import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="tnav">
      <button class="back-btn" type="button" (click)="voltar.emit()">
        <svg width="8" height="13" viewBox="0 0 8 14" fill="none">
          <path d="M7 1L1 7l6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <span class="title">{{ title() }}</span>
    </header>
  `,
  styles: [`
    .tnav {
      height: 54px;
      display: flex;
      align-items: center;
      padding: 0 16px;
      gap: 11px;
      border-bottom: 0.5px solid var(--dt-cream-3);
      background: var(--dt-cream);
    }
    .back-btn {
      width: 32px; height: 32px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      background: var(--dt-cream-2);
      border: 0.5px solid var(--dt-cream-3);
      cursor: pointer;
      color: var(--dt-text-2);
    }
    .title {
      font-size: 14.5px;
      font-weight: 500;
      color: var(--dt-text);
    }
  `],
})
export class TopNavComponent {
  readonly title = input('');
  readonly voltar = output<void>();
}
