import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import MovieBasic from '../data/movieBasic';
import MovieDetail from '../data/movieDetail';
import Seat from '../data/seat';
import Show from '../data/show';
import Showing from '../data/showing';
import Page from './page';

@Injectable({
  providedIn: 'root'
})
export class MovieService {

  private ApiUrl = "https://popcorn-api.toast.ws/"
  

  constructor(
    public httpClient: HttpClient
  ) { }

  listMovie(page: number, size: number, inactive: boolean): Observable<Page<MovieBasic>> {
    return this.httpClient.get(`${this.ApiUrl}movies/?`+
    `page=${encodeURIComponent(page)}&`+
    `size=${encodeURIComponent(size)}&`+
    `inactive=${encodeURIComponent(inactive)}`, {
      responseType: 'json',
    }) as Observable<Page<MovieBasic>>;
  }

  getMovie(id: string): Observable<MovieDetail>{
    return this.httpClient.get(`${this.ApiUrl}movies/${encodeURIComponent(id)}`, {
      responseType: 'json',
    }) as Observable<MovieDetail>;
  }

  getShowings(id: string, date: Date): Observable<Page<Showing>>{
    return this.httpClient.get(`${this.ApiUrl}movies/${encodeURIComponent(id)}/shows/?date=${date}`, {
      responseType: 'json',
    }) as Observable<Page<Showing>>;
  }

  getThisWeeksShowings(id: string): Observable<Showing[]>{
    return this.httpClient.get(`${this.ApiUrl}movies/${encodeURIComponent(id)}/shows`, {
      responseType: 'json',
    }) as Observable<Showing[]>;
  }

  getShowForId(id: string): Observable<Show>{
    return this.httpClient.get(`${this.ApiUrl}shows/${encodeURIComponent(id)}`, {
      responseType: 'json',
    }) as Observable<Show>;
  }

}
