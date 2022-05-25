import { gql } from 'apollo-server-express';

import { typeDefs as nodeDefs } from './Node/Node';
import { typeDefs as listDefs } from './List/List';
import { typeDefs as clientDefs } from "./Client/Client";
import { typeDefs as demandDefs } from "./Demand/Demand";

const typeDefs = gql`
    type Query {
        _root: String
    }

    ${nodeDefs}
    ${listDefs}
    ${clientDefs}
    ${demandDefs}
`;

export default typeDefs;
