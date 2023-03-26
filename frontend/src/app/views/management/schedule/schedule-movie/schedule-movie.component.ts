import {Component} from '@angular/core';
import {AuthService} from "../../../../auth/auth.service";
import MovieDetail from "../../../../data/movieDetail";
import Showing from "../../../../data/showing";
import {MovieService} from "../../../../api/movie.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-management',
  templateUrl: './schedule-movie.component.html',
  styleUrls: ['./schedule-movie.component.scss']
})
export class ScheduleMovieComponent {
  private role: string = "";

  public movie: MovieDetail | undefined;
  public showings: Showing[] | undefined;


  constructor(
    public movieService: MovieService,
    public route: ActivatedRoute,
    public router: Router,
    public authService: AuthService,
    private location: Location,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
  }


  ngOnInit() {
    this.authService.getRole().subscribe({
      next: role => {
        this.role = role;
      },
      error: err => {
        //TODO: error handling
      }
    });

    let movieId = this.route.snapshot.paramMap.get('movie_id');

    if (movieId) {
      this.movieService.getMovie(movieId)
        .subscribe((movie) => {
          this.movie = movie;
        });

      this.movieService.getThisWeeksShowings(movieId)
        .subscribe((showings) => {
          this.showings = showings;
        });

    }

  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  buyTickets(movieId: number, theaterId: number) {

  }

  back() {
    this.location.back();
  }

  openDialog(id: string, event: MouseEvent) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: { id: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteShowing(id);
      }
    });

  }

  createShowing() {
    this.router.navigate(['/management/showing/create/' + this.movie?.id]);
  }

  deleteShowing(id: string) {
    this.movieService.deleteShowing(id).subscribe({
      next: (success) => {
        this.snackBar.open('Movie deleted successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        window.location.reload();
      },
      error: (err) => {
        this.snackBar.open('An error occurred while creating the movie', 'Close', {
          duration: 3000,
          panelClass: 'error-snackbar'
        });
      }
    });

  }

  getDateString(date: string) {
    const myDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const time = myDate.toLocaleTimeString('de-DE', {
      hour: 'numeric',
      minute: 'numeric',
    });

    if (myDate.toDateString() === today.toDateString()) {
      return 'Heute, ' + time + ' Uhr';
    } else if (myDate.toDateString() === tomorrow.toDateString()) {
      return 'Morgen, ' + time + ' Uhr';
    } else {
      return myDate.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }) + ' Uhr';
    }

  }

}
