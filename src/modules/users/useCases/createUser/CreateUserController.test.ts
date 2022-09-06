import request from "supertest";
import { Connection } from "typeorm";

import { app } from "../../../../app";

import getConnection from "../../../../database";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await getConnection("localhost");
    connection.query("");
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });
  it("should be able to create a user", async () => {
    const user = {
      email: "email@email.com",
      name: "name",
      password: "password",
    };

    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(201);
  });

  it("should not be able to create an user if already exists", async () => {
    const user = {
      email: "email@email.com",
      name: "name",
      password: "password",
    };

    await request(app).post("/api/v1/users").send(user);

    const response = await request(app).post("/api/v1/users").send(user);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("User already exists");
  });
});
