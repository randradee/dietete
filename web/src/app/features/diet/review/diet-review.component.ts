import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { environment } from '../../../../environments/environment';

interface ItemDieta {
  id: string;
  descricao: string;
  quantidade: string;
  unidade: string;
  pontuacaoConfianca: number;
  diaSemana?: string;
  nomeRefeicao?: string;
  [key: string]: unknown;
}

interface PlanoDieta {
  id: string;
  nomeArquivo: string;
  dataEnvio: string;
  itens: ItemDieta[];
  [key: string]: unknown;
}

interface GrupoRefeicao {
  nome: string;
  ok: boolean;
  itens: ItemDieta[];
}

interface GrupoDia {
  dia: string;
  refeicoes: GrupoRefeicao[];
}

@Component({
  selector: 'app-diet-review',
  standalone: true,
  imports: [TopNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen">
      <app-top-nav
        [title]="plano() ? 'Revisão — ' + nomeArquivoSimples() : 'Revisão'"
        (voltar)="router.navigate(['/dieta/enviar'])"
      />

      <div class="content">
        @if (carregando()) {
          <div class="loading">
            <div class="spinner"></div>
            <p>Carregando plano...</p>
          </div>
        } @else if (erro()) {
          <div class="error-state">
            <p>{{ erro() }}</p>
            <button class="btn-link" (click)="carregarPlano()">Tentar novamente</button>
          </div>
        } @else if (plano()) {
          <!-- Summary bar -->
          <div class="summary-bar">
            <div class="sb-item">
              <span class="sb-val">{{ totalItens() }}</span>
              <span class="sb-lbl">extraídos</span>
            </div>
            <div class="sb-item">
              <span class="sb-val">{{ itensOk() }}</span>
              <span class="sb-lbl">confirmados</span>
            </div>
            <div class="sb-item">
              <span class="sb-val sb-val-warn">{{ itensRevisar() }}</span>
              <span class="sb-lbl">revisar</span>
            </div>
          </div>

          <!-- Day blocks -->
          @for (grupo of gruposDia(); track grupo.dia) {
            <div class="day-block">
              <div class="day-head">{{ grupo.dia }}</div>
              @for (ref of grupo.refeicoes; track ref.nome) {
                <div class="ref-row">
                  <div class="rdot" [class.rdot-ok]="ref.ok" [class.rdot-warn]="!ref.ok"></div>
                  <div class="ref-info">
                    <div class="rname">{{ ref.nome }}</div>
                    <div class="ritems">
                      @for (item of ref.itens; track item.id; let last = $last) {
                        @if (item.pontuacaoConfianca < 0.5) {
                          <span class="rwarn">{{ item.descricao }}</span>
                        } @else {
                          {{ item.descricao }}
                        }
                        @if (!last) { · }
                      }
                    </div>
                  </div>
                  <span class="badge" [class.badge-ok]="ref.ok" [class.badge-warn]="!ref.ok">
                    {{ ref.ok ? 'OK' : 'Revisar' }}
                  </span>
                </div>
              }
            </div>
          }

          <button type="button" class="btn-primary" (click)="confirmarEGerarLista()">
            Confirmar e gerar lista
          </button>
        }
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
    .content {
      background: var(--dt-cream);
      padding: 14px 16px;
      flex: 1;
    }

    /* Loading / error */
    .loading, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 48px 16px;
      color: var(--dt-muted);
      font-size: 13px;
      text-align: center;
    }
    .spinner {
      width: 32px; height: 32px;
      border: 3px solid var(--dt-cream-2);
      border-top-color: var(--dt-green-600);
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn-link {
      background: none;
      border: none;
      color: var(--dt-green-600);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      text-decoration: underline;
    }

    /* Summary bar */
    .summary-bar {
      border-radius: 14px;
      padding: 13px 16px;
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
      background: var(--dt-green-800);
    }
    .sb-item { text-align: center; }
    .sb-val {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      display: block;
      color: #fff;
    }
    .sb-val-warn { color: #fde68a; }
    .sb-lbl { font-size: 9.5px; display: block; color: rgba(255,255,255,.45); }

    /* Day block */
    .day-block {
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 9px;
      border: 0.5px solid var(--dt-cream-3);
    }
    .day-head {
      padding: 9px 14px;
      font-size: 9.5px;
      font-weight: 500;
      letter-spacing: .08em;
      text-transform: uppercase;
      background: #eaf3de;
      color: var(--dt-green-600);
      border-bottom: 0.5px solid var(--dt-cream-3);
    }
    .ref-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 11px 14px;
      border-bottom: 0.5px solid #f0ece4;
      background: var(--dt-white);
    }
    .ref-row:last-child { border-bottom: none; }
    .rdot {
      width: 7px; height: 7px;
      border-radius: 50%;
      margin-top: 4px;
      flex-shrink: 0;
    }
    .rdot-ok { background: var(--dt-green-500); }
    .rdot-warn { background: var(--dt-warn); }
    .ref-info { flex: 1; }
    .rname { font-size: 12.5px; font-weight: 500; color: var(--dt-text); }
    .ritems { font-size: 11px; color: var(--dt-muted); margin-top: 2px; line-height: 1.5; }
    .rwarn { color: var(--dt-warn); }
    .badge {
      font-size: 10.5px;
      font-weight: 500;
      padding: 3px 9px;
      border-radius: 99px;
      flex-shrink: 0;
      white-space: nowrap;
    }
    .badge-ok { background: #eaf3de; color: var(--dt-green-600); }
    .badge-warn { background: var(--dt-warn-bg); color: #b45309; }

    /* Confirm button */
    .btn-primary {
      display: flex;
      align-items: center;
      justify-content: center;
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
      margin-top: 10px;
    }
    .btn-primary:hover { background: var(--dt-green-700); }
  `],
})
export class DietReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly plano = signal<PlanoDieta | null>(null);

  readonly totalItens = computed(() => this.plano()?.itens.length ?? 0);
  readonly itensOk = computed(() => (this.plano()?.itens ?? []).filter(i => i.pontuacaoConfianca >= 0.5).length);
  readonly itensRevisar = computed(() => (this.plano()?.itens ?? []).filter(i => i.pontuacaoConfianca < 0.5).length);

  readonly nomeArquivoSimples = computed(() => {
    const nome = this.plano()?.nomeArquivo ?? '';
    return nome.replace('.pdf', '').slice(0, 20);
  });

  readonly gruposDia = computed<GrupoDia[]>(() => {
    const itens = this.plano()?.itens ?? [];
    if (itens.length === 0) return [];

    const temDias = itens.some(i => i.diaSemana);

    if (temDias) {
      const mapaD = new Map<string, Map<string, ItemDieta[]>>();
      for (const item of itens) {
        const dia = item.diaSemana ?? 'Geral';
        const ref = item.nomeRefeicao ?? 'Refeição';
        if (!mapaD.has(dia)) mapaD.set(dia, new Map());
        const mapaR = mapaD.get(dia)!;
        if (!mapaR.has(ref)) mapaR.set(ref, []);
        mapaR.get(ref)!.push(item);
      }
      return Array.from(mapaD.entries()).map(([dia, mapaR]) => ({
        dia,
        refeicoes: Array.from(mapaR.entries()).map(([nome, itensR]) => ({
          nome,
          ok: itensR.every(i => i.pontuacaoConfianca >= 0.5),
          itens: itensR,
        })),
      }));
    }

    const mapaR = new Map<string, ItemDieta[]>();
    for (const item of itens) {
      const ref = item.nomeRefeicao ?? 'Todos os itens';
      if (!mapaR.has(ref)) mapaR.set(ref, []);
      mapaR.get(ref)!.push(item);
    }
    return [{
      dia: 'Plano alimentar',
      refeicoes: Array.from(mapaR.entries()).map(([nome, itensR]) => ({
        nome,
        ok: itensR.every(i => i.pontuacaoConfianca >= 0.5),
        itens: itensR,
      })),
    }];
  });

  ngOnInit(): void {
    this.carregarPlano();
  }

  carregarPlano(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.erro.set('ID do plano não encontrado.'); return; }

    this.carregando.set(true);
    this.erro.set(null);

    this.http
      .get<PlanoDieta>(`${environment.apiUrl}/planos-dieta/${id}`)
      .subscribe({
        next: (plano) => {
          this.plano.set(plano);
          this.carregando.set(false);
        },
        error: (err) => {
          this.carregando.set(false);
          this.erro.set(err.error?.detail ?? 'Erro ao carregar o plano de dieta.');
        },
      });
  }

  confirmarEGerarLista(): void {
    this.router.navigate(['/lista-compras']);
  }
}
