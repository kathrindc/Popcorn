export default interface MovieDetail {
    id: string,
    name: string,
    description: string,
    duration: number,
    minimumAge: number,
    releasedAt: Date,
    posterUrl: string,
    imdbUrl: string,
}