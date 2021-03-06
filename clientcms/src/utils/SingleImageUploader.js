import React from "react";
import Dropzone from "react-dropzone";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import PropTypes from "prop-types";

const styles = theme => ({
    expansionButton: {
        color: "#F0F2F8",
        background: "#DDDFE7",
        borderRadius: 25
    },
    icon: {
        fontSize: "large"
    }
});

class SingleImageUploader extends React.PureComponent {
    constructor(props) {
        super(props);
        let images = [];
        if (props.data) {
            images = [
                ...images,
                {
                    ...props.data,
                    uploaded: true
                }
            ];
        }
        this.state = {
            images
        };
        this.dropzoneRef = React.createRef();
        this.removeImage = this.removeImage.bind(this);
        this.openFileBrowser = this.openFileBrowser.bind(this);
    }

    componentDidMount() {
        this.props.onRef && this.props.onRef(this);
    }

    componentDidUpdate(prevProps) {
        const { upload, uploadAction } = this.props;
        const { images } = this.state;
        if (prevProps.upload !== upload && Boolean(upload)) {
            uploadAction({
                variables: { files: images.filter(image => !image.uploaded) }
            });
        }
    }

    componentWillUnmount() {
        this.props.onRef && this.props.onRef(undefined);
    }

    openFileBrowser() {
        this.dropzoneRef.current.open();
    }

    onDrop(images) {
        this.setState({
            images: images.map(file =>
                Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    uploaded: false
                })
            )
        });
        this.props.updateImageName &&
            this.props.updateImageName(images[0].name);
    }

    removeImage() {
        this.setState({ images: [] });
        this.props.updateImageName && this.props.updateImageName("");
    }

    doUploadImage(action) {}

    render() {
        const { classes } = this.props;
        const { images } = this.state;
        const image = images.length > 0 ? images[0] : null;
        return (
            <div
                style={{
                    width: "90%",
                    border: "1px solid #CACED5",
                    padding: 10
                }}
            >
                {!Boolean(image) && (
                    <p
                        style={{
                            fontSize: "0.5em",
                            color: "#4D4F5C",
                            marginLeft: "1.2vw"
                        }}
                    >
                        UPLOAD
                    </p>
                )}
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center"
                    }}
                >
                    <Dropzone
                        ref={this.dropzoneRef}
                        disableClick={true}
                        style={{
                            position: "relative",
                            width: "90%",
                            backgroundColor: "#F0F2F8",
                            height: "320px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                        onDrop={this.onDrop.bind(this)}
                    >
                        {!Boolean(image) ? (
                            <React.Fragment>
                                <div
                                    style={{
                                        padding: 10,
                                        border: "1px solid #DDDFE7",
                                        borderRadius: 45
                                    }}
                                    onClick={this.openFileBrowser}
                                >
                                    <div
                                        style={{
                                            padding: 10,
                                            border: "1px solid #DDDFE7",
                                            borderRadius: 35,
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        <IconButton
                                            className={`fas fa-arrow-circle-up ${
                                                classes.expansionButton
                                            }`}
                                        />
                                    </div>
                                </div>
                                <div
                                    style={{
                                        marginTop: 10,
                                        textAlign: "center",
                                        color: "#43425D",
                                        fontSize: "1em"
                                    }}
                                >
                                    DRAG {"&"} DROP
                                    <p
                                        style={{
                                            color: "#aaaaaa",
                                            fontSize: "0.5em"
                                        }}
                                    >
                                        YOUR FILES OR{" "}
                                        <span
                                            onClick={this.openFileBrowser}
                                            style={{
                                                color: "#3B86FF",
                                                textDecoration: "underline",
                                                fontWeight: 700
                                            }}
                                        >
                                            BROWSE
                                        </span>
                                    </p>
                                </div>
                            </React.Fragment>
                        ) : (
                            <img
                                src={
                                    image.uploaded ? image.path : image.preview
                                }
                                alt=""
                                style={{ height: 320 }}
                            />
                        )}
                    </Dropzone>
                </div>
            </div>
        );
    }
}

SingleImageUploader.propTypes = {
    updateImageName: PropTypes.func.isRequired,
    uploadAction: PropTypes.func.isRequired,
    upload: PropTypes.bool.isRequired,
    data: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        path: PropTypes.string,
        type: PropTypes.string
    })
};

export default withStyles(styles)(SingleImageUploader);
