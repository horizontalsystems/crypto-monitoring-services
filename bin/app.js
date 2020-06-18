import MonitoringService from '../src/services/monitoring.service';
import logger from '../src/utils/logger.winston'
import AppConfig from '../config/app.config.json';
import coinsConfig from '../config/coins.config.json';

const appConfig = AppConfig[process.env.NODE_ENV || 'development'];

const monitoringService = new MonitoringService(appConfig, coinsConfig, logger);
monitoringService.start()
