import {Component, ViewChild} from '@angular/core';
import {AuthService} from "../../../../../auth/auth.service";
import {MovieService} from "../../../../../api/movie.service";
import {Location} from "@angular/common";
import {FormBuilder} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import Seat from "../../../../../data/seat";
import {Theater} from "../../../../../data/theater";

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
  public seats: Seat[] | undefined;

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

    const theaterId = this.route.snapshot.paramMap.get('theaterId');
    this.update = this.route.snapshot.url.join('/').includes('update');

    if (theaterId) {
      this.movieService.getTheater(theaterId).subscribe({
        next: (theater)  => {
          this.theater = theater;
        },
        error: (err) => {
        }
      });
    }

  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  back() {
    this.location.back();
  }

  onSubmit() {/*
    if (this.theaterForm.valid) {
      const theaterCreate: TheaterCreate = {
        name: this.theaterForm.get('name')?.value,
        features: this.selectedFeatures,
      };

      //different wether it is update or create
      if (this.theaterId) {
        this.movieService.createTheater(theaterCreate).subscribe({
          next: (theater) => {
            this.router.navigate(['/management/theaters']).then(() => {
              this.snackBar.open('Theater created successfully!', 'Close', {
                duration: 5000,
                panelClass: 'success-snackbar'
              });
            });
          },
          error: (err) => {
            this.snackBar.open('An error occurred while creating the theater', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });

      } else {
        this.movieService.createTheater(theaterCreate).subscribe({
          next: (theater) => {
            this.router.navigate(['/management/theaters']).then(() => {
              this.snackBar.open('Theater created successfully!', 'Close', {
                duration: 5000,
                panelClass: 'success-snackbar'
              });
            });
          },
          error: (err) => {
            this.snackBar.open('An error occurred while creating the theater', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });

      }

    }*/
  }


}
