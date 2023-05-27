import Sequelize, { Model } from "sequelize";
import bcrypt from "bcryptjs";
import Portfolio from "./Portfolio.js";

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL, // VIRTUAL is a field that will never be saved in the database
        password_hash: Sequelize.STRING,
      },
      {
        sequelize,
        timestamps: true,
      }
    );

    this.addHook("beforeSave", async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.hasMany(models.Portfolio, { foreignKey: 'userId', as: 'portfolio' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
  async getPortfolios() {
    const portfolios = await Portfolio.findAll({
      where: { userId: this.id },
    });
    return portfolios;
  };
  async addPortfolio(shareId, amount) {
    const portfolio = await Portfolio.create({
      shareId,
      amount,
      userId: this.id,
    });
    return portfolio;
  };
}

export default User;
