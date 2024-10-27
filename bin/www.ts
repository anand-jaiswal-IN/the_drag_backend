import app from "../src/app";
import http from "http";
import debug from "debug";
import { config } from "dotenv";

config();

const logger = debug("the_drag:server");

const port = normalizePort(process.env.PORT || "8080");
const host = process.env.HOST || "127.0.0.1";

app.set("host", host);
app.set("port", port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Server is running at ${host}:${port}`));

server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(this: http.Server): void {
  const addr = this.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;
  logger("Listening on " + bind);
}
