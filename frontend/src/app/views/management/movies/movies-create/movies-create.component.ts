import {Component} from '@angular/core';
import {AuthService} from "../../../../auth/auth.service";
import {MovieService} from "../../../../api/movie.service";
import {DatePipe, Location} from "@angular/common";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import MovieDetail from "../../../../data/movieDetail";


@Component({
  selector: 'app-management',
  templateUrl: './movies-create.component.html',
  styleUrls: ['./movies-create.component.scss']
})
export class MoviesCreateComponent {
  private role: string = "";
  public movieForm: FormGroup;

  //for updating movie
  public movieId: string | null = null;
  private movie: MovieDetail | undefined;


  constructor(
    public authService: AuthService,
    public movieService: MovieService,
    private location: Location,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.movieForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      duration: [null, [Validators.required, Validators.min(0)]],
      minimumAge: [null, [Validators.required, Validators.min(0)]],
      releasedAt: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.authService.getRole().subscribe({
      next: role => {
        this.role = role;
      },
      error: err => {
      }
    });

    this.movieForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      duration: [null, [Validators.required, Validators.min(0)]],
      minimumAge: [null, [Validators.required, Validators.min(0)]],
      releasedAt: [null, Validators.required],
    });

    var id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.movieService.getMovie(id).subscribe({
        next: (data)  => {
          this.movieId = id;
          this.movie = data;
          this.movieForm.patchValue({
            name: this.movie.name,
            description: this.movie.description,
            duration: this.movie.duration,
            minimumAge: this.movie.minimumAge,
            releasedAt: this.movie.releasedAt,
          });
        },
        error: (err) =>{
          this.movieId = null;
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

  onSubmit() {
    if (this.movieForm.valid) {
      const formData = this.movieForm.value;
      const releasedAtDate = new Date(formData.releasedAt);
      const year = releasedAtDate.getFullYear();
      const month = releasedAtDate.getMonth()+1 >= 10 ? releasedAtDate.getMonth() + 1 : '0' + (releasedAtDate.getMonth() + 1);
      const date = releasedAtDate.getDate() >= 10 ? releasedAtDate.getDate() : '0' + releasedAtDate.getDate();
      formData.releasedAt = year + '-' + month + '-' + date;
      console.log(formData.releasedAt);

      //different wether it is update or create
      if (this.movieId) {
        formData.id = this.movieId;
        this.movieService.updateMovie(formData).subscribe({
          next: (movie) => {
            this.router.navigate(['/management/movies']).then(() => {
              this.snackBar.open('Movie updated successfully!', 'Close', {
                duration: 5000,
                panelClass: 'success-snackbar'
              });
            });
          },
          error: (err) => {
            this.snackBar.open('An error occurred while updating the movie', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });

      } else {
        this.movieService.createMovie(formData).subscribe({
          next: (movie) => {
            this.router.navigate(['/management/movies']).then(() => {
              this.snackBar.open('Movie created successfully!', 'Close', {
                duration: 5000,
                panelClass: 'success-snackbar'
              });
            });
          },
          error: (err) => {
            this.snackBar.open('An error occurred while creating the movie', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });

      }

    }
  }

}
