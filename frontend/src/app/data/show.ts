import Seat from "./seat";

export default interface Show{
    id: string,
    variant: string[],
    startsAt: Date,
    movieId: string,
    theaterId: string,
    seats: Seat[],
}
