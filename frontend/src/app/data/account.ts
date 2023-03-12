import { EmailValidator } from "@angular/forms"

export default interface Account{
    id: string,
    role: string,
    email: string,
    nameFirst: string,
    nameLast: string,
    birthday: Date,
    addressLine1: string,
    addressLine2: string,
    addressPostcode: string,
    addressTown: string,
    addressState: string,
    addressCountry: string,
}