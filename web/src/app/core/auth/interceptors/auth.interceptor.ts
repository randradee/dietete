import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RespostaAutenticacao } from '../models/auth.models';

let estaAtualizando = false;
const refreshSubject = new BehaviorSubject<RespostaAutenticacao | null>(null);

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.obterToken();

  const reqAutenticada = token ? adicionarToken(req, token) : req;

  return next(reqAutenticada).pipe(
    catchError((erro) => {
      if (erro instanceof HttpErrorResponse && erro.status === 401) {
        return tratarErro401(req, next, authService);
      }
      return throwError(() => erro);
    })
  );
};

function adicionarToken(
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function tratarErro401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) {
  if (!estaAtualizando) {
    estaAtualizando = true;
    refreshSubject.next(null);

    return authService.atualizarToken().pipe(
      switchMap((resposta) => {
        estaAtualizando = false;
        refreshSubject.next(resposta);
        return next(adicionarToken(req, resposta.tokenAcesso));
      }),
      catchError((err) => {
        estaAtualizando = false;
        authService.sair();
        return throwError(() => err);
      })
    );
  }

  return refreshSubject.pipe(
    filter((resposta) => resposta !== null),
    take(1),
    switchMap((resposta) =>
      next(adicionarToken(req, resposta!.tokenAcesso))
    )
  );
}
