export default interface Page<T> {
    count: number,
    next: string | null,
    previous: string | null,
    records: T[]
};
