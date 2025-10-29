const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, errors } = format;
require("winston-daily-rotate-file");

// Format personnalisé
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaString = Object.keys(meta).length
    ? JSON.stringify(meta, null, 2)
    : "";
  return `${timestamp} [${level}] : ${stack || message} ${metaString}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Gère les erreurs avec stack trace
    logFormat
  ),
  transports: [
    // Logs en console (dev)
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),

    // combined.log → tout
    new transports.DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),

    // error.log → erreurs uniquement
    new transports.DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
