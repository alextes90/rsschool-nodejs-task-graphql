import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, result } from './schemas.js';
import { graphql } from 'graphql';

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

      return await graphql({
        schema: result,
        source,
        variableValues: variables,
        contextValue: {
          db: prisma,
        },
      });
    },
  });
};

export default plugin;
