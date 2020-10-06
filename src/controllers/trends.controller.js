class TrendsController {
    constructor(logger, monitoringService) {
        this.logger = logger;
        this.monitoringService = monitoringService
    }

    getInfo(req, res) {
        this.monitoringService
            .getTrendInfo(req.params.coinCode, req.params.date)
            .then(result => {
                res.status(200).json(result);
            })
            .catch(error => {
                res.status(500).send(error);
            });
    }
}

export default TrendsController;
