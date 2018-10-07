import { IResolverObject } from "graphql-tools";
// import * as BigInt from "graphql-type-bigint";

export const typeDef: string = `
#scalar BigInt

type User {
  #id: BigInt
  id: String
  email: String
  name: String
  provider: String
}

type Query {
  me: User
}
`;

export const resolver: IResolverObject = {
  // BigInt,
  Query: {
    me(root, args, ctx) {
      return ctx.user.getSafeData();
    }
  }
};
