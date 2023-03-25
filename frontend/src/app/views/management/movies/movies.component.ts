import {Component} from '@angular/core';
import {AuthService} from "../../../auth/auth.service";
import {MovieService} from "../../../api/movie.service";
import Page from "../../../api/page";
import MovieBasic from "../../../data/movieBasic";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog.component";

@Component({
  selector: 'app-management',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
})
export class MoviesComponent {
  private role: string = "";
  public movies: Page<MovieBasic> | undefined;

  constructor(
    public authService: AuthService,
    public movieService: MovieService,
    private router: Router,
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

    this.movieService.listMovie(1, 10, true).subscribe((movies) => {
      this.movies = movies;
    });

  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  editMovie(id: string, event: MouseEvent) {
    event.stopPropagation();
    this.router.navigate(['management/movies/update/' + id]);

  }

  openDialog(id: string, event: MouseEvent) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: { id: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteMovie(id);
      }
    });


  }

  deleteMovie(id: string) {
    this.movieService.deleteMovie(id).subscribe({
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

  createMovie() {
    this.router.navigate(['/management/movies/create']);
  }

}
