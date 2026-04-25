import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { ShoppingListItemComponent, ItemLista } from '../item/shopping-list-item.component';
import { environment } from '../../../../environments/environment';

interface ListaComprasResposta {
  id: string;
  periodo: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  itens: Omit<ItemLista, 'listaId'>[];
}

interface GrupoCategoria {
  categoria: string;
  itens: ItemLista[];
}

type Periodo = 'Semanal' | 'Mensal';
type Tipo = 'Individual' | 'Unificada';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [FormsModule, BottomNavComponent, ShoppingListItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen">
      <!-- Header -->
      <div class="list-head">
        <div class="list-top-row">
          <span class="list-title">Lista de compras</span>
          <div class="toggle-row">
            <div
              class="toption"
              [class.on]="tipo() === 'Individual'"
              (click)="mudarTipo('Individual')"
            >Individual</div>
            <div
              class="toption"
              [class.on]="tipo() === 'Unificada'"
              (click)="mudarTipo('Unificada')"
            >Casal</div>
          </div>
        </div>
        <div class="period-tabs">
          <div
            class="ptab"
            [class.active]="periodo() === 'Semanal'"
            (click)="mudarPeriodo('Semanal')"
          >Semanal</div>
          <div
            class="ptab"
            [class.active]="periodo() === 'Mensal'"
            (click)="mudarPeriodo('Mensal')"
          >Mensal</div>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="acoes-row">
          <button
            type="button"
            class="btn-gerar"
            [disabled]="carregando()"
            (click)="gerarLista()"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            {{ carregando() ? 'Gerando...' : 'Gerar lista' }}
          </button>
        </div>

        @if (erro()) {
          <div class="error-banner">{{ erro() }}</div>
        }

        @if (grupos().length === 0 && !carregando() && !erro()) {
          <div class="empty-state">
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="var(--dt-cream-3)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.99-1.61L23 6H6"/>
            </svg>
            <p>Nenhum item na lista.</p>
            <p>Clique em "Gerar lista" para começar.</p>
          </div>
        }

        @if (grupos().length > 0) {
          <div class="list-meta">
            {{ totalItens() }} itens · {{ tipo() === 'Individual' ? 'Individual' : 'Casal' }} · {{ periodo() }}
          </div>

          @for (grupo of grupos(); track grupo.categoria) {
            <div class="cat-lbl">{{ grupo.categoria }}</div>
            @for (item of grupo.itens; track item.id) {
              <app-shopping-list-item
                [item]="item"
                (atualizado)="onItemAtualizado($event)"
              />
            }
          }
        }
      </div>

      <app-bottom-nav active="compras" />
    </div>
  `,
  styles: [`
    .screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--dt-cream);
    }

    /* Header */
    .list-head {
      padding: 14px 16px 0;
      background: var(--dt-cream);
    }
    .list-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .list-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 21px;
      font-weight: 600;
      color: var(--dt-text);
    }
    .toggle-row {
      display: inline-flex;
      border-radius: 99px;
      padding: 3px;
      background: var(--dt-cream-2);
    }
    .toption {
      padding: 4px 12px;
      border-radius: 99px;
      font-size: 11.5px;
      font-weight: 500;
      cursor: pointer;
      color: var(--dt-muted);
    }
    .toption.on {
      background: var(--dt-white);
      color: var(--dt-green-600);
    }
    .period-tabs {
      display: flex;
      border-bottom: 0.5px solid var(--dt-cream-3);
      margin-top: 12px;
    }
    .ptab {
      flex: 1;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12.5px;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      color: var(--dt-muted);
    }
    .ptab.active {
      color: var(--dt-green-600);
      border-bottom-color: var(--dt-green-600);
    }

    /* Content */
    .content {
      background: var(--dt-cream);
      padding: 12px 16px 16px;
      flex: 1;
    }
    .acoes-row { margin-bottom: 12px; }
    .btn-gerar {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 9px 18px;
      border-radius: 11px;
      background: var(--dt-green-800);
      border: none;
      color: var(--dt-green-50);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-gerar:hover:not(:disabled) { background: var(--dt-green-700); }
    .btn-gerar:disabled { opacity: .6; cursor: not-allowed; }

    .error-banner {
      background: #fff0f0;
      border: 1px solid #fcc;
      color: #b00;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 12px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 40px 16px;
      color: var(--dt-muted);
      font-size: 13px;
      text-align: center;
    }

    .list-meta {
      font-size: 11px;
      color: var(--dt-muted);
      padding: 8px 0 2px;
    }

    .cat-lbl {
      font-size: 9.5px;
      font-weight: 500;
      letter-spacing: .09em;
      text-transform: uppercase;
      color: var(--dt-muted);
      padding: 11px 0 5px;
    }
  `],
})
export class ShoppingListComponent {
  private readonly http = inject(HttpClient);

  readonly periodo = signal<Periodo>('Semanal');
  readonly tipo = signal<Tipo>('Individual');
  readonly grupos = signal<GrupoCategoria[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  readonly totalItens = () => this.grupos().reduce((acc, g) => acc + g.itens.length, 0);

  mudarPeriodo(p: Periodo): void {
    this.periodo.set(p);
    this.grupos.set([]);
    this.erro.set(null);
  }

  mudarTipo(t: Tipo): void {
    this.tipo.set(t);
    this.grupos.set([]);
    this.erro.set(null);
  }

  gerarLista(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.http
      .post<ListaComprasResposta>(`${environment.apiUrl}/listas-compras/gerar`, {
        periodo: this.periodo(),
        tipo: this.tipo(),
      })
      .subscribe({
        next: (dto) => {
          const itens: ItemLista[] = dto.itens.map(i => ({ ...i, listaId: dto.id }));
          this.grupos.set(this.agruparPorCategoria(itens));
          this.carregando.set(false);
        },
        error: (err) => {
          this.carregando.set(false);
          this.erro.set(err.error?.detail ?? 'Erro ao gerar a lista de compras.');
        },
      });
  }

  onItemAtualizado(itemAtualizado: ItemLista): void {
    this.grupos.update(grupos =>
      grupos.map(g => ({
        ...g,
        itens: g.itens.map(i => i.id === itemAtualizado.id ? itemAtualizado : i),
      }))
    );
  }

  private agruparPorCategoria(itens: ItemLista[]): GrupoCategoria[] {
    const mapa = new Map<string, ItemLista[]>();
    for (const item of itens) {
      const cat = item.categoria ?? 'Outros';
      if (!mapa.has(cat)) mapa.set(cat, []);
      mapa.get(cat)!.push(item);
    }
    return Array.from(mapa.entries()).map(([categoria, itensGrupo]) => ({
      categoria,
      itens: itensGrupo,
    }));
  }
}
