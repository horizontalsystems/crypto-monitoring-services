// const fetch = require('node-fetch');
import fetch from 'node-fetch';

class MessagingServiceProvider {
    constructor(messagingServiceConfig, logger) {
        this.logger = logger
        this.config = messagingServiceConfig
        this.apiUrl = this.config.api_url

        this.getJWT(this.config.username, this.config.password)
            .then(response => {
                this.jwt = response
                this.logger.info(`Response:${JSON.stringify(response)}`)
            })
            .then(data => this.logger.info(`Data:${data}`))
            .catch(err => {
                this.logger.info(err)
            })

        const headers = {
            'Content-Type': 'application/json'
        }
    }

    getJWT(username, password) {
        const url = `${this.apiUrl}identity/authenticate?username=${username}&password=${password}`
        this.logger.info(url)
        return fetch(url)
    }

    // async sendNotificationToTopic(topic, title, body) {

    // }
}

export default MessagingServiceProvider;
