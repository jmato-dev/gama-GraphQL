import { gql } from 'apollo-server-express';
import * as uuid from 'uuid';

import createRepository from '../../io/Database/createRepository';
import { ListSortmentEnum } from '../List/List';

const clientRepository = createRepository('client');

export const typeDefs = gql`
    type Client implements Node {
        id: ID!
        name: String!
        email: String!
        disabled: Boolean!
    }

    type ClienList implements List {
        items: [Client!]!
        totalItems: Int!
    }

    input ClientListFilter {
        name: String
        email: String
        disabled: Boolean
    }

    input ClienListOptions {
        take: Int
        skip: Int
        filter: ClientListFilter
        sort: ListSort
    }

    extend type Query {
        client(id: ID!): Client
        clients(options: ClienListOptions): ClienList
    }

    input CreateClientInput {
        name: String!
        email: String!
    }

    input UpdateClientInput {
        id: ID!
        name: String!
        email: String!
    }

    extend type Mutation {
        createClient(input: CreateClientInput!): Client!
        updateClient(input: UpdateClientInput!): Client!
        deleteClient(id: ID!): Client!
        enableClient(id: ID!): Client!
        disableClient(id: ID!): Client!
    }
`;

export const resolvers = {
    Query: {
        client: async(_, { id }) => {
            const clients = await clientRepository.read();
            return clients.find(client => client.id === id);
        },
        clients: async(_, args) => {
            const {
                skip = 0,
                take = 10,
                sort,
                filter,
            } = args.options || {};

            const clients = await clientRepository.read();
            
            if (sort)
                clients.sort((a, b) => {
                    if (!['name', 'email', 'disabled'].includes(sort.sorter))
                        throw new Error(`Cannot sort by field "${sort.sorter}`);

                    const fieldA = a[sort.sorter];
                    const fieldB = b[sort.sorter];

                    if (typeof fieldA === 'string')
                        return sort.sortment === ListSortmentEnum.ASC ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);

                    return sort.sortment === ListSortmentEnum.ASC ? Number(fieldA) - Number(fieldB) : Number(fieldB) - Number(fieldA);
                    
                });

            const filteredClients = clients.filter((client) => {
                if (!filter || Object.keys(filter).length === 0)
                    return true;

                return Object.entries(filter).every(([field, value]) => {
                    if (client[field] === null || client[field] === undefined)
                        return false;

                    if (typeof value === 'string') {
                        if (value.startsWith('%') && value.endsWith('%'))
                            return client[field].includes(value.substr(1, value.length -2));
                        if (value.startsWith('%'))
                            return client[field].endsWith(value.substr(1));
                        if (value.endsWith('%'))
                            return client[field].startsWith(value.substr(0, value.length - 1));
                        return client[field] === value;
                    }
                    return client[field] === value;
                });
            });

            return {
                items: filteredClients.slice(skip, skip + take),
                totalItems: filteredClients.length,
            };
        },
    },

    Mutation: {
        createClient: async (_, { input }) => {
            const clients = await clientRepository.read();

            const client = {
                id: uuid.v4(),
                name: input.name,
                email: input.email,
                disabled: false
            }

            await clientRepository.write([...clients, client]);

            return client;
        },

        updateClient: async (_, { input }) => {
            const clients = await clientRepository.read();
            let client = clients.find(item => item.id === input.id);

            if (!client)
                throw new Error(`No client with id: "${input.id}"`);

            client = {
                ...client,
                name: input.name,
                email: input.email,
            }

            const updated = clients.map((item) => {
                if (item.id === client.id)
                    return client
                return item;
            });

            await clientRepository.write(updated);

            return client;
        },

        deleteClient: async (_, { id }) => {
            // console.log ("id", id);

            const clients = await clientRepository.read();
            let client = clients.find(item => item.id === id);

            if (!client)
                throw new Error(`No client with id: "${id}"`);

            const updated = clients.filter((item) => item.id !== client.id);

            await clientRepository.write(updated);

            return client;
        },

        enableClient: async (_, { id }) => {
            const clients = await clientRepository.read();
            let client = clients.find(item => item.id === id);

            if (!client)
                throw new Error(`No client with id: "${id}"`);

            if (!client.disabled)
                throw new Error(`Client "${id}" is already enabled.`);

            const updated = clients.map((item) => {
                if (item.id === client.id)
                    item.disabled = false;

                return item;
            });

            await clientRepository.write(updated);

            return client;
        },

        disableClient: async (_, { id }) => {
            const clients = await clientRepository.read();
            let client = clients.find(item => item.id === id);

            if (!client)
                throw new Error(`No client with id: "${id}"`);

            if (client.disabled)
                throw new Error(`Client "${id}" is already disabled.`);

            const updated = clients.map((item) => {
                if (item.id === client.id)
                    item.disabled = true;

                return item;
            });

            await clientRepository.write(updated);

            return client;
        }

    }
};
