import { parseResponse } from "../http/request";
import { IRequest } from "../http/http.inteface";
import { UserRole } from "../user/entity/user.entity";
import jwt from "jsonwebtoken";

export default (roles: UserRole[], req: IRequest) => {
  return function () {
    const token = req.headers.get("Authorization").slice(7);

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
    console.log(decodedData);
  };
};
