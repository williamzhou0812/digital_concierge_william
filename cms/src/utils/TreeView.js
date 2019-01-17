import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import CancelIcon from "@material-ui/icons/Cancel";
import ExpandIcon from "@material-ui/icons/ChevronRight";
import CompressIcon from "@material-ui/icons/ExpandMore";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import DirEntryIcon from "@material-ui/icons/Description";
import EditIcon from "@material-ui/icons/Edit";
import MoreHorizontalIcon from "@material-ui/icons/MoreHoriz";
import styled from "styled-components";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import PropTypes from "prop-types";
import {
    getAllUniqueItems,
    TABLET_CMS_CREATE_CONTENT_SUBCATEGORY_URL,
    TABLET_CMS_CREATE_CONTENT_DIRECTORY_URL
} from "./Constants";
import { Mutation } from "react-apollo";
import { changeDirectoryListAndEntryStatus } from "../data/mutation";
import { getDirectoryListBySystem } from "../data/query";
import { ClipLoader } from "react-spinners";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import Grid from "@material-ui/core/Grid";

const styles = theme => ({
    buttonCreate: {
        color: "white",
        backgroundColor: "rgb(35,38,92)",
        marginRight: "15px",
        paddingLeft: "25px",
        paddingRight: "25px"
    },
    buttonDelete: {
        color: "white",
        backgroundColor: "rgb(35,38,92)",
        paddingLeft: "1px",
        paddingRight: "1px",
        marginRight: 15
    },
    expansionButton: {
        color: "white",
        background: "rgb(155,157,183)",
        padding: 0,
        margin: theme.spacing.unit * 0.1
    },
    icon: {
        fontSize: "small"
    },
    tableHeaderRow: {
        borderTop: "1px solid rgba(224, 224, 224, 1)",
        backgroundColor: "rgb(234,235,238)"
    },
    headerCol: {
        color: "rgb(131,134,166)",
        width: "5%"
    },
    headerTitleCol: {
        color: "rgb(131,134,166)",
        width: "80%"
    },
    tableEntryRow: {
        backgroundColor: "rgb(246,246,246)"
    },
    tableEntryCol: {
        color: "rgb(38,42,95)",
        width: "5%"
    },
    tableEntryTitleCol: {
        color: "rgb(38,42,95)",
        width: "80%"
    },
    tableCheckboxCol: {
        width: "5%"
    },
    buttonCreateLeftGrid: {
        fontSize: "1.3em",
        paddingRight: 10
    },
    buttonCreateRightGrid: {
        height: "75%",
        paddingLeft: 5,
        paddingRight: 0,
        paddingTop: 5,
        borderLeft: "2px solid white"
    }
});

//A few constants settings
const paddingSize = 30;
const approximateButtonSize = 40;
const TreeEntry = styled.div`
    padding-left: ${props => props.paddingSize}px;
    display: flex;
    align-items: center;
`;

const SlideUpTransition = props => {
    return <Slide direction="up" {...props} />;
};

class TreeView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            expanded: [],
            selected_dir_lists: [],
            selected_dir_entries: [],
            dataTree: [],
            dirListOnlyDataTree: [],
            anchorEl: null,
            anchorElCreate: null,
            deleteModal: false
        };
        this.navigateToDiffPage = this.navigateToDiffPage.bind(this);
        this.handleOpenOptions = this.handleOpenOptions.bind(this);
        this.handleCloseOptions = this.handleCloseOptions.bind(this);
        this.handleOpenCreate = this.handleOpenCreate.bind(this);
        this.handleCloseCreate = this.handleCloseCreate.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.closeDeleteModal = this.closeDeleteModal.bind(this);
    }

    componentDidMount() {
        //mapping data tree for easier querying
        const { data } = this.props;
        let updated = [];
        data.forEach(entry => {
            updated = [
                ...updated,
                ...this.getItemAndAllChildItems(entry, true)
            ];
        });
        this.setState({
            dataTree: [...updated],
            dirListOnlyDataTree: [
                ...updated.filter(item => Boolean(item.is_dir_list))
            ]
        });
    }

    componentDidUpdate(prevProps) {
        //mapping data tree for easier querying
        const { data } = this.props;
        if (prevProps.data !== data) {
            let updated = [];
            data.forEach(entry => {
                updated = [
                    ...updated,
                    ...this.getItemAndAllChildItems(entry, true)
                ];
            });
            this.setState({
                dataTree: [...updated],
                dirListOnlyDataTree: [
                    ...updated.filter(item => Boolean(item.is_dir_list))
                ]
            });
        }
    }

    //helper function to check whether a parent has the child as a direct descendant
    _isParentOf(parent, child_id) {
        const { child_directory_lists_key, directory_entries_key } = this.props;
        if (
            (parent[child_directory_lists_key] &&
                parent[child_directory_lists_key].length > 0) ||
            (parent[directory_entries_key] &&
                parent[directory_entries_key].length > 0)
        ) {
            const which =
                parent[child_directory_lists_key] &&
                parent[child_directory_lists_key].length > 0
                    ? parent[child_directory_lists_key]
                    : parent[directory_entries_key];
            return Boolean(which.find(entry => entry.id === child_id));
        } else {
            return false;
        }
    }

    //a function that attempts to retrieve all of the parent directory_list ids of a children
    //(the children could be a child directory list or a directory entry)
    //via recursive function method
    //
    //UPDATE: THIS FUNCTION IS NOT RELIABLE TO USE FOR DIRECTORY ENTRIES DUE TO
    //DIRECTORY ENTRY'S MANY TO MANY RELATIONSHIP WITH DIRECTORY LIST
    //WHICH MEANS THAT ONE DIRECTORY ENTRY COULD BE A CHILD OF DIFFERENT DIRECTORY LIST
    //AND ONE DIRECTORY ENTRY HAS NO GUARANTEE THAT IT HAS A UNIQUE PARENT DIRECTORY LIST
    getParentItem(list_id, is_dir_list = true) {
        const { dataTree } = this.state;
        if (Boolean(dataTree && dataTree.length > 0)) {
            const foundItem = dataTree.find(entry => {
                return (
                    entry.id === list_id && entry.is_dir_list === is_dir_list
                );
            });
            const possibleParents = Boolean(foundItem)
                ? dataTree.filter(
                      entry =>
                          Boolean(entry.is_dir_list) &&
                          entry.depth === foundItem.depth - 1
                  ) //Only get previous level parent
                : [];

            const parentArray = possibleParents.filter(item =>
                this._isParentOf(item, list_id)
            );
            return parentArray.length > 0
                ? [
                      parentArray[0].id,
                      ...this.getParentItem(parentArray[0].id, true)
                  ]
                : [];
        }
    }
    //Get a directory list and all of its child directory list or directory entries, as it is usually one or the other
    //I.E. one directory list can only have a child directory lists or directory entries
    //All attribute argument refer to whether the object should retrieve all of its directory list attributes, or just the ID
    getItemAndAllChildItems(dir_list, allAttributes = false) {
        const { child_directory_lists_key, directory_entries_key } = this.props;
        if (
            dir_list[child_directory_lists_key] &&
            dir_list[child_directory_lists_key].length > 0
        ) {
            let output = allAttributes
                ? [{ ...dir_list }]
                : [
                      {
                          id: dir_list.id,
                          is_dir_list: dir_list.is_dir_list,
                          depth: dir_list.depth
                      }
                  ];
            dir_list[child_directory_lists_key].forEach(item => {
                output = [
                    ...output,
                    ...this.getItemAndAllChildItems(item, allAttributes)
                ];
            });
            return output;
        } else if (
            dir_list[directory_entries_key] &&
            dir_list[directory_entries_key].length > 0
        ) {
            let output = allAttributes
                ? [{ ...dir_list }]
                : [
                      {
                          id: dir_list.id,
                          is_dir_list: dir_list.is_dir_list,
                          depth: dir_list.depth
                      }
                  ];
            dir_list[directory_entries_key].forEach(item => {
                output = [
                    ...output,
                    ...this.getItemAndAllChildItems(item, allAttributes)
                ];
            });
            return output;
        } else {
            //https://stackoverflow.com/a/40560953
            const { is_dir_list, depth, hash_id } = dir_list;
            return allAttributes
                ? [{ ...dir_list }]
                : [
                      {
                          id: dir_list.id,
                          is_dir_list,
                          depth,
                          ...(Boolean(hash_id) && { hash_id })
                      }
                  ];
        }
    }

    //Helper recursive function utilised to recur and calculate the number of child elements in a directory list
    _totalChildLength(entry) {
        const { child_directory_lists_key, directory_entries_key } = this.props;
        if (
            entry[child_directory_lists_key] &&
            entry[child_directory_lists_key].length > 0
        ) {
            //Parent directory list has a child directory list, recur in its child directory list
            return 1 + this.totalLength(entry[child_directory_lists_key]);
        } else if (
            entry[directory_entries_key] &&
            entry[directory_entries_key].length > 0
        ) {
            //Parent directory list has no child directory list, but have directory entries, recur in the directory entries instead
            return 1 + this.totalLength(entry[directory_entries_key]);
        } else {
            //End of the line, no need to recur any more
            return 1;
        }
    }

    //Calculates the number of elements a directory list have along with its child directory lists or directory entries
    //Utilising recursion in the form of function _totalChildLength
    totalLength(directories) {
        let output = 0;
        directories.forEach(entry => {
            output += this._totalChildLength(entry);
        });
        return output;
    }

    //Method gets called when we expand a directory list
    addToExpanded(dir_list_id) {
        if (this.state.expanded.indexOf(dir_list_id) === -1) {
            this.setState({
                expanded: [...this.state.expanded, dir_list_id]
            });
        }
    }

    ////Method gets called when we minimise a directory list
    removeFromExpanded(dir_list_id) {
        const index = this.state.expanded.indexOf(dir_list_id);
        if (index !== -1) {
            this.setState({
                expanded: [
                    ...this.state.expanded.slice(0, index),
                    ...this.state.expanded.slice(index + 1)
                ]
            });
        }
    }

    //A function that ensures the parent directory list and all of its child directory are expanded
    ensureAllIsExpanded(directory_list) {
        const { expanded } = this.state;
        const { child_directory_lists_key, directory_entries_key } = this.props;
        //Filter only the items that are directory list and have a child directory list or directory entries inside of it
        const directory_lists = this.getItemAndAllChildItems(
            directory_list,
            undefined,
            true
        ).filter(
            item =>
                Boolean(item.is_dir_list) &&
                ((Boolean(item[child_directory_lists_key]) &&
                    item[child_directory_lists_key].length > 0) ||
                    (Boolean(item[directory_entries_key]) &&
                        item[directory_entries_key].length > 0))
        );
        let output = true;
        for (let directory_list of directory_lists) {
            if (!expanded.includes(directory_list.id)) {
                output = false;
                break;
            }
        }
        return output;
    }

    //Adding directory list and / or directory entry ids into their relevant state arrays (selected_dir_lists or selected_dir_entries)
    addToSelected(directory, has_child) {
        const {
            selected_dir_lists,
            selected_dir_entries,
            dirListOnlyDataTree
        } = this.state;
        if (has_child) {
            const items = this.getItemAndAllChildItems(directory);
            const directory_lists = items
                .filter(item => Boolean(item.is_dir_list))
                .map(item => item.id);
            const directory_entries = items
                .filter(item => !item.is_dir_list)
                .map(item => item.hash_id);

            //If all entries under parent directory list is checked, we have to select the parent directory list as well
            const parents = this.getParentItem(
                directory.id,
                directory.is_dir_list
            );
            let to_check_parent = [];
            parents.forEach(parent_id => {
                const parent = dirListOnlyDataTree.find(
                    item => item.id === parent_id
                );
                if (
                    this.checkChildItemsSelected(
                        parent,
                        directory_lists,
                        directory_entries
                    )
                ) {
                    to_check_parent = [...to_check_parent, parent_id];
                }
            });

            this.setState({
                selected_dir_lists: [
                    ...selected_dir_lists,
                    ...to_check_parent,
                    ...directory_lists
                ],
                selected_dir_entries: [
                    ...selected_dir_entries,
                    ...directory_entries
                ]
            });
        } else {
            //Differentiating between a directory list no child directory entries or just a normal directory entry
            if (directory.is_dir_list) {
                //An directory list with empty child

                //If all entries under parent directory list is checked, we have to select the parent directory list as well
                const parents = this.getParentItem(
                    directory.id,
                    directory.is_dir_list
                );
                let to_check_parent = [];
                parents.forEach(parent_id => {
                    const parent = dirListOnlyDataTree.find(
                        item => item.id === parent_id
                    );
                    if (this.checkChildItemsSelected(parent, [directory.id])) {
                        to_check_parent = [...to_check_parent, parent_id];
                    }
                });

                this.setState({
                    selected_dir_lists: [
                        ...selected_dir_lists,
                        ...to_check_parent,
                        directory.id
                    ]
                });
            } else {
                //If all directories entries are selected, we have to select the parent directory list as well
                const child_and_parents = directory.hash_id.split("-");
                const parents = child_and_parents.slice(
                    0,
                    child_and_parents.length - 1
                );
                let to_check_parent = [];
                parents.forEach(parent_id => {
                    const parent = dirListOnlyDataTree.find(
                        item => item.id === parent_id
                    );
                    if (
                        this.checkChildItemsSelected(parent, undefined, [
                            directory.hash_id
                        ])
                    ) {
                        to_check_parent = [...to_check_parent, parent_id];
                    }
                });
                this.setState({
                    selected_dir_lists: [
                        ...selected_dir_lists,
                        ...to_check_parent
                    ],
                    selected_dir_entries: [
                        ...selected_dir_entries,
                        directory.hash_id
                    ]
                });
            }
        }
    }

    //Removing directory list and / or directory entry ids from their relevant state arrays (selected_dir_lists or selected_dir_entries)
    removeFromSelected(directory, has_child) {
        const { selected_dir_lists, selected_dir_entries } = this.state;
        if (has_child) {
            const items = this.getItemAndAllChildItems(directory);
            const parents = this.getParentItem(
                directory.id,
                directory.is_dir_list
            ); //Also un-check the parents as well when
            const dir_lists = [
                ...items
                    .filter(item => Boolean(item.is_dir_list))
                    .map(item => item.id),
                ...parents
            ];
            const directories = items
                .filter(item => !item.is_dir_list)
                .map(item => item.hash_id);
            this.setState({
                selected_dir_lists: selected_dir_lists.filter(
                    list_id => !dir_lists.includes(list_id)
                ),
                selected_dir_entries: selected_dir_entries.filter(
                    directory_id => !directories.includes(directory_id)
                )
            });
        } else {
            //Differentiating between a directory list with empty directory or just a normal directory
            const { is_dir_list } = directory;

            //Unselecting a child also means unselecting the parent as well
            if (is_dir_list) {
                //An directory list with no directory entries
                //Unselecting parent directory lists as well
                const parents = this.getParentItem(directory.id, is_dir_list);
                this.setState({
                    selected_dir_lists: selected_dir_lists.filter(
                        dir_list_id =>
                            dir_list_id !== directory.id &&
                            !parents.includes(dir_list_id)
                    )
                });
            } else {
                //Unselecting parent directory lists as well
                //1 Directory entry can be a child of multiple parents, so this.getParentItem() method is not reliable
                //Have to use hash id for getting parent IDs
                // const parents = directory.hash_id.split("-");
                const child_and_parents = directory.hash_id.split("-");
                const parents = child_and_parents.slice(
                    0,
                    child_and_parents.length - 1
                );
                this.setState({
                    selected_dir_lists: selected_dir_lists.filter(
                        dir_list_id => !parents.includes(dir_list_id)
                    ),
                    selected_dir_entries: selected_dir_entries.filter(
                        directory_id => directory_id !== directory.hash_id
                    )
                });
            }
        }
    }

    //A function to check whether a directory has all of its child selected
    //@args excluded_dir_lists
    //@args excluded_dir_entries
    //Both these two (optional) arguments refers to excluded directory lists and directory entries to check because
    //they are not added into the main state component yet, but will eventually be added in the main state component at a
    //later stage
    checkChildItemsSelected(
        directory,
        excluded_dir_lists = [],
        excluded_dir_entries = []
    ) {
        const { selected_dir_lists, selected_dir_entries } = this.state;
        const childItems = this.getItemAndAllChildItems(directory).slice(1); //Skipping first entry in the array because it is self
        const dir_lists = childItems
            .filter(item => Boolean(item.is_dir_list))
            .map(item => item.id);
        const dir_entries = childItems
            .filter(item => !item.is_dir_list)
            .map(item => item.hash_id);

        //Ensure everything is inside the selected state arrays
        let output = true;
        const search_dir_lists = [...selected_dir_lists, ...excluded_dir_lists];
        const search_dir_entries = [
            ...selected_dir_entries,
            ...excluded_dir_entries
        ];
        for (let dir_list_id of dir_lists) {
            if (!search_dir_lists.includes(dir_list_id)) {
                output = false;
                break;
            }
        }
        for (let directory_id of dir_entries) {
            if (!search_dir_entries.includes(directory_id)) {
                output = false;
                break;
            }
        }
        return output;
    }

    checkChildItemsIndeterminate(directory) {
        const { selected_dir_lists, selected_dir_entries } = this.state;
        const childItems = this.getItemAndAllChildItems(directory).slice(1); //Skipping first entry in the array because it is self
        const dir_lists = childItems
            .filter(item => Boolean(item.is_dir_list))
            .map(dir_list => dir_list.id);
        const dir_entries = childItems
            .filter(item => !item.is_dir_list)
            .map(entry => entry.id);

        //Ensure partial element is inside the selected state arrays
        let output = false;
        for (let dir_list_id of dir_lists) {
            if (selected_dir_lists.includes(dir_list_id)) {
                output = true;
                break;
            }
        }
        for (let dir_entry_id of dir_entries) {
            if (selected_dir_entries.includes(dir_entry_id)) {
                output = true;
                break;
            }
        }
        return output;
    }

    //Render expand or minimise icon on a directory list based on whether it is expanded or minimised
    renderExpandOrCompressIcon(dir_list_id) {
        const { expanded } = this.state;
        const { classes } = this.props;
        if (expanded.indexOf(dir_list_id) !== -1) {
            //Inside expanded array
            return (
                <IconButton
                    className={classes.expansionButton}
                    onClick={() => this.removeFromExpanded(dir_list_id)}
                >
                    <CompressIcon fontSize="large" />
                </IconButton>
            );
        } else {
            //Not inside expanded array
            return (
                <IconButton
                    className={classes.expansionButton}
                    onClick={() => this.addToExpanded(dir_list_id)}
                >
                    <ExpandIcon fontSize="large" />
                </IconButton>
            );
        }
    }

    handleVisibleOrInvisible(row, action) {
        const { system_id: systemId } = this.props;

        const toUpdateList = this.getItemAndAllChildItems(row, true);

        const toUpdateDirLists = toUpdateList.filter(element => {
            return element.is_dir_list;
        });
        const toUpdateDirEntries = toUpdateList.filter(element => {
            return !element.is_dir_list;
        });
        const { dataTree } = this.state;
        const { child_directory_lists_key, directory_entries_key } = this.props;

        /**
         * Prepare toUpdateDirListIds list
         */
        let toUpdateDirListIds = [];
        toUpdateDirLists.forEach(element => {
            toUpdateDirListIds.push(parseInt(element.id));
        });

        if (row.is_dir_list) {
            const parents = this.getParentItem(row.id, true);

            parents.forEach(parent => {
                if (row.active === false) {
                    toUpdateDirListIds.push(parseInt(parent));
                }

                const parentObject = dataTree.find(item => {
                    return (
                        item.id === parent && item.is_dir_list //item.__typename === "TB_Category"
                    );
                });
                const getSiblingDirectoryListList =
                    parentObject[child_directory_lists_key];
                if (
                    row.active === false &&
                    getSiblingDirectoryListList.filter(eachDirList => {
                        return eachDirList.active === row.active;
                    }).length === 1
                ) {
                    toUpdateDirListIds.push(parseInt(parent));
                }
            });
        }

        /**
         * Prepare toUpdateDirEntryIds list
         */
        let toUpdateDirEntryIds = [];

        toUpdateDirEntries.forEach(element => {
            const parents = element.hash_id.split("-");
            const lastParentId = parents[parents.length - 2];
            toUpdateDirEntryIds.push({
                directoryEntryId: parseInt(element.id),
                directoryListId: parseInt(lastParentId)
            });

            const lastParentObject = dataTree.find(item => {
                return (
                    item.id === lastParentId && item.is_dir_list
                    // item.__typename === "TB_Category"
                );
            });

            const getSiblingDirectoryList =
                lastParentObject[directory_entries_key];

            let shouldChangeLastParentStatus = true;

            getSiblingDirectoryList.forEach(sibling => {
                if (sibling.active === row.active && sibling.id !== row.id) {
                    shouldChangeLastParentStatus = false;
                }
            });

            if (
                getSiblingDirectoryList.filter(eachDirList => {
                    return eachDirList.active === row.active;
                }).length !== 0 &&
                row.active === false
            ) {
                shouldChangeLastParentStatus = true;
            }

            if (shouldChangeLastParentStatus) {
                parents.forEach((element, index) => {
                    if (parents.length - 1 > index && row.active === false) {
                        toUpdateDirListIds.push(parseInt(parseInt(element)));
                    }
                });
            }
        });
        action({
            variables: {
                directoryEntryIdList: toUpdateDirEntryIds,
                directoryListIdList: getAllUniqueItems(toUpdateDirListIds),
                status: !row.active,
                systemId
            }
        });
        console.log({
            directoryEntryIdList: toUpdateDirEntryIds,
            directoryListIdList: getAllUniqueItems(toUpdateDirListIds),
            status: !row.active,
            systemId
        });
    }

    renderCheck(row) {
        return (
            <Mutation
                mutation={changeDirectoryListAndEntryStatus()}
                refetchQueries={[
                    {
                        query: getDirectoryListBySystem()
                    }
                ]}
            >
                {(action, { loading, error }) => {
                    if (loading)
                        return (
                            <ClipLoader
                                sizeUnit={"px"}
                                size={24}
                                color={"rgba(0, 0, 0, 0.87)"}
                                loading={loading}
                            />
                        );
                    if (error) return `Error! ${error.message}`;

                    return row.active ? (
                        <CheckIcon
                            onClick={() => {
                                this.handleVisibleOrInvisible(row, action);
                            }}
                        />
                    ) : (
                        <CloseIcon
                            onClick={() => {
                                this.handleVisibleOrInvisible(row, action);
                            }}
                        />
                    );
                }}
            </Mutation>
        );
    }

    renderDirectory(directory, index) {
        const { depth } = directory;
        const calculatedPaddingSize = depth * paddingSize;
        const {
            child_directory_lists_key,
            directory_entries_key,
            classes
        } = this.props;
        if (
            (directory[child_directory_lists_key] &&
                directory[child_directory_lists_key].length > 0) ||
            (directory[directory_entries_key] &&
                directory[directory_entries_key].length > 0)
        ) {
            //Rendering a table row for a parent directory list that has a child directory list or directory entries inside of it
            const { selected_dir_lists, expanded } = this.state;
            const is_expanded = expanded.indexOf(directory.id) !== -1; //Check if the directory list is expanded or not

            //Determining which array to recur into based on whether it is a parent directory list that has child directory list(s) or just a directory list with
            //directory entry(s) in it
            const toLoop =
                directory[child_directory_lists_key] &&
                directory[child_directory_lists_key].length > 0
                    ? directory[child_directory_lists_key]
                    : directory[directory_entries_key];
            return (
                /*Rendering the row*/
                <React.Fragment key={`${directory.id}-${index}`}>
                    <TableRow className={classes.tableEntryRow}>
                        <TableCell className={classes.tableEntryTitleCol}>
                            <TreeEntry paddingSize={calculatedPaddingSize}>
                                <div style={{ marginRight: 15 }}>
                                    {this.renderExpandOrCompressIcon(
                                        directory.id
                                    )}
                                </div>
                                {directory.name}
                            </TreeEntry>
                        </TableCell>
                        <TableCell>
                            <EditIcon />
                        </TableCell>
                        <TableCell>{this.renderCheck(directory)}</TableCell>
                        <TableCell>
                            <MoreHorizontalIcon
                                id={`dir_list-${directory.id}`}
                                onClick={this.handleOpenOptions}
                            />
                        </TableCell>
                        <TableCell
                            padding="checkbox"
                            className={classes.tableCheckboxCol}
                        >
                            <Checkbox
                                onChange={() => {
                                    if (
                                        selected_dir_lists.includes(
                                            directory.id
                                        )
                                    ) {
                                        return this.removeFromSelected(
                                            directory,
                                            true
                                        );
                                    } else {
                                        return this.addToSelected(
                                            directory,
                                            true
                                        );
                                    }
                                }}
                                disabled={!this.ensureAllIsExpanded(directory)}
                                checked={selected_dir_lists.includes(
                                    directory.id
                                )}
                                indeterminate={
                                    !selected_dir_lists.includes(
                                        directory.id
                                    ) &&
                                    this.checkChildItemsIndeterminate(directory)
                                }
                            />
                        </TableCell>
                    </TableRow>
                    {is_expanded &&
                        toLoop.map((child_directory_item, index_directory) => {
                            //We do recursion here
                            return this.renderDirectory(
                                child_directory_item,
                                index_directory
                            );
                        })}
                </React.Fragment>
            );
        } else {
            //Just an empty parent directory list with no child directory list nor a directory entries. Another possibility is that the entry is a plain old directory entry
            const { selected_dir_lists, selected_dir_entries } = this.state;
            const id_options_header = directory.is_dir_list
                ? "dir_list"
                : "dir_entry";
            //No more child, no need to recur any more
            return (
                <TableRow
                    key={`${directory.id}-${index}`}
                    className={classes.tableEntryRow}
                >
                    <TableCell className={classes.tableEntryTitleCol}>
                        <TreeEntry paddingSize={calculatedPaddingSize}>
                            <div
                                style={{
                                    marginLeft: 15,
                                    width: `${approximateButtonSize}px`
                                }}
                            >
                                {!directory.is_dir_list && <DirEntryIcon />}
                            </div>
                            {directory.name}
                        </TreeEntry>
                    </TableCell>
                    <TableCell>
                        <EditIcon />
                    </TableCell>
                    <TableCell>{this.renderCheck(directory)}</TableCell>
                    <TableCell>
                        <MoreHorizontalIcon
                            id={`${id_options_header}-${directory.id}`}
                            onClick={this.handleOpenOptions}
                        />
                    </TableCell>
                    <TableCell
                        padding="checkbox"
                        className={classes.tableCheckboxCol}
                    >
                        <Checkbox
                            onChange={() => {
                                //Differentiating between a directory list with empty directory entries or just a normal directory entry
                                if (directory.is_dir_list) {
                                    if (
                                        selected_dir_lists.includes(
                                            directory.id
                                        )
                                    ) {
                                        return this.removeFromSelected(
                                            directory
                                        );
                                    } else {
                                        return this.addToSelected(
                                            directory,
                                            false
                                        );
                                    }
                                } else {
                                    if (
                                        selected_dir_entries.includes(
                                            directory.hash_id
                                        )
                                    ) {
                                        return this.removeFromSelected(
                                            directory
                                        );
                                    } else {
                                        return this.addToSelected(
                                            directory,
                                            false
                                        );
                                    }
                                }
                            }}
                            checked={
                                directory.is_dir_list
                                    ? selected_dir_lists.includes(directory.id)
                                    : selected_dir_entries.includes(
                                          directory.hash_id
                                      )
                            }
                        />
                    </TableCell>
                </TableRow>
            );
        }
    }

    //renders all of the directory lists in a table using Material UI framework for the Table Component
    //This method utilises recursion to render each of the parent directory lists,  child directory lists, and directory entries
    //inside of a table row
    renderDirectories() {
        // console.log(this.getParentItem("1", false));
        // console.log(this._isParentOf({
        //     id: "6", name: "SERVICES & FACILITIES", has_directory: false, active: true, image: null,
        //     child_directory_lists: [], directory_entries: [ {id: "1", name: "CHECK-OUT TIME", __typename: "TB_Directory"}, {id: "2", name: "IRON & IRONING BOARD", __typename: "TB_Directory"}]
        // }, "1"));
        const {
            selected_dir_lists,
            selected_dir_entries,
            dataTree
        } = this.state;
        const { classes, data } = this.props;

        if (data && data.length > 0) {
            // const allItemsLength = this.totalLength(data);
            const allItemsLength = dataTree.length;

            let allExpanded = true;
            for (let tree of dataTree) {
                if (!this.ensureAllIsExpanded(tree)) {
                    allExpanded = false;
                    break;
                }
            }
            return (
                <Table>
                    <TableHead className={classes.tableHeaderRow}>
                        <TableRow>
                            <TableCell className={classes.headerTitleCol}>
                                TITLE
                            </TableCell>
                            <TableCell className={classes.headerCol}>
                                EDIT
                            </TableCell>
                            <TableCell className={classes.headerCol}>
                                VISIBLE
                            </TableCell>
                            <TableCell className={classes.headerCol}>
                                ACTIONS
                            </TableCell>
                            <TableCell
                                padding="checkbox"
                                className={classes.tableCheckboxCol}
                            >
                                {Boolean(dataTree) && dataTree.length > 0 && (
                                    <Checkbox
                                        indeterminate={
                                            (selected_dir_lists.length > 0 ||
                                                selected_dir_entries > 0) &&
                                            selected_dir_lists.length +
                                                selected_dir_entries.length <
                                                allItemsLength
                                        }
                                        checked={
                                            selected_dir_lists.length +
                                                selected_dir_entries.length ===
                                            allItemsLength
                                        }
                                        onChange={() => {
                                            if (
                                                selected_dir_lists.length +
                                                    selected_dir_entries.length ===
                                                allItemsLength
                                            ) {
                                                //If everything is selected, un check everything
                                                this.setState({
                                                    selected_dir_lists: [],
                                                    selected_dir_entries: []
                                                });
                                            } else {
                                                this.setState({
                                                    selected_dir_lists: dataTree
                                                        .filter(
                                                            item =>
                                                                item.is_dir_list
                                                        )
                                                        .map(item => item.id),
                                                    selected_dir_entries: dataTree
                                                        .filter(
                                                            item =>
                                                                !item.is_dir_list
                                                        )
                                                        .map(
                                                            item => item.hash_id
                                                        )
                                                });
                                            }
                                        }}
                                        disabled={!allExpanded}
                                    />
                                )}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((directory, index) => {
                            return this.renderDirectory(directory, index);
                        })}
                    </TableBody>
                </Table>
            );
        } else {
            return <div />;
        }
    }

    navigateToDiffPage(url) {
        const { history } = this.props;
        this.setState({ anchorElCreate: null }, () => {
            history.push(url);
        });
    }

    handleOpenOptions(event) {
        // console.log(event.currentTarget.id);
        this.setState({ anchorEl: event.currentTarget });
    }

    handleCloseOptions() {
        this.setState({ anchorEl: null });
    }

    handleOpenCreate(event) {
        this.setState({ anchorElCreate: event.currentTarget });
    }

    handleCloseCreate(event) {
        this.setState({ anchorElCreate: null });
    }

    openDeleteModal() {
        this.setState({ deleteModal: true });
    }

    closeDeleteModal() {
        this.setState({ deleteModal: false });
    }

    getAllCheckedItemNames() {
        const {
            dataTree,
            dirListOnlyDataTree,
            selected_dir_lists,
            selected_dir_entries
        } = this.state;
        let excluded_dir_lists = [];
        let excluded_dir_entries = [];
        if (
            selected_dir_lists.length + selected_dir_entries.length ===
            dataTree.length
        ) {
            return ["ALL CONTENT"];
        } else {
            let output = [];
            for (const dir_list_id of selected_dir_lists) {
                if (!excluded_dir_lists.includes(dir_list_id)) {
                    const category = dirListOnlyDataTree.find(
                        cat => cat.id === dir_list_id
                    );
                    if (this.checkChildItemsSelected(category)) {
                        const items = this.getItemAndAllChildItems(category);
                        excluded_dir_lists = [
                            ...excluded_dir_lists,
                            ...items
                                .filter(item => Boolean(item.is_category))
                                .map(item => item.id)
                        ];
                        excluded_dir_entries = [
                            ...excluded_dir_entries,
                            ...items
                                .filter(item => !Boolean(item.is_category))
                                .map(item => item.hash_id)
                        ];
                        output = [
                            ...output,
                            `${category.name.toUpperCase()} & ALL ENTRIES`
                        ];
                    }
                }
            }
            for (const hash_id of selected_dir_entries) {
                if (!excluded_dir_entries.includes(hash_id)) {
                    const { name } = dataTree
                        .filter(item => !Boolean(item.is_category))
                        .find(item => item.hash_id === hash_id);
                    output = [...output, name.toUpperCase()];
                }
            }
            return output;
        }
    }

    render() {
        const { classes, data, create_menu_bar } = this.props;
        const {
            dataTree,
            dirListOnlyDataTree,
            selected_dir_entries,
            selected_dir_lists,
            anchorEl,
            anchorElCreate,
            deleteModal
        } = this.state;
        return (
            <React.Fragment>
                <div
                    style={{
                        marginTop: 30,
                        marginBottom: 20,
                        display: "flex",
                        flexDirection: "row-reverse",
                        width: "100%"
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.buttonDelete}
                        disabled={
                            selected_dir_entries.length +
                                selected_dir_lists.length ===
                            0
                        }
                        onClick={this.openDeleteModal}
                    >
                        <DeleteIcon />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        className={classes.buttonCreate}
                        onClick={this.handleOpenCreate}
                    >
                        <Grid
                            xs={12}
                            container
                            direction="row"
                            justify="flex-start"
                            alignItems="center"
                        >
                            <Grid
                                item
                                xs={10}
                                className={classes.buttonCreateLeftGrid}
                            >
                                CREATE
                            </Grid>
                            <Grid
                                item
                                xs={2}
                                className={classes.buttonCreateRightGrid}
                            >
                                <CompressIcon fontSize="small" />
                            </Grid>
                        </Grid>
                    </Button>
                    <Menu
                        id="simple-menu-create"
                        anchorEl={anchorElCreate}
                        open={Boolean(anchorElCreate)}
                        onClose={this.handleCloseCreate}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right"
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right"
                        }}
                    >
                        {create_menu_bar.map(({ id, name, url }, index) => (
                            <MenuItem
                                key={`CREATE_MENU_BAR_${id}-${index}`}
                                className={classes.menuItemStyle}
                                onClick={this.navigateToDiffPage.bind(
                                    this,
                                    url
                                )}
                            >
                                {name}
                            </MenuItem>
                        ))}
                    </Menu>
                </div>

                {Boolean(data) &&
                    Array.isArray(data) &&
                    data.length > 0 &&
                    Boolean(dataTree) &&
                    dataTree.length > 0 &&
                    Boolean(dirListOnlyDataTree) &&
                    dirListOnlyDataTree.length > 0 && (
                        <React.Fragment>
                            {this.renderDirectories()}
                            <Menu
                                id="simple-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={this.handleCloseOptions}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left"
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right"
                                }}
                            >
                                <MenuItem
                                    className={classes.menuItemStyle}
                                    onClick={this.handleCloseOptions}
                                >
                                    PREVIEW
                                </MenuItem>
                                <MenuItem
                                    className={classes.menuItemStyle}
                                    onClick={this.handleCloseOptions}
                                >
                                    EDIT
                                </MenuItem>
                                <MenuItem
                                    className={classes.menuItemStyle}
                                    onClick={this.handleCloseOptions}
                                >
                                    DELETE
                                </MenuItem>
                                <MenuItem
                                    className={classes.menuItemStyle}
                                    onClick={this.handleCloseOptions}
                                >
                                    ADD NEW
                                </MenuItem>
                            </Menu>
                        </React.Fragment>
                    )}
                <Dialog
                    open={deleteModal}
                    TransitionComponent={SlideUpTransition}
                    keepMounted
                    onClose={this.closeDeleteModal}
                >
                    <DialogTitle>
                        <Typography
                            classes={{
                                root: classes.customDialogTitle
                            }}
                        >
                            ARE YOU SURE YOU WANT TO DELETE?
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <List>
                            {this.getAllCheckedItemNames().map(
                                (item, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <CancelIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item}
                                            classes={{
                                                primary:
                                                    classes.customDialogText
                                            }}
                                        />
                                    </ListItem>
                                )
                            )}
                        </List>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeDeleteModal} color="primary">
                            YES
                        </Button>
                        <Button onClick={this.closeDeleteModal} color="primary">
                            NO
                        </Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}

TreeView.defaultProps = {
    child_directory_lists_key: "child_directory_lists",
    directory_entries_key: "directory_entries",
    create_menu_bar: [
        {
            id: 1,
            name: "TIER ENTRY",
            url: TABLET_CMS_CREATE_CONTENT_SUBCATEGORY_URL
        },
        {
            id: 2,
            name: "DIRECTORY ENTRY",
            url: TABLET_CMS_CREATE_CONTENT_DIRECTORY_URL
        },
        {
            id: 3,
            name: "POPUP WINDOW",
            url: TABLET_CMS_CREATE_CONTENT_DIRECTORY_URL
        },
        {
            id: 4,
            name: "GALLERY PAGE",
            url: TABLET_CMS_CREATE_CONTENT_DIRECTORY_URL
        }
    ]
};

TreeView.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    child_directory_lists_key: PropTypes.string,
    directory_entries_key: PropTypes.string,
    system_id: PropTypes.number.isRequired,
    history: PropTypes.object.isRequired,
    create_menu_bar: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            url: PropTypes.string.isRequired
        })
    )
};

export default withStyles(styles)(TreeView);
