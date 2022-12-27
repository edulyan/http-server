import { parseResponse } from "../http/request";
import { IRequest } from "../http/http.inteface";
const jwt = require("jsonwebtoken");

export function authMiddleware(req: IRequest): string | boolean {
  try {
    const token = req.headers.get("Authorization").slice(7);

    console.log(token);

    if (!token) {
      return parseResponse({
        protocol: "HTTP/1.1",
        headers: new Map(),
        status: "UNAUTHORIZED",
        statusCode: 401,
        body: JSON.stringify("The user is unauthorized"),
      });
    }

    const decodedData = jwt.verify(token, "SECRET");
    return true;
  } catch (error) {
    return parseResponse({
      protocol: "HTTP/1.1",
      headers: new Map(),
      status: "UNAUTHORIZED",
      statusCode: 401,
      body: JSON.stringify("The user is unauthorized"),
    });
  }
}
