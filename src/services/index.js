import expressService from './express.service';
import sequelizeService from './sequelize.service';
import jwtService from './jwt.service';
import Market from './orderBook/Market';

const market = new Market();

export {
    expressService,
    sequelizeService,
    jwtService,
    market,
};