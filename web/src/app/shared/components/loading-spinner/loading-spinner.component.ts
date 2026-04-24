import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [ProgressSpinner],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="spinner-container">
      <p-progress-spinner strokeWidth="4" />
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 24px;
    }
  `],
})
export class LoadingSpinnerComponent {}
