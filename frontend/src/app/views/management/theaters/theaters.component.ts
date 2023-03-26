import {Component} from '@angular/core';
import {AuthService} from "../../../auth/auth.service";
import {MovieService} from "../../../api/movie.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "../dialogs/confirm-dialog.component";
import {Location} from "@angular/common";
import {Theaters} from "../../../data/theaters";

@Component({
  selector: 'app-management',
  templateUrl: './theaters.component.html',
  styleUrls: ['./theaters.component.scss']
})
export class TheatersComponent {
  private role: string = "";
  public theaters: Theaters | undefined;

  constructor(
    public authService: AuthService,
    public movieService: MovieService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private location: Location,
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

    this.movieService.getTheaters().subscribe((theaters) => {
      this.theaters = theaters;
    });

  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  editTheater(id: string, event: MouseEvent) {
    event.stopPropagation();
    // this.router.navigate(['management/movies/update/' + id]);

  }

  openDialog(id: string, event: MouseEvent) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: { id: id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deleteTheater(id);
      }
    });

  }

  deleteTheater(id: string) {
    //TODO: deleteTheater
/*    this.movieService.deleteMovie(id).subscribe({
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
    });*/

  }

  createTheater() {
    // this.router.navigate(['/management/movies/create']);
  }

  back() {
    this.location.back();
  }


  getFeatures(features: string[]) {
    return features.join(', ');

  }

}
