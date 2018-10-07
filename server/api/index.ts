import { IResolverObject, IResolvers, makeExecutableSchema } from "apollo-server";

interface IModule {
  typeDef: string;
  resolver: IResolverObject;
}

/* tslint:disable:no-var-requires */
const modules: IModule[] = [require("./modules/user")];

const mainDefs: string[] = [
  `
    schema {
        query: Query,
        #mutation: Mutation
    }
`
];

export default makeExecutableSchema({
  resolvers: (modules.map(m => m.resolver).filter(res => !!res) as any) as IResolvers,
  typeDefs: mainDefs.concat(modules.map(m => m.typeDef).filter(res => !!res)),
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});
