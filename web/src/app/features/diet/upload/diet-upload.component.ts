import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TopNavComponent } from '../../../shared/components/top-nav/top-nav.component';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { environment } from '../../../../environments/environment';

interface PlanoDietaResponse {
  id: string;
  [key: string]: unknown;
}

type UsuarioTab = 'Ana' | 'Pedro';

@Component({
  selector: 'app-diet-upload',
  standalone: true,
  imports: [TopNavComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="screen">
      <app-top-nav title="Enviar dieta" (voltar)="router.navigate(['/dashboard'])" />

      <div class="content">
        <!-- User tabs -->
        <div class="utabs">
          @for (u of usuarios; track u) {
            <div
              class="utab"
              [class.active]="usuarioAtivo() === u"
              (click)="usuarioAtivo.set(u)"
            >{{ u }}</div>
          }
        </div>

        <!-- Upload zone -->
        <div
          class="upload-zone"
          [class.drag-over]="arrastandoArquivo()"
          [class.tem-arquivo]="arquivoSelecionado() !== null"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          <div class="uz-icon">
            @if (arquivoSelecionado()) {
              <svg viewBox="0 0 24 24" fill="none" stroke="#e53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--dt-green-600)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
            }
          </div>

          @if (arquivoSelecionado()) {
            <div class="uz-title">{{ arquivoSelecionado()!.name }}</div>
            <div class="uz-desc">{{ formatarTamanho(arquivoSelecionado()!.size) }}</div>
            <div class="uz-actions">
              <button type="button" class="btn-sm" (click)="removerArquivo()">Remover</button>
              <button
                type="button"
                class="btn-sm btn-primary"
                [disabled]="carregando()"
                (click)="enviarDieta()"
              >
                {{ carregando() ? 'Enviando...' : 'Enviar PDF' }}
              </button>
            </div>
          } @else {
            <div class="uz-title">Envie o PDF da dieta</div>
            <div class="uz-desc">Toque para selecionar o arquivo PDF emitido pelo seu nutricionista</div>
            <button type="button" class="btn-sm" (click)="fileInput.click()">Selecionar PDF</button>
          }
        </div>

        @if (erro()) {
          <div class="error-banner">{{ erro() }}</div>
        }

        <input
          #fileInput
          type="file"
          accept=".pdf,application/pdf"
          style="display:none"
          (change)="onFileChange($event)"
        />

        <!-- Uploaded files list -->
        <div class="shead">
          <span class="stitle">Dietas enviadas</span>
        </div>

        @for (f of arquivosEnviados(); track f.id) {
          <div class="file-row">
            <div class="ffile-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e53935" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div class="ffile-info">
              <div class="ffile-name">{{ f.nome }}</div>
              <div class="ffile-meta">{{ f.tamanho }} · {{ f.data }}</div>
            </div>
            <span class="badge" [class.badge-ok]="f.status === 'Processado'" [class.badge-warn]="f.status === 'Revisão'">
              {{ f.status }}
            </span>
          </div>
        }

        @if (arquivosEnviados().length === 0) {
          <div class="empty-files">Nenhum arquivo enviado ainda.</div>
        }
      </div>

      <app-bottom-nav active="dieta" />
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

    /* User tabs */
    .utabs {
      display: flex;
      border-radius: 11px;
      padding: 3px;
      gap: 3px;
      margin-bottom: 14px;
      background: var(--dt-cream-2);
    }
    .utab {
      flex: 1;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      color: var(--dt-muted);
    }
    .utab.active {
      background: var(--dt-white);
      color: var(--dt-green-800);
    }

    /* Upload zone */
    .upload-zone {
      border-radius: 18px;
      padding: 32px 18px;
      text-align: center;
      margin-bottom: 14px;
      border: 2px dashed var(--dt-cream-3);
      background: var(--dt-white);
      cursor: pointer;
    }
    .upload-zone.drag-over {
      border-color: var(--dt-green-500);
      background: var(--dt-green-50);
    }
    .upload-zone.tem-arquivo {
      border-color: var(--dt-green-400);
      border-style: solid;
    }
    .uz-icon {
      width: 54px; height: 54px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
      background: #eaf3de;
      border: 1px solid #c8ddb0;
    }
    .uz-icon svg { width: 26px; height: 26px; }
    .uz-title {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--dt-text);
      margin-bottom: 6px;
    }
    .uz-desc {
      font-size: 11.5px;
      font-weight: 300;
      line-height: 1.6;
      max-width: 210px;
      margin: 0 auto 16px;
      color: var(--dt-muted);
    }
    .uz-actions {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .btn-sm {
      display: inline-flex;
      align-items: center;
      padding: 9px 22px;
      border-radius: 11px;
      background: var(--dt-cream-2);
      border: 1px solid var(--dt-cream-3);
      color: var(--dt-text-2);
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn-sm.btn-primary {
      background: var(--dt-green-800);
      border-color: var(--dt-green-800);
      color: var(--dt-green-50);
    }
    .btn-sm.btn-primary:hover:not(:disabled) { background: var(--dt-green-700); }
    .btn-sm:disabled { opacity: .6; cursor: not-allowed; }

    .error-banner {
      background: #fff0f0;
      border: 1px solid #fcc;
      color: #b00;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13px;
      margin-bottom: 14px;
    }

    /* Files list */
    .shead {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .stitle {
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      font-weight: 600;
      color: var(--dt-text);
    }
    .file-row {
      display: flex;
      align-items: center;
      gap: 11px;
      border-radius: 13px;
      padding: 12px 13px;
      margin-bottom: 7px;
      border: 0.5px solid var(--dt-cream-3);
      background: var(--dt-white);
    }
    .ffile-icon {
      width: 38px; height: 38px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      background: #fee2e2;
    }
    .ffile-info { flex: 1; min-width: 0; }
    .ffile-name {
      font-size: 12.5px;
      font-weight: 500;
      color: var(--dt-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ffile-meta { font-size: 10.5px; color: var(--dt-muted); margin-top: 1px; }
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
    .empty-files {
      text-align: center;
      color: var(--dt-muted);
      font-size: 13px;
      padding: 16px 0;
    }
  `],
})
export class DietUploadComponent {
  private readonly http = inject(HttpClient);
  readonly router = inject(Router);

  readonly usuarioAtivo = signal<UsuarioTab>('Ana');
  readonly arquivoSelecionado = signal<File | null>(null);
  readonly carregando = signal(false);
  readonly arrastandoArquivo = signal(false);
  readonly erro = signal<string | null>(null);
  readonly arquivosEnviados = signal<{ id: string; nome: string; tamanho: string; data: string; status: string }[]>([]);

  readonly usuarios: UsuarioTab[] = ['Ana', 'Pedro'];

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastandoArquivo.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastandoArquivo.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.arrastandoArquivo.set(false);
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) this.definirArquivo(files[0]);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.definirArquivo(input.files[0]);
  }

  removerArquivo(): void {
    this.arquivoSelecionado.set(null);
  }

  enviarDieta(): void {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) return;
    this.carregando.set(true);
    this.erro.set(null);

    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('usuario', this.usuarioAtivo());

    this.http
      .post<PlanoDietaResponse>(`${environment.apiUrl}/planos-dieta`, formData)
      .subscribe({
        next: (resposta) => {
          localStorage.setItem('dietete_ultimo_plano_id', resposta.id);
          this.carregando.set(false);
          this.router.navigate(['/dieta/revisar', resposta.id]);
        },
        error: (err) => {
          this.carregando.set(false);
          this.erro.set(err.error?.detail ?? 'Erro ao enviar a dieta. Tente novamente.');
        },
      });
  }

  private definirArquivo(file: File): void {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      this.erro.set('Apenas arquivos PDF são aceitos.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.erro.set('O arquivo deve ter no máximo 10 MB.');
      return;
    }
    this.erro.set(null);
    this.arquivoSelecionado.set(file);
  }

  formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
