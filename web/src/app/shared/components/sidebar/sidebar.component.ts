import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { LayoutService } from '../../../core/layout/layout.service';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Button, Divider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (layout.sidebarAberta()) {
      <div class="sidebar-overlay" (click)="fechar()" aria-hidden="true"></div>
    }

    <aside class="sidebar" [class.sidebar--aberta]="layout.sidebarAberta()">
      <div class="sidebar-header">
        <span class="sidebar-logo">DieTete</span>
        <p-button
          icon="pi pi-times"
          variant="text"
          severity="secondary"
          size="small"
          title="Fechar menu"
          (onClick)="fechar()"
        />
      </div>

      <p-divider />

      @if (auth.estaLogado()) {
        <nav class="sidebar-nav">
          <a
            class="nav-item"
            routerLink="/lista-compras"
            routerLinkActive="nav-item--ativo"
            (click)="fechar()"
          >
            <i class="pi pi-shopping-cart"></i>
            <span>Lista de Compras</span>
          </a>
          <a
            class="nav-item"
            routerLink="/dieta/enviar"
            routerLinkActive="nav-item--ativo"
            (click)="fechar()"
          >
            <i class="pi pi-upload"></i>
            <span>Enviar Dieta</span>
          </a>
          <a
            class="nav-item"
            routerLink="/dieta/revisar"
            routerLinkActive="nav-item--ativo"
            (click)="fechar()"
          >
            <i class="pi pi-list-check"></i>
            <span>Revisar Dieta</span>
          </a>
        </nav>

        <p-divider />

        <div class="sidebar-usuario">
          <i class="pi pi-user"></i>
          <span class="usuario-nome">{{ auth.nomeUsuario() }}</span>
        </div>
      }
    </aside>
  `,
  styles: [`
    .sidebar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.4);
      z-index: 999;
    }
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 260px;
      background: var(--p-surface-0, #fff);
      box-shadow: 4px 0 16px rgba(0,0,0,.12);
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform .25s ease;
      display: flex;
      flex-direction: column;
    }
    .sidebar--aberta {
      transform: translateX(0);
    }
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 4px;
    }
    .sidebar-logo {
      font-size: 1.3rem;
      font-weight: bold;
      letter-spacing: 1px;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      padding: 4px 8px;
      gap: 2px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      text-decoration: none;
      color: var(--p-text-color, #212121);
      font-size: 0.95rem;
      transition: background .15s;
    }
    .nav-item:hover {
      background: var(--p-surface-100, #f5f5f5);
    }
    .nav-item--ativo {
      background: var(--p-primary-50, #e3f2fd);
      color: var(--p-primary-color, #1976d2);
      font-weight: 500;
    }
    .nav-item--ativo i {
      color: var(--p-primary-color, #1976d2);
    }
    .sidebar-usuario {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 20px 16px;
      font-size: 0.875rem;
      color: var(--p-text-muted-color, #757575);
    }
  `],
})
export class SidebarComponent {
  readonly layout = inject(LayoutService);
  readonly auth = inject(AuthService);

  fechar(): void {
    this.layout.fecharSidebar();
  }
}
