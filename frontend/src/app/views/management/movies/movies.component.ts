import {Component} from '@angular/core';
import {AuthService} from "../../../auth/auth.service";
import {MovieService} from "../../../api/movie.service";
import Page from "../../../api/page";
import MovieBasic from "../../../data/movieBasic";

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
    public movieService: MovieService
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

}
