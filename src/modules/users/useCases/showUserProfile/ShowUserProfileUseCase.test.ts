import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ShowUserProfileError } from "./ShowUserProfileError";

import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show a User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });
  it("should be able to show a user profile", async () => {
    const expectedUser = await inMemoryUsersRepository.create({
      email: "email",
      name: "name",
      password: "password",
    });

    const user = await showUserProfileUseCase.execute(expectedUser.id as string);

    expect(user).toEqual(expectedUser);
  });

  it("should be throw an error when user not found", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("");
    }).rejects.toEqual(new ShowUserProfileError());
  });
});
