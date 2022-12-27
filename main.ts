import { UserController } from "./src/user/user.controller";
import { HttpServer } from "./src/http/http";
import { IRequest } from "./src/http/http.inteface";
import { Response } from "./src/http/response";
import * as path from "path";
import * as fs from "fs";

const server = new HttpServer(async (req: IRequest, res: Response) => {
  const userController = new UserController();

  switch (req.url) {
    case "/getUsers":
      console.log(req.headers);

      if (!req.headers.get("Authorization")) {
        console.log("14-error");

        res.writeHead(401, {
          Connection: "keep-alive",
          "Content-Type": "application/json; charset=utf-8",
          "WWW-Authenticate": "Basic",
        });
        res.end(JSON.stringify("Not Authenticated!"));
        break;
      } else {
        const credentials = Buffer.from(
          req.headers.get("Authorization").split(" ")[1],
          "base64"
        )
          .toString()
          .split(":");
        const username = credentials[0];
        const password = credentials[1];

        if (username != "admin" || password != "admin") {
          console.log("31-error");

          res.writeHead(401, {
            Connection: "keep-alive",
            "Content-Type": "application/json; charset=utf-8",
            "WWW-Authenticate": "Basic",
          });
          res.end(JSON.stringify("Not Authenticated!"));
          break;
        }

        try {
          const data = JSON.stringify(await userController.getAll());
          res.writeHead(200, {
            Connection: "keep-alive",
            "Content-Type": "application/json",
            "Content-Length": `${data.length}`,
            "Cache-Control": "max-age=100",
          });
          res.end(data);
          break;
        } catch (error) {
          res.writeHead(500, {
            Connection: "keep-alive",
            "Content-Type": "application/json; charset=utf-8",
          });
          res.end(JSON.stringify(error));
          break;
        }
      }

    case "/auth/register":
      try {
        const user = JSON.stringify(
          await userController.registration(JSON.parse(req.body))
        );
        res.writeHead(200, {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": `${user.length}`,
        });
        res.end(user);
        break;
      } catch (error) {
        res.writeHead(400, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify({ message: error }));
      }

    case "/redirect":
      res.writeHead(301, {
        "Content-Type": "text/html; charset=utf-8",
        Location: "http://10.102.174.12:1457/redirect-new",
      });
      res.end("DONE");
      break;

    case "/redirect-new":
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<h1>Successfully redirected</h1>");
      break;

    case "/getUs":
      try {
        const data = JSON.stringify(await userController.getAll());
        res.writeHead(200, {
          Connection: "keep-alive",
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": `${data.length}`,
          "Cache-Control": "max-age=3600, must-revalidate",
        });
        res.end(data);
        break;
      } catch (error) {
        res.writeHead(500, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(JSON.stringify(error));
        break;
      }

    case "/getImg":
      let stream = fs.createReadStream(
        path.join(__dirname, "src/static/some.png")
      );
      console.log(stream);

      stream.pipe(res.socket);

      stream.on("error", (err) => {
        console.log("Error with STREAM - ", err);
      });

      res.writeHead(200, { "Content-Type": "image/png" });
      res.end(path.join(__dirname, "src/static/some.png"));
      break;

    case "/getHtmlCache":
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "max-age=3600, must-revalidate",
      });
      res.end("<h1>Cache page</h1>");
      break;

    case "/getHtml":
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
      });
      res.end("<h1>HELLO Kolya</h1>");
      break;
    default:
      res.writeHead(501, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ message: "Error" }));
  }

  // if (req.method == "GET" && req.url == "/") {
  //   res.setHeader("Content-Type", "application/json; charset=utf-8");
  //   res.writeHead(200);
  //   res.end(JSON.stringify(await userController.getAll()));
  //   // res.setHeader("Content-Type", "text/plain");
  // }
});

server.listen(1457, "127.0.0.1");
