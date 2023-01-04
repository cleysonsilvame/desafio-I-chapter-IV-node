import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementError } from "./CreateTransferStatementError";
import { ICreateTransferStatementDTO } from "./ICreateTransferStatementDTO";

@injectable()
export class CreateTransferStatementUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({
    sender_id,
    receiver_id,
    amount,
    description,
  }: ICreateTransferStatementDTO) {
    const sender = await this.usersRepository.findById(sender_id);
    
    if (!sender) {
      throw new CreateTransferStatementError.SenderNotFound();
    }

    const receiver = await this.usersRepository.findById(receiver_id);

    if (!receiver) {
      throw new CreateTransferStatementError.ReceiverNotFound();
    }

    const senderBalance = await this.statementsRepository.getUserBalance({
      user_id: sender_id,
    });

    if (senderBalance.balance < amount) {
      throw new CreateTransferStatementError.InsufficientFunds();
    }

    const transference = await this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: receiver_id,
      sender_id,
    });
    
    return transference;
  }
}
