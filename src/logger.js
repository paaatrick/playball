import winston from 'winston';

winston.configure({
  transports: [
    new winston.transports.File({
      filename: 'playball.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
      )
    })
  ]
});

export default winston;
