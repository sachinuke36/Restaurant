



import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),       // adds colors
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});


export { logger as log };


// export const log = {
//   info: (message: string) =>
//     console.log(`[INFO] ${new Date().toISOString()} - ${message}`),

//   error: (message: string, error?: unknown) => {
//     console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
//     if (error) console.error(error);
//   },

//   warn: (message: string) =>
//     console.warn(`[WARN] ${new Date().toISOString()} - ${message}`)
// };