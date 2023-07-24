import { Type } from '@fastify/type-provider-typebox';
import { GraphQLSchema } from 'graphql';
import RootQuery from './graphQlSchemas/querySchema.js';
import RootMutation from './graphQlSchemas/mutationSchema.js';

export const gqlResponseSchema = Type.Partial(
  Type.Object({
    data: Type.Any(),
    errors: Type.Any(),
  }),
);

export const createGqlResponseSchema = {
  body: Type.Object(
    {
      query: Type.String(),
      variables: Type.Optional(Type.Record(Type.String(), Type.Any())),
    },
    {
      additionalProperties: false,
    },
  ),
};

export const result = new GraphQLSchema({ query: RootQuery, mutation: RootMutation });
