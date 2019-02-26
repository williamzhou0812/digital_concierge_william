import React, { useState, useEffect, Component } from "react";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import ReactTable from "react-table";
import { Mutation, Query } from "react-apollo";
import { getUsersByClient } from "../../data/query";
import { DELETE_USER, UPDATE_USER } from "../../data/mutation";
import Checkbox from "@material-ui/core/Checkbox";
import WelcomeUserCreate from "./WelcomeUserCreate";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import DialogActions from "@material-ui/core/DialogActions";
import Paper from "@material-ui/core/Paper";
import Fade from "@material-ui/core/Fade";
import { withRouter } from "react-router-dom";

const Transition = props => {
    return <Slide direction="up" {...props} />;
};

const styles = theme => ({
    buttonPaddingBottom: {
        marginBottom: "10px"
    },
    button: {
        margin: theme.spacing.unit
    },
    input: {
        display: "none"
    }
});

const changeClientDataStructure = data => {
    let outputUser = [];
    console.log(data);

    data.client.users.map(
        ({
            roles = [],
            name: user = "",
            email: username = "",
            active = "",
            id,
            first_phone_number: first_phone_number = "",
            second_phone_number: second_phone_number = "",
            position: position = ""
        }) => {
            let rolesName;
            let departmentsName;

            roles.map(({ id, name, department }) => {
                // roles_id = id;
                //  department_id = department.id;
                rolesName = rolesName ? `${rolesName} ${name}` : `${name}`;
                departmentsName = department.name
                    ? `${department.name}`
                    : `${departmentsName} ${department.name}`;
            });
            let eachUser = {
                id,
                user,
                username,
                status: active ? "Active" : "Inactive",
                role: rolesName,
                roles,
                department: departmentsName,
                first_phone_number,
                second_phone_number,
                position
            };
            outputUser.push(eachUser);
        }
    );

    return outputUser;
};

class WelcomeUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: [],
            is_create_page: false,
            selected_row: null,
            deleteModal: false,
            editModal: false,
            single_delete: [],
            selected_object: null
        };
        this.handleAction = this.handleAction.bind(this);
        this.handleEditModal = this.handleEditModal.bind(this);
    }

    handleAction(original) {
        this.setState({
            selected_row: original ? original.id : null
        });
    }

    handleIsCreatePageState() {
        this.setState({ is_create_page: !this.state.is_create_page });
    }

    handleEditModal() {
        this.setState({ editModal: !this.state.editModal });
    }

    render() {
        const { classes } = this.props;
        const {
            selected,
            is_create_page,
            selected_row,
            deleteModal,
            editModal,
            single_delete,
            selected_object
        } = this.state;
        if (is_create_page) {
            return (
                <WelcomeUserCreate
                    handleIsCreatePageState={
                        (this.handleIsCreatePageState = this.handleIsCreatePageState.bind(
                            this
                        ))
                    }
                />
            );
        } else {
            return (
                <Query
                    query={getUsersByClient}
                    variables={{ id: this.props.data.id }}
                    fetchPolicy="network-only"
                >
                    {({ loading, error, data }) => {
                        if (loading) return <h1>Loading</h1>;
                        if (error) return <h1>Error</h1>;
                        console.log(data);

                        return (
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "lightgray",
                                    padding: "20px"
                                }}
                            >
                                <h1>Users</h1>
                                <div style={{ display: "flex" }}>
                                    <div>
                                        <Button
                                            variant="contained"
                                            className={classes.button}
                                            onClick={() => {
                                                this.setState({
                                                    is_create_page: true
                                                });
                                            }}
                                        >
                                            CREATE A USER ACCOUNT
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            variant="contained"
                                            className={classes.button}
                                            onClick={() => {
                                                this.setState({
                                                    deleteModal: true
                                                });
                                            }}
                                        >
                                            DELETE
                                        </Button>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: "white",
                                        padding: "20px"
                                    }}
                                >
                                    <ReactTable
                                        defaultPageSize={10}
                                        data={changeClientDataStructure(data)}
                                        columns={[
                                            {
                                                Header: "USER",
                                                accessor: "user",
                                                style: {
                                                    textAlign: "center"
                                                },
                                                filterable: true,
                                                filterMethod: (
                                                    filter,
                                                    original
                                                ) =>
                                                    original.user
                                                        .toLowerCase()
                                                        .includes(
                                                            filter.value.toLowerCase()
                                                        )
                                            },
                                            {
                                                Header: "USERNAME",
                                                accessor: "username",
                                                style: {
                                                    textAlign: "center"
                                                },
                                                filterable: true,
                                                filterMethod: (
                                                    filter,
                                                    original
                                                ) =>
                                                    original.username
                                                        .toLowerCase()
                                                        .includes(
                                                            filter.value.toLowerCase()
                                                        )
                                            },
                                            {
                                                Header: "ROLE",
                                                accessor: "role",
                                                style: {
                                                    textAlign: "center"
                                                },
                                                filterable: true,
                                                filterMethod: (
                                                    filter,
                                                    original
                                                ) =>
                                                    original.role
                                                        .toLowerCase()
                                                        .includes(
                                                            filter.value.toLowerCase()
                                                        )
                                            },
                                            {
                                                Header: "DEPARTMENT",
                                                accessor: "department",
                                                style: {
                                                    textAlign: "center"
                                                },
                                                filterable: true,
                                                filterMethod: (
                                                    filter,
                                                    original
                                                ) =>
                                                    original.department
                                                        .toLowerCase()
                                                        .includes(
                                                            filter.value.toLowerCase()
                                                        )
                                            },
                                            {
                                                Header: "STATUS",
                                                accessor: "status",
                                                style: {
                                                    textAlign: "center"
                                                },
                                                filterable: true,
                                                filterMethod: (
                                                    filter,
                                                    original
                                                ) =>
                                                    original.status
                                                        .toLowerCase()
                                                        .includes(
                                                            filter.value.toLowerCase()
                                                        )
                                            },
                                            {
                                                Header: "ACTIONS",
                                                style: {
                                                    textAlign: "center"
                                                },
                                                width: 75,
                                                Cell: ({ original }) => {
                                                    const selectedId = parseInt(
                                                        original.id
                                                    );

                                                    return selected_row &&
                                                        original.id ===
                                                            selected_row ? (
                                                        <React.Fragment>
                                                            <div
                                                                onClick={() => {
                                                                    this.handleAction(
                                                                        null
                                                                    );
                                                                }}
                                                                style={{
                                                                    position:
                                                                        "fixed",
                                                                    width:
                                                                        "100vw",
                                                                    height:
                                                                        "100vh",
                                                                    top: 0,
                                                                    right: 0,
                                                                    bottom: 0,
                                                                    left: 0
                                                                }}
                                                            />
                                                            <Fade in>
                                                                <Paper
                                                                    elevation={
                                                                        5
                                                                    }
                                                                    style={{
                                                                        position:
                                                                            "absolute",
                                                                        backgroundColor:
                                                                            "white",
                                                                        padding:
                                                                            "15px",
                                                                        borderRadius:
                                                                            "5px"
                                                                    }}
                                                                >
                                                                    <div
                                                                        onClick={() => {
                                                                            this.handleAction(
                                                                                null
                                                                            );
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display:
                                                                                    "flex",
                                                                                flexDirection:
                                                                                    "column"
                                                                            }}
                                                                        >
                                                                            <Button
                                                                                className={
                                                                                    this
                                                                                        .props
                                                                                        .classes
                                                                                        .buttonPaddingBottom
                                                                                }
                                                                                variant="outlined"
                                                                                color="primary"
                                                                                onClick={() => {
                                                                                    this.setState(
                                                                                        {
                                                                                            editModal: true
                                                                                        }
                                                                                    );
                                                                                }}
                                                                            >
                                                                                DETAIL
                                                                            </Button>
                                                                            <Button
                                                                                variant="outlined"
                                                                                color="secondary"
                                                                                onClick={() => {
                                                                                    this.setState(
                                                                                        {
                                                                                            deleteModal: true
                                                                                        }
                                                                                    );
                                                                                }}
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </Paper>
                                                            </Fade>
                                                        </React.Fragment>
                                                    ) : (
                                                        <div
                                                            onClick={() => {
                                                                this.setState({
                                                                    single_delete: [
                                                                        parseInt(
                                                                            selectedId
                                                                        )
                                                                    ],
                                                                    selected_object: changeClientDataStructure(
                                                                        data
                                                                    ).find(
                                                                        eachUser => {
                                                                            return (
                                                                                parseInt(
                                                                                    eachUser.id
                                                                                ) ===
                                                                                parseInt(
                                                                                    selectedId
                                                                                )
                                                                            );
                                                                        }
                                                                    )
                                                                });
                                                                this.handleAction(
                                                                    original
                                                                );
                                                            }}
                                                        >
                                                            ...
                                                        </div>
                                                    );
                                                }
                                            },
                                            {
                                                style: {
                                                    textAlign: "center"
                                                },
                                                Cell: ({ original }) => {
                                                    const selectedId = parseInt(
                                                        original.id
                                                    );
                                                    return (
                                                        <div>
                                                            <Checkbox
                                                                checked={this.state.selected.includes(
                                                                    selectedId
                                                                )}
                                                                onClick={() => {
                                                                    this.setState(
                                                                        {
                                                                            selected: selected.includes(
                                                                                parseInt(
                                                                                    selectedId
                                                                                )
                                                                            )
                                                                                ? selected.filter(
                                                                                      each => {
                                                                                          return (
                                                                                              each !=
                                                                                              parseInt(
                                                                                                  selectedId
                                                                                              )
                                                                                          );
                                                                                      }
                                                                                  )
                                                                                : [
                                                                                      ...selected,
                                                                                      parseInt(
                                                                                          selectedId
                                                                                      )
                                                                                  ]
                                                                        }
                                                                    );
                                                                }}
                                                                value="checkedB"
                                                                color="primary"
                                                                style={{
                                                                    padding: "0"
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                }
                                            }
                                        ]}
                                    />
                                </div>

                                <Mutation
                                    mutation={UPDATE_USER}
                                    refetchQueries={[
                                        {
                                            query: getUsersByClient,
                                            variables: {
                                                id: this.props.data.id
                                            }
                                        }
                                    ]}
                                >
                                    {(updateUser, { loading, error }) => {
                                        return (
                                            <Dialog
                                                open={editModal}
                                                TransitionComponent={Transition}
                                                onClose={() => {
                                                    this.setState({
                                                        editModal: false
                                                    });
                                                }}
                                                maxWidth="xl"
                                                fullWidth
                                            >
                                                <DialogTitle>
                                                    DETAIL
                                                </DialogTitle>
                                                <DialogContent>
                                                    <WelcomeUserCreate
                                                        updateUser={updateUser}
                                                        handleEditModal={
                                                            this.handleEditModal
                                                        }
                                                        is_edit
                                                        selected_user={
                                                            this.state
                                                                .selected_object
                                                        }
                                                    />
                                                </DialogContent>
                                            </Dialog>
                                        );
                                    }}
                                </Mutation>
                                <Mutation
                                    mutation={DELETE_USER}
                                    refetchQueries={[
                                        {
                                            query: getUsersByClient,
                                            variables: {
                                                id: this.props.data.id
                                            }
                                        }
                                    ]}
                                >
                                    {(deleteUsers, { loading, error }) => {
                                        if (error)
                                            return `Error! ${error.message}`;
                                        let to_delete_data;
                                        if (single_delete.length > 0) {
                                            to_delete_data = single_delete;
                                        } else {
                                            to_delete_data = selected;
                                        }
                                        return (
                                            <Dialog
                                                open={deleteModal}
                                                TransitionComponent={Transition}
                                                onClose={() => {
                                                    this.setState({
                                                        deleteModal: false,
                                                        selected: [],
                                                        single_delete: []
                                                    });
                                                }}
                                            >
                                                <DialogTitle>
                                                    Confirmation
                                                </DialogTitle>

                                                <DialogContent>
                                                    {(selected.length === 0 &&
                                                        single_delete.length ===
                                                            0) ||
                                                    (selected.length < 0 &&
                                                        single_delete.length >
                                                            0) ||
                                                    (selected.length > 0 &&
                                                        single_delete.length <
                                                            0) ? (
                                                        <p>
                                                            Please choose at
                                                            least one user to
                                                            delete first.
                                                        </p>
                                                    ) : (
                                                        <React.Fragment>
                                                            <p
                                                                style={{
                                                                    fontSize:
                                                                        "1.3em"
                                                                }}
                                                            >
                                                                Are you sure you
                                                                want to delete
                                                                the selected
                                                                images? Click OK
                                                                to confirm.
                                                            </p>
                                                            <ul
                                                                style={{
                                                                    paddingLeft:
                                                                        "30px",
                                                                    paddingRight:
                                                                        "30px"
                                                                }}
                                                            >
                                                                {to_delete_data.map(
                                                                    (
                                                                        each,
                                                                        index
                                                                    ) => {
                                                                        const selected_user = changeClientDataStructure(
                                                                            data
                                                                        ).find(
                                                                            eachUser => {
                                                                                return (
                                                                                    parseInt(
                                                                                        eachUser.id
                                                                                    ) ===
                                                                                    parseInt(
                                                                                        each
                                                                                    )
                                                                                );
                                                                            }
                                                                        );

                                                                        return (
                                                                            <li
                                                                                key={
                                                                                    index
                                                                                }
                                                                                style={{
                                                                                    fontSize:
                                                                                        "1.2em"
                                                                                }}
                                                                            >
                                                                                {selected_user &&
                                                                                    selected_user.user}
                                                                            </li>
                                                                        );
                                                                    }
                                                                )}
                                                            </ul>
                                                        </React.Fragment>
                                                    )}
                                                </DialogContent>
                                                <DialogActions>
                                                    {selected.length > 0 ||
                                                    single_delete.length > 0 ? (
                                                        <React.Fragment>
                                                            <Button
                                                                onClick={() => {
                                                                    this.setState(
                                                                        {
                                                                            deleteModal: false,
                                                                            single_delete: []
                                                                        }
                                                                    );
                                                                }}
                                                                color="secondary"
                                                                className={
                                                                    classes.buttonFont
                                                                }
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                onClick={() => {
                                                                    console.log(
                                                                        "delete button"
                                                                    );

                                                                    deleteUsers(
                                                                        {
                                                                            variables: {
                                                                                input: {
                                                                                    id:
                                                                                        single_delete.length >
                                                                                        0
                                                                                            ? single_delete
                                                                                            : selected
                                                                                }
                                                                            }
                                                                        }
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            deleteModal: false,
                                                                            selected: [],
                                                                            single_delete: []
                                                                        }
                                                                    );
                                                                }}
                                                                color="primary"
                                                                autoFocus
                                                                className={
                                                                    classes.buttonFont
                                                                }
                                                            >
                                                                Ok
                                                            </Button>
                                                        </React.Fragment>
                                                    ) : (
                                                        <Button
                                                            onClick={() => {
                                                                this.setState({
                                                                    deleteModal: false,
                                                                    single_delete: []
                                                                });
                                                            }}
                                                            color="primary"
                                                            className={
                                                                classes.buttonFont
                                                            }
                                                        >
                                                            Ok
                                                        </Button>
                                                    )}
                                                </DialogActions>
                                            </Dialog>
                                        );
                                    }}
                                </Mutation>
                            </div>
                        );
                    }}
                </Query>
            );
        }
    }
}

export default withRouter(withStyles(styles)(WelcomeUser));
