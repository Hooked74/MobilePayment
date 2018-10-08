import { IResolverObject } from "graphql-tools";
import Event, { IOperatorBalances } from "../../db/event";
import Operator, { IOperator } from "../../db/operator";

export const typeDef: string = `
type Operator {
  id: String
  name: String
  image: String
  balance: Int
}

extend type Query {
  operators: [Operator]!
  operator(id: String!): Operator!
}
`;

export const resolver: IResolverObject = {
  Query: {
    async operators(root, args, ctx) {
      const userId: string = ctx.user.getSafeData().id;
      const [operators, balances]: [IOperator[], IOperatorBalances] = await Promise.all([
        Operator.findAll(),
        Event.getOperatorBalances(userId)
      ]);

      return operators.map((operator: IOperator) => ({
        ...operator,
        balance: balances[operator.id] || 0
      }));
    },
    async operator(_, { id }) {
      return Operator.findById(id);
    }
  }
};
