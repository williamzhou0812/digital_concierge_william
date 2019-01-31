import React, { Component, Fragment, lazy, Suspense } from "react";
import { withApollo } from "react-apollo";
import { withStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import styled from "styled-components";
import MultipleMutationAndQueryExample from "./MultipleMutationAndQueryExample";

const NewClientSetupTitle = styled.p`
    font-size: 2.5em;
    padding-top: 15px;
`;

const styles = theme => ({
    root: {
        width: "80%",
        marginLeft: "auto",
        marginRight: "auto"
    },
    button: {
        marginRight: theme.spacing.unit
    },
    instructions: {
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit
    }
});

const array_components = [
    {
        component: lazy(() => import("./WizardCreateClientPageOne")),
        title: "Client"
    },
    {
        component: lazy(() => import("./WizardCreateClientPageTwo")),
        title: "Account set-up"
    },
    {
        component: lazy(() => import("./WizardCreateClientPageThree")),
        title: "Structure"
    },
    {
        component: lazy(() => import("./WizardCreateClientPageFour")),
        title: "System"
    },
    {
        component: lazy(() => import("./WizardCreateClientPageFive")),
        title: "Theme"
    },
    {
        component: lazy(() => import("./WizardCreateClientPageSix")),
        title: "Media"
    }
];

class CreateClient extends Component {
    state = {
        activeStep: 0
    };

    handleNext = () => {
        const { activeStep } = this.state;

        this.setState({
            activeStep: Math.min(activeStep + 1, array_components.length - 1)
        });
    };

    render() {
        const { classes } = this.props;
        const { activeStep } = this.state;
        const SelectedComponent = array_components[activeStep].component;

        return (
            <div className={classes.root}>
                <NewClientSetupTitle>New Client Setup</NewClientSetupTitle>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {array_components.map(({ title }) => {
                        const props = {};
                        const labelProps = {};
                        return (
                            <Step key={title} {...props}>
                                <StepLabel {...labelProps}>{title}</StepLabel>
                            </Step>
                        );
                    })}
                </Stepper>
                <div>
                    <div>
                        <Suspense>
                            <SelectedComponent next={this.handleNext} />
                        </Suspense>
                        <div>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleNext}
                                className={classes.button}
                            >
                                {activeStep === array_components.length - 1
                                    ? "Finish"
                                    : "Next"}
                            </Button>
                        </div>
                    </div>
                </div>
                <MultipleMutationAndQueryExample />
            </div>
        );
    }
}

CreateClient.propTypes = {
    classes: PropTypes.object
};

export default withApollo(withStyles(styles)(CreateClient));