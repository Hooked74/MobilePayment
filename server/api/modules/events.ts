import { IResolverObject } from "graphql-tools";
import { OperationsEnum } from "../../collections/operations";
import Event from "../../db/event";
import Operator from "../../db/operator";

export const typeDef: string = `
type PaymentStatus {
  success: Boolean
  operatorId: String
  balance: Int
}

extend type Mutation {
  pay(operatorId: String!, phoneNumber: String!, amount: Int!): PaymentStatus
}
`;

export const resolver: IResolverObject = {
  Mutation: {
    async pay(root, { operatorId, phoneNumber, amount }, ctx) {
      const userId: string = ctx.user.getSafeData().id;
      const operationId: string = `${OperationsEnum.DEPOSIT}`;
      await Operator.findById(operatorId);

      // TODO: add phone number and amount verification

      const event: Event = new Event({ userId, operationId, operatorId, amount, phoneNumber });
      await event.save();
      const balance: number = await Event.getOperatorBalance(userId, operatorId);

      return { success: true, balance, operatorId };
    }
  }
};
