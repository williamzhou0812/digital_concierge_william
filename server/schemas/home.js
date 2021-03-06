import { gql } from "apollo-server-express";

export default gql`
    extend type Query {
        home(id: ID!): Home
        homes: [Home]
    }

    extend type Mutation {
        createHome(input: CreateHomeInput): Start
        editHome(input: UpdateHomeInput): Start
    }

    type Home {
        id: ID!
        description: String
        logoMediaId: Int
        logo: Media
        headerMediaId: Int
        header: Media
        colours: [JSON]
        colour1Hex: String
        colour1Alpha: Int
        colour2Hex: String
        colour2Alpha: Int
        colour3Hex: String
        colour3Alpha: Int
        colour4Hex: String
        colour4Alpha: Int
        colour5Hex: String
        colour5Alpha: Int
        createdAt: DateTime
        updatedAt: DateTime
        layout: Layout
        template: Template
        systems: [System]
        media: [Media]
    }

    input CreateHomeInput {
        description: String
        logo: Upload
        logoMediaId: Int
        header: Upload
        headerMediaId: Int
        colours: [ColourThemeInput]!
        layoutId: ID!
        templateId: ID
        systemId: ID!
        clientId: ID!
    }

    input UpdateHomeInput {
        id: ID!
        description: String
        logo: Upload
        logoMediaId: Int
        header: Upload
        headerMediaId: Int
        colours: [ColourThemeInput]!
        layoutId: ID!
        templateId: ID
        clientId: ID!
    }
`;
