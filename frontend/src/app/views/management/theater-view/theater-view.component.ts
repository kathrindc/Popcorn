import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from 'src/app/api/movie.service';
import { SeatService } from 'src/app/api/seat.service';
import Seat from 'src/app/data/seat';
import Show from 'src/app/data/show';
import {AuthService} from "../../../auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Location} from "@angular/common";

@Component({
  selector: 'app-management',
  templateUrl: './theater-view.component.html',
  styleUrls: ['./theater-view.component.scss']
})
export class TheaterViewComponent implements OnInit {
  private role: string = "";

  public show: Show | undefined
  public selectionMap: any = {};
  public selectedSeats: Seat[] = [];
  public selSeatNumbs: number[] = [];

  public rows: (Seat | null)[][] | undefined;
  public rowNumbs: number | undefined;
  public seatNumbs: number | undefined;


  constructor(
    public movieService: MovieService,
    public seatService: SeatService,
    public route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private location: Location,
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
        let rows = 0;
        let cols = 0;
        show.seats.forEach((seat) => {
          if (seat.displayX > cols) cols = seat.displayX;
          if (seat.displayY > rows) rows = seat.displayY;
        });

        this.rowNumbs = rows;
        this.seatNumbs = cols;

        this.rows = new Array(this.rowNumbs);
        for (let i = 0; i < this.rowNumbs; i++) {
          this.rows[i] = new Array(this.seatNumbs);
          for (let j = 0; j < this.seatNumbs; j++) {
            this.rows[i][j] = null;
          }
        }

        if (this.rows) {
          //set seats to previouse settings
          show.seats.forEach((seat) => {
            const y = Number(seat.displayY) - 1, x = Number(seat.displayX) - 1

            this.rows![y][x] = {
              id: seat.id,
              displayNum: seat.displayNum,
              displayX: seat.displayX,
              displayY: seat.displayY,
              flagDeluxe: seat.flagDeluxe,
              flagWheelchair: seat.flagWheelchair,
              isFree: seat.isFree,
            }

          });
        }
        this.rows.reverse();
        this.show = show;

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
      this.selSeatNumbs[i] = this.selectedSeats[i].id;
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

  back() {
    this.location.back();
  }
}
