import {Component} from '@angular/core';
import {AuthService} from "../../../../../auth/auth.service";
import {MovieService} from "../../../../../api/movie.service";
import {Location} from "@angular/common";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {Theaters} from "../../../../../data/theaters";
import ShowingCreate from "../../../../../data/showingCreate";



@Component({
  selector: 'app-management',
  templateUrl: './showing-create.component.html',
  styleUrls: ['./showing-create.component.scss']
})
export class ShowingCreateComponent {
  private role: string = "";
  public showingForm: FormGroup;
  public movieId: string | null = null;
  public theaters: Theaters | undefined;

  public daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  constructor(
    public authService: AuthService,
    public movieService: MovieService,
    private location: Location,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.showingForm = this.fb.group({
      theater: [null, Validators.required],
      start: [new Date(), Validators.required],
      end: ['', Validators.required],
      startTimeHours: ['19', Validators.required],
      startTimeMinutes: ['00', Validators.required],
      daysOfWeek: this.fb.group({
        Monday: [false],
        Tuesday: [false],
        Wednesday: [false],
        Thursday: [false],
        Friday: [false],
        Saturday: [false],
        Sunday: [false]
      })
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

    this.movieService.getTheaters().subscribe({
      next: (theaters: Theaters) => {
        this.theaters = theaters;
      }
    })

    this.movieId = this.route.snapshot.paramMap.get('movieId');

  }

  hasRole(roles: string[]): boolean {
    return roles.includes(this.role);
  }

  back() {
    this.location.back();
  }

  onSubmit() {
    if (this.showingForm.valid && this.movieId != null) {
      const id = this.movieId;
      const selectedDates = this.getSelectedDates();

      selectedDates.forEach(date => {
        const body: ShowingCreate = {
          startsAt: date,
          movieId: id,
          theaterId: this.showingForm.value.theater,
          variant: []
        };

        this.movieService.createShowing(body).subscribe({
          next: (showing) => {

          },
          error: (err) => {
            this.snackBar.open('An error occurred while creating the movie', 'Close', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      });

      this.router.navigate(['management/schedule/' + this.movieId])
    }
  }

  getSelectedDates() {
    const selectedDates = [];
    const startDate = new Date(this.showingForm.value.start);
    const endDate = new Date(this.showingForm.value.end);
    const selectedDays = this.showingForm.value.daysOfWeek;
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayOfWeek = this.daysOfWeek[currentDate.getDay()];
      if (selectedDays[dayOfWeek]) {
        currentDate.setHours(this.showingForm.value.startTimeHours, this.showingForm.value.startTimeMinutes);
        selectedDates.push(currentDate.toISOString());
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return selectedDates;
  }

}
