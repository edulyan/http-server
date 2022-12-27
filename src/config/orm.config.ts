export const ConfigPG = {
  type: "postgres",
  host: "localhost",
  port: 1457,
  username: "edgar",
  password: "20012002",
  database: "http_project",
  synchronize: true,
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
};
