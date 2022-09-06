import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });
  it("should be able to get a statement operation", async () => {
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

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: id as string,
      statement_id: statement.id as string,
    });

    expect(statementOperation).toMatchObject(statement);
  });

  it("should be throw an error when statement not found", async () => {
    expect(async () => {
      const { id } = await inMemoryUsersRepository.create({
        email: "email",
        name: "name",
        password: "password",
      });

      await getStatementOperationUseCase.execute({
        user_id: id as string,
        statement_id: "",
      });
    }).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });

  it("should be throw an error when user not found", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "",
        statement_id: "",
      });
    }).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });
});
