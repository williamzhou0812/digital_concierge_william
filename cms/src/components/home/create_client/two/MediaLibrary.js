import React from "react";
import { Query, withApollo, compose, graphql } from "react-apollo";
import { getClientImageById } from "../../../../data/query";
import PropTypes from "prop-types";
import Loading from "../../../loading/Loading";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { times } from "lodash";
import styled from "styled-components";

const PaginationSection = styled.li`
    display: inline;
    padding: 10px;

    &:hover {
        background-color: lightgrey;
    }
`;

class MediaLibrary extends React.Component {
    state = { limit: 10, offset: 0 };

    handlePagination(id) {
        this.setState({
            offset: id * this.state.limit
        });
    }

    render() {
        const { clientId: id } = this.props;
        const { limit, offset } = this.state;
        return (
            <div>
                <Query
                    query={getClientImageById}
                    variables={{ id, limit, offset }}
                >
                    {({
                        loading,
                        error,
                        // data: { client: { media: images = {} } = {} } = {}
                        data: { mediaByClient: images = {} } = {}
                    }) => {
                        if (loading) return <Loading loadingData />;
                        if (error) return `Error! ${error.message}`;
                        console.log(images);
                        let totalImages;
                        let pages;
                        let currentPage = 1;
                        let hasLastPage =
                            totalImages % limit > 0 ? true : false;
                        if (images.length > 0) {
                            totalImages = images[0].totalImages;
                            pages =
                                (totalImages - (totalImages % limit)) / limit;
                            currentPage =
                                offset / limit > 0 ? offset / limit : 1;
                        }
                        console.log(pages);

                        return (
                            <div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        height: "3vh"
                                    }}
                                >
                                    <div>
                                        Images {offset + 1} -{" "}
                                        {offset + limit > totalImages
                                            ? totalImages
                                            : offset + limit}{" "}
                                        of {totalImages} Images Shown Below
                                    </div>
                                    <div>
                                        <Select
                                            value={this.state.limit}
                                            onChange={event => {
                                                this.setState({
                                                    limit: event.target.value
                                                });
                                            }}
                                        >
                                            <MenuItem value={5}>
                                                Show 5 Images Per Page
                                            </MenuItem>
                                            <MenuItem value={10}>
                                                Show 10 Images Per Page
                                            </MenuItem>
                                            <MenuItem value={20}>
                                                Show 20 Images Per Page
                                            </MenuItem>
                                            <MenuItem value={30}>
                                                Show 30 Images Per Page
                                            </MenuItem>
                                            <MenuItem value={50}>
                                                Show 50 Images Per Page
                                            </MenuItem>
                                            <MenuItem value={100}>
                                                Show 100 Images Per Page
                                            </MenuItem>
                                        </Select>
                                    </div>
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        overflowY: "scroll",
                                        height: "60vh"
                                    }}
                                >
                                    {images.length > 0 &&
                                        images.map(image => {
                                            return (
                                                <div
                                                    style={{ padding: "10px" }}
                                                >
                                                    <p
                                                        style={{
                                                            width: "300px",
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        {image.name}
                                                    </p>
                                                    <p
                                                        style={{
                                                            width: "300px",
                                                            textAlign: "center"
                                                        }}
                                                    >
                                                        {image.createdAt}
                                                    </p>
                                                    <img
                                                        src={image.path}
                                                        width={300}
                                                    />
                                                </div>
                                            );
                                        })}
                                </div>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        height: "5vh"
                                    }}
                                >
                                    {images.length > 0 ? (
                                        <div>
                                            <ul>
                                                {pages > 0 && (
                                                    <a
                                                        onClick={this.handlePagination.bind(
                                                            this,
                                                            0
                                                        )}
                                                    >
                                                        <PaginationSection>
                                                            <span>1</span>
                                                        </PaginationSection>
                                                    </a>
                                                )}
                                                {currentPage >= 4 && (
                                                    <PaginationSection>
                                                        <span>...</span>
                                                    </PaginationSection>
                                                )}
                                                {times(pages, index => {
                                                    if (
                                                        index < pages - 1 &&
                                                        index > 0
                                                    ) {
                                                        console.log(
                                                            `current page${currentPage}`
                                                        );
                                                        console.log(
                                                            `index${index}`
                                                        );

                                                        if (
                                                            currentPage <
                                                                index + 3 &&
                                                            currentPage >
                                                                index - 3
                                                        ) {
                                                            return (
                                                                <a
                                                                    onClick={this.handlePagination.bind(
                                                                        this,
                                                                        index +
                                                                            1
                                                                    )}
                                                                >
                                                                    <PaginationSection>
                                                                        <span>
                                                                            {index +
                                                                                1}
                                                                        </span>
                                                                    </PaginationSection>
                                                                </a>
                                                            );
                                                        }
                                                    }
                                                })}
                                                {currentPage <= pages - 5 && (
                                                    <PaginationSection>
                                                        <span>...</span>
                                                    </PaginationSection>
                                                )}
                                                {pages > 0 && (
                                                    <a
                                                        onClick={this.handlePagination.bind(
                                                            this,
                                                            pages
                                                        )}
                                                    >
                                                        <PaginationSection>
                                                            <span>
                                                                {totalImages %
                                                                    limit >
                                                                    0 &&
                                                                pages < 3
                                                                    ? pages + 1
                                                                    : pages}
                                                            </span>
                                                        </PaginationSection>
                                                    </a>
                                                )}
                                            </ul>
                                        </div>
                                    ) : (
                                        <PaginationSection>
                                            <span>1</span>
                                        </PaginationSection>
                                    )}
                                    <div>
                                        Page {currentPage} of {pages - 1}
                                    </div>
                                </div>
                            </div>
                        );
                    }}
                </Query>
            </div>
        );
    }
}

MediaLibrary.propTypes = {
    clientId: PropTypes.number.isRequired
};

export default withApollo(MediaLibrary);
/*export default compose(
    withApollo,
    graphql(getClientImageById, {
        options: ownProps => ({
            variables: {
                id: ownProps.clientId
            }
        }),
        name: "getClientImageById"
    })
)(MediaLibrary);*/
