import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Toolbar } from 'primeng/toolbar';
import { Button } from 'primeng/button';
import { AuthService } from '../../../core/auth/services/auth.service';
import { LayoutService } from '../../../core/layout/layout.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Toolbar, Button, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toolbar styleClass="header-toolbar">
      <ng-template #start>
        @if (authService.estaLogado()) {
          <p-button
            icon="pi pi-bars"
            variant="text"
            severity="secondary"
            title="Menu"
            (onClick)="layout.toggleSidebar()"
          />
        }
        <span class="logo">DieTete</span>

        @if (authService.estaLogado()) {
          <nav class="nav-links">
            <p-button
              label="Lista de Compras"
              icon="pi pi-shopping-cart"
              variant="text"
              routerLink="/lista-compras"
            />
            <p-button
              label="Enviar Dieta"
              icon="pi pi-upload"
              variant="text"
              routerLink="/dieta/enviar"
            />
          </nav>
        }
      </ng-template>

      <ng-template #end>
        @if (authService.estaLogado()) {
          <span class="usuario-nome">{{ authService.nomeUsuario() }}</span>
          <p-button
            icon="pi pi-sign-out"
            variant="text"
            title="Sair"
            (onClick)="sair()"
          />
        }
      </ng-template>
    </p-toolbar>
  `,
  styles: [`
    .header-toolbar {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
    }
    .logo {
      font-size: 1.4rem;
      font-weight: bold;
      letter-spacing: 1px;
      margin: 0 8px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      margin-left: 8px;
    }
    .usuario-nome {
      margin-right: 8px;
      font-size: 0.9rem;
    }
  `],
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly layout = inject(LayoutService);
  private readonly router = inject(Router);

  sair(): void {
    this.authService.sair();
  }
}
