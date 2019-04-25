import path from 'path';
import winston from 'winston';

winston.configure({
  transports: [
    new winston.transports.File({
      filename: path.resolve(__dirname, 'playball.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
      )
    })
  ]
});

export default winston;
