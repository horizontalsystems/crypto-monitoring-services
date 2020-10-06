/* eslint-disable no-bitwise */
// const sqlite3 = require('sqlite3').verbose();
const Database = require('sqlite-async')
const fs = require('fs')
const path = require('path');

class StorageService {
    constructor(logger, dbConfig) {
        this.logger = logger;
        this.dbConfig = dbConfig;

        this.prepareDirs()
        this.prepareDb()
    }

    prepareDirs() {
        this.logger.info('Preparing SQLLite database dirs ... ')

        if (this.dbConfig.storage.includes(':memory')) return

        try {
            const filename = path.basename(this.dbConfig.storage);
            const dir = this.dbConfig.storage.replace(filename, '')

            if (!fs.existsSync(dir)) {
                this.logger.info(`${this.dbConfig.storage}: directory does not exists creating ... `)

                fs.mkdirSync(dir, { recursive: true })
                this.logger.info(`Successfully create dir: ${dir}`)
            }
        } catch (e) {
            this.logger.error(`Error! Error preparing directories: ${e}`)
        }
    }

    prepareDb() {
        this.logger.info('Preparing SQLLite database ... ')

        Database.open(this.dbConfig.storage, Database.OPEN_READWRITE | Database.OPEN_CREATE)
            .then(db => {
                this.db = db
                this.db.run('CREATE TABLE IF NOT EXISTS tb_trend_info('
                + 'id         INTEGER  PRIMARY KEY AUTOINCREMENT, '
                + 'coin_code  TEXT NOT NULL, '
                + 'trend_type CHAR(8), '
                + 'prev_trend CHAR(50), '
                + 'curr_trend CHAR(50), '
                + 'date       INTEGER)')
            })
            .catch(err => {
                this.logger.error(`Error! Error opening database: ${this.dbConfig.storage}, ${err.message}`)
            })
    }

    async saveTrendInfo(coinCode, date, trendType, prevTrend, currTrend) {
        let sql = 'INSERT INTO tb_trend_info (coin_code, date, trend_type, prev_trend, curr_trend)'
        sql += 'VALUES (? ,?, ?, ? ,?) '

        return this.db.run(sql, [coinCode,
            date,
            trendType,
            JSON.stringify(prevTrend),
            JSON.stringify(currTrend)]);
    }

    async getTrendInfo(coinCode, dateFrom, dateTo) {
        let result
        const sql = 'SELECT * FROM tb_trend_info '
                + ' WHERE coin_code=? and date>=? and date<=?'

        try {
            result = await this.db.all(sql, [coinCode, dateFrom, dateTo])
            return result
        } catch (err) {
            this.logger.error(`Error retrieving trend info:${err}`)
        }

        return {}
    }
}

export default StorageService
