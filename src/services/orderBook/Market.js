import Orderbook from './orderbook.service';

import Share from '../../database/models/Share';
import Order from '../../database/models/Order';

class Market {
    constructor() {
        this.orderbooks = {};
        this.sharesMap = new Map();
    }

    async init() {
        const shares = await Share.findAll();
        shares.forEach(share => {
            this.initOrderbook(share.id, share.symbol);
            this.sharesMap.set(share.id, share.symbol);
        });
    }

    async initOrderbook(shareId, symbol) {
        this.orderbooks[symbol] = new Orderbook(shareId);
        const orders = await Order.findAll({
            where: { shareId, status: false,},  
            order: [['price', 'DESC']],
        });
        orders.forEach((order) => {

            const newOrder = {
                id: order.id, 
                side: order.type == 0 ? 'bids' : 'asks', 
                price: parseFloat(order.price), 
                quantity: parseInt(order.amount)
            }
            this.orderbooks[symbol].initOrder(newOrder)
        });
        

    }

    getSymbol(shareId) {
        return this.sharesMap.get(shareId);
    }

    removeOrderbook(symbol) {
        delete this.orderbooks[symbol];
    }

    listShares() {
        return Object.keys(this.orderbooks);
    }

    listOrderBook(symbol) {
        return this.orderbooks[symbol];
    }

    limitOrder(order) {
        let { shareId, orderId, side, price, quantity } = order;
        
        const symbol = this.getSymbol(shareId);

        const newOrder = {
            id: orderId, 
            side, 
            price,
            quantity
        }

        return this.orderbooks[symbol].addLimitOrder(newOrder);
    }
    isPriceAcceptable(shareId, side, price) {
        const symbol = this.getSymbol(shareId);
        side = side == 0 ? 'bids' : 'asks';
        return this.orderbooks[symbol].isPriceAcceptable(side, price);
    }
}

export default Market;