/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, result } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';

export type User = {
  id: string;
  name: string;
  balance: number;
  userSubscribedTo?: {
    subscriberId: string;
    authorId: string;
  }[];
  subscribedToUser?: {
    subscriberId: string;
    authorId: string;
  }[];
};

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { prisma } = fastify;

      const source = req.body.query;
      const { variables } = req.body;

      console.log('var:', variables);

      const validationErrors = validate(result, parse(source), [depthLimit(5)]);

      if (validationErrors.length > 0) {
        return { errors: validationErrors };
      }

      return await graphql({
        schema: result,
        source,
        variableValues: variables,
        contextValue: {
          db: prisma,
          dataLoader: new WeakMap(),
        },
      });
    },
  });
};

export default plugin;
