import Sequelize, { Model } from "sequelize";
class Share extends Model {
  static init(sequelize) {
    super.init(
      {
        symbol: {
          type: Sequelize.STRING(3),
          allowNull: false,
          unique: true,
          validate: {
            isUppercase: true,
            len: [3, 3],
          },
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
      }
    );
    return this;
  }
  static associate(models) {
    this.hasMany(models.Portfolio, { foreignKey: 'shareId', as: 'portfolio' });
  }
}
export default Share;
