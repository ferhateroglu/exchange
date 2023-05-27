class Order {
    constructor(orderId, price, quantity, side) {
        this.id = orderId;
        this.price = price;
        this.quantity = quantity;
        this.side = side;
    }
}

export default Order;