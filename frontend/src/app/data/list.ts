import Order from "./order";

export default interface List<T>{
    totalRecords: number,
    totalPages: number,
    currentPage: number,
    records: T[],
}