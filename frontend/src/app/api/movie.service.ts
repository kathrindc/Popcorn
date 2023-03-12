import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Account from '../data/account';
import MovieBasic from '../data/movieBasic';
import MovieDetail from '../data/movieDetail';
import OrderDetail from '../data/orderDetail';
import List from '../data/list';
import Review from '../data/review';
import Seat from '../data/seat';
import Show from '../data/show';
import Showing from '../data/showing';
import Page from './page';
import Order from '../data/order';
import MovieMini from '../data/movieMini';

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

  getOrders(): Observable<List<Order>>{
    return this.httpClient.get(`${this.ApiUrl}my/orders`,
    {responseType: 'json',
  }) as Observable<List<Order>>
  }

  getOrderDetail(id: string): Observable<OrderDetail>{
    return this.httpClient.get(`${this.ApiUrl}my/orders/${id}`,
    {responseType: 'json',
  }) as Observable<OrderDetail>
  }

  getAccountInfo(): Observable<Account>{
    return this.httpClient.get(`${this.ApiUrl}my/account`,
    {responseType: 'json',
  }) as Observable<Account>
  }
  
  getReviews(): Observable<List<Review>>{
    return this.httpClient.get(`${this.ApiUrl}my/ratings`,
    {responseType: 'json',
  }) as Observable<List<Review>>
  }

  submitReview(movieId: string, stars: number, content: string): Observable<string> {
    return this.httpClient.post(`${this.ApiUrl}my/ratings`, {movieId, stars, content}, { responseType: 'text' }) as Observable<string>
  }

  getReviewableMovies(): Observable<MovieMini[]> {
    return this.httpClient.get(`${this.ApiUrl}my/movies?unrated=true`,
    {responseType: 'json'}) as Observable<MovieMini[]>
  }
}
