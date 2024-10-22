import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const ErrorInterceptor: HttpInterceptorFn = (req, next) => {

  return next(req).pipe(
    catchError((err: any) => {

      if (err instanceof HttpErrorResponse) {

        if (err.status === 404) {
        } else {
          console.error('HTTP error:', err);
        }


      } else {
        console.error('Um erro ocorreu:', err);
      }

      return throwError(() => err);
    })
  );
};
