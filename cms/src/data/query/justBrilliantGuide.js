import gql from "graphql-tag";

export const getJustBrilliantGuideList = gql`
    query getJustBrilliantGuideList {
        justBrilliantGuides {
            id
            name
        }
    }
`;
