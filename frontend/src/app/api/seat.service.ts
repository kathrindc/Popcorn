import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import Cart from '../data/cart';
import Seat from '../data/seat';

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  private ApiUrl = "https://popcorn-api.toast.ws"

  constructor(
    public httpClient: HttpClient,
  ) {  }

  public async tryAddCart(showId: string | undefined, seats: number[]){
    const observable = this.httpClient.post<any>(
      `${this.ApiUrl}/my/cart`,
      {showId, seats},
      { observe: 'response'}
    );
    const response = (await lastValueFrom(observable)) as HttpResponse<any>;
    if(response.status === 201){
      return true;
    }
    return false;
  }


  getCart(): Observable<Cart>{
    return this.httpClient.get(`${this.ApiUrl}/my/cart`, {
      responseType: 'json',
    }) as Observable<Cart>;
  }

  public async tryPurchase(){
    const observable = this.httpClient.post<any>(
      `${this.ApiUrl}/my/orders`,
      {},
      { observe: 'response'}
    );
    const response = (await lastValueFrom(observable)) as HttpResponse<any>;
    if(response.status === 201){
      return true;
    }
    return false;
  }

}

