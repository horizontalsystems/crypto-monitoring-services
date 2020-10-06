import { Router } from 'express'
import TrendsRoutes from './api/trends.routes'

class Routes {
    constructor(monitoringService) {
        this.router = new Router()
        this.trendsRoutes = new TrendsRoutes(this.router, monitoringService)
        this.router.use('/api/', this.trendsRoutes.getRouter());
    }

    getRouter() {
        return this.router
    }
}

export default Routes
