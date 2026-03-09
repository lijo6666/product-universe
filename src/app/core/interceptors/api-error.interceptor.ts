import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.status === 0
          ? 'Network connection failed. Please check your internet or API server.'
          : `Request failed (${error.status}). Please try again.`;

      snackBar.open(message, 'Dismiss', {
        duration: 4000,
        verticalPosition: 'top'
      });

      return throwError(() => error);
    })
  );
};
