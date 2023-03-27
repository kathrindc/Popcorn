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
  }

  async addToCart(event: Event) {
    event.preventDefault();

    for(let i=0; i<this.selectedSeats.length; i++){
      this.selSeatNumbs[i]=this.selectedSeats[i].id
    }

    if(await this.seatService.tryAddCart(this.show?.id, this.selSeatNumbs)){
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
