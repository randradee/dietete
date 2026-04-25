import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type NavItem = 'inicio' | 'dieta' | 'compras' | 'perfil';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bnav">
      <a class="bni" [class.active]="active() === 'inicio'" routerLink="/dashboard">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>Início</span>
        @if (active() === 'inicio') { <span class="dot"></span> }
      </a>
      <a class="bni" [class.active]="active() === 'dieta'" routerLink="/dieta/enviar">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <span>Dieta</span>
        @if (active() === 'dieta') { <span class="dot"></span> }
      </a>
      <a class="bni" [class.active]="active() === 'compras'" routerLink="/lista-compras">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
        </svg>
        <span>Compras</span>
        @if (active() === 'compras') { <span class="dot"></span> }
      </a>
      <a class="bni" [class.active]="active() === 'perfil'" routerLink="/perfil">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <span>Perfil</span>
        @if (active() === 'perfil') { <span class="dot"></span> }
      </a>
    </nav>
  `,
  styles: [`
    .bnav {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-bottom: 4px;
      border-top: 0.5px solid var(--dt-cream-3);
      background: var(--dt-cream);
    }
    .bni {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-decoration: none;
      color: var(--dt-muted);
    }
    .icon { width: 20px; height: 20px; }
    span { font-size: 9.5px; font-weight: 500; }
    .bni.active { color: var(--dt-green-600); }
    .dot {
      width: 4px; height: 4px;
      border-radius: 50%;
      background: var(--dt-green-600);
    }
  `],
})
export class BottomNavComponent {
  readonly active = input<NavItem>('inicio');
}
