import { getRepository } from "typeorm";
import { UserDto } from "./dto/createUser.dto";
import { UpdUserDto } from "./dto/updateUser.dto";
import { User, UserRole } from "./entity/user.entity";
import { parseResponse } from "./../http/request";
import { Response } from "../http/response";
import { IResponse } from "../http/http.inteface";
const jwt = require("jsonwebtoken");

export class UserController {
  async getAll(): Promise<User[]> {
    try {
      const users = await getRepository(User).find();
      return users;
    } catch (error) {
      return error;
    }
  }

  async getById(id: string): Promise<{ user: User; res: string }> {
    const user = await getRepository(User).findOne(id);
    let res: string;

    if (!user) {
      res = parseResponse({
        protocol: "HTTP/1.1",
        headers: new Map(),
        status: "NOT FOUND",
        statusCode: 404,
        body: JSON.stringify("User not found"),
      });
    } else {
      res = parseResponse({
        protocol: "HTTP/1.1",
        headers: new Map(),
        status: "OK",
        statusCode: 200,
        body: JSON.stringify(user),
      });
    }

    return { user: user, res: res };
  }

  async registration(dto: UserDto): Promise<User> {
    const user = await getRepository(User).findOne({
      where: { email: dto.email },
    });

    if (user) {
      throw "ERROR";
    } else {
      const createdUser = getRepository(User).create({
        ...dto,
        role: UserRole.ADMIN,
      });

      return await getRepository(User).save(createdUser);
    }
  }

  async login(dto: UserDto): Promise<string> {
    const foundUser = await getRepository(User).findOne({
      where: { email: dto.email, password: dto.password },
    });

    if (!foundUser) {
      return parseResponse({
        protocol: "HTTP/1.1",
        headers: new Map(),
        status: "UNAUTHORIZED",
        statusCode: 401,
        body: JSON.stringify("Invalid email or password"),
      });
    } else {
      const token = jwt.sign(
        {
          id: foundUser.id,
          role: foundUser.role,
        },
        "SECRET",
        {
          expiresIn: "30m",
        }
      );

      return parseResponse({
        protocol: "HTTP/1.1",
        headers: new Map(),
        status: "OK",
        statusCode: 200,
        body: JSON.stringify({ foundUser, token }),
      });
    }
  }

  async updateUser(id: string, dto: UpdUserDto): Promise<string> {
    const foundUser = await getRepository(User).findOne(id);

    if (!foundUser) {
      return parseResponse({
        protocol: "HTTP/1.1",
        headers: new Map(),
        status: "NOT FOUND",
        statusCode: 404,
        body: JSON.stringify("User not found"),
      });
    }

    await getRepository(User).update(id, dto);

    return parseResponse({
      protocol: "HTTP/1.1",
      headers: new Map(),
      status: "OK",
      statusCode: 200,
      body: JSON.stringify(true),
    });
  }

  async deleteUser(id: string): Promise<string> {
    const foundUser = await getRepository(User).findOne(id);

    if (!foundUser) {
      return parseResponse({
        protocol: "HTTP/1.1",
        headers: new Map(),
        status: "NOT FOUND",
        statusCode: 404,
        body: JSON.stringify("User not found"),
      });
    }

    await getRepository(User).delete(id);

    return parseResponse({
      protocol: "HTTP/1.1",
      headers: new Map(),
      status: "OK",
      statusCode: 200,
      body: JSON.stringify(true),
    });
  }
}
