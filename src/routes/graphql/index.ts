import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, result } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';

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
