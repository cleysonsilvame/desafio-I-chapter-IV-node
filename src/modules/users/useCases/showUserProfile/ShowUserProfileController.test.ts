import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";

import getConnection from "../../../../database/";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await getConnection("localhost");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to view a user profile", async () => {
    const user = {
      email: "email@email.com",
      name: "name",
      password: "password",
    };

    const createUserResponse = await request(app)
      .post("/api/v1/users")
      .send(user);

    expect(createUserResponse.status).toBe(201);

    const authentication = await request(app)
      .post("/api/v1/sessions")
      .send(user);

    expect(authentication.body).toHaveProperty("token");

    const response = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${authentication.body.token}`,
      });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject(createUserResponse.body);
  });

  it("should be throw an error when user not found", async () => {
    const response = await request(app).get("/api/v1/profile");

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: "JWT token is missing!",
    });
  });
});
