import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from 'src/app/api/movie.service';
import { SeatService } from 'src/app/api/seat.service';
import Seat from 'src/app/data/seat';
import Show from 'src/app/data/show';

@Component({
  selector: 'app-seats',
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.scss']
})
export class SeatsComponent implements OnInit {

  public show: Show | null = null;
  public rows: (Seat | null)[][] | null = null;
  public selectionMap: any = {};
  public selectedSeats: Seat[] = [];
  public selSeatNumbs: number[] = [];

  constructor(
    public movieService: MovieService,
    public seatService: SeatService,
    public route: ActivatedRoute,
    public router: Router
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
  }

  async addToCart(event: Event) {
    event.preventDefault();

    for(let i=0; i<this.selectedSeats.length; i++){
      this.selSeatNumbs[i]=this.selectedSeats[i].displayNum
    }

    if(await this.seatService.tryAddCart(this.show?.theaterId, this.selSeatNumbs)){
      this.router.navigate(['/cart'])
        .then(_r => console.log('seats successfully added to cart'));
    }

    console.log(this.selectedSeats);
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

  updateSeats() {
    let seats: Seat[] = [];

    for (let id in this.selectionMap) {
      if (this.selectionMap[id] != null) {
        seats.push(this.selectionMap[id] as Seat);
      }
    }

    this.selectedSeats = seats;
  }
}
