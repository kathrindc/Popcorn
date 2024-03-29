import Seat from "./seat";

export default interface Show{
    id: string,
    variant: string[],
    startsAt: string,
    movieId: string,
    theaterId: string,
    seats: Seat[],
}
