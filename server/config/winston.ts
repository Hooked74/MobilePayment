import * as winston from "winston";

export default winston.createLogger({
  transports: [
    new winston.transports.Console({
      json: false,
      colorize: true
    } as any)
  ]
});
