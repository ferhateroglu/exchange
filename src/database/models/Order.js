import Sequelize, { Model } from 'sequelize';

class Order extends Model {
    static init(sequelize) {
        super.init(
            {
                userId: Sequelize.INTEGER,
                shareId: Sequelize.INTEGER,
                amount: Sequelize.INTEGER,
                price: Sequelize.DECIMAL(10, 2),
                type: Sequelize.BOOLEAN,//0 = bid, 1 = ask
                status: Sequelize.BOOLEAN,//0 = open, 1 = closed
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
 
export default Order;