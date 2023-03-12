import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from 'src/app/api/movie.service';
import OrderDetail from 'src/app/data/orderDetail';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent {
  public orderDetail: OrderDetail | null = null;

  constructor(
    public movieService: MovieService,
    public route: ActivatedRoute,
    public router: Router,
  ) { }

  ngOnInit(): void {
    let id = this.route.snapshot.paramMap.get('id');

    if (id == null) {
      this.router.navigate(['/']);

      return;
    }

    this.movieService.getOrderDetail(id)
      .subscribe((orderDetail) => {this.orderDetail = orderDetail;
      console.log(this.orderDetail);});
  }
}
