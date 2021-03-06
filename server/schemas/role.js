import { gql } from "apollo-server-express";

export default gql`
    extend type Query {
        role(id: ID!): Role
        roles: [Role]
        rolesByClientId(clientId: ID!): [Role]
    }

    extend type Mutation {
        createRole(input: CreateRoleInput): Role
        updateRole(input: UpdateRoleInput): Role
        deleteRoles(input: DeleteRoleInput): Boolean
        duplicateRoles(input: DuplicateRoleInput): Boolean
        duplicateRole(id: ID!, name: String!): Boolean
    }

    type Role {
        id: ID!
        name: String
        is_standard_role: Boolean
        createdAt: DateTime
        updatedAt: DateTime
        users: [User]
        permissions: [Permission]
        department: Department
        client: Client
    }

    input CreateRoleInput {
        name: String!
        isStandardRole: Boolean!
        departmentId: ID!
        permissionIds: [ID]
        clientId: ID!
    }

    input UpdateRoleInput {
        id: ID!
        name: String!
        departmentId: ID!
        permissionIds: [ID]!
    }

    input DeleteRoleInput {
        roleIds: [ID]!
        clientId: ID!
    }

    input DuplicateRoleInput {
        roleIds: [Int]!
    }
`;
