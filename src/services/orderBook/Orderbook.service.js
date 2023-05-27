import Order from "../../database/models/Order";

class Orderbook {
    constructor(shareId) {
        this.shareId = shareId;
        this.bids = {};
        this.asks = {};
        this.asksPrices = [] //stack of prices
        this.bidsPrices = [] //stack of prices
    }

    //init orderbook with orders from database
    initOrder(order) {
        this.addLimitOrder(order);
    }

    //check limit price is acceptable
    checkLimitPrice(side, price) {
        const appositeSide = side === "bids" ? "asks" : "bids";
        const priceArr = this[appositeSide + "Prices"];

        const bestPrice = priceArr.length > 0 ? priceArr[priceArr.length - 1] : undefined;

        //if there is no best price, then any price is acceptable
        if (!bestPrice) return true;

        //limit order is acceptable if it is a buy order and the price is less than or equal to the best ask price
        if (side === "asks") {
            return price >= bestPrice;
        } else { //limit order is acceptable if it is a sell order and the price is greater than or equal to the best bid price
            return price <= bestPrice;
        }
    }

    //remove price from end of array
    removePrice(side) {
        const priceArr = this[side + "Prices"];
        priceArr.pop();
    }

    getBestPrice(side) {
        const appositeSide = side === "bids" ? "asks" : "bids";
        const priceArr = this[appositeSide + "Prices"];

        //if there is no best price, then any price is acceptable
        if (!priceArr || !(priceArr.length > 0)) return undefined;

        return priceArr[priceArr.length - 1];
    }

    addPrice(side, price) {
        const priceArr = this[side + "Prices"];
        priceArr.push(price);
    }

    addLimitOrder(order) {

        let { id, side, price, quantity } = order;
        let remainingQuantity = quantity;


        if (!this.checkLimitPrice(order.side, order.price)) return;

        const appositeSide = side === "bids" ? "asks" : "bids";
        const orderSide = this[side];
        const matchSide = this[appositeSide];

        const existingOrders = matchSide[price];

        //if there is no order at this price 
        if (!existingOrders || !(existingOrders.length > 0)) {
            //add order to orderbook
            delete order.side;
            if (!orderSide[price]) orderSide[price] = [order];
            else orderSide[price].push(order);
            //if price is better than best price 
            if (side === 'bids') {

                if (!this.getBestPrice(appositeSide) || price > this.getBestPrice(appositeSide)) {
                    this.addPrice(side, price);
                }

            } else {

                if (!this.getBestPrice(appositeSide) || price < this.getBestPrice(appositeSide)) {
                    this.addPrice(side, price);
                }

            }
            return;
        }

        const matchList = [];

        //if there is an order at this price
        const length = existingOrders.length;
        for (let i = 0; i < length; i++) {
            const existingOrder = existingOrders[i];

            // taker is not ended
            if (existingOrder.quantity <= remainingQuantity) {
                matchList.push({ makerId: existingOrder.id, takerId: id, quantity: existingOrder.quantity });
                remainingQuantity -= existingOrder.quantity;

                // maker orders are ended
                if (i === length - 1) {
                    delete matchSide[price]
                    this.removePrice(appositeSide);

                    // add remaining taker quantity to orderbook
                    if (remainingQuantity > 0) {
                        delete order.side;
                        orderSide[price] = [{ ...order, quantity: remainingQuantity }];
                        this.addPrice(side, price);
                    }
                }
            } else { // taker is ended
                if(remainingQuantity === 0) break;

                matchList.push({ makerId: existingOrder.id, takerId: id, quantity: remainingQuantity });
                existingOrder.quantity -= remainingQuantity;
                remainingQuantity = 0;
                // taker status 1 yapılacak
                break;
            }
        }

        return matchList;

    } 

    isPriceAcceptable(side,price) {
        const bestPrice = this.getBestPrice(side);
        if (!bestPrice) return true;
        if (side === "bids") return price <= bestPrice;  
        else return price >= bestPrice; 6 
    }
}

export default Orderbook;
