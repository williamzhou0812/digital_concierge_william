import { gql } from "apollo-server-express";

export default gql`
    extend type Query {
        jbgMap(id: ID!): JbgMap
        jbgMaps: [JbgMap]
    }

    type JbgMap {
        id: ID!
        name: String
        createdAt: DateTime
        updatedAt: DateTime
        layout: Layout
        just_brilliant_guides: [JustBrilliantGuide]
        media: [Media]
    }
`;
