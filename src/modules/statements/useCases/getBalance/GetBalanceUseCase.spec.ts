import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });
  it("should be able to get a balance", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: "email",
      name: "name",
      password: "password",
    });

    const statement = await inMemoryStatementsRepository.create({
      amount: 100,
      description: "description",
      type: OperationType.DEPOSIT,
      user_id: id as string,
    });

    const balance = await getBalanceUseCase.execute({
      user_id: id as string,
    });

    expect(balance).toMatchObject({
      balance: 100,
      statement: [statement],
    });
  });

  it("should be throw an error when user not found", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "",
      });
    }).rejects.toEqual(new GetBalanceError());
  });
});
