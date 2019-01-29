import gql from "graphql-tag";

export const getSelectedUserQuery = gql`
    query getUser {
        user(id: 1) {
            id
            name
            email
            active
            avatar
            createdAt
            updatedAt
            role {
                name
                is_admin
                permissions {
                    name
                }
            }
            client {
                name
                avatar
                number_of_users
                active
            }
        }
    }
`;

export const getCurrentUserQuery = gql`
    query getCurrentUser {
        getCurrentUser {
            id
            name
            email
            active
            avatar
            createdAt
            updatedAt
            role {
                name
                is_admin
                permissions {
                    name
                }
            }
            client {
                name
                avatar
                number_of_users
                active
            }
        }
    }
`;
