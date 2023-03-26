import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatService } from 'src/app/api/seat.service';
import Cart from 'src/app/data/cart';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {

  public cart: Cart | null = null;
  
  constructor(
    public seatService: SeatService,
    public route: ActivatedRoute,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.seatService.getCart()
      .subscribe((cart)=>this.cart=cart);
  }

  async purchase(event: Event) {
    event.preventDefault();

    if(await this.seatService.tryPurchase()){
      this.router.navigate(['/cart'])
        .then(_r => console.log('seats bought tickets!'));
    }

    console.log(this.cart);
    this.router.navigate(['/orders'])
  }

}
