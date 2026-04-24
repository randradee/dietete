import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Card,
    InputText,
    Password,
    Button,
    Toast,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast />
    <div class="page-container">
      <p-card class="auth-card">
        <ng-template #title>DieTete</ng-template>
        <ng-template #subtitle>Faça login para continuar</ng-template>

        <form [formGroup]="form" (ngSubmit)="entrar()" class="auth-form">
          <div class="field">
            <label for="email" class="field-label">E-mail</label>
            <input
              pInputText
              id="email"
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              autocomplete="email"
              class="full-width"
            />
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <small class="field-error">E-mail é obrigatório</small>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <small class="field-error">E-mail inválido</small>
            }
          </div>

          <div class="field">
            <label for="senha" class="field-label">Senha</label>
            <p-password
              inputId="senha"
              formControlName="senha"
              [feedback]="false"
              [toggleMask]="true"
              [fluid]="true"
              autocomplete="current-password"
            />
            @if (form.get('senha')?.hasError('required') && form.get('senha')?.touched) {
              <small class="field-error">Senha é obrigatória</small>
            }
          </div>

          <p-button
            label="Entrar"
            type="submit"
            [loading]="carregando()"
            [fluid]="true"
            styleClass="submit-btn"
          />
        </form>

        <ng-template #footer>
          <p class="register-link">
            Não tem conta?
            <a routerLink="/auth/registrar">Registre-se</a>
          </p>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`
    .page-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 16px;
      background: #f5f5f5;
    }
    .auth-card {
      width: 100%;
      max-width: 400px;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .field-label {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .field-error {
      color: #e53935;
      font-size: 0.75rem;
    }
    .full-width {
      width: 100%;
    }
    .submit-btn {
      margin-top: 4px;
    }
    .register-link {
      text-align: center;
      margin: 0;
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly carregando = signal(false);

  readonly form: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);

    const { email, senha } = this.form.value;

    this.authService.entrar({ email, senha }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/lista-compras']);
      },
      error: (err) => {
        this.carregando.set(false);
        const mensagem =
          err.status === 401 || err.status === 400
            ? 'E-mail ou senha inválidos.'
            : 'Erro ao conectar. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: mensagem,
        });
      },
    });
  }
}
