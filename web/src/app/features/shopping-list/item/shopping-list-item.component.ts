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
import { environment } from '../../../../environments/environment';

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
  selector: 'app-shopping-list-item',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="item-row" [class.done]="marcado()">
      <!-- Checkbox -->
      <div
        class="icheck"
        [class.checked]="marcado()"
        (click)="marcado.set(!marcado())"
      >
        @if (marcado()) {
          <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        }
      </div>

      @if (modoEdicao()) {
        <!-- Edit mode -->
        <input
          class="edit-input"
          [(ngModel)]="rascunho.nome"
          (keydown.enter)="salvar()"
          (keydown.escape)="cancelar()"
        />
        <div class="edit-actions">
          <button class="edit-btn ok" [disabled]="salvando()" (click)="salvar()">✓</button>
          <button class="edit-btn cancel" (click)="cancelar()">✕</button>
        </div>
      } @else {
        <!-- View mode -->
        <span class="iname" [class.done-text]="marcado()">{{ item().nome }}</span>
        <span class="iqty">{{ item().quantidadeTotal }} {{ item().unidade }}</span>
        <button class="edit-icon-btn" title="Editar" (click)="iniciarEdicao()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .item-row {
      display: flex;
      align-items: center;
      gap: 11px;
      border-radius: 12px;
      padding: 11px 13px;
      margin-bottom: 6px;
      border: 0.5px solid var(--dt-cream-2);
      background: var(--dt-white);
    }
    .icheck {
      width: 20px; height: 20px;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      border: 1.5px solid var(--dt-cream-3);
      cursor: pointer;
    }
    .icheck.checked {
      background: var(--dt-green-600);
      border-color: var(--dt-green-600);
    }
    .iname {
      flex: 1;
      font-size: 13px;
      color: var(--dt-text);
    }
    .iname.done-text {
      color: #c0b8ae;
      text-decoration: line-through;
    }
    .iqty {
      font-size: 11.5px;
      font-weight: 500;
      padding: 3px 9px;
      border-radius: 7px;
      background: #eaf3de;
      color: var(--dt-green-600);
      white-space: nowrap;
    }
    .edit-icon-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--dt-muted);
      padding: 2px;
      display: flex;
      align-items: center;
      opacity: 0;
      transition: opacity .15s;
    }
    .item-row:hover .edit-icon-btn { opacity: 1; }
    .edit-input {
      flex: 1;
      height: 32px;
      border-radius: 8px;
      border: 1.5px solid var(--dt-green-400);
      padding: 0 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      outline: none;
      background: var(--dt-white);
    }
    .edit-actions { display: flex; gap: 4px; }
    .edit-btn {
      width: 28px; height: 28px;
      border-radius: 7px;
      border: none;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      display: flex; align-items: center; justify-content: center;
    }
    .edit-btn.ok { background: var(--dt-green-600); color: #fff; }
    .edit-btn.cancel { background: var(--dt-cream-2); color: var(--dt-text-3); }
    .edit-btn:disabled { opacity: .5; cursor: not-allowed; }
  `],
})
export class ShoppingListItemComponent {
  readonly item = input.required<ItemLista>();
  readonly atualizado = output<ItemLista>();

  private readonly http = inject(HttpClient);

  readonly modoEdicao = signal(false);
  readonly salvando = signal(false);
  readonly marcado = signal(false);

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

    this.http
      .patch<ItemLista>(url, {
        nome: this.rascunho.nome,
        quantidade: this.rascunho.quantidadeTotal,
        unidade: i.unidade,
      })
      .subscribe({
        next: (itemAtualizado) => {
          this.atualizado.emit({ ...itemAtualizado, listaId: i.listaId });
          this.modoEdicao.set(false);
          this.salvando.set(false);
        },
        error: () => this.salvando.set(false),
      });
  }
}
