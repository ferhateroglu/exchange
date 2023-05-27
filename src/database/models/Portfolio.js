import Sequelize, { Model } from "sequelize";
class Portfolio extends Model {
  static init(sequelize) {
    super.init(
      {
        amount: Sequelize.INTEGER,
        locked: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'User',
            key: 'id',
          },
        },
        shareId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Share',
            key: 'id',
          },
        }
      },
      {
        sequelize,
        timestamps: true,
      }
    );
    return this;
  }
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    this.belongsTo(models.Share, { foreignKey: 'shareId', as: 'share' }); 
  }
}
export default Portfolio;
