import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {JwtHelperService} from '@auth0/angular-jwt';
import {firstValueFrom, lastValueFrom, map, Observable, pluck} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private ApiUrl = "https://popcorn-api.toast.ws"

  constructor(
    public jwtHelper: JwtHelperService,
    public httpClient: HttpClient,
    public router: Router,
  ) {
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('auth');

    return !this.jwtHelper.isTokenExpired(token);
  }

  public getRole(): Observable<string> {
    let headers: HttpHeaders = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Authorization', `Bearer ${localStorage.getItem('auth')}`);

    const observable = this.httpClient.get(
      `${this.ApiUrl}/my/account`,
      {headers: headers}
    );

    return observable.pipe(map((x: any) => x.role));
  }

  public async tryLogin(email: string, password: string): Promise<boolean> {
    const observable = this.httpClient.post(
      `${this.ApiUrl}/auth/login`,
      {email, password}
    );
    const {token} = (await lastValueFrom(observable)) as { token: string };

    if (token) {
      localStorage.setItem('auth', token);

      return true;
    }

    return false;
  }

  public logout() {
    localStorage.removeItem('auth');

    this.router.navigate(['/login']);
  }
}
