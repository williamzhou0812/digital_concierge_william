import React from "react";
import TabbedPageSingleForm from "../../../utils/TabbedPageSingleForm";
import { WELCOME_URL } from "../../../utils/Constants";
import { Redirect } from "react-router-dom";
import { Query, Mutation } from "react-apollo";
import { CREATE_ARTICLE } from "../../../data/mutation";
import {
    getJbgLayoutFamilyDetailedList,
    getJbgTemplateList,
    getArticleListFromPublication,
    getJustBrilliantGuideLayoutFamilyDefaults
} from "../../../data/query";
import Loading from "../../loading/Loading";
import TabLayout from "../common/TabLayout";
import TabContent from "../common/TabContent";

const CreateNewArticle = ({ match }) => {
    const { params } = match || {};
    const { pub_id = null } = params || {};
    const tabs = [
        {
            name: "Preview",
            withButtons: true,
            withCancel: true,
            component: () => <div>Preview</div>
        },
        {
            name: "Layout",
            withButtons: true,
            withCancel: true,
            component: TabLayout
        },
        {
            name: "Content",
            withButtons: true,
            withCancel: true,
            component: TabContent
        }
    ];

    return (
        <div style={{ flex: 1, height: "100%" }}>
            {Boolean(pub_id) ? (
                <Mutation
                    mutation={CREATE_ARTICLE}
                    refetchQueries={[
                        {
                            query: getArticleListFromPublication,
                            variables: { id: pub_id }
                        }
                    ]}
                >
                    {(
                        action,
                        { loading: loadingMutation, error: errorMutation }
                    ) => {
                        if (loadingMutation) return <Loading loadingData />;
                        if (errorMutation)
                            return (
                                <React.Fragment>
                                    Error! ${errorMutation.message}
                                </React.Fragment>
                            );
                        return (
                            <Query query={getJbgLayoutFamilyDetailedList}>
                                {({
                                    loading: loadingQueryLayout,
                                    error: errorQueryLayout,
                                    data: {
                                        jbgLayoutFamilies: jbgLayoutFamiliesBefore
                                    }
                                }) => {
                                    if (loadingQueryLayout)
                                        return <Loading loadingData />;
                                    if (errorQueryLayout)
                                        return (
                                            <React.Fragment>
                                                Error!{" "}
                                                {errorQueryLayout.message}
                                            </React.Fragment>
                                        );
                                    const jbgLayoutFamilies = jbgLayoutFamiliesBefore.map(
                                        ({ __typename, ...others }) => ({
                                            ...others
                                        })
                                    );
                                    return (
                                        <Query query={getJbgTemplateList}>
                                            {({
                                                loading: loadingQueryTemplate,
                                                error: errorQueryTemplate,
                                                data: {
                                                    jbgTemplates: jbgTemplatesBefore
                                                }
                                            }) => {
                                                if (loadingQueryTemplate)
                                                    return (
                                                        <Loading loadingData />
                                                    );
                                                if (errorQueryTemplate)
                                                    return (
                                                        <React.Fragment>
                                                            Error!{" "}
                                                            {
                                                                errorQueryTemplate.message
                                                            }
                                                        </React.Fragment>
                                                    );
                                                const jbgTemplates = jbgTemplatesBefore.map(
                                                    ({
                                                        __typename,
                                                        ...others
                                                    }) => ({
                                                        ...others
                                                    })
                                                );

                                                const onSubmit = (
                                                    values,
                                                    formikBag
                                                ) => {
                                                    console.log(values);
                                                    console.log(formikBag);
                                                    //TODO: Do action here
                                                };

                                                return (
                                                    <Query
                                                        query={
                                                            getJustBrilliantGuideLayoutFamilyDefaults
                                                        }
                                                        variables={{
                                                            id: pub_id
                                                        }}
                                                    >
                                                        {({
                                                            loading: loadingQueryDefault,
                                                            error: errorQueryDefault,
                                                            data: {
                                                                justBrilliantGuide
                                                            }
                                                        }) => {
                                                            if (
                                                                loadingQueryDefault
                                                            )
                                                                return (
                                                                    <Loading
                                                                        loadingData
                                                                    />
                                                                );
                                                            if (
                                                                errorQueryDefault
                                                            )
                                                                return (
                                                                    <React.Fragment>
                                                                        Error!{" "}
                                                                        {
                                                                            errorQueryDefault.message
                                                                        }
                                                                    </React.Fragment>
                                                                );
                                                            const {
                                                                __typename,
                                                                ...otherDefaults
                                                            } = justBrilliantGuide;

                                                            //https://stackoverflow.com/a/38829074 -- Mapping keys inside an array to create a new array
                                                            const defaultFamilyLayouts = Object.assign(
                                                                {},
                                                                ...Object.keys(
                                                                    otherDefaults
                                                                ).map(k =>
                                                                    k === "id"
                                                                        ? {}
                                                                        : {
                                                                              [k]: otherDefaults[
                                                                                  k
                                                                              ].toString()
                                                                          }
                                                                )
                                                            );

                                                            return (
                                                                <TabbedPageSingleForm
                                                                    title="Editorial Article"
                                                                    data={{
                                                                        justBrilliantGuideId: pub_id,
                                                                        jbgLayoutId: null,
                                                                        jbgFamilyLayoutId: null,
                                                                        jbgTemplateId: null,
                                                                        headerMediumId: null,
                                                                        header_preview: null,
                                                                        header_image_upload: null,
                                                                        featureMediumId: null,
                                                                        feature_image_upload: null,
                                                                        feature_preview: null,
                                                                        name:
                                                                            "",
                                                                        introductionText:
                                                                            "",
                                                                        description:
                                                                            ""
                                                                    }}
                                                                    exitUrl={
                                                                        WELCOME_URL +
                                                                        "/guide"
                                                                    }
                                                                    cancelUrl={
                                                                        WELCOME_URL +
                                                                        "/guide"
                                                                    }
                                                                    tabs={tabs}
                                                                    tooltipText="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                                                    onSubmit={
                                                                        onSubmit
                                                                    }
                                                                    otherProps={{
                                                                        layoutFamilies: jbgLayoutFamilies,
                                                                        templates: jbgTemplates,
                                                                        defaultFamilyLayouts
                                                                    }}
                                                                />
                                                            );
                                                        }}
                                                    </Query>
                                                );
                                            }}
                                        </Query>
                                    );
                                }}
                            </Query>
                        );
                    }}
                </Mutation>
            ) : (
                <Redirect to={WELCOME_URL + "/guide"} />
            )}
        </div>
    );
};
export default CreateNewArticle;
