import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });
  it("should be able to create a user", async () => {
    const user = await createUserUseCase.execute({
      email: "email",
      name: "name",
      password: "password",
    });

    expect(user).toHaveProperty("id");
  });

  it("should be throw an error when user already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        email: "email",
        name: "name",
        password: "password",
      });
      await createUserUseCase.execute({
        email: "email",
        name: "name",
        password: "password",
      });
    }).rejects.toEqual(new CreateUserError());
  });
});
