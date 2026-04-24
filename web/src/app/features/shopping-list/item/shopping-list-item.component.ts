import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Tag } from 'primeng/tag';
import { environment } from '../../../../../environments/environment';

export interface ItemLista {
  id: string;
  listaId: string;
  nome: string;
  quantidadeTotal: number;
  unidade: string;
  categoria: string;
  editadoManualmente: boolean;
  precoEstimado: number | null;
}

@Component({
  selector: '[app-shopping-list-item]',
  standalone: true,
  imports: [FormsModule, Button, InputText, InputNumber, Tag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (modoEdicao()) {
      <td>
        <input pInputText [(ngModel)]="rascunho.nome" style="width:100%" />
      </td>
      <td>
        <p-inputnumber
          [(ngModel)]="rascunho.quantidadeTotal"
          [minFractionDigits]="0"
          [maxFractionDigits]="2"
          inputStyleClass="input-qtd"
        />
      </td>
      <td>{{ item().unidade }}</td>
      <td><p-tag [value]="item().categoria" severity="info" /></td>
      <td class="acoes-cel">
        <p-button
          icon="pi pi-check"
          size="small"
          severity="success"
          [loading]="salvando()"
          (onClick)="salvar()"
        />
        <p-button
          icon="pi pi-times"
          size="small"
          severity="secondary"
          variant="text"
          (onClick)="cancelar()"
        />
      </td>
    } @else {
      <td>
        <span>{{ item().nome }}</span>
        @if (item().editadoManualmente) {
          <p-tag value="editado" severity="warn" styleClass="tag-editado" />
        }
      </td>
      <td>{{ item().quantidadeTotal }}</td>
      <td>{{ item().unidade }}</td>
      <td><p-tag [value]="item().categoria" severity="info" /></td>
      <td class="acoes-cel">
        @if (item().precoEstimado) {
          <span class="preco">R$&nbsp;{{ item().precoEstimado!.toFixed(2) }}</span>
        }
        <p-button
          icon="pi pi-pencil"
          size="small"
          variant="text"
          severity="secondary"
          title="Editar item"
          (onClick)="iniciarEdicao()"
        />
      </td>
    }
  `,
  styles: [`
    :host { display: contents; }
    .tag-editado { margin-left: 6px; vertical-align: middle; font-size: 0.7rem; }
    .input-qtd { width: 80px; }
    .acoes-cel { white-space: nowrap; }
    .preco { font-size: 0.875rem; color: #388e3c; margin-right: 4px; }
  `],
})
export class ShoppingListItemComponent {
  readonly item = input.required<ItemLista>();
  readonly atualizado = output<ItemLista>();

  private readonly http = inject(HttpClient);

  readonly modoEdicao = signal(false);
  readonly salvando = signal(false);

  rascunho: { nome: string; quantidadeTotal: number } = { nome: '', quantidadeTotal: 0 };

  iniciarEdicao(): void {
    const i = this.item();
    this.rascunho = { nome: i.nome, quantidadeTotal: i.quantidadeTotal };
    this.modoEdicao.set(true);
  }

  cancelar(): void {
    this.modoEdicao.set(false);
  }

  salvar(): void {
    this.salvando.set(true);
    const i = this.item();
    const url = `${environment.apiUrl}/listas-compras/${i.listaId}/itens/${i.id}`;
    const corpo = {
      nome: this.rascunho.nome,
      quantidade: this.rascunho.quantidadeTotal,
      unidade: i.unidade,
    };

    this.http.patch<ItemLista>(url, corpo).subscribe({
      next: (itemAtualizado) => {
        this.atualizado.emit({ ...itemAtualizado, listaId: i.listaId });
        this.modoEdicao.set(false);
        this.salvando.set(false);
      },
      error: () => this.salvando.set(false),
    });
  }
}
