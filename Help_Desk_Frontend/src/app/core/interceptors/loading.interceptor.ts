import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  const loadingService = inject(LoadingService);

  let message = 'Cargando...';

  switch (req.method) {

    case 'POST':
      message = 'Procesando...';
      break;

    case 'PUT':
    case 'PATCH':
      message = 'Actualizando...';
      break;

    case 'DELETE':
      message = 'Eliminando...';
      break;

    case 'GET':
      message = 'Cargando...';
      break;

  }

  loadingService.show(message);

  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );

};