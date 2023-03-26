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
import {Theaters} from "../data/theaters";
import {Theater} from "../data/theater";
import ShowingCreate from "../data/showingCreate";
import {TheaterCreate} from "../data/theater-create";

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

  createMovie(formData: FormData): Observable<MovieDetail>{
    return this.httpClient.post<MovieDetail>(`${this.ApiUrl}movies`, formData);
  }

  updateMovie(formData: FormData): Observable<MovieDetail>{
    return this.httpClient.put<MovieDetail>(`${this.ApiUrl}movies`, formData);
  }

  deleteMovie(id: string): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${this.ApiUrl}movies/${id}`, {
      responseType: 'json',
    });
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

  deleteShowing(id: string): Observable<boolean>{
    return this.httpClient.delete<boolean>(`${this.ApiUrl}shows/${id}`, {
      responseType: 'json',
    });
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
    return this.httpClient.get(`${this.ApiUrl}my/ratings`, {
      responseType: 'json',
  }) as Observable<List<Review>>
  }

  getTheaters(): Observable<Theaters> {
    return this.httpClient.get<Theaters>(`${this.ApiUrl}theaters`, {
      responseType: 'json',
    });
  }

  getTheater(id: string): Observable<Theater> {
    return this.httpClient.get<Theater>(`${this.ApiUrl}theaters/${id}`, {
      responseType: 'json',
    });
  }

  deleteTheater(id: string): Observable<boolean> {
    return this.httpClient.delete<boolean>(`${this.ApiUrl}theaters/${id}`, {
      responseType: 'json',
    });
  }

  createTheater(data: TheaterCreate): Observable<Theater> {
    console.log(data);
    return this.httpClient.post<Theater>(`${this.ApiUrl}theaters`, data);
  }

  updateTheater(data: Theater): Observable<Theater>{
    return this.httpClient.put<Theater>(`${this.ApiUrl}theaters`, data);
  }

  createShowing(data: ShowingCreate): Observable<Showing> {
    console.log(data);
    return this.httpClient.post<Showing>(`${this.ApiUrl}shows`, data);
  }

  submitReview(movieId: string, stars: number, content: string): Observable<string> {
    return this.httpClient.post(`${this.ApiUrl}my/ratings`, {movieId, stars, content}, { responseType: 'text' }) as Observable<string>
  }

  getReviewableMovies(): Observable<MovieMini[]> {
    return this.httpClient.get(`${this.ApiUrl}my/movies?unrated=true`,
    {responseType: 'json'}) as Observable<MovieMini[]>
  }
}
