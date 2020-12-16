import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        let cloned: HttpRequest<any>;
        const token = localStorage.getItem('token');
        if (token) {
            cloned = req.clone({
                headers: req.headers.set('Authorization', 'bearer '.concat(token)),
                url: environment.baseURL + environment.apiURL + `${req.url}`
            });
        } else {
            cloned = req.clone({ url: environment.baseURL + environment.apiURL + `${req.url}` });
        }
        return next.handle(cloned);
    }
}
