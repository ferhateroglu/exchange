import * as Yup from "yup";
import Portfolio from "../database/models/Portfolio";
import Share from "../database/models/Share";
import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
} from "../utils/ApiError";

//Yup is a JavaScript schema builder for value parsing and validation.

let portfoliorController = {

  add: async (req, res, next) => {
    try {
      const { body, userId } = req;

      const schema = Yup.object().shape({
        amount: Yup.number().required(),
        shareId: Yup.number().required()
      });

      if (!(await schema.isValid(body.portfolio))) throw new ValidationError()

      //check if share exists
      const shareExists = await Share.findByPk(body.portfolio.shareId);
      if (!shareExists) throw new BadRequestError("Share does not exist");

      //check if portfolio exists
      let portfolio = await Portfolio.findOne({
        where: { userId, shareId: body.portfolio.shareId },
      });

      //create or update
      if (portfolio) {
        portfolio.amount += body.portfolio.amount;
        await portfolio.save();
      } else {
        portfolio = await Portfolio.create({ ...body.portfolio, userId }); 
      }

      return res.status(200).json(portfolio);
    } catch (error) {
      next(error);
    }
  },

  get: async (req, res, next) => {
    try {
      const { userId } = req;
      const portfolio = await Portfolio.findAll({
        where: { userId },
        attributes: ["id", "amount","locked"],
        include: [
          {
            model: Share,
            as: "share",
            attributes: ["id", "name", "symbol"],
          },
        ],
      });

      return res.status(200).json(portfolio);
    } catch (error) {
      next(error);
    }
  }
};

export default portfoliorController;
