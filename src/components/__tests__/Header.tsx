import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { shallow } from "enzyme";
import * as React from "react";
import * as fetch from "unfetch";
import Header from "../Header/Header";

let apolloClient: ApolloClient<NormalizedCacheObject>;
describe("Header", () => {
  beforeEach(() => {
    apolloClient = new ApolloClient({
      link: createHttpLink({ uri: "/graphql", fetch }),
      cache: new InMemoryCache().restore({})
    });
  });
  test("should render a Header component", () => {
    const wrapper = shallow(<Header name="mock" client={apolloClient} />);
    expect(wrapper).toMatchSnapshot();
  });
});
