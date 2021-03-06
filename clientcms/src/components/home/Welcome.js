import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import {
//     COLOR_JBG_PURPLE,
//     SYSTEM_CMS_INDEX_URL,
//     TOUCHSCREEN_CMS_INDEX_URL
// } from "../../utils/Constants";
// import "./Welcome.css";
// import Button from "@material-ui/core/Button";
// import { isEmpty } from "lodash";
// import { Redirect } from "react-router";
import Loading from "../loading/Loading";
import {
    getCurrentUserQuery as query,
    getClientFromUser,
    getClientDetail
} from "../../data/query";
import { withApollo, Query } from "react-apollo";
import styled from "styled-components";
import WelcomeAccount from "./WelcomeAccount";
import { WELCOME_URL } from "../../utils/Constants";

const ContainerDiv = styled.div`
    width: 100vw;
    // height: calc(100vh - 80px);
    height: 100vh;

    position: relative;
    display: flex;
    background-color: #f4f4f4;
`;

const SidebarDiv = styled.div`
    width: 260px;
    background-color: white;
    position: fixed;
    color: black;
    display: flex;
    flex-direction: column;
    height: 100vh;
    align-items: center;
`;
const ContentDiv = styled.div`
    width: calc(100vw - 260px);
`;

const SidebarContainer = styled.div`
    width: 260px;
    height: 100vh;
`;

const SidebarSelected = styled.div`
    width: 100%;
    background: rgb(113, 113, 113);
    color: white;
    font-weight: 700;
    padding: 5% 0 5% 15%;
    //  text-align: center;
`;

const SidebarNormal = styled.div`
    width: 100%;
    background: white;
    color: black;
    font-weight: 700;
    padding: 5% 0 5% 15%;
    text-align: left;
`;

// class Welcome extends Component {
//     render() {
//         const SELECT_FONT_STYLE = {
//             textAlign: "center",
//             fontSize: "1.5em",
//             height: "50px",
//             lineHeight: "50px",
//             fontWeight: "bold",
//             color: COLOR_JBG_PURPLE
//         };
//         const { client } = this.props;
//         const { getCurrentUser: user } = client.readQuery({
//             query
//         });
//         const { has_tablet, has_touchscreen } = user.client;

//         if (has_tablet && !has_touchscreen)
//             return (
//                 <Redirect
//                     to={{
//                         pathname: SYSTEM_CMS_INDEX_URL
//                     }}
//                 />
//             );

//         if (!has_tablet && has_touchscreen)
//             return (
//                 <Redirect
//                     to={{
//                         pathname: TOUCHSCREEN_CMS_INDEX_URL
//                     }}
//                 />
//             );

//         return (
//             <div
//                 style={{
//                     width: "100vw",
//                     height: `calc(100vh - 80px)`,
//                     position: "relative",
//                     backgroundColor: "rgb(247,247,247)"
//                 }}
//             >
//                 <div
//                     style={{
//                         margin: "auto",
//                         position: "absolute",
//                         top: "50%",
//                         left: "50%",
//                         transform: "translate(-50%, -50%)"
//                     }}
//                 >
//                     <p
//                         style={{
//                             color: COLOR_JBG_PURPLE,
//                             textAlign: "center",
//                             textTransform: "uppercase",
//                             fontSize: "1.8em",
//                             fontWeight: "bold"
//                         }}
//                     >
//                         PLEASE SELECT WHICH PLATFORM TO EDIT
//                     </p>

//                     <div
//                         style={{
//                             display: "flex",
//                             flexDirection: "row",
//                             flexWrap: "nowrap",
//                             justifyContent: "center",
//                             alignItems: "center",
//                             alignContent: "center"
//                         }}
//                     >
//                         {!isEmpty(user) && has_tablet && (
//                             <Link
//                                 to={SYSTEM_CMS_INDEX_URL}
//                                 style={{
//                                     textDecoration: "none",
//                                     margin: "10px",
//                                     backgroundColor: "white"
//                                 }}
//                             >
//                                 <div className="welcome_page_selection_image_container">
//                                     <img
//                                         className="welcome_page_selection_image_container_image"
//                                         src="https://s3-ap-southeast-2.amazonaws.com/digitalconcierge/cms_assets/welcome_page_tablet_small.png"
//                                         alt="welcome_page_tablet_small"
//                                     />
//                                     <div className="welcome_page_selection_image_container_middle">
//                                         <Button
//                                             variant="contained"
//                                             type="submit"
//                                             color="primary"
//                                             style={{
//                                                 width: "200px",
//                                                 color: "white",
//                                                 fontSize: "1.3em",
//                                                 backgroundColor: COLOR_JBG_PURPLE
//                                             }}
//                                         >
//                                             EDIT
//                                         </Button>
//                                     </div>
//                                 </div>
//                                 <p style={SELECT_FONT_STYLE}>
//                                     DIGITAL COMPENDIUM
//                                 </p>
//                             </Link>
//                         )}

//                         {!isEmpty(user) && has_touchscreen && (
//                             <Link
//                                 to={TOUCHSCREEN_CMS_INDEX_URL}
//                                 style={{
//                                     textDecoration: "none",
//                                     margin: "10px",
//                                     backgroundColor: "white"
//                                 }}
//                             >
//                                 <div className="welcome_page_selection_image_container">
//                                     <img
//                                         className="welcome_page_selection_image_container_image"
//                                         src="https://s3-ap-southeast-2.amazonaws.com/digitalconcierge/cms_assets/welcome_page_touchscreen_small.png"
//                                         alt="welcome_page_tablet_small"
//                                     />
//                                     <div className="welcome_page_selection_image_container_middle">
//                                         <Button
//                                             variant="contained"
//                                             type="submit"
//                                             color="primary"
//                                             style={{
//                                                 width: "200px",
//                                                 color: "white",
//                                                 fontSize: "1.3em",
//                                                 backgroundColor: COLOR_JBG_PURPLE
//                                             }}
//                                         >
//                                             EDIT
//                                         </Button>
//                                     </div>
//                                 </div>
//                                 <p style={SELECT_FONT_STYLE}>
//                                     DIGITAL CONCIERGE
//                                 </p>
//                             </Link>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

const WelcomeSystems = React.lazy(() => import("./WelcomeSystems"));
const WelcomeTheme = React.lazy(() => import("./WelcomeTheme"));
const WelcomeUser = React.lazy(() => import("./WelcomeUser"));

const SIDEBAR_BUTTONS = [
    { id: "systems", name: "SYSTEMS", component: WelcomeSystems },
    { id: "account", name: "ACCOUNT", component: WelcomeAccount },
    { id: "theme", name: "THEME SETTINGS", component: WelcomeTheme },
    { id: "users", name: "USERS & STRUCTURES", component: WelcomeUser },
    { id: "support", name: "SUPPORT", component: "WelcomeSystems" }
];

const renderWelcomeComponent = (
    loading,
    error,
    data,
    selected,
    handleClickSidebar
) => {
    if (loading) return <Loading loadingData />;
    if (error) return `Error! ${error.message}`;
    const client =
        Boolean(data) && Boolean(data.clientByUser)
            ? data.clientByUser
            : Boolean(data) && Boolean(data.client)
            ? data.client
            : {};

    const { component: SelectedComponent } = SIDEBAR_BUTTONS.find(
        ({ id }) => id === selected
    );
    return (
        <React.Fragment>
            <SidebarContainer>
                <SidebarDiv>
                    <div
                        style={{
                            height: "160px",
                            textAlign: "center",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        {client && client.avatar && (
                            <img
                                src={client.avatar}
                                style={{
                                    width: "60%",

                                    margin: "0 auto"
                                }}
                                alt={`${client.name} avatar`}
                            />
                        )}
                    </div>
                    {/* <p
                    style={{
                        fontSize: "18px",
                        width: "100%",
                        backgroundColor: "#C1C1C1",
                        color: "white",
                        padding: "5% 0 5% 15%",
                        margin: "0"
                    }}
                >
                    ADMIN <br /> CONSOLE
                </p> */}
                    {SIDEBAR_BUTTONS.map(({ id, name }) => (
                        <React.Fragment key={id}>
                            {selected === id ? (
                                <SidebarSelected
                                    id={id}
                                    onClick={handleClickSidebar}
                                >
                                    {name}
                                </SidebarSelected>
                            ) : (
                                <SidebarNormal
                                    id={id}
                                    onClick={handleClickSidebar}
                                >
                                    {name}
                                </SidebarNormal>
                            )}
                        </React.Fragment>
                    ))}
                </SidebarDiv>
            </SidebarContainer>
            <ContentDiv>
                <React.Suspense>
                    <SelectedComponent data={client} />
                </React.Suspense>
            </ContentDiv>
        </React.Fragment>
    );
};

export const Welcome = ({ client, match, history }) => {
    const { params } = match || {};
    const { client_id = "", which = "systems" } = params;

    const [selected, setSelected] = useState(which);

    //Component did update via hooks
    useEffect(() => {
        console.info("Tabs changed ", match);
        setSelected(match.params.which || "systems");
    }, [match.params.which]);

    const { getCurrentUser: user } = client.readQuery({ query });

    const handleClickSidebar = event => {
        setSelected(event.target.id);
        history.push(`${WELCOME_URL}/${client_id}/${event.target.id}`);
    };

    console.log(user);
    return (
        <ContainerDiv>
            {Boolean(client_id) && client_id.length > 0 ? (
                <Query query={getClientDetail} variables={{ id: client_id }}>
                    {({ loading, error, data }) => (
                        <React.Fragment>
                            {renderWelcomeComponent(
                                loading,
                                error,
                                data,
                                selected,
                                handleClickSidebar
                            )}
                        </React.Fragment>
                    )}
                </Query>
            ) : (
                <Query query={getClientFromUser}>
                    {({ loading, error, data }) => (
                        <React.Fragment>
                            {renderWelcomeComponent(
                                loading,
                                error,
                                data,
                                selected,
                                handleClickSidebar
                            )}
                        </React.Fragment>
                    )}
                </Query>
            )}
        </ContainerDiv>
    );
};

export default withApollo(Welcome);
