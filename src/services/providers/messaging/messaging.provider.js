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
                this.logger.info(`Response:${JSON.stringify(response.token)}`)
            })
            .catch(err => {
                this.logger.info(err)
            })

        // const headers = {
        //     'Content-Type': 'application/json'
        // }
    }

    async getJWT(username, password) {
        const url = `${this.apiUrl}identity/authenticate?username=${username}&password=${password}`
        const response = await fetch(url);

        return response.json();
    }

    async sendNotificationToChannel(channelName, title, body) {
        const url = `${this.apiUrl}admin/send/${channelName}`
        const bearer = `Bearer ${this.jwt}`;
        const content = { title, body };

        const response = await fetch(url, {
            method: 'post',
            body: JSON.stringify(content),
            headers: {
                Authorization: bearer,
                'Content-Type': 'application/json'
            }
        });

        this.logger.info(`Notification sent, status: ${JSON.stringify(response)}`)

        return response.status
    }
}

export default MessagingServiceProvider;
