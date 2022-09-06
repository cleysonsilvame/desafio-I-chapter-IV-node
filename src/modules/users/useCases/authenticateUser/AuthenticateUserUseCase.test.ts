import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";

import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe("Authenticate User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository
    );
  });
  it("should be able to authenticate a user", async () => {
    const expectedUser = await inMemoryUsersRepository.create({
      email: "email",
      name: "name",
      password: await hash("password", 8),
    });

    const authentication = await authenticateUserUseCase.execute({
      email: expectedUser.email,
      password: "password",
    });

    expect(authentication).toHaveProperty("user");
    expect(authentication).toHaveProperty("token");
  });

  it("should be throw an error when user not found", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "email",
        password: "password",
      });
    }).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("should be throw an error when password don't match", async () => {
    expect(async () => {
      await inMemoryUsersRepository.create({
        email: "email",
        name: "name",
        password: "password without hash",
      });

      await authenticateUserUseCase.execute({
        email: "email",
        password: "password",
      });
    }).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
