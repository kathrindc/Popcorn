import CartItem from "./cartItem"

export default interface Cart {
    expiry: Date,
    items: CartItem[],
}