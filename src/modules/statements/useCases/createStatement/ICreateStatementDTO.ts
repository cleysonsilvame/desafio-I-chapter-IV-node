import { Statement } from "../../entities/Statement";

export interface ICreateStatementDTO extends
Pick<
  Statement,
  'user_id' |
  
  'description' |
  'amount' |
  'type'
> {
  sender_id?: string
}
