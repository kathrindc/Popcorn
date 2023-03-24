import {Component} from '@angular/core';
import {AuthService} from "../../../../auth/auth.service";
import MovieDetail from "../../../../data/movieDetail";
import Showing from "../../../../data/showing";
import {MovieService} from "../../../../api/movie.service";
import {ActivatedRoute, Router} from "@angular/router";

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
    public authService: AuthService
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


}
