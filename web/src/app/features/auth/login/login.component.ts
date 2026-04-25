import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen">
      <div class="hero">
        <div class="hring" style="width:300px;height:300px;top:-90px;left:10px"></div>
        <div class="hring" style="width:200px;height:200px;top:-55px;left:60px"></div>
        <span class="logotype">Die<em>tete</em></span>
        <span class="tagline">nutrição · bem-estar</span>
      </div>

      <div class="fbody">
        <p class="eyebrow">Bem-vinda de volta</p>

        @if (erro()) {
          <div class="error-banner">{{ erro() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="entrar()">
          <div class="field">
            <label class="flabel">E-mail</label>
            <div class="fw">
              <input
                class="finput"
                type="email"
                formControlName="email"
                autocomplete="email"
                placeholder="seu@email.com"
              />
              <span class="fic">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="#c0b8ae" stroke-width="1.3"/>
                  <path d="M1 5l7 5 7-5" stroke="#c0b8ae" stroke-width="1.3" stroke-linecap="round"/>
                </svg>
              </span>
            </div>
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <small class="ferror">E-mail é obrigatório</small>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <small class="ferror">E-mail inválido</small>
            }
          </div>

          <div class="field">
            <label class="flabel">Senha</label>
            <div class="fw">
              <input
                class="finput"
                [type]="mostrarSenha() ? 'text' : 'password'"
                formControlName="senha"
                autocomplete="current-password"
                placeholder="••••••••"
              />
              <button type="button" class="fic fic-btn" (click)="mostrarSenha.set(!mostrarSenha())">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <ellipse cx="8" cy="8" rx="7" ry="5" stroke="#c0b8ae" stroke-width="1.3"/>
                  <circle cx="8" cy="8" r="2" fill="#c0b8ae"/>
                </svg>
              </button>
            </div>
            @if (form.get('senha')?.hasError('required') && form.get('senha')?.touched) {
              <small class="ferror">Senha é obrigatória</small>
            }
          </div>

          <a class="forgot" href="#">Esqueci a senha</a>

          <button type="submit" class="btn-primary" [disabled]="carregando()">
            @if (carregando()) {
              Entrando...
            } @else {
              Entrar
              <span class="btn-arr">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="#e8f5dc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            }
          </button>
        </form>

        <div class="sep">
          <div class="sep-line"></div>
          <span class="sep-txt">ou continue com</span>
          <div class="sep-line"></div>
        </div>

        <button type="button" class="btn-social">
          <svg width="15" height="15" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>

        <div class="footer-row">
          Não tem conta? <a routerLink="/auth/registrar">Criar agora</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--dt-cream);
    }

    .hero {
      background: var(--dt-green-800);
      padding: 36px 24px 50px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 36px;
      background: var(--dt-cream);
      border-radius: 32px 32px 0 0;
    }
    .hring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.07);
    }
    .logotype {
      font-family: 'Cormorant Garamond', serif;
      font-size: 38px;
      font-weight: 600;
      letter-spacing: .04em;
      position: relative;
      z-index: 1;
      display: block;
      color: #fff;
    }
    .logotype em { font-style: italic; color: var(--dt-green-200); }
    .tagline {
      font-size: 10px;
      font-weight: 300;
      letter-spacing: .15em;
      text-transform: uppercase;
      margin-top: 6px;
      position: relative;
      z-index: 1;
      display: block;
      color: rgba(255,255,255,.38);
    }

    .fbody {
      background: var(--dt-cream);
      padding: 20px 22px 32px;
      flex: 1;
    }
    .eyebrow {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: .12em;
      text-transform: uppercase;
      text-align: center;
      color: var(--dt-muted);
      margin-bottom: 18px;
    }
    .error-banner {
      background: #fff0f0;
      border: 1px solid #fcc;
      color: #b00;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 14px;
    }
    .field {
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .flabel {
      font-size: 9.5px;
      font-weight: 500;
      letter-spacing: .07em;
      text-transform: uppercase;
      color: var(--dt-text-3);
    }
    .fw { position: relative; }
    .finput {
      display: block;
      width: 100%;
      height: 48px;
      border-radius: 13px;
      padding: 0 44px 0 14px;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      border: 1.5px solid var(--dt-cream-3);
      background: var(--dt-white);
      color: var(--dt-text);
    }
    .finput:focus { border-color: var(--dt-green-600); }
    .fic {
      position: absolute;
      right: 13px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      display: flex;
      align-items: center;
    }
    .fic-btn {
      background: none;
      border: none;
      cursor: pointer;
      pointer-events: auto;
    }
    .ferror { color: #b45309; font-size: 11px; }
    .forgot {
      display: block;
      text-align: right;
      margin: 2px 0 16px;
      font-size: 11px;
      color: var(--dt-green-600);
      text-decoration: none;
      font-weight: 500;
    }
    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 9px;
      width: 100%;
      height: 50px;
      border-radius: 13px;
      background: var(--dt-green-800);
      border: none;
      color: var(--dt-green-50);
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-primary:hover:not(:disabled) { background: var(--dt-green-700); }
    .btn-primary:disabled { opacity: .6; cursor: not-allowed; }
    .btn-arr {
      width: 22px; height: 22px;
      border-radius: 50%;
      background: rgba(255,255,255,.15);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .sep {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 14px 0;
    }
    .sep-line { flex: 1; height: 1px; background: var(--dt-cream-3); }
    .sep-txt { font-size: 10.5px; color: #bdb5aa; }
    .btn-social {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      height: 46px;
      border-radius: 13px;
      border: 1.5px solid var(--dt-cream-3);
      background: var(--dt-white);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: var(--dt-text-2);
      cursor: pointer;
    }
    .footer-row {
      text-align: center;
      margin-top: 14px;
      font-size: 11.5px;
      color: #9a9288;
    }
    .footer-row a {
      color: var(--dt-green-800);
      font-weight: 500;
      text-decoration: none;
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly mostrarSenha = signal(false);

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
    this.erro.set(null);
    const { email, senha } = this.form.value;
    this.authService.entrar({ email, senha }).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(
          err.status === 401 || err.status === 400
            ? 'E-mail ou senha inválidos.'
            : 'Erro ao conectar. Tente novamente.'
        );
      },
    });
  }
}
