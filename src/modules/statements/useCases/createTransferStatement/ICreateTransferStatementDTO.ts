import { Statement } from "../../entities/Statement";

export interface ICreateTransferStatementDTO
  extends Pick<Statement, "description" | "amount"> {
  sender_id: string;
  receiver_id: string;
}
