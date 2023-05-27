import * as Yup from "yup";
import { market } from "../services"
import Order from "../database/models/Order";
import Portfolio from "../database/models/Portfolio";
import Share from "../database/models/Share";
import {
    BadRequestError,
    UnauthorizedError,
    ValidationError,
} from "../utils/ApiError";

let orderController = {
    getOne: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { userId } = req.user;

            const schema = Yup.object().shape({
                id: Yup.number().required(),
            });

            if (!(await schema.isValid(req.params))) throw new ValidationError();

            const order = await Order.findOne({ where: { id, userId } });

            if (!order) throw new BadRequestError("Order not found");

            return res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const { userId } = req.user;

            const orders = await Order.findAll({ where: { userId } });

            if (!orders) throw new BadRequestError("Orders not found");

            return res.status(200).json(orders);
        } catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const { body, userId } = req;

            const schema = Yup.object().shape({
                shareId: Yup.number().required(),
                amount: Yup.number().moreThan(0).required(),
                price: Yup.string().test((value) => /^\d+(\.\d{1,2})?$/.test(value.toString()) && parseFloat(value) > 0).required(),
                type: Yup.boolean().required(),
            });

            if (!(await schema.isValid(body))) throw new ValidationError();
            if (body.shareId == 1) throw new ValidationError("TRY is not a share");

            //check portfolio
            let portfolio;
            if (body.type == 1) {//bid check try
                console.log("try");
                portfolio = await Portfolio.findOne({
                    where: { userId, shareId: 1 },
                    attributes: ["id", "amount", "locked"],
                    include: [{ model: Share, as: "share", attributes: ["id", "name"] }],
                });

            } else {//ask check share
                portfolio = await Portfolio.findOne({
                    where: { userId, shareId: body.shareId },
                    attributes: ["id", "amount", "locked"],
                    include: [{ model: Share, as: "share", attributes: ["id", "name", "symbol"] }],
                });
            }

            if (!portfolio) throw new BadRequestError(`You need to ${body.type == 1 ? "TRY" : body.shareId} to make this order`);

            const { id, amount, locked, share } = portfolio;

            //check amount
            if (body.type == 1) {//bid check try
                let totalCost = parseFloat(body.price) * parseInt(body.amount);
                totalCost = totalCost.toFixed(2);
                const availableTry = amount - locked;
                if (availableTry < totalCost) throw new BadRequestError(`You need to ${share.symbol} : ${totalCost} to make this order but you have ${availableTry}`);

            } else {//ask check share
                const availableShare = amount - locked;
                if (availableShare < body.amount) throw new BadRequestError(`You need to ${share.symbol} : ${body.amount} to make this order but you have ${availableShare}`);
            }

            //order cant be worse than market's best price
            if(market.isPriceAcceptable(body.shareId, body.type, parseFloat(body.price)) == false) throw new BadRequestError("Order price is worse than market's best price");


            const order = await Order.create({ userId, ...body, status: 0 });

            if (!order) throw new BadRequestError("Order not created");

            //update portfolio
            portfolio.locked += parseInt(body.amount);
            await portfolio.save();

            //add order to market
            const newOrder = { 
                shareId: body.shareId, 
                orderId: order.id , 
                side: body.type == false ? "bids" : "asks" , 
                price: parseFloat(body.price), 
                quantity: parseInt(body.amount) 
            };

            const matchList =  market.limitOrder(newOrder);

            // [
            //     { makerId: 1, takerId: 27, quantity: 20 },
            //     { makerId: 21, takerId: 27, quantity: 5 }
            // ]       
            if(matchList.length > 0){
                // get orders
                const orders = await Order.findAll({ where: { id: matchList.map(x => x.makerId) } });
                console.log(orders);

                //update orders
                for (let i = 0; i < orders.length; i++) {
                    const order = orders[i];
                    const match = matchList.find(x => x.makerId == order.id);
                    order.status = 1;
                    order.matched = match.quantity;
                    await order.save();
                }

                //update portfolios
                for (let i = 0; i < matchList.length; i++) {
                    const match = matchList[i];
                    const portfolio = await Portfolio.findOne({ where: { userId: match.makerId, shareId: body.shareId } });
                    portfolio.amount += match.quantity;
                    portfolio.locked -= match.quantity;
                    await portfolio.save();
                }

                //update taker portfolio
                const takerPortfolio = await Portfolio.findOne({ where: { userId, shareId: body.shareId } });
                takerPortfolio.amount += matchList.reduce((a, b) => a + (b['quantity'] || 0), 0);
                takerPortfolio.locked -= matchList.reduce((a, b) => a + (b['quantity'] || 0), 0);
                await takerPortfolio.save();

            }
            

            return res.status(201).json(order);
        } catch (error) {
            next(error);
        }
    },

};


export default orderController;