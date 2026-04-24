import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../environments/environment';

interface PlanoDietaResponse {
  id: string;
  [key: string]: unknown;
}

@Component({
  selector: 'app-diet-upload',
  standalone: true,
  imports: [
    Card,
    Button,
    ProgressBar,
    Toast,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast />
    <div class="page-container">
      <p-card class="upload-card">
        <ng-template #title>Enviar Dieta</ng-template>
        <ng-template #subtitle>Faça upload do seu plano alimentar em PDF</ng-template>

        <div
          class="drop-zone"
          [class.tem-arquivo]="arquivoSelecionado() !== null"
          [class.drag-over]="arrastandoArquivo()"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
        >
          @if (arquivoSelecionado()) {
            <div class="arquivo-info">
              <i class="pi pi-file-pdf pdf-icon"></i>
              <p class="nome-arquivo">{{ arquivoSelecionado()!.name }}</p>
              <p class="tamanho-arquivo">{{ formatarTamanho(arquivoSelecionado()!.size) }}</p>
              <p-button
                label="Remover"
                icon="pi pi-times"
                severity="danger"
                variant="text"
                (onClick)="removerArquivo()"
              />
            </div>
          } @else {
            <div class="drop-placeholder">
              <i class="pi pi-cloud-upload upload-icon"></i>
              <p>Arraste e solte seu PDF aqui</p>
              <p class="ou-texto">ou</p>
              <p-button
                label="Selecionar arquivo"
                icon="pi pi-folder-open"
                variant="outlined"
                (onClick)="fileInput.click()"
              />
            </div>
          }
        </div>

        <input
          #fileInput
          type="file"
          accept=".pdf,application/pdf"
          style="display: none"
          (change)="onFileChange($event)"
        />

        @if (carregando()) {
          <p-progress-bar mode="indeterminate" styleClass="progress-bar" />
          <p class="carregando-texto">Enviando e processando sua dieta...</p>
        }

        <ng-template #footer>
          <div class="card-actions">
            <p-button
              label="Enviar Dieta"
              icon="pi pi-send"
              [loading]="carregando()"
              [disabled]="!arquivoSelecionado() || carregando()"
              (onClick)="enviarDieta()"
            />
          </div>
        </ng-template>
      </p-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 700px;
      margin: 0 auto;
    }
    .upload-card {
      width: 100%;
    }
    .drop-zone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 48px 24px;
      text-align: center;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      margin-top: 8px;
    }
    .drop-zone.drag-over {
      border-color: var(--p-primary-color, #1976d2);
      background: #e3f2fd;
    }
    .drop-zone.tem-arquivo {
      border-color: #4caf50;
      background: #f1f8e9;
    }
    .upload-icon {
      font-size: 64px;
      color: #bdbdbd;
      display: block;
      margin-bottom: 16px;
    }
    .pdf-icon {
      font-size: 64px;
      color: #f44336;
      display: block;
      margin-bottom: 16px;
    }
    .drop-placeholder p {
      margin: 8px 0;
      color: #757575;
    }
    .ou-texto {
      font-size: 0.875rem;
    }
    .arquivo-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .nome-arquivo {
      font-weight: 500;
      margin: 0;
    }
    .tamanho-arquivo {
      color: #757575;
      font-size: 0.875rem;
      margin: 0;
    }
    .progress-bar {
      margin-top: 16px;
    }
    .carregando-texto {
      text-align: center;
      color: #757575;
      font-size: 0.875rem;
      margin-top: 8px;
    }
    .card-actions {
      display: flex;
      justify-content: flex-end;
    }
  `],
})
export class DietUploadComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly arquivoSelecionado = signal<File | null>(null);
  readonly carregando = signal(false);
  readonly arrastandoArquivo = signal(false);

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
    if (files && files.length > 0) {
      this.definirArquivo(files[0]);
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.definirArquivo(input.files[0]);
    }
  }

  private definirArquivo(file: File): void {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo inválido',
        detail: 'Apenas arquivos PDF são aceitos.',
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo muito grande',
        detail: 'O arquivo deve ter no máximo 10 MB.',
      });
      return;
    }
    this.arquivoSelecionado.set(file);
  }

  removerArquivo(): void {
    this.arquivoSelecionado.set(null);
  }

  enviarDieta(): void {
    const arquivo = this.arquivoSelecionado();
    if (!arquivo) return;

    this.carregando.set(true);

    const formData = new FormData();
    formData.append('arquivo', arquivo);

    this.http
      .post<PlanoDietaResponse>(`${environment.apiUrl}/planos-dieta`, formData)
      .subscribe({
        next: (resposta) => {
          this.carregando.set(false);
          this.router.navigate(['/dieta/revisar', resposta.id]);
        },
        error: (err) => {
          this.carregando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.error?.detail ?? 'Erro ao enviar a dieta. Tente novamente.',
          });
        },
      });
  }

  formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
