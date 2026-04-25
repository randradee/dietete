import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
  styles: [`
    :host {
      display: block;
      max-width: 480px;
      margin: 0 auto;
      min-height: 100vh;
      background: var(--dt-cream);
      box-shadow: 0 0 40px rgba(0,0,0,.08);
      position: relative;
    }
  `],
})
export class App {}
