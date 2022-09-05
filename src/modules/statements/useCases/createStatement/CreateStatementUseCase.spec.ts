import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });
  it("should be able to create a new deposit", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: "email",
      name: "name",
      password: "password",
    });

    const statement = await createStatementUseCase.execute({
      amount: 100,
      description: "description",
      type: OperationType.DEPOSIT,
      user_id: id as string,
    });

    expect(statement).toMatchObject({
      amount: 100,
      description: "description",
      type: "deposit",
      user_id: id as string,
    });
  });

  it("should be able to create a new withdraw", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: "email",
      name: "name",
      password: "password",
    });

    await createStatementUseCase.execute({
      amount: 100,
      description: "description",
      type: OperationType.DEPOSIT,
      user_id: id as string,
    });

    const statement = await createStatementUseCase.execute({
      amount: 50,
      description: "description",
      type: OperationType.WITHDRAW,
      user_id: id as string,
    });

    expect(statement).toMatchObject({
      amount: 50,
      description: "description",
      type: "withdraw",
      user_id: id as string,
    });
  });

  it("should be throw an error when user not found", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "description",
        type: OperationType.DEPOSIT,
        user_id: "",
      });
    }).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("should be throw an error when user not contains funds", async () => {
    const { id } = await inMemoryUsersRepository.create({
      email: "email",
      name: "name",
      password: "password",
    });

    expect(async () => {
      await createStatementUseCase.execute({
        amount: 100,
        description: "description",
        type: OperationType.WITHDRAW,
        user_id: id as string,
      });
    }).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });
});
