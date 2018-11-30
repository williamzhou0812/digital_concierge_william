import { gql } from "apollo-server-express";

export default gql`
    extend type Query {
        tb_directory(id: ID!): TB_Directory
        tb_directories: [TB_Directory]
    }

    type TB_Directory {
        id: ID!
        name: String
        body: String
        active: Boolean
        image: String
        phone: String
        address: String
        opening_hours: String
        td_categories: [TB_Category]
    }
`;
