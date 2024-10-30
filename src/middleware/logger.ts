import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";

const LOG_DIR = path.join(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIR, "app.log");

// Ensure log directory exists
async function ensureLogDir() {
  try {
    await fs.access(LOG_DIR);
  } catch {
    await fs.mkdir(LOG_DIR, { recursive: true });
  }
}

// Write log entry safely
async function writeLog(entry: string) {
  try {
    await fs.appendFile(LOG_FILE, entry);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

export default async function logger(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await ensureLogDir();

    const startTime = new Date();
    let isFinished = false;

    const originalEnd = res.end;

    // Override end method
    res.end = function (...args: any[]) {
      if (!isFinished) {
        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        const logEntry = `${startTime.toISOString()} - METHOD: ${
          req.method
        } URL: ${req.url} - STATUS-CODE: ${
          res.statusCode
        } - DURATION: ${duration}ms\n`;

        writeLog(logEntry).catch(console.error);

        isFinished = true;
      }
      return originalEnd.apply(res, args);
    };

    const errorHandler = (err: Error) => {
      const errorLogEntry = `${new Date().toISOString()} - ERROR: ${
        err.message
      }\n`;
      writeLog(errorLogEntry).catch(console.error);
    };

    // Attach error handlers
    req.on("error", errorHandler);
    res.on("error", errorHandler);

    // Clean finish handler
    const finishHandler = () => {
      if (!isFinished) {
        const finishLogEntry = `${new Date().toISOString()} - FINISHED: ${
          req.method
        } ${req.url} with ${res.statusCode}\n`;
        writeLog(finishLogEntry).catch(console.error);
        isFinished = true;
      }

      // Cleanup event listeners
      req.removeListener("error", errorHandler);
      res.removeListener("error", errorHandler);
      res.removeListener("finish", finishHandler);
    };

    res.on("finish", finishHandler);

    next();
  } catch (err) {
    console.error("Logger middleware initialization failed:", err);
    next(err);
  }
}
