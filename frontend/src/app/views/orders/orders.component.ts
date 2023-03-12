import { Component } from '@angular/core';
import { MovieService } from 'src/app/api/movie.service';
import List from 'src/app/data/list';
import Order from 'src/app/data/order';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent {

  public list: List<Order> | null = null;

  constructor(
    public movieService: MovieService
  ) { }

  ngOnInit(): void {
    this.movieService.getOrders()
      .subscribe((list) => {this.list = list;
      console.log(this.list);});
  }

}
