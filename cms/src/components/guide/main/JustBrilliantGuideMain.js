import React from "react";
import TabbedPage from "../../../utils/TabbedPage";
import PublicationList from "./PublicationList";
import MainAdvertiserList from "./MainAdvertiserList";

const JustBrilliantGuideMain = ({ data }) => {
    return (
        <TabbedPage
            title="Just Brilliant Guides"
            data={data}
            tabs={[
                {
                    name: "Publications",
                    withButtons: false,
                    withCancel: false,
                    component: PublicationList
                },
                {
                    name: "Advertisers",
                    withButtons: false,
                    withCancel: false,
                    component: MainAdvertiserList
                }
            ]}
        />
    );
};

export default JustBrilliantGuideMain;
