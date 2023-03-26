import {Component, ViewChild} from '@angular/core';
import {AuthService} from "../../../../../auth/auth.service";
import {MovieService} from "../../../../../api/movie.service";
import {Location} from "@angular/common";
import {FormBuilder} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import Seat from "../../../../../data/seat";
import {Theater} from "../../../../../data/theater";
import SeatDetails from "../../../../../data/seatDetails";
import SeatCreate from "../../../../../data/seatCreate";
import SeatCreateNew from "../../../../../data/seatCreateNew";
import {forkJoin, mergeMap, Observable} from "rxjs";

// Define a new interface to represent the 2D array of seats
interface SeatArray {
  [index: number]: SeatCreateNew[];
}

@Component({
  selector: 'app-management',
  templateUrl: './seats-create.component.html',
  styleUrls: ['./seats-create.component.scss']
})
export class SeatsCreateComponent {
  private role: string = "";

  //for updating seats
  public update: boolean = false;

  public theaterId: string | null = null;
  private theater: Theater | undefined;
  public oldSeats: SeatDetails[] | undefined;
  public seatsCreate: SeatCreate[] | undefined;
  public rows: (Seat | null)[][] | undefined;

  //for creating new seat scheme
  public seatsCreateNew: SeatCreateNew[][] | undefined;

  public selectionMap: any = {};
  public selectedSeats: Seat[] = [];
  public selSeatNumbs: number[] = [];

  public rowNumbs: number | undefined;
  public seatNumbs: number | undefined;


  constructor(
    public authService: AuthService,
    public movieService: MovieService,
    private location: Location,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {

  }

  ngOnInit() {
    this.authService.getRole().subscribe({
      next: role => {
        this.role = role;
      },
      error: err => {
      }
    });

    this.theaterId = this.route.snapshot.paramMap.get('theaterId');
    this.update = this.route.snapshot.url.join('/').includes('update');

    if (this.theaterId) {
      this.movieService.getTheater(this.theaterId).subscribe({
        next: (theater)  => {
          this.theater = theater;
        },
        error: (err) => {
        }
      });
    }

    if (this.theaterId) {
      this.movieService.getSeats(this.theaterId).subscribe((seats) => {
        if (seats.length > 0) {
          this.update = true;
          this.oldSeats = seats;

          let rows = 0;
          let cols = 0;
          seats.forEach((seat) => {
            if (seat.displayX > cols) cols = seat.displayX;
            if (seat.displayY > rows) rows = seat.displayY;
          });

          this.rowNumbs = rows;
          this.seatNumbs = cols;

          //set grid and set all to inactive
          this.seatsCreateNew = new Array(this.rowNumbs);
          for (let i = 0; i < this.rowNumbs; i++) {
            this.seatsCreateNew[i] = new Array(this.seatNumbs);
            for (let j = 0; j < this.seatNumbs; j++) {
              this.seatsCreateNew[i][j] = {
                displayNum: "0",
                displayX: i+1,
                displayY: j+1,
                flagDeluxe: false,
                flagWheelchair: false,
                active: false
              }
            }
          }

          if (this.seatsCreateNew) {
            //set seats to previouse settings
            seats.forEach((seat) => {
              const y = Number(seat.displayY) - 1, x = Number(seat.displayX) - 1

              this.seatsCreateNew![y][x] = {
                displayNum: "0",
                displayX: seat.displayX,
                displayY: seat.displayY,
                flagDeluxe: seat.flagDeluxe,
                flagWheelchair: seat.flagWheelchair,
                active: true,
              }

            });
          }
          this.seatsCreateNew.reverse();
        }


      });

    } else {
/*      this.rowNumbs = 6;
      this.seatNumbs = 8;*/

    }

  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  back() {
    this.location.back();
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

  getSeatClassNew(seat: SeatCreateNew) : string {
    const base = `seat-box `;

    if (seat.flagWheelchair) {
      return base + 'accessible';
    } else if (seat.flagDeluxe) {
      return base + 'deluxe';
    } else if (!seat.active) {
      return base + 'inactive';
    }
    return base + 'active';
  }

  toggleSelect(seat: Seat) {
    if (!seat.isFree) {
      return;
    }

    this.selectionMap[seat.id] = this.selectionMap[seat.id] ? null : seat;
    this.updateSeats();
  }

  toggleSelectNew(seat: SeatCreateNew) {
    if (seat.active && !seat.flagDeluxe && !seat.flagWheelchair) {
      seat.active = true;
      seat.flagDeluxe = true;
      seat.flagWheelchair = false;
    } else if (seat.flagDeluxe) {
      seat.active = true;
      seat.flagDeluxe = false;
      seat.flagWheelchair = true;
    } else if (seat.flagWheelchair) {
      seat.active = false;
      seat.flagDeluxe = false;
      seat.flagWheelchair = false;
    } else {
      seat.active = true;
      seat.flagDeluxe = false;
      seat.flagWheelchair = false;
    }

  }

  isSelected(seatId: string | number) : boolean {
    return !!(this.selectionMap[seatId]);
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

  newSeating() {
    if (this.rowNumbs !== undefined && this.seatNumbs !== undefined) {
      this.seatsCreateNew = new Array(this.rowNumbs);
      for (let i = 0; i < this.rowNumbs; i++) {
        this.seatsCreateNew[i] = new Array(this.seatNumbs);

        for (let j = 0; j < this.seatNumbs; j++) {
          this.seatsCreateNew[i][j] = {
            displayNum: "0",
            displayX: j+1,
            displayY: i+1,
            flagDeluxe: false,
            flagWheelchair: false,
            active: true
          }
        }
      }

      this.seatsCreateNew.reverse();
    }

  }

  createSeats() {
    if (this.rowNumbs !== undefined && this.seatNumbs !== undefined) {
      if (this.seatsCreateNew && this.theaterId) {
        //observables to delete Seats
        const deleteSeatObservables: Observable<boolean>[] = [];
        if (this.update) {

          //delete all seats from this theater
          this.oldSeats?.forEach((seat) => {
            deleteSeatObservables.push(
              this.movieService.deleteSeat(this.theaterId!, seat.id)
            );
          });
        }

        //make a forkJoin if we have to wait for observables
        if (deleteSeatObservables.length > 0) {
          forkJoin(deleteSeatObservables).subscribe({
            next: () => {
              this.saveNewSeats();
            },
            error: (err) => {
              this.snackBar.open('Error while deleting Seats!', 'Close', {
                duration: 3000,
                panelClass: 'error-snackbar'
              });
            }
          });

        } else {
          this.saveNewSeats();
        }

      }
    }

  }

  saveNewSeats() {
    let seatNumber = 1;
    const createSeatObservables = [];

    if (this.rowNumbs && this.seatNumbs && this.seatsCreateNew && this.theaterId) {
      for (let i = 0; i < this.rowNumbs; i++) {
        for (let j = 0; j < this.seatNumbs; j++) {
          if (this.seatsCreateNew[i][j].active) {
            const mySeatCreate: SeatCreate = {
              displayNum: String(seatNumber),
              displayX: this.seatsCreateNew[i][j].displayX,
              displayY: this.seatsCreateNew[i][j].displayY,
              flagDeluxe: this.seatsCreateNew[i][j].flagDeluxe,
              flagWheelchair: this.seatsCreateNew[i][j].flagWheelchair,
            }
            seatNumber++;

            createSeatObservables.push(
              this.movieService.createSeat(this.theaterId, mySeatCreate)
            );

          }
        }
      }

      if (createSeatObservables.length > 0) {
        forkJoin(createSeatObservables).pipe(
          mergeMap(() => {
            return this.router.navigate(['/management/theaters']);
          })
        ).subscribe({
          next: () => {
            this.snackBar.open('Seats created successfully!', 'Close', {
              duration: 5000,
              panelClass: 'success-snackbar'
            });
          },
          error: (err) => {
            this.snackBar.open('Error while creating Seats!', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      } else {
        this.router.navigate(['/management/theaters']);
      }
    }

  }


}
