import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { environment } from '../../../../environments/environment';

interface ItemDieta {
  id: string;
  descricao: string;
  quantidade: string;
  unidade: string;
  pontuacaoConfianca: number;
  [key: string]: unknown;
}

interface PlanoDieta {
  id: string;
  nomeArquivo: string;
  dataEnvio: string;
  itens: ItemDieta[];
  [key: string]: unknown;
}

@Component({
  selector: 'app-diet-review',
  standalone: true,
  imports: [
    Card,
    Button,
    Tag,
    TableModule,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-container">
      <p-card>
        <ng-template #title>Revisão da Dieta</ng-template>
        @if (plano()) {
          <ng-template #subtitle>Arquivo: {{ plano()!.nomeArquivo }}</ng-template>
        }

        @if (carregando()) {
          <app-loading-spinner />
        } @else if (erro()) {
          <div class="erro-container">
            <i class="pi pi-exclamation-circle" style="font-size: 2rem; color: #e53935;"></i>
            <p>{{ erro() }}</p>
            <p-button label="Tentar novamente" variant="text" (onClick)="carregarPlano()" />
          </div>
        } @else if (plano()) {
          <div class="resumo">
            <p>
              <strong>{{ itensNormais().length }}</strong> itens identificados com confiança.
            </p>
            @if (itensParaRevisao().length > 0) {
              <div class="aviso-revisao">
                <i class="pi pi-exclamation-triangle" style="color: #f57c00;"></i>
                <span>
                  <strong>{{ itensParaRevisao().length }}</strong> itens precisam de revisão
                  (confiança abaixo de 50%).
                </span>
              </div>
            }
          </div>

          @if (itensParaRevisao().length > 0) {
            <h3 class="secao-titulo">
              <i class="pi pi-exclamation-triangle" style="color: #f57c00;"></i>
              Itens para Revisão
            </h3>
            <p-table [value]="itensParaRevisao()" styleClass="p-datatable-sm tabela-itens">
              <ng-template #header>
                <tr>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                  <th>Confiança</th>
                  <th>Status</th>
                </tr>
              </ng-template>
              <ng-template #body let-item>
                <tr class="linha-revisao">
                  <td>{{ item.descricao }}</td>
                  <td>{{ item.quantidade }} {{ item.unidade }}</td>
                  <td>{{ (item.pontuacaoConfianca * 100).toFixed(0) }}%</td>
                  <td><p-tag severity="warn" value="Revisar" /></td>
                </tr>
              </ng-template>
            </p-table>
          }

          @if (itensNormais().length > 0) {
            <h3 class="secao-titulo" style="margin-top: 20px;">
              <i class="pi pi-check-circle" style="color: var(--p-primary-color, #1976d2);"></i>
              Itens Confirmados
            </h3>
            <p-table [value]="itensNormais()" styleClass="p-datatable-sm tabela-itens">
              <ng-template #header>
                <tr>
                  <th>Descrição</th>
                  <th>Quantidade</th>
                  <th>Confiança</th>
                  <th>Status</th>
                </tr>
              </ng-template>
              <ng-template #body let-item>
                <tr>
                  <td>{{ item.descricao }}</td>
                  <td>{{ item.quantidade }} {{ item.unidade }}</td>
                  <td>{{ (item.pontuacaoConfianca * 100).toFixed(0) }}%</td>
                  <td><p-tag severity="success" value="OK" /></td>
                </tr>
              </ng-template>
            </p-table>
          }
        }

        @if (!carregando() && plano()) {
          <ng-template #footer>
            <div class="card-actions">
              <p-button
                label="Gerar Lista de Compras"
                icon="pi pi-shopping-cart"
                (onClick)="gerarListaCompras()"
              />
            </div>
          </ng-template>
        }
      </p-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .resumo {
      margin: 16px 0;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .aviso-revisao {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f57c00;
      margin-top: 8px;
    }
    .secao-titulo {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0 8px;
      font-size: 1rem;
    }
    .linha-revisao {
      background: #fff8e1;
    }
    .erro-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: #757575;
      gap: 12px;
    }
    .tabela-itens {
      width: 100%;
    }
    .card-actions {
      display: flex;
      justify-content: flex-end;
    }
  `],
})
export class DietReviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly plano = signal<PlanoDieta | null>(null);

  readonly itensParaRevisao = signal<ItemDieta[]>([]);
  readonly itensNormais = signal<ItemDieta[]>([]);

  ngOnInit(): void {
    this.carregarPlano();
  }

  carregarPlano(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.erro.set('ID do plano não encontrado.');
      return;
    }

    this.carregando.set(true);
    this.erro.set(null);

    this.http
      .get<PlanoDieta>(`${environment.apiUrl}/planos-dieta/${id}`)
      .subscribe({
        next: (plano) => {
          this.plano.set(plano);
          const itens = plano.itens ?? [];
          this.itensParaRevisao.set(itens.filter((i) => i.pontuacaoConfianca < 0.5));
          this.itensNormais.set(itens.filter((i) => i.pontuacaoConfianca >= 0.5));
          this.carregando.set(false);
        },
        error: (err) => {
          this.carregando.set(false);
          this.erro.set(
            err.error?.detail ?? 'Erro ao carregar o plano de dieta.'
          );
        },
      });
  }

  gerarListaCompras(): void {
    this.router.navigate(['/lista-compras']);
  }
}
