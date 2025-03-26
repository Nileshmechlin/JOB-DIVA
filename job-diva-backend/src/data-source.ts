import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
  dropSchema: true,
});
export const connectToDb = async () => {
  try {
    await AppDataSource.initialize();
    console.log(`Database is Successfully Connected !!`);
  } catch (error: any) {
    console.log(error);
  }
};
