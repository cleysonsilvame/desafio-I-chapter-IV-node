import { hash } from "bcryptjs";
import { v4 as uuid } from "uuid";
import request from "supertest";
import { app } from "../../../../app";

import getConnection from "../../../../database/";

import { Connection } from "typeorm";

let connection: Connection;

const admin = {
  name: "admin",
  email: "admin@finapi.com",
  password: "admin",
};

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await getConnection("localhost");
    await connection.runMigrations();

    const id = uuid();
    const password = await hash(admin.password, 8);

    await connection
      .createQueryBuilder()
      .insert()
      .into("users")
      .values({
        id,
        ...admin,
        password,
      })
      .execute();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a valid user", async () => {
    const response = await request(app).post("/api/v1/sessions").send(admin);

    expect(response.body).toHaveProperty("token");
  });

  it("should be throw an error when password don't match", async () => {
    const response = await request(app)
      .post("/api/v1/sessions")
      .send({
        ...admin,
        password: "another password",
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: "Incorrect email or password",
    });
  });
});
