import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MovieService } from 'src/app/api/movie.service';
import List from 'src/app/data/list';
import MovieMini from 'src/app/data/movieMini';
import Review from 'src/app/data/review';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {
  public list: List<Review> | null = null;

  constructor(
    public movieService: MovieService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews() {
    this.movieService.getReviews()
      .subscribe((list) => {this.list = list;});
  }

  openReviewDialog() {
    let dialogRef = this.dialog.open(ReviewDialog, {
      width: '50vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadReviews();
      }
    });
  }
}

@Component({
  selector: 'dialog-review',
  templateUrl: './dialog-review.html'
})
export class ReviewDialog {
  public reviewableMovies: MovieMini[] = [];
  public movieId: string = '';
  public stars: number = 3;
  public content: string = '';

  constructor(
    public dialogRef: MatDialogRef<ReviewDialog>,
    public movieService: MovieService
  ) {
    movieService.getReviewableMovies().subscribe(results => this.reviewableMovies = results);
  }

  submit() {
    this.movieService.submitReview(this.movieId, this.stars, this.content)
      .subscribe(() => this.dialogRef.close(true))
  }

  onContentChange(event: Event) {
    this.content = (event.target as any).value;
  }
}
