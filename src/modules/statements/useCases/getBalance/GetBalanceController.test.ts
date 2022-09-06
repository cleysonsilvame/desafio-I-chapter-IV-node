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

describe("Get Balance", () => {
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

  it("should be able to get a balance", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send(admin);

    const statement = {
      amount: 200,
      description: "description",
    };

    const { body: statementResponse } = await request(app)
      .post("/api/v1/statements/deposit")
      .send(statement)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    delete statementResponse.user_id;

    expect(response.body).toMatchObject({
      balance: statement.amount,
      statement: [statementResponse],
    });
  });

  it("should be throw an error when user not found", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer invalid`,
    });

    expect(response.body).toMatchObject({ message: "JWT invalid token!" });
  });
});
