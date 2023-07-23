/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { GraphQLObjectType, GraphQLList, GraphQLNonNull } from 'graphql';
import {
  ContextInterface,
  MemberType,
  MemberTypeId,
  PostType,
  ProfileType,
  UserType,
} from '../types/general.js';
import { UUIDType } from '../types/uuid.js';
import {
  ResolveTree,
  parseResolveInfo,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    memberTypes: {
      type: new GraphQLList(MemberType),
      resolve: async (_parent, _args, { db }: ContextInterface) => {
        return await db.memberType.findMany();
      },
    },
    posts: {
      type: new GraphQLList(PostType),
      resolve: async (_parent, _args, { db }: ContextInterface) => {
        return await db.post.findMany();
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async (_parent, _args, ctx: ContextInterface, info) => {
        // return await db.user.findMany();
        const { db } = ctx;
        const parsedInfo = parseResolveInfo(info) as ResolveTree;

        const { fields } = simplifyParsedResolveInfoFragmentWithType(
          parsedInfo,
          info.returnType,
        );

        const fieldsKeys = Object.keys(fields);

        const users = await db.user.findMany({
          include: {
            subscribedToUser: fieldsKeys.includes('subscribedToUser'),
            userSubscribedTo: fieldsKeys.includes('userSubscribedTo'),
          },
        });

        ctx.dataUsers = users;

        return users;
      },
    },
    profiles: {
      type: new GraphQLList(ProfileType),
      resolve: async (_parent, _args, { db }: ContextInterface) => {
        return await db.profile.findMany();
      },
    },
    memberType: {
      type: MemberType,
      args: { id: { type: new GraphQLNonNull(MemberTypeId) } },
      resolve: async (_, args, { db }: ContextInterface) => {
        const memberType = await db.memberType.findFirst({
          where: {
            id: args.id,
          },
        });
        return memberType;
      },
    },
    post: {
      type: PostType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, { db }: ContextInterface) => {
        const postType = await db.post.findFirst({
          where: {
            id: args.id,
          },
        });
        return postType;
      },
    },
    user: {
      type: UserType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, { db }: ContextInterface) => {
        const userType = await db.user.findUnique({
          where: {
            id: args.id,
          },
        });
        return userType;
      },
    },
    profile: {
      type: ProfileType,
      args: { id: { type: new GraphQLNonNull(UUIDType) } },
      resolve: async (_, args, { db }: ContextInterface) => {
        const profileType = await db.profile.findFirst({
          where: {
            id: args.id,
          },
        });
        return profileType;
      },
    },
  },
});

export default RootQuery;
