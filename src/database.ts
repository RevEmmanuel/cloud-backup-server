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
    logging: true,
    entities: [__dirname + '/data/entities/*.js'],
};

export const myDataSource = new DataSource(dataSourceOptions);

function connectToDatabase() {
    myDataSource
        .initialize()
        .then(() => {
            console.log('Connected to database');
        })
        .catch(error => {
            console.error('Database connection error:', error);
        });
}

connectToDatabase();
