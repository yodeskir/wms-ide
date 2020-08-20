import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { MapStateService } from './map-state.service';
import { MapState } from '../map-state';
import { Observable } from 'rxjs';
import { AuthResult } from '../login/authResult';
import { catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class LoginService {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient, private mapStateService: MapStateService) {
  }

  isValid(): any {
    const mapstate: MapState = this.mapStateService.getMapState();
    return mapstate.token != null && mapstate.token.length > 0;
}

  doLogin(username, password): Observable<AuthResult> {
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    httpOptions.headers = headers;
    const req = {'username': username, 'password': password};
    return this.http.post<AuthResult>(this.baseUrl + '/login/signin/', req, httpOptions)
    .pipe(
      // catchError(this.handleError('doLogin', null))
    );
  }





}
