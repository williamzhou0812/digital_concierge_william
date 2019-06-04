import React from "react";
import { Query, Mutation } from "react-apollo";
import {
    getAdvertiserActiveAgreement,
    getArtworkSizeList
} from "../../../data/query";
import Loading from "../../loading/Loading";
import { getArticlesFromJustBrilliantGuide } from "../../../data/query/justBrilliantGuide";
import { EDIT_ADVERTISING_ARTWORK } from "../../../data/mutation";
import {
    ContainerDiv,
    FormLabelDiv,
    SectionDiv,
    SectionTitleDiv,
    ContinueButton
} from "./commonStyle";
import { Formik, Form, Field } from "formik";
import { Select } from "formik-material-ui";
import { OutlinedInput, MenuItem } from "@material-ui/core";
import { DatePicker } from "@material-ui/pickers";
import { isEmpty } from "lodash";
import styled from "styled-components";
import SimpleDocumentUploader from "../../../utils/SimpleDocumentUploader";

const StepArtworkHOC = ({ advertiserId, exitUrl, onRef, pubId }) => (
    <Query
        query={getAdvertiserActiveAgreement}
        variables={{ id: advertiserId }}
    >
        {({
            loading: loadingAdvertiser,
            error: errorAdvertiser,
            data: { advertiser }
        }) => {
            if (loadingAdvertiser) return <Loading loadingData />;
            if (errorAdvertiser)
                return (
                    <React.Fragment>
                        Error! {errorAdvertiser.message}
                    </React.Fragment>
                );
            return (
                <Query
                    query={getArticlesFromJustBrilliantGuide}
                    variables={{ id: pubId }}
                >
                    {({
                        loading: loadingArticles,
                        error: errorArticles,
                        data: { justBrilliantGuide }
                    }) => {
                        if (loadingArticles) return <Loading loadingData />;
                        if (errorArticles)
                            return (
                                <React.Fragment>
                                    Error! {errorArticles.message}
                                </React.Fragment>
                            );
                        const { articles = [] } = justBrilliantGuide || {};
                        //TODO: ADD REFETCH MUTATION
                        return (
                            <Query query={getArtworkSizeList}>
                                {({
                                    loading: loadingArtworks,
                                    error: errorArtworks,
                                    data: { artworkSizes }
                                }) => {
                                    if (loadingArtworks)
                                        return <Loading loadingData />;
                                    if (errorArtworks)
                                        return (
                                            <React.Fragment>
                                                Error! {errorArtworks.message}
                                            </React.Fragment>
                                        );
                                    return (
                                        <Mutation
                                            mutation={EDIT_ADVERTISING_ARTWORK}
                                        >
                                            {(action, { loading, error }) => {
                                                if (loading)
                                                    return (
                                                        <Loading loadingData />
                                                    );
                                                if (error)
                                                    return (
                                                        <React.Fragment>
                                                            Error!{" "}
                                                            {error.message}
                                                        </React.Fragment>
                                                    );
                                                return (
                                                    <StepArtwork
                                                        advertiser={advertiser}
                                                        exitUrl={exitUrl}
                                                        onRef={onRef}
                                                        articles={articles}
                                                        artworkSizes={
                                                            artworkSizes
                                                        }
                                                    />
                                                );
                                            }}
                                        </Mutation>
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

const renderSelectField = (label, name, optionValues, errors) => {
    return (
        <div style={{ width: "100%" }}>
            <FormLabelDiv>{label}</FormLabelDiv>
            <Field
                name={name}
                component={Select}
                disabled={optionValues.length < 1}
                fullWidth={true}
                input={
                    <OutlinedInput
                        labelWidth={0}
                        name={name}
                        error={!isEmpty(errors) && errors[name]}
                    />
                }
            >
                {optionValues.map(({ id, name }, index) => (
                    <MenuItem key={`ITEM-${name}-${id}-${index}`} value={id}>
                        {name}
                    </MenuItem>
                ))}
            </Field>
        </div>
    );
};

const SectionDivModified = styled(SectionDiv)`
    border-right: ${props =>
        Boolean(props.borderRight) ? props.borderRight : "none"};
    margin-right: ${props =>
        Boolean(props.marginRight) ? props.marginRight : "0px"};
    padding-left: 10px;
    padding-right: 10px;
`;

const FieldContainerDiv = styled.div`
    width: 100%;
    margin-bottom: 20px;
`;

const StepArtwork = ({
    advertiser,
    exitUrl,
    onRef,
    articles,
    artworkSizes
}) => {
    const { active_advertising } = advertiser;
    const { media } = active_advertising;
    let documentRef = React.createRef();
    return (
        <Formik
            initialValues={{
                artworkSizeId:
                    Boolean(active_advertising) &&
                    Boolean(active_advertising.artwork_size) &&
                    Boolean(active_advertising.artwork_size.id)
                        ? active_advertising.artwork_size.id
                        : null,
                artwork_supply_date:
                    Boolean(active_advertising) &&
                    Boolean(active_advertising.artwork_supply_date)
                        ? active_advertising.artwork_supply_date
                        : null,
                artwork_file_preview:
                    Boolean(media) && Boolean(media.path) ? media.path : "",
                artwork_file_name:
                    Boolean(media) && Boolean(media.name) ? media.name : "",
                articleId:
                    Boolean(active_advertising) &&
                    Array.isArray(active_advertising.articles) &&
                    active_advertising.articles.length > 0 &&
                    Boolean(active_advertising.articles[0].id)
                        ? active_advertising.articles[0].id
                        : null
            }}
        >
            {({ errors, setFieldValue, values }) => {
                const handleDateChange = data => {
                    const { $d: date = null } = data || {};
                    setFieldValue("artwork_supply_date", date);
                };
                return (
                    <Form>
                        <ContainerDiv>
                            <SectionDivModified
                                flexBasis="30%"
                                flexDirection="column"
                                borderRight="1px solid #DDDDDD"
                                marginRight="70px"
                            >
                                <SectionTitleDiv>Details</SectionTitleDiv>
                                <FieldContainerDiv>
                                    {renderSelectField(
                                        "Artwork Size",
                                        "artworkSizeId",
                                        artworkSizes,
                                        errors
                                    )}
                                </FieldContainerDiv>
                                <FieldContainerDiv>
                                    <FormLabelDiv>
                                        Artwork Supplied By
                                    </FormLabelDiv>
                                    <DatePicker
                                        name="artwork_supply_date"
                                        disableFuture={false}
                                        disablePast={false}
                                        format="DD MMMM YYYY"
                                        required={true}
                                        openTo="year"
                                        views={["year", "month", "date"]}
                                        value={values.artwork_supply_date}
                                        onChange={handleDateChange}
                                        clearable
                                        autoOk
                                        inputVariant="outlined"
                                        fullWidth
                                    />
                                </FieldContainerDiv>
                                <FieldContainerDiv>
                                    <SimpleDocumentUploader
                                        onRef={ref => (documentRef = ref)}
                                        {...Boolean(
                                            values.artwork_file_preview
                                        ) && {
                                            previewUrl:
                                                values.artwork_file_preview
                                        }}
                                        {...Boolean(
                                            values.artwork_file_name
                                        ) && {
                                            previewName:
                                                values.artwork_file_name
                                        }}
                                        label="Upload Artwork"
                                    />
                                </FieldContainerDiv>
                                <FieldContainerDiv>
                                    {renderSelectField(
                                        "Ad Location",
                                        "articleId",
                                        articles,
                                        errors
                                    )}
                                </FieldContainerDiv>
                            </SectionDivModified>
                            <SectionDiv
                                flexBasis="60%"
                                flexDirection="column"
                                paddingRight="0px"
                            >
                                <SectionTitleDiv>
                                    Artwork Preview
                                </SectionTitleDiv>
                                {Boolean(media) && Boolean(media.path) && (
                                    <div
                                        style={{
                                            width: "100%",
                                            backgroundImage: `url('${
                                                media.path
                                            }')`,
                                            height: "100%",
                                            backgroundPosition: "left",
                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "contain"
                                        }}
                                    />
                                )}
                            </SectionDiv>
                        </ContainerDiv>
                    </Form>
                );
            }}
        </Formik>
    );
};

export default StepArtworkHOC;
