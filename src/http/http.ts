import * as net from "net";
import { createConnection } from "typeorm";
import { parseRequest } from "./request";
import { Response } from "./response";
import { User } from "../user/entity/user.entity";

export class HttpServer {
  server: net.Server;

  constructor(requestListener: any) {
    this.server = net.createServer();
    this.server.on("connection", (socket: net.Socket) => {
      console.log("\r\nUser Connected\r\n");

      socket.on("data", (buffer) => {
        const request = parseRequest(buffer.toString());
        const response = new Response(socket);

        requestListener(request, response);
      });

      socket.on("error", (err) => {
        console.log("SOCKET ERROR - ", err);
      });
    });
  }

  async listen(PORT: number, HOST: string) {
    this.server.listen(PORT, HOST);
    await createConnection({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "",
      password: "",
      database: "",
      synchronize: true,
      entities: [User],
      // __dirname + "./src/**/*.entity{.ts,.js}"
    })
      .then(() => console.log("Database has been connected"))
      .catch((err) => console.log(err));

    console.log(`Server is running on - ${HOST}:${PORT}...`);
  }

  close() {
    this.server.close();
  }
}
