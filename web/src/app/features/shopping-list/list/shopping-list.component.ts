import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { Card } from 'primeng/card';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { SelectButton } from 'primeng/selectbutton';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { environment } from '../../../../environments/environment';
import { ShoppingListItemComponent, ItemLista } from '../item/shopping-list-item.component';

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
  imports: [
    FormsModule,
    NgTemplateOutlet,
    Card,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    SelectButton,
    Button,
    TableModule,
    Tag,
    ShoppingListItemComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <p-card>
        <ng-template #title>Lista de Compras</ng-template>
        <ng-template #subtitle>Gere sua lista com base no plano alimentar</ng-template>

        <div class="controles">
          <div class="controle-grupo">
            <label class="controle-label">Tipo de lista:</label>
            <p-select-button
              [options]="opcoesTipo"
              [(ngModel)]="tipoSelecionado"
              optionLabel="label"
              optionValue="value"
            />
          </div>
        </div>

        <p-tabs [value]="0" (valueChange)="onTabChange($event)" styleClass="tabs-periodo">
          <p-tablist>
            <p-tab [value]="0">Semanal</p-tab>
            <p-tab [value]="1">Mensal</p-tab>
          </p-tablist>

          <p-tabpanels>
            <p-tabpanel [value]="0">
              <ng-container [ngTemplateOutlet]="conteudoLista" />
            </p-tabpanel>
            <p-tabpanel [value]="1">
              <ng-container [ngTemplateOutlet]="conteudoLista" />
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>

        <ng-template #conteudoLista>
          <div class="tab-content">
            <div class="acoes">
              <p-button
                label="Gerar Lista"
                icon="pi pi-refresh"
                [loading]="carregando()"
                (onClick)="gerarLista()"
              />
            </div>

            @if (erro()) {
              <div class="erro-lista">{{ erro() }}</div>
            }

            @if (grupos().length === 0 && !carregando() && !erro()) {
              <div class="lista-vazia">
                <i class="pi pi-shopping-cart" style="font-size: 48px; color: #bdbdbd;"></i>
                <p>Nenhum item na lista. Clique em "Gerar Lista" para começar.</p>
              </div>
            }

            @for (grupo of grupos(); track grupo.categoria) {
              <div class="grupo-categoria">
                <h3 class="categoria-titulo">
                  <p-tag [value]="grupo.categoria" severity="secondary" />
                  <span class="badge">{{ grupo.itens.length }}</span>
                </h3>
                <p-table [value]="grupo.itens" styleClass="p-datatable-sm tabela-itens">
                  <ng-template #header>
                    <tr>
                      <th>Item</th>
                      <th>Quantidade</th>
                      <th>Unidade</th>
                      <th>Categoria</th>
                      <th style="width:140px">Preço / Ações</th>
                    </tr>
                  </ng-template>
                  <ng-template #body let-item>
                    <tr
                      app-shopping-list-item
                      [item]="item"
                      (atualizado)="onItemAtualizado($event)"
                    ></tr>
                  </ng-template>
                </p-table>
              </div>
            }
          </div>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    .controles {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin: 8px 0 16px;
    }
    .controle-grupo {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .controle-label {
      font-size: 0.875rem;
      color: #757575;
      font-weight: 500;
    }
    .tab-content { padding-top: 16px; }
    .acoes { margin-bottom: 16px; }
    .lista-vazia {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #bdbdbd;
      gap: 16px;
    }
    .grupo-categoria { margin-bottom: 24px; }
    .categoria-titulo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .badge {
      background: var(--p-primary-color, #1976d2);
      color: white;
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 0.75rem;
    }
    .tabela-itens { width: 100%; }
    .erro-lista {
      color: #f44336;
      padding: 8px;
      background: #ffebee;
      border-radius: 4px;
      margin-bottom: 16px;
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

  private listaId = '';

  readonly opcoesTipo = [
    { label: 'Individual', value: 'Individual' },
    { label: 'Unificada (casal)', value: 'Unificada' },
  ];

  get tipoSelecionado(): Tipo { return this.tipo(); }
  set tipoSelecionado(value: Tipo) { this.tipo.set(value); }

  onTabChange(index: string | number | undefined): void {
    this.periodo.set(index === 0 ? 'Semanal' : 'Mensal');
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
          this.listaId = dto.id;
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
