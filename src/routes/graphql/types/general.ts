/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaClient } from '@prisma/client';
import graphql, { GraphQLInputObjectType, GraphQLNonNull } from 'graphql';
import { UUIDType } from './uuid.js';
import DataLoader from 'dataloader';
import { User } from '../index.js';

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLEnumType,
} = graphql;

export interface ContextInterface {
  db: PrismaClient;
  dataLoader: WeakMap<any, any>;
  dataUsers?: Record<string, unknown>[];
}

export const MemberTypeId = new GraphQLEnumType({
  name: 'MemberTypeId',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});

export const UserType: graphql.GraphQLObjectType<any, any> = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: UUIDType },
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
    profile: {
      type: ProfileType,
      resolve: async (parent, _args, { db, dataLoader }: ContextInterface, info) => {
        // return await db.profile.findUnique({ where: { userId: parent.id } });
        let dl = dataLoader.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const rows = await db.profile.findMany({ where: { userId: { in: ids } } });
            const sortedInIdsOrrder = ids.map((id) => rows.find((x) => x.userId === id));
            return sortedInIdsOrrder;
          });
          dataLoader.set(info.fieldNodes, dl);
        }
        return dl.load(parent.id);
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (parent, _args, { db, dataLoader }: ContextInterface, info) => {
        // return await db.post.findMany({ where: { authorId: parent.id } });
        let dl = dataLoader.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const rows = await db.post.findMany({ where: { authorId: { in: ids } } });
            const sortedInIdsOrrder = ids.map((id) =>
              rows.filter((x) => x.authorId === id),
            );
            return sortedInIdsOrrder;
          });
          dataLoader.set(info.fieldNodes, dl);
        }
        return dl.load(parent.id);
      },
    },
    userSubscribedTo: {
      type: new GraphQLList(UserType),
      resolve: async (
        parent: User,
        _args,
        { db, dataLoader, dataUsers }: ContextInterface,
        info,
      ) => {
        // return await db.user.findMany({
        //   where: {
        //     subscribedToUser: {
        //       some: {
        //         subscriberId: parent.id,
        //       },
        //     },
        //   },
        // })

        if (dataUsers) {
          const user = dataUsers.find((user) => user.id === parent.id);
          return user && user.userSubscribedTo;
        }

        let dl = dataLoader.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const rows = await db.user.findMany({
              where: { subscribedToUser: { some: { subscriberId: { in: ids } } } },
              include: { subscribedToUser: true, userSubscribedTo: false },
            });
            const sortedInIdsOrrder = ids.map((id) =>
              rows.filter((x) => x.subscribedToUser.find((el) => el.subscriberId === id)),
            );
            return sortedInIdsOrrder;
          });
          dataLoader.set(info.fieldNodes, dl);
        }
        return dl.load(parent.id);
      },
    },
    subscribedToUser: {
      type: new GraphQLList(UserType),
      resolve: async (
        parent: User,
        _args,
        { db, dataLoader, dataUsers }: ContextInterface,
        info,
      ) => {
        // return await db.user.findMany({
        //   where: {
        //     userSubscribedTo: {
        //       some: {
        //         authorId: parent.id,
        //       },
        //     },
        //   },
        // });

        if (dataUsers) {
          const user = dataUsers.find((user) => user.id === parent.id);
          return user && user.subscribedToUser;
        }

        let dl = dataLoader.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const rows = await db.user.findMany({
              where: { userSubscribedTo: { some: { authorId: { in: ids } } } },
              include: { userSubscribedTo: true, subscribedToUser: false },
            });
            const sortedInIdsOrrder = ids.map((id) =>
              rows.filter((x) => x.userSubscribedTo.find((el) => el.authorId === id)),
            );
            return sortedInIdsOrrder;
          });
          dataLoader.set(info.fieldNodes, dl);
        }
        return dl.load(parent.id);
      },
    },
  }),
});

export const PostType = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: { type: UUIDType },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    authorId: { type: UUIDType },
    author: {
      type: UserType,
      resolve: async (parent, _args, { db, dataLoader }: ContextInterface, info) => {
        // return await db.user.findFirst({ where: { id: parent.authorId } });
        let dl = dataLoader.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const rows = await db.user.findMany({ where: { id: { in: ids } } });
            const sortedInIdsOrrder = ids.map((id) => rows.find((x) => x.id === id));
            return sortedInIdsOrrder;
          });
          dataLoader.set(info.fieldNodes, dl);
        }
        return dl.load(parent.authorId);
      },
    },
  }),
});

export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: { type: UUIDType },
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    userId: { type: UUIDType },
    user: {
      type: UserType,
      resolve: async (parent, _args, { db, dataLoader }: ContextInterface, info) => {
        // return await db.user.findFirst({ where: { id: parent.userId } });
        let dl = dataLoader.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const rows = await db.user.findMany({ where: { id: { in: ids } } });
            const sortedInIdsOrrder = ids.map((id) => rows.find((x) => x.id === id));
            return sortedInIdsOrrder;
          });
          dataLoader.set(info.fieldNodes, dl);
        }
        return dl.load(parent.userId);
      },
    },
    memberTypeId: { type: MemberTypeId },
    memberType: {
      type: MemberType,
      resolve: async (parent, _args, { db, dataLoader }: ContextInterface, info) => {
        // return await db.memberType.findFirst({ where: { id: parent.memberTypeId } });
        let dl = dataLoader.get(info.fieldNodes);
        if (!dl) {
          dl = new DataLoader(async (ids: any) => {
            const rows = await db.memberType.findMany({ where: { id: { in: ids } } });
            const sortedInIdsOrrder = ids.map((id) => rows.find((x) => x.id === id));
            return sortedInIdsOrrder;
          });
          dataLoader.set(info.fieldNodes, dl);
        }
        return dl.load(parent.memberTypeId);
      },
    },
  }),
});

export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: { type: MemberTypeId },
    discount: { type: GraphQLFloat },
    postsLimitPerMonth: { type: GraphQLInt },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (parent, _args, { db }: ContextInterface) => {
        return await db.profile.findMany({ where: { memberTypeId: parent.id } });
      },
    },
  }),
});

export const CreateUserInput = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
  }),
});

export const CreatePostInput = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: {
    authorId: { type: new GraphQLNonNull(UUIDType) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const CreateProfileInput = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: new GraphQLNonNull(UUIDType) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
    memberTypeId: { type: new GraphQLNonNull(MemberTypeId) },
  }),
});

export const ChangePostInput = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: {
    authorId: { type: UUIDType },
    content: { type: GraphQLString },
    title: { type: GraphQLString },
  },
});

export const ChangeProfileInput = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: {
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
    memberTypeId: { type: MemberTypeId },
  },
});

export const ChangeUserInput = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: {
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat },
  },
});
