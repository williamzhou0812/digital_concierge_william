import gql from "graphql-tag";

export const CREATE_USER = gql`
    mutation createUser($input: CreateUserInput) {
        createUser(input: $input) {
            id
            name
        }
    }
`;
