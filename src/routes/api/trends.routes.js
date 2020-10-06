import TrendsController from '../../controllers/trends.controller';
import logger from '../../utils/logger.winston';

class TrendsRoutes {
    constructor(router, monitoringService) {
        this.trendsController = new TrendsController(logger, monitoringService);
        this.router = router

        this.router.get('/trends/info/:coinCode', (req, res) => {
            this.trendsController.getInfo(req, res)
        });

        this.router.get('/trends/info/:coinCode/:date', (req, res) => {
            this.trendsController.getInfo(req, res)
        });
    }

    getRouter() {
        return this.router
    }
}

export default TrendsRoutes
