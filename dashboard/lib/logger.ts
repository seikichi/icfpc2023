import pino from "pino";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  // NOTE: https://github.com/davidmarkclements/fast-redact
  // > It's important to understand that for performance reasons fast-redact mutates the original object
  // redact: ["password"],
});

export default logger;
