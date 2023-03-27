import ticket from "./ticket"

export default interface OrderDetail{
    id: string,
    userId: string,
    complete: boolean,
    submittedAt: Date,
    completedAt: Date,
    tickets: ticket[],
}