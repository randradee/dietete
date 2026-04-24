import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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

const senhasIguaisValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const senha = control.get('senha');
  const confirmacaoSenha = control.get('confirmacaoSenha');
  if (senha && confirmacaoSenha && senha.value !== confirmacaoSenha.value) {
    confirmacaoSenha.setErrors({ senhasDiferentes: true });
    return { senhasDiferentes: true };
  }
  return null;
};

@Component({
  selector: 'app-register',
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
        <ng-template #subtitle>Crie sua conta</ng-template>

        <form [formGroup]="form" (ngSubmit)="registrar()" class="auth-form">
          <div class="field">
            <label for="nomeCompleto" class="field-label">Nome completo</label>
            <input
              pInputText
              id="nomeCompleto"
              type="text"
              formControlName="nomeCompleto"
              placeholder="Seu nome completo"
              autocomplete="name"
              class="full-width"
            />
            @if (form.get('nomeCompleto')?.hasError('required') && form.get('nomeCompleto')?.touched) {
              <small class="field-error">Nome é obrigatório</small>
            }
            @if (form.get('nomeCompleto')?.hasError('minlength') && form.get('nomeCompleto')?.touched) {
              <small class="field-error">Nome deve ter pelo menos 3 caracteres</small>
            }
          </div>

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
              [feedback]="true"
              [toggleMask]="true"
              [fluid]="true"
              autocomplete="new-password"
            />
            @if (form.get('senha')?.hasError('required') && form.get('senha')?.touched) {
              <small class="field-error">Senha é obrigatória</small>
            }
            @if (form.get('senha')?.hasError('minlength') && form.get('senha')?.touched) {
              <small class="field-error">Senha deve ter pelo menos 6 caracteres</small>
            }
          </div>

          <div class="field">
            <label for="confirmacaoSenha" class="field-label">Confirmar senha</label>
            <p-password
              inputId="confirmacaoSenha"
              formControlName="confirmacaoSenha"
              [feedback]="false"
              [toggleMask]="true"
              [fluid]="true"
              autocomplete="new-password"
            />
            @if (form.get('confirmacaoSenha')?.hasError('required') && form.get('confirmacaoSenha')?.touched) {
              <small class="field-error">Confirmação de senha é obrigatória</small>
            }
            @if (form.get('confirmacaoSenha')?.hasError('senhasDiferentes') && form.get('confirmacaoSenha')?.touched) {
              <small class="field-error">As senhas não coincidem</small>
            }
          </div>

          <p-button
            label="Registrar"
            type="submit"
            [loading]="carregando()"
            [fluid]="true"
            styleClass="submit-btn"
          />
        </form>

        <ng-template #footer>
          <p class="login-link">
            Já tem conta?
            <a routerLink="/auth/login">Faça login</a>
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
      max-width: 440px;
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
    .login-link {
      text-align: center;
      margin: 0;
    }
  `],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly carregando = signal(false);

  readonly form: FormGroup = this.fb.group(
    {
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmacaoSenha: ['', Validators.required],
    },
    { validators: senhasIguaisValidator }
  );

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);

    const { nomeCompleto, email, senha, confirmacaoSenha } = this.form.value;

    this.authService
      .registrar({ nomeCompleto, email, senha, confirmacaoSenha })
      .subscribe({
        next: () => {
          this.carregando.set(false);
          this.router.navigate(['/lista-compras']);
        },
        error: (err) => {
          this.carregando.set(false);
          const mensagem =
            err.status === 409
              ? 'E-mail já cadastrado.'
              : err.error?.detail ?? 'Erro ao registrar. Tente novamente.';
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: mensagem,
          });
        },
      });
  }
}
