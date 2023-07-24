/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { GraphQLBoolean, GraphQLObjectType } from 'graphql';
import {
  ChangePostInput,
  ChangeProfileInput,
  ChangeUserInput,
  ContextInterface,
  CreatePostInput,
  CreateProfileInput,
  CreateUserInput,
  PostType,
  ProfileType,
  UserType,
} from '../types/general.js';
import { UUIDType } from '../types/uuid.js';

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    createPost: {
      type: PostType,
      args: { dto: { type: CreatePostInput } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        return await db.post.create({ data: args.dto });
      },
    },
    createUser: {
      type: UserType,
      args: { dto: { type: CreateUserInput } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        return await db.user.create({ data: args.dto });
      },
    },
    createProfile: {
      type: ProfileType,
      args: { dto: { type: CreateProfileInput } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        return await db.profile.create({ data: args.dto });
      },
    },
    deletePost: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        try {
          await db.post.delete({ where: { id: args.id } });
        } catch {
          return false;
        }
        return true;
      },
    },
    deleteProfile: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        try {
          await db.profile.delete({ where: { id: args.id } });
        } catch {
          return false;
        }
        return true;
      },
    },
    deleteUser: {
      type: GraphQLBoolean,
      args: { id: { type: UUIDType } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        try {
          await db.user.delete({ where: { id: args.id } });
        } catch {
          return false;
        }
        return true;
      },
    },
    changePost: {
      type: PostType,
      args: { id: { type: UUIDType }, dto: { type: ChangePostInput } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        return await db.post.update({ where: { id: args.id }, data: args.dto });
      },
    },
    changeProfile: {
      type: ProfileType,
      args: { id: { type: UUIDType }, dto: { type: ChangeProfileInput } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        return await db.profile.update({ where: { id: args.id }, data: args.dto });
      },
    },
    changeUser: {
      type: UserType,
      args: { id: { type: UUIDType }, dto: { type: ChangeUserInput } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        return await db.user.update({ where: { id: args.id }, data: args.dto });
      },
    },
    subscribeTo: {
      type: UserType,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        await db.subscribersOnAuthors.create({
          data: { subscriberId: args.userId, authorId: args.authorId },
        });

        return await db.user.findUnique({ where: { id: args.userId } });
      },
    },
    unsubscribeFrom: {
      type: GraphQLBoolean,
      args: { userId: { type: UUIDType }, authorId: { type: UUIDType } },
      resolve: async (_parent, args, { db }: ContextInterface) => {
        try {
          await db.subscribersOnAuthors.delete({
            where: {
              subscriberId_authorId: {
                subscriberId: args.userId,
                authorId: args.authorId,
              },
            },
          });
        } catch {
          return false;
        }
        return true;
      },
    },
  },
});

export default RootMutation;
