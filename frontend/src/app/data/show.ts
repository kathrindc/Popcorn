import Seat from "./seat";

export default interface Show{
    id: number,
    variant: string[],
    startsAt: Date,
    movieId: string,
    theaterId: string,
    seats: Seat[],
}