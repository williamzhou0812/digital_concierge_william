import React, { useState } from "react";
import Tabs from "@material-ui/core/Tabs";
import Paper from "@material-ui/core/Paper";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";
// import Typography from "@material-ui/core/Typography";
import ModifyDirectoryListLayout from "./ModifyDirectoryListLayout";
import ModifyDirectoryListContent from "./ModifyDirectoryListContent";
import PropTypes from "prop-types";
import {
    ContainerDiv,
    SYSTEM_CMS_CONTENT_URL,
    // HEX_COLOUR_REGEX,
    DECIMAL_RADIX,
    SYSTEM_MODIFY_DIRECTORY_LIST_URL,
    SORT_BY_ORDER_BY_OPTIONS
} from "../../../utils/Constants";
import { withStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import { Formik, Form } from "formik";
import { Mutation, withApollo } from "react-apollo";
import {
    EDIT_DIRECTORY_LIST,
    CREATE_DIRECTORY_LIST
} from "../../../data/mutation";
import {
    getDirectoryListBySystem,
    getSystemThemeAndPalettes
} from "../../../data/query";
import * as Yup from "yup";
import { List } from "immutable";
import Slide from "@material-ui/core/Slide";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitleHelper from "../../../utils/DialogTitleHelper";
import InfoIcon from "@material-ui/icons/Info";
import Tooltip from "@material-ui/core/Tooltip";
import { sanitize } from "dompurify";
import {
    MainSectionContainer,
    PageHeader,
    //  ContainerDiv,
    ContainerDivTab,
    TopButtonsContainer,
    // BlueButtons,
    SubSectionTop,
    MainSubSections
} from "../../home/WelcomeStyleSet";

const TabContainer = props => {
    return (
        // <Typography component="div" style={{ height: "100%" }}>
        //     {props.children}
        // </Typography>
        // <div style={{ width: "100%", height: "100%" }}>{props.children}</div>
        <ContainerDiv>{props.children}</ContainerDiv>
    );
};

const styles = () => ({
    buttonSaveExit: {
        width: 150,
        position: "absolute",
        top: 100,
        right: 20,
        backgroundColor: "rgb(33,143,250)",
        color: "white",
        fontFamily: "Source Sans Pro, sans-serif"
    },
    buttonCancel: {
        backgroundColor: "white",
        color: "rgb(33,143,250)",
        border: "2px solid rgb(33,143,250)",
        fontWeight: "bold",
        margin: "2%",
        // width: "180px",
        padding: "5% 0"
    },
    buttonSaveKeep: {
        width: 150,
        position: "absolute",
        top: 140,
        right: 20,
        backgroundColor: "rgb(33,143,250)",
        color: "white",
        fontFamily: "Source Sans Pro, sans-serif"
    },
    blueButtons: {
        backgroundColor: "rgb(33, 143, 250)",
        borderRadius: "5px",
        color: "white",
        margin: "2%",
        padding: "5% 0"
    },
    infoIcon: {
        color: "rgb(38, 153, 251)"
    },
    tooltip: {
        fontSize: "1em"
    }
});

const lightGreyHeader = "rgb(247,247,247)";

const validationSchema = Yup.object().shape({
    name: Yup.string().required("Required."),
    layout_id: Yup.string().required("Required."),
    parent_id: Yup.string("Required."),
    images: Yup.mixed().required("Required.")
    // colours: Yup.array()
    //     .of(
    //         Yup.object().shape({
    //             hex: Yup.string()
    //                 .matches(HEX_COLOUR_REGEX)
    //                 .required("Please select the correct colour format"),
    //             alpha: Yup.number()
    //                 .min(0)
    //                 .max(100)
    //                 .required("Please select the correct alpha format")
    //         })
    //     )
    //     .required("Required.")
});

TabContainer.propTypes = {
    children: PropTypes.node.isRequired
};

const SlideUpTransition = props => {
    return <Slide direction="up" {...props} />;
};

const ModifyDirectoryList = props => {
    const [tab, setTab] = useState(0);
    const [toExit, setToExit] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);

    const handleCancelButton = () => setOpenDialog(true);
    const closeDialog = () => setOpenDialog(false);

    //Used to determine whether this is going to be a create or edit page
    const has_data =
        props.location &&
        props.location.state &&
        props.location.state.data &&
        props.location.state.data.id;

    //Used to determine whether this is going to be a create with additional information about the parent_id
    const has_parent_id =
        props.location &&
        props.location.state &&
        props.location.state.data &&
        props.location.state.data.parent_id;

    const handleChange = (_event, value) => {
        setTab(value);
    };

    const system_id = props.match.params.system_id;

    const { classes } = props;

    const {
        system: {
            theme: {
                defaultDirListLayout: {
                    id: layout_id,
                    layout_family: { id: layout_family_id }
                }
            }
        }
    } = props.client.readQuery({
        query: getSystemThemeAndPalettes,
        variables: { id: system_id }
    });

    const directoryList = has_data ? props.location.state.data : null;
    const { value: sortBy } = has_data
        ? SORT_BY_ORDER_BY_OPTIONS.find(
              ({ actualValue: { sortBy, orderBy } }) =>
                  sortBy === directoryList.sortBy &&
                  orderBy === directoryList.orderBy
          )
        : { value: null };
    const initialValues =
        has_data && directoryList
            ? {
                  id: directoryList.id,
                  name: directoryList.name,
                  title: sanitize(directoryList.title),
                  title_plaintext: directoryList.title_plaintext,
                  description: Boolean(directoryList.description)
                      ? sanitize(directoryList.description)
                      : "",
                  layout_family_id: directoryList.layout.layout_family.id,
                  layout_id: directoryList.layout.id,
                  order: directoryList.order,
                  parent_id:
                      Boolean(directoryList.parent_id) && !directoryList.is_root //Non-root Directory list
                          ? directoryList.parent_id
                          : directoryList.is_root //Root directory list
                          ? "-1"
                          : "",
                  images:
                      directoryList.media &&
                      Array.isArray(directoryList.media) &&
                      directoryList.media.length > 0
                          ? [{ ...directoryList.media[0], uploaded: true }]
                          : [],
                  colours: [...directoryList.colours],
                  initial_colours: [...directoryList.colours],
                  sortBy
              }
            : {
                  id: null,
                  name: "",
                  title: "",
                  title_plaintext: "",
                  description: "",
                  order: 0,
                  layout_family_id: Boolean(layout_family_id)
                      ? layout_family_id
                      : "",
                  layout_id: Boolean(layout_id) ? layout_id : "",
                  parent_id: has_parent_id
                      ? props.location.state.data.parent_id
                      : "",
                  images: [],
                  colours: [],
                  initial_colours: [],
                  sortBy: 1
              };

    //Modify data of the directory to remove unnecessary key values item
    //For example child_directory & directory_entries
    const modifyDataBeingSendToEditPage = (values, directory) => {
        if (directory.id && directory.media) {
            const is_dir_list = true;
            const {
                name,
                title: titleUnSanitized,
                title_plaintext,
                description: descriptionUnSanitized,
                layout_family_id,
                layout_id,
                order,
                parent_id,
                colours,
                sortBy
            } = values;
            const is_root = values.parent_id === "-1";
            const { id, media } = directory;

            return {
                id,
                name,
                title: sanitize(titleUnSanitized),
                title_plaintext: title_plaintext,
                description: sanitize(descriptionUnSanitized),
                layout: {
                    id: layout_id,
                    layout_family: {
                        id: layout_family_id
                    }
                },
                order,
                parent_id,
                active: true,
                media,
                colours: colours.toJS(),
                is_dir_list,
                is_root,
                sortBy
            };
        } else {
            return null;
        }
    };

    const cleanUp = values => {
        //Do clean up for generated preview images to prevent memory leak
        values.images.forEach(image => {
            if (!Boolean(image.uploaded) && Boolean(image.preview)) {
                // Make sure to revoke the preview data uris to avoid memory leaks
                URL.revokeObjectURL(image.preview);
            }
        });
    };

    const actionAfterSubmission = (values, data) => {
        const { history, match } = props;
        if (toExit) {
            cleanUp(values);
            history.push(
                SYSTEM_CMS_CONTENT_URL.replace(
                    ":system_id",
                    parseInt(match.params.system_id)
                )
            );
        } else if (!has_data) {
            //FROM CREATE PAGE NAVIGATE TO MODIFY PAGE AS WELL AS SET UPDATED DATA IN LOCATION

            history.push({
                pathname: SYSTEM_MODIFY_DIRECTORY_LIST_URL.replace(
                    ":system_id",
                    system_id
                ),
                state: { data: modifyDataBeingSendToEditPage(values, data) }
            });
        }
    };

    return (
        <div
            style={{
                width: "100%",
                // height: "100%",
                // height: "calc(100vh-80px)",
                // overflowY: "auto",
                backgroundColor: lightGreyHeader
            }}
        >
            <Mutation
                mutation={
                    has_data ? EDIT_DIRECTORY_LIST() : CREATE_DIRECTORY_LIST()
                }
                refetchQueries={[
                    {
                        query: getDirectoryListBySystem,
                        variables: { id: system_id }
                    }
                ]}
            >
                {/* {(action, { loading, error }) => ( */}
                {action => (
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(values, { setSubmitting }) => {
                            setSubmitting(true);
                            console.log(values);

                            const {
                                id,
                                name,
                                title: initialTitle,
                                title_plaintext,
                                order,
                                description: initialDescription,
                                layout_id: layout_idString,
                                colours: coloursImmutable,
                                images,
                                parent_id,
                                sortBy: sortByIndex
                            } = values;
                            const { match } = props;

                            const has_data = Boolean(id);
                            const layout_id = parseInt(
                                layout_idString,
                                DECIMAL_RADIX
                            );
                            const colours = List.isList(coloursImmutable)
                                ? coloursImmutable.toJS()
                                : [...coloursImmutable];
                            const {
                                actualValue: { sortBy, orderBy }
                            } = SORT_BY_ORDER_BY_OPTIONS[sortByIndex];

                            //https://stackoverflow.com/a/47892178
                            let toSubmit = {
                                ...(Boolean(id) && {
                                    id: parseInt(id, DECIMAL_RADIX)
                                }),
                                name,
                                is_root: parent_id === "-1",
                                layout_id,
                                system_id: parseInt(match.params.system_id),
                                ...(Boolean(parent_id) &&
                                    parent_id !== "-1" && {
                                        //Make sure parent_id is not equal to -1 because that is the home id, which means we are creating a root directory entry
                                        parent_id: parseInt(
                                            parent_id,
                                            DECIMAL_RADIX
                                        )
                                    }),
                                colours,
                                title: sanitize(initialTitle),
                                title_plaintext,
                                order,
                                description: sanitize(initialDescription),
                                sortBy,
                                orderBy
                            };

                            if (images && images.length === 1 && !has_data) {
                                if (!images[0].uploaded) {
                                    console.log("CREATE WITH UPLOAD IMAGE");
                                    toSubmit = {
                                        ...toSubmit,
                                        image: images[0]
                                    };
                                } else if (images[0].uploaded) {
                                    console.log(
                                        "CREATE WITH EXISTING IMAGE FROM LIBRARY"
                                    );
                                    toSubmit = {
                                        ...toSubmit,
                                        media_id: parseInt(
                                            images[0].id,
                                            DECIMAL_RADIX
                                        )
                                    };
                                }

                                console.log(toSubmit);

                                action({
                                    variables: { input: { ...toSubmit } }
                                }).then(({ data }) => {
                                    console.log(data);
                                    actionAfterSubmission(
                                        values,
                                        data.createDirectoryList
                                    );
                                });
                            } else if (
                                images &&
                                images.length === 1 &&
                                has_data
                            ) {
                                console.log(images[0]);
                                if (!images[0].uploaded) {
                                    //If user upload another image
                                    console.log("UPDATE WITH NEW IMAGE");

                                    toSubmit = {
                                        ...toSubmit,
                                        image: images[0]
                                    };
                                } else if (
                                    images[0].uploaded &&
                                    images[0].changed
                                ) {
                                    console.log(
                                        "UPDATE WITH EXISTING IMAGE FROM LIBRARY"
                                    );

                                    toSubmit = {
                                        ...toSubmit,
                                        media_id: parseInt(
                                            images[0].id,
                                            DECIMAL_RADIX
                                        )
                                    };
                                } else {
                                    console.log(
                                        "UPDATE WITHOUT CHANGING IMAGE"
                                    );
                                }
                                console.log(toSubmit);

                                action({
                                    variables: { input: { ...toSubmit } }
                                }).then(({ data }) => {
                                    console.log(data);
                                    actionAfterSubmission(
                                        values,
                                        data.editDirectoryList
                                    );
                                });
                            }
                        }}
                    >
                        {({
                            dirty,
                            isSubmitting,
                            errors,
                            values,
                            setFieldValue,
                            submitForm
                        }) => {
                            const saveAndKeepEditing = () => {
                                setToExit(false);
                                submitForm();
                            };

                            const cancelEdit = () => {
                                cleanUp(values);
                                props.history.push(
                                    SYSTEM_CMS_CONTENT_URL.replace(
                                        ":system_id",
                                        system_id
                                    )
                                );
                            };

                            return (
                                <Form>
                                    <ContainerDiv style={{ padding: "3%" }}>
                                        <SubSectionTop>
                                            <div
                                                style={{
                                                    width: "65%",
                                                    display: "flex"
                                                }}
                                            >
                                                <PageHeader>
                                                    SYSTEM CONTENT:{" "}
                                                    {has_data
                                                        ? "MODIFY"
                                                        : "ADD"}{" "}
                                                    DIRECTORY LIST
                                                </PageHeader>

                                                <Tooltip
                                                    classes={{
                                                        tooltip: classes.tooltip
                                                    }}
                                                    title=" tincidunt, urna odio facilisis sapien, at
                                                    aliquam massa turpis in ante. Praesent
                                                    cursus venenatis erat, ac blandit velit.
                                                    Duis eu ante faucibus, sollicitudin urna"
                                                    placement="bottom"
                                                >
                                                    <InfoIcon
                                                        className={
                                                            classes.infoIcon
                                                        }
                                                        fontSize="small"
                                                    />
                                                </Tooltip>
                                            </div>
                                            {tab > 0 && (
                                                <React.Fragment>
                                                    <TopButtonsContainer
                                                        style={{
                                                            width: "10%",
                                                            margin: "0 1% 0 2%"
                                                        }}
                                                    >
                                                        <Button
                                                            variant="outlined"
                                                            className={
                                                                classes.buttonCancel
                                                            }
                                                            onClick={
                                                                handleCancelButton
                                                            }
                                                        >
                                                            CANCEL
                                                        </Button>
                                                    </TopButtonsContainer>
                                                    <TopButtonsContainer>
                                                        <Button
                                                            type="submit"
                                                            variant="outlined"
                                                            className={
                                                                classes.blueButtons
                                                            }
                                                        >
                                                            SAVE & EXIT
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={
                                                                saveAndKeepEditing
                                                            }
                                                            className={
                                                                classes.blueButtons
                                                            }
                                                        >
                                                            SAVE & KEEP EDITING
                                                        </Button>
                                                    </TopButtonsContainer>
                                                </React.Fragment>
                                            )}
                                        </SubSectionTop>
                                        <Paper
                                            square
                                            style={{
                                                backgroundColor: lightGreyHeader,
                                                boxShadow: "none",
                                                borderBottom:
                                                    "2px solid rgb(217,217,217)"
                                            }}
                                        >
                                            <Tabs
                                                value={tab}
                                                // classes={{
                                                //     indicator: props.classes.indicator
                                                // }}
                                                TabIndicatorProps={{
                                                    style: {
                                                        backgroundColor:
                                                            "rgb(57,154,249)"
                                                    }
                                                }}
                                                onChange={handleChange}
                                            >
                                                >
                                                <Tab label="PREVIEW" />
                                                <Tab label="LAYOUT" />
                                                <Tab label="CONTENT" />
                                            </Tabs>
                                        </Paper>

                                        <ContainerDivTab>
                                            {tab === 0 && (
                                                <TabContainer>
                                                    PREVIEW
                                                </TabContainer>
                                            )}
                                            {tab === 1 && (
                                                <TabContainer>
                                                    <ModifyDirectoryListLayout
                                                        values={values}
                                                        errors={errors}
                                                        isSubmitting={
                                                            isSubmitting
                                                        }
                                                        setFieldValue={
                                                            setFieldValue
                                                        }
                                                    />
                                                </TabContainer>
                                            )}
                                            {tab === 2 && (
                                                <TabContainer>
                                                    <ModifyDirectoryListContent
                                                        values={values}
                                                        errors={errors}
                                                        isSubmitting={
                                                            isSubmitting
                                                        }
                                                        setFieldValue={
                                                            setFieldValue
                                                        }
                                                    />
                                                </TabContainer>
                                            )}
                                        </ContainerDivTab>
                                        <Dialog
                                            open={openDialog}
                                            TransitionComponent={
                                                SlideUpTransition
                                            }
                                            keepMounted
                                            onClose={closeDialog}
                                        >
                                            <DialogTitleHelper
                                                onClose={closeDialog}
                                            >
                                                CONFIRM PAGE NAVIGATION
                                            </DialogTitleHelper>
                                            <DialogContent>
                                                <DialogContentText component="div">
                                                    {dirty ? (
                                                        <React.Fragment>
                                                            <div
                                                                style={{
                                                                    paddingTop: 10
                                                                }}
                                                            >
                                                                ARE YOU SURE YOU
                                                                WANT TO LEAVE
                                                                THIS PAGE?
                                                            </div>
                                                            <div>
                                                                YOU HAVE UNSAVED
                                                                CHANGES.
                                                            </div>
                                                        </React.Fragment>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                paddingTop: 10
                                                            }}
                                                        >
                                                            ARE YOU SURE YOU
                                                            WANT TO LEAVE THIS
                                                            PAGE?
                                                        </div>
                                                    )}
                                                </DialogContentText>
                                            </DialogContent>
                                            <DialogActions>
                                                <Button
                                                    color="primary"
                                                    onClick={cancelEdit}
                                                >
                                                    LEAVE
                                                </Button>
                                                <Button
                                                    color="primary"
                                                    onClick={closeDialog}
                                                >
                                                    STAY
                                                </Button>
                                            </DialogActions>
                                        </Dialog>
                                    </ContainerDiv>
                                </Form>
                            );
                        }}
                    </Formik>
                )}
            </Mutation>
        </div>
    );
};

export default withApollo(withStyles(styles)(ModifyDirectoryList));
// export default ModifyDirectoryList;
