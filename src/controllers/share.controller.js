import * as Yup from "yup";
import Share from "../database/models/Share";
import { BadRequestError, ValidationError, ConflictError } from "../utils/ApiError";
import { market } from "../services"

let addShareController = {
    add: async (req, res, next) => {
        try {
            const schema = Yup.object().shape({
                symbol: Yup.string().length(3).matches(/^[A-Z]+$/, 'String must consist of uppercase letters only').required(),
                name: Yup.string().required(),
            });

            if (!(await schema.isValid(req.body))) throw new ValidationError();

            const shareExists = await Share.findOne({
                where: { symbol: req.body.symbol },
            });

            if (shareExists) throw new ConflictError("Share symbol already exists");

            const share = await Share.create(req.body);

            return res.status(200).json(share);
        } catch (error) {
            next(error);
        }
    },
    listShares: async (req, res, next) => {
        try{
            const shares = market.listShares();
            return res.status(200).json(shares);
        }catch(error){
            throw error;
        }
        
    },
    listOrderBook: async (req, res, next) => {
        try{

            const schema = Yup.object().shape({
                symbol: Yup.string().length(3).matches(/^[A-Z]+$/, 'String must consist of uppercase letters only').required(),
            });

            if (!(await schema.isValid(req.params))) throw new ValidationError();

            const orderBook = market.listOrderBook(req.params.symbol);
            return res.status(200).json(orderBook);
        }catch(error){
            next(error);
        }
        
    }
};
export default addShareController;