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

describe("Get Statement Operation", () => {
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

  it("should be able to get a statement operation", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send(admin);

    const statement = {
      amount: 200,
      description: "description",
    };

    const {
      body: { id, ...rest },
    } = await request(app)
      .post("/api/v1/statements/deposit")
      .send(statement)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    const response = await request(app)
      .get(`/api/v1/statements/${id}`)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id,
      ...rest,
      amount: statement.amount.toFixed(2),
    });
  });

  it("should be throw an error when statement not found", async () => {
    const { body } = await request(app).post("/api/v1/sessions").send(admin);

    const statement_id = "127d63a7-247d-4c26-9b53-ec23a17f5c18";

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer ${body.token}`,
      });

    // expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ message: "Statement not found" });
  });

  it("should be throw an error when user not found", async () => {
    const statement_id = "127d63a7-247d-4c26-9b53-ec23a17f5c18";

    const response = await request(app)
      .get(`/api/v1/statements/${statement_id}`)
      .set({
        Authorization: `Bearer invalid`,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ message: "JWT invalid token!" });
  });
});
