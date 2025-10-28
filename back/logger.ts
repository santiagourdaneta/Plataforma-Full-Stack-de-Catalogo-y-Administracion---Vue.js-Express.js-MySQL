// logger.js
const { createLogger, format, transports } = require('winston');
const path = require('path');

// --------------------------------------------------
// LA DECLARACIÓN 'logger'
// --------------------------------------------------
module.exports = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.printf((info: any) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
    ),
    transports: [
        new transports.Console({ format: format.colorize({ all: true }) }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'error.log'), level: 'error' }),
        new transports.File({ filename: path.join(__dirname, 'logs', 'combined.log') })
    ]
});
