import * as net from "net";
import { STATUS_CODES } from "http";

export class Response {
  socket: net.Socket;
  status: number;
  headersSent: boolean;
  isChunked: boolean;
  headers: Object;

  constructor(socket: net.Socket) {
    this.socket = socket;
    this.status = 200;
    this.headersSent = false;
    this.isChunked = false;
    this.headers = {};
  }

  setStatus(status: number) {
    this.status = status;
  }

  setHeader(key: string, value: any) {
    this.headers[key] = value;
  }

  writeHead(statusCode = this.status, headers = {}) {
    if (!this.headersSent) {
      this.headersSent = true;
      for (const key in headers) {
        this.setHeader(key, headers[key]);
      }
      this.setHeader("Date", new Date().toUTCString());
      if (!this.headers["Content-Length"]) {
        this.isChunked = true;
        this.setHeader("Transfer-Encoding", "chunked");
      }
      this.socket.write(
        `HTTP/1.1 ${statusCode} ${STATUS_CODES[statusCode]}\r\n`
      );
      for (const key in this.headers) {
        this.socket.write(`${key}: ${this.headers[key]}\r\n`);
      }
      this.socket.write("\r\n");
    }
  }

  write(chunk: string) {
    if (!this.headersSent) {
      if (!this.headers["Content-Length"]) {
        this.isChunked = true;
        this.setHeader("Transfer-Encoding", "chunked");
      }
      this.writeHead();
    }
    if (this.isChunked) {
      const hexSize = chunk.length.toString(16);
      this.socket.write(hexSize + "\r\n");
      this.socket.write(chunk + "\r\n");
    } else {
      this.socket.write(chunk);
    }
  }

  end(chunk: string) {
    if (!this.headersSent) {
      if (!this.headers["Content-Length"]) {
        this.setHeader("Content-Length", chunk ? chunk.length : 0);
      }
      this.writeHead();
    }
    if (this.isChunked) {
      if (chunk) {
        this.write(chunk);
      }
      this.socket.end("0\r\n\r\n");
    } else {
      this.socket.end(chunk);
    }
  }
}
