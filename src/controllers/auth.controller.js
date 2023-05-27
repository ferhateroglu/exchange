import * as Yup from "yup";
import User from "../database/models/User";
import jwtService from "../services/jwt.service";
import {
  BadRequestError,
  UnauthorizedError,
  ValidationError,
} from "../utils/ApiError";

let authController = {
  login: async (req, res, next) => {
    try {
      const schema = Yup.object().shape({
        email: Yup.string().email().required(),
        password: Yup.string().required(),
      });

      if (!(await schema.isValid(req.body))) throw new ValidationError();

      let { email, password } = req.body;

      const user = await User.findOne({ where: { email } });

      if (!user) throw new BadRequestError("User not found");

      if (!(await user.checkPassword(password))) throw new UnauthorizedError("Password does not match");

      const token = jwtService.jwtSign(user.id);

      return res.status(200).json({ user, token });
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      jwtService.jwtBlacklistToken(jwtService.jwtGetToken(req));

      res.status(200).json({ msg: "Authorized" });
    } catch (error) {
      next(error);
    }
  },
  register: async (req, res, next) => {
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required(),
        email: Yup.string().email().required(),
        password: Yup.string().required().min(6),
      });

      if (!(await schema.isValid(req.body))) throw new ValidationError();

      const { email } = req.body;

      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) throw new BadRequestError("User already exists");

      const user = await User.create(req.body);

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

};

export default authController;
