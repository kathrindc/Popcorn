import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from 'src/app/api/movie.service';
import { SeatService } from 'src/app/api/seat.service';
import Seat from 'src/app/data/seat';
import Show from 'src/app/data/show';
import {AuthService} from "../../../auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-management',
  templateUrl: './theater-view.component.html',
  styleUrls: ['./theater-view.component.scss']
})
export class TheaterViewComponent implements OnInit {
  private role: string = "";

  public show: Show | undefined
  public rows: (Seat | null)[][] | undefined;
  public selectionMap: any = {};
  public selectedSeats: Seat[] = [];
  public selSeatNumbs: number[] = [];

  constructor(
    public movieService: MovieService,
    public seatService: SeatService,
    public route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    let showId = this.route.snapshot.paramMap.get('showId');
    let theaterId = this.route.snapshot.paramMap.get('theaterId');

    if (showId == null||theaterId == null) {
      this.router.navigate(['/']);
      return;
    }

    this.movieService.getShowForId(showId)
      .subscribe((show) => {
        let rows: (Seat | null)[][] = [], lastY = 1;
        let row: (Seat | null)[] = [], nextX = 0;

        for (let seat of show.seats) {
          if (lastY != seat.displayY) {
            lastY = seat.displayY;
            nextX = 0;

            rows.push(row);
            row = [];
          }

          nextX += 1;

          while (nextX < seat.displayX) {
            nextX += 1;
            row.push(null);
          }

          row.push(seat);
        }

        if (row.length > 0) {
          rows.push(row);
        }

        this.show = show;
        this.rows = rows.reverse();
      });

    this.authService.getRole().subscribe({
      next: role => {
        this.role = role;
      },
      error: err => {

      }
    });
  }

  async sellTickets(event: Event) {
    event.preventDefault();

    for(let i=0; i<this.selectedSeats.length; i++){
      this.selSeatNumbs[i]=this.selectedSeats[i].displayNum
    }

    if(await this.seatService.tryAddCart(this.show!.id, this.selSeatNumbs)) {
      if (await this.seatService.tryPurchase()) {
        this.router.navigate(['/management'])
          .then(() => this.snackBar.open('Seats sold successfully!', 'OK',
            {
              duration: 3000,
              panelClass: ['success-snackbar']
            }));
      } else {
        this.snackBar.open('Error while Purchasing Tickets', 'OK',
          {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
      }
    } else {
      this.snackBar.open('Error while Reserving Tickets', 'OK',
        {
          duration: 3000,
          panelClass: ['error-snackbar']
        });

    }

  }

  isSelected(seatId: string | number) : boolean {
    return !!(this.selectionMap[seatId]);
  }

  toggleSelect(seat: Seat) {
    if (!seat.isFree) {
      return;
    }

    this.selectionMap[seat.id] = this.selectionMap[seat.id] ? null : seat;
    this.updateSeats();
  }

  getSeatClass(seat: Seat) : string {
    const base = `seat-box ${this.isSelected(seat.id) ? 'selected' : ''} `;

    if (!seat.isFree) {
      return base + 'taken';
    }

    if (seat.flagWheelchair) {
      return base + 'accessible';
    }

    if (seat.flagDeluxe) {
      return base + 'deluxe';
    }

    return base + 'free';
  }

  getSeatPrice(seat: Seat): string {
    //TODO: calculate proper price by duration, deluxe seat, day, row etc.
    return (seat.flagDeluxe ? 15.90 : 11.90).toFixed(2);
  }

  getTotalPrice(): string {
    let totalPrice = 0;
    for (let seat of this.selectedSeats) {
      totalPrice += seat.flagDeluxe ? 15.9 : 11.9;
    }
    return totalPrice.toFixed(2); // Return the total price with 2 decimal places
  }

  updateSeats() {
    let seats: Seat[] = [];

    for (let id in this.selectionMap) {
      if (this.selectionMap[id] != null) {
        seats.push(this.selectionMap[id] as Seat);
      }
    }

    this.selectedSeats = seats;
  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }
}
