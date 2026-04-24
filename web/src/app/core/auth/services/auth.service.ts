import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  RespostaAutenticacao,
  EntrarRequest,
  RegistrarRequest,
} from '../models/auth.models';

const TOKEN_KEY = 'dietete_token';
const REFRESH_TOKEN_KEY = 'dietete_refresh_token';
const USUARIO_KEY = 'dietete_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly usuarioAtual = signal<RespostaAutenticacao | null>(null);

  readonly estaLogado = computed(() => this.usuarioAtual() !== null);

  readonly nomeUsuario = computed(() => this.usuarioAtual()?.nomeCompleto ?? '');

  constructor() {
    this.carregarUsuarioDoStorage();
  }

  private carregarUsuarioDoStorage(): void {
    try {
      const dados = localStorage.getItem(USUARIO_KEY);
      if (dados) {
        const usuario: RespostaAutenticacao = JSON.parse(dados);
        this.usuarioAtual.set(usuario);
      }
    } catch {
      this.limparStorage();
    }
  }

  obterToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  obterRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  entrar(req: EntrarRequest): Observable<RespostaAutenticacao> {
    return this.http
      .post<RespostaAutenticacao>(`${environment.apiUrl}/auth/entrar`, req)
      .pipe(
        tap((resposta) => this.salvarSessao(resposta)),
        catchError((err) => throwError(() => err))
      );
  }

  registrar(req: RegistrarRequest): Observable<RespostaAutenticacao> {
    return this.http
      .post<RespostaAutenticacao>(`${environment.apiUrl}/auth/registrar`, req)
      .pipe(
        tap((resposta) => this.salvarSessao(resposta)),
        catchError((err) => throwError(() => err))
      );
  }

  atualizarToken(): Observable<RespostaAutenticacao> {
    const refreshToken = this.obterRefreshToken();
    return this.http
      .post<RespostaAutenticacao>(`${environment.apiUrl}/auth/atualizar-token`, {
        tokenAtualizacao: refreshToken,
      })
      .pipe(
        tap((resposta) => this.salvarSessao(resposta)),
        catchError((err) => {
          this.sair();
          return throwError(() => err);
        })
      );
  }

  sair(): void {
    this.limparStorage();
    this.usuarioAtual.set(null);
    this.router.navigate(['/auth/login']);
  }

  private salvarSessao(resposta: RespostaAutenticacao): void {
    localStorage.setItem(TOKEN_KEY, resposta.tokenAcesso);
    localStorage.setItem(REFRESH_TOKEN_KEY, resposta.tokenAtualizacao);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(resposta));
    this.usuarioAtual.set(resposta);
  }

  private limparStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  }
}
