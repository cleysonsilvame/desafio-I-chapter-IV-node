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

describe("Create Statement Controller", () => {
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

  it("should be able to create a new deposit", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send(admin);

    const statement = {
      amount: 200,
      description: "description",
    };

    const response = await request(app)
      .post("/api/v1/statements/deposit")
      .send(statement)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toMatchObject({
      ...statement,
      type: "deposit",
    });
  });

  it("should be able to create a new withdraw", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send(admin);

    const statement = {
      amount: 200,
      description: "description",
    };

    await request(app)
      .post("/api/v1/statements/deposit")
      .send({ ...statement, amount: 400 })
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(statement)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toMatchObject({
      ...statement,
      type: "withdraw",
    });
  });

  it("should be throw an error when user not contains funds", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send(admin);

    const statement = {
      amount: 1000,
      description: "description",
    };

    const response = await request(app)
      .post("/api/v1/statements/withdraw")
      .send(statement)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.body).toMatchObject({ message: "Insufficient funds" });
  });
});
