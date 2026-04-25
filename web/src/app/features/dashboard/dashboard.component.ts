import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { environment } from '../../../environments/environment';

interface RefeicaoItem {
  id: string;
  nome: string;
  descricao: string;
  kcal: number;
  progresso: number;
  emoji: string;
}

interface MacroPlan {
  kcal: number;
  proteina: number;
  gordura: number;
  carbo: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen">
      <!-- Header strip -->
      <div class="hstrip">
        <div class="greet-row">
          <div>
            <div class="greet-name">Olá, <em>{{ primeiroNome() }}</em></div>
            <div class="greet-sub">{{ dataHoje() }}</div>
          </div>
          <div class="av-wrap">
            <button class="av" (click)="menuAberto.set(!menuAberto())" type="button">
              {{ iniciais() }}
            </button>
            @if (menuAberto()) {
              <div class="av-menu">
                <div class="av-menu-nome">{{ authService.nomeUsuario() }}</div>
                <div class="av-menu-email">{{ authService.usuarioAtual()?.email }}</div>
                <div class="av-menu-sep"></div>
                <button class="av-menu-sair" (click)="sair()" type="button">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sair
                </button>
              </div>
            }
          </div>
        </div>
        <div class="macros">
          @if (macros()) {
            <div class="macro">
              <span class="macro-v">{{ macros()!.kcal }}</span>
              <span class="macro-lb">kcal</span>
            </div>
            <div class="macro">
              <span class="macro-v">{{ macros()!.proteina }}g</span>
              <span class="macro-lb">proteína</span>
            </div>
            <div class="macro">
              <span class="macro-v">{{ macros()!.gordura }}g</span>
              <span class="macro-lb">gordura</span>
            </div>
            <div class="macro">
              <span class="macro-v">{{ macros()!.carbo }}g</span>
              <span class="macro-lb">carbo</span>
            </div>
          } @else {
            @for (lb of ['kcal','proteína','gordura','carbo']; track lb) {
              <div class="macro">
                <span class="macro-v">—</span>
                <span class="macro-lb">{{ lb }}</span>
              </div>
            }
          }
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="shead">
          <span class="stitle">Refeições de hoje</span>
        </div>

        @if (refeicoes().length > 0) {
          @for (r of refeicoes(); track r.id) {
            <div class="card">
              <div class="mcard">
                <div class="micon">{{ r.emoji }}</div>
                <div class="minfo">
                  <div class="mname">{{ r.nome }}</div>
                  <div class="mitems">{{ r.descricao }}</div>
                  <div class="mbar-bg">
                    <div class="mbar-fill" [style.width.%]="r.progresso"></div>
                  </div>
                </div>
                <div class="mkcal">
                  <div class="mkcal-n">{{ r.kcal }}</div>
                  <div class="mkcal-u">kcal</div>
                </div>
              </div>
            </div>
          }
        } @else {
          <div class="empty-state">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--dt-cream-3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <p>Nenhum plano ativo.</p>
            <p>Envie sua dieta para começar.</p>
          </div>
        }

        <div class="shead" style="margin-top:16px">
          <span class="stitle">Ações rápidas</span>
        </div>
        <div class="qa-grid">
          <a class="qa" routerLink="/dieta/enviar">
            <span class="qa-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            </span>
            <div class="qa-lbl">Enviar dieta</div>
          </a>
          <a class="qa" routerLink="/lista-compras">
            <span class="qa-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
              </svg>
            </span>
            <div class="qa-lbl">Lista de compras</div>
          </a>
        </div>
      </div>

      <app-bottom-nav active="inicio" />
    </div>
  `,
  styles: [`
    .screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--dt-cream);
    }

    /* Header strip */
    .hstrip {
      background: var(--dt-green-800);
      padding: 16px 18px 22px;
      position: relative;
      overflow: hidden;
    }
    .hstrip::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 22px;
      border-radius: 22px 22px 0 0;
      background: var(--dt-cream);
    }
    .greet-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
    }
    .greet-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 600;
      color: #fff;
    }
    .greet-name em { font-style: italic; color: var(--dt-green-200); }
    .greet-sub {
      font-size: 11px;
      font-weight: 300;
      margin-top: 2px;
      color: rgba(255,255,255,.45);
    }
    .av-wrap {
      position: relative;
      flex-shrink: 0;
    }
    .av {
      width: 38px; height: 38px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 500;
      background: rgba(255,255,255,.15);
      border: 1.5px solid rgba(255,255,255,.25);
      color: #fff;
      cursor: pointer;
    }
    .av-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: var(--dt-white);
      border: 0.5px solid var(--dt-cream-3);
      border-radius: 13px;
      padding: 12px 0 8px;
      min-width: 190px;
      box-shadow: 0 8px 24px rgba(0,0,0,.10);
      z-index: 100;
    }
    .av-menu-nome {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--dt-text);
      padding: 0 14px 2px;
    }
    .av-menu-email {
      font-size: 11px;
      color: var(--dt-muted);
      padding: 0 14px 10px;
    }
    .av-menu-sep {
      height: 0.5px;
      background: var(--dt-cream-3);
      margin: 0 0 6px;
    }
    .av-menu-sair {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 14px;
      background: none;
      border: none;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #c0392b;
      cursor: pointer;
      text-align: left;
    }
    .av-menu-sair:hover { background: #fff5f5; }
    .macros { display: flex; gap: 7px; }
    .macro {
      flex: 1;
      border-radius: 11px;
      padding: 9px 6px;
      text-align: center;
      background: rgba(255,255,255,.1);
      border: 1px solid rgba(255,255,255,.12);
    }
    .macro-v {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      font-weight: 600;
      display: block;
      color: #fff;
    }
    .macro-lb {
      font-size: 9px;
      font-weight: 300;
      display: block;
      color: rgba(255,255,255,.45);
    }

    /* Content */
    .content {
      background: var(--dt-cream);
      padding: 14px 16px 10px;
      flex: 1;
    }
    .shead {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .stitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: var(--dt-text);
    }

    /* Meal card */
    .card {
      border-radius: 14px;
      padding: 13px 14px;
      margin-bottom: 8px;
      border: 0.5px solid var(--dt-cream-3);
      background: var(--dt-white);
    }
    .mcard { display: flex; align-items: center; gap: 11px; }
    .micon {
      width: 42px; height: 42px;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
      background: #eaf3de;
    }
    .minfo { flex: 1; min-width: 0; }
    .mname { font-size: 13.5px; font-weight: 500; color: var(--dt-text); }
    .mitems {
      font-size: 11.5px;
      color: var(--dt-muted);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .mbar-bg {
      height: 3px;
      border-radius: 99px;
      margin-top: 6px;
      width: 110px;
      background: var(--dt-cream-2);
    }
    .mbar-fill {
      height: 100%;
      border-radius: 99px;
      background: var(--dt-green-500);
    }
    .mkcal { text-align: right; flex-shrink: 0; }
    .mkcal-n {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: var(--dt-green-600);
    }
    .mkcal-u { font-size: 10px; color: var(--dt-muted); }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 32px 16px;
      color: var(--dt-muted);
      font-size: 13px;
      text-align: center;
    }

    /* Quick actions */
    .qa-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    .qa {
      border-radius: 14px;
      padding: 14px;
      text-align: center;
      border: 0.5px solid var(--dt-cream-3);
      background: var(--dt-white);
      text-decoration: none;
      display: block;
    }
    .qa-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 5px;
    }
    .qa-icon svg { width: 22px; height: 22px; color: var(--dt-green-600); }
    .qa-lbl {
      font-size: 12px;
      font-weight: 500;
      color: var(--dt-text-2);
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly macros = signal<MacroPlan | null>(null);
  readonly refeicoes = signal<RefeicaoItem[]>([]);
  readonly menuAberto = signal(false);

  readonly primeiroNome = computed(() => {
    const nome = this.authService.nomeUsuario();
    return nome ? nome.split(' ')[0] : 'você';
  });

  readonly iniciais = computed(() => {
    const nome = this.authService.nomeUsuario();
    if (!nome) return '?';
    const partes = nome.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
      : nome[0].toUpperCase();
  });

  readonly dataHoje = computed(() => {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  });

  sair(): void {
    this.authService.sair();
  }

  ngOnInit(): void {
    this.tentarCarregarPlanoDieta();
  }

  private tentarCarregarPlanoDieta(): void {
    const ultimoId = localStorage.getItem('dietete_ultimo_plano_id');
    if (!ultimoId) return;

    this.http
      .get<{ macros?: MacroPlan; refeicoes?: RefeicaoItem[] }>(
        `${environment.apiUrl}/planos-dieta/${ultimoId}`
      )
      .subscribe({
        next: (plano) => {
          if (plano.macros) this.macros.set(plano.macros);
          if (plano.refeicoes) this.refeicoes.set(plano.refeicoes);
        },
        error: () => {},
      });
  }
}
