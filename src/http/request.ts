import { IRequest, IResponse } from "./http.inteface";

//deprecated
export const parseResponse = (res: IResponse): string => `
${res.protocol} ${res.statusCode} ${res.status}
${Array.from(res.headers)
  .map((kv) => `${kv[0]}: ${kv[1]}`)
  .join("\r\n")}
${res.body}`;

export const parseRequest = (req: string): IRequest => {
  const [firstLine, rest] = divideStringOn(req, "\r\n");
  const [method, url, protocol] = firstLine.split(" ", 3);
  const [headers, body] = divideStringOn(rest, "\r\n\r\n");
  const parsedHeaders = headers.split("\r\n").reduce((map, header) => {
    const [key, value] = divideStringOn(header, ": ");
    return map.set(key, value);
  }, new Map());
  return { protocol, method, url, headers: parsedHeaders, body };
};

const divideStringOn = (s: string, search: string) => {
  const index = s.indexOf(search);
  const first = s.slice(0, index);
  const rest = s.slice(index + search.length);
  return [first, rest];
};
