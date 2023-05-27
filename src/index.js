import dotenv from "dotenv";
 import { expressService, sequelizeService, market} from "./services";
dotenv.config();



const services = [expressService, sequelizeService, market];

(async () => {

  try {
    for (const service of services) {
      await service.init();
    }
    console.log("Server initialized.");
    //PUT ADITIONAL CODE HERE.
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
})();

