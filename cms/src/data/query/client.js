import gql from "graphql-tag";

export const getClientFromUser = gql`
    query get_client_from_user {
        clientByUser {
            name
            full_company_name
            nature_of_business
            address
            postal_address
            phone
            email
            active
            number_of_users
            avatar
            contacts {
                id
                name
                title
                phone
                mobile
                email
            }
            contracts {
                id
                number
                file
                package
                active
            }
        }
    }
`;
