import {DataSource, DataSourceOptions} from 'typeorm';
import dotenv from 'dotenv';

dotenv.config();
const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: false,
    entities: [__dirname + '/data/entities/*.js', __dirname + '/data/entities/*.ts'],
};


export const myDataSource = new DataSource(dataSourceOptions);


export async function connectToDatabase() {
   try {
       await myDataSource
           .initialize()
       console.log('Connected to database');
   }catch (error) {
       console.error('Database connection error:', error);
   }
}

