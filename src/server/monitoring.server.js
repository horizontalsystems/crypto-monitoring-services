import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from '../utils/logger.winston'
import MonitoringService from '../services/monitoring.service';
import AppConfig from '../../config/app.config.json';
import coinsConfig from '../../config/coins.config.json';

const appConfig = AppConfig[process.env.NODE_ENV || 'development'];
const morgan = require('morgan');

class MonitoringServer {
    constructor() {
        this.app = express();
        this.http = http.createServer(this.app);
        this.port = process.env.PORT || '3000'

        const corsOptions = {
            origin: `http://localhost:${this.port}`
        };

        this.app.use(cors(corsOptions));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.get('/', (_, res) => {
            res.send('Monitoring server is On !!!');
        });

        this.initMiddlewares();
    }

    initMiddlewares() {
        this.app.use(morgan('combined', { stream: logger.stream }));
    }

    start() {
        this.http.listen(this.port);
        logger.info(`App started listening port:${this.port}`)

        const monitoringService = new MonitoringService(logger, appConfig, coinsConfig);
        monitoringService.start()
        logger.info('Monitoring service started successfully')
    }
}

export default MonitoringServer;
