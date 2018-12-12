import React, { Component } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react/lib/Panel';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FormPanel from './formPanel';
import VotePanel from './votePanel';
import { addPanelFields, editPanelFields, settingPanelFields } from '../../common/constants';
import { addAdmin, updateAdmin, voteAdminOut, voteCandidateIn, rescindVoteAgainst, rescindVoteFor } from '../../actions/adminActions';
import * as utils from '../../common/utils';
import './flyout.scss';

class Flyout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      submitButtonDisabled: true,
      form: {},
      error: {},
      touched: {},
      isCalloutVisible: {},
    };
  }

  componentDidMount = () => {
    this.buildFieldsInState();
  }

  getFields = () => {
    if (this.props.buttonClicked === 'add') {
      return addPanelFields;
    } else if (this.props.buttonClicked === 'edit') {
      return editPanelFields;
    }
    return settingPanelFields;
  }

  getPanel = () => {
    const { buttonClicked, view, selectedDetails } = this.props;
    const {
      form, touched, error, isCalloutVisible,
    } = this.state;
    if (buttonClicked === 'vote' || buttonClicked === 'rescind') {
      return (
        <VotePanel view={view} selectedDetails={selectedDetails} buttonClicked={buttonClicked} />
      );
    }
    return (
      <FormPanel
        items={this.getFields()}
        form={form}
        touched={touched}
        error={error}
        handleChange={this.handleChange}
        handleFocus={this.handleFocus}
        isCalloutVisible={isCalloutVisible}
      />
    );
  }

  getHeaderText = () => {
    if (this.props.buttonClicked === 'vote' && this.props.view === 'members') {
      return 'Vote against';
    } else if (this.props.buttonClicked === 'vote' && this.props.view !== 'members') {
      return 'Vote in';
    } else if (this.props.buttonClicked === 'edit') {
      return 'Change alias';
    } else if (this.props.buttonClicked === 'settings') {
      return 'Settings';
    } else if (this.props.buttonClicked === 'rescind') {
      return 'Rescind Vote';
    }
    return 'Nominate a candidate';
  }

  getButtonText = () => {
    let submitText = 'Nominate';
    if (this.props.buttonClicked === 'vote' && this.props.view === 'members') {
      submitText = 'Vote against';
    } else if (this.props.buttonClicked === 'vote' && this.props.view !== 'members') {
      submitText = 'Vote in';
    } else if (this.props.buttonClicked === 'settings') {
      submitText = 'Save';
    } else if (this.props.buttonClicked === 'rescind') {
      submitText = 'Rescind';
    } else if (this.props.buttonClicked === 'edit') {
      submitText = 'Save';
    }
    return submitText;
  }

  buildFieldsInState = () => {
    if (this.props.buttonClicked === 'vote' || this.props.buttonClicked === 'rescind') {
      this.setState({
        submitButtonDisabled: false,
      });
      return;
    }
    if (this.props.buttonClicked === 'add') {
      addPanelFields.forEach((field) => {
        this.setState(prevState => ({
          ...prevState,
          form: {
            ...prevState.form,
            [field.name]: '',
          },
          isCalloutVisible: {
            ...prevState.isCalloutVisible,
            [field.name]: false,
          },
        }));
      });
      addPanelFields.forEach((field) => {
        if (field.required) {
          this.setState(prevState => ({
            ...prevState,
            touched: {
              ...prevState.touched,
              [field.name]: false,
            },
            error: {
              ...prevState.error,
              [field.name]: '',
            },
          }));
        }
      });
    } else if (this.props.buttonClicked === 'settings') {
      settingPanelFields.forEach((field) => {
        this.setState(prevState => ({
          ...prevState,
          form: {
            ...prevState.form,
            [field.name]: '',
          },
        }));
      });
      settingPanelFields.forEach((field) => {
        if (field.required) {
          this.setState(prevState => ({
            ...prevState,
            touched: {
              ...prevState.touched,
              [field.name]: false,
            },
            error: {
              ...prevState.error,
              [field.name]: '',
            },
          }));
        }
      });
    } else {
      editPanelFields.forEach((field) => {
        this.setState(prevState => ({
          form: {
            ...prevState.field,
            [field.name]: '',
          },
        }));
      });
      editPanelFields.forEach((field) => {
        if (field.required) {
          this.setState(prevState => ({
            ...prevState,
            touched: {
              ...prevState.touched,
              [field.name]: false,
            },
            error: {
              ...prevState.error,
              [field.name]: '',
            },
          }));
        }
      });
    }
  }

  handleChange = (inputValue, fieldName, type) => {
    this.setState({
      form: {
        ...this.state.form,
        [fieldName]: inputValue,
      },
    }, () => this.validate(fieldName, type));
  }

  handleFocus = fieldName =>
    this.setState({ touched: { ...this.state.touched, [fieldName]: true } });

  handleBlur = (fieldName, type) => this.validate(fieldName, type);

  validate = (name, type) => {
    const { form, error } = this.state;
    const errorMessage = utils.validate(name, type, form);
    this.setState({
      error: {
        ...error,
        [name]: errorMessage,
      },
    }, () => this.enableButton());
  }

  enableButton = () => {
    const { touched, error } = this.state;
    const allTouched = Object.values(touched).every(touchedValue => touchedValue);
    const noError = Object.values(error).every(errorValue => errorValue.length === 0);
    const disable = (allTouched && noError);
    return this.setState({ submitButtonDisabled: !disable });
  }

  handleSubmit = () => {
    const { form } = this.state;
    if (this.props.buttonClicked === 'vote') {
      const { selectedDetails } = this.props;
      if (this.props.view === 'members') {
        this.props.actions.voteAdminOut(selectedDetails[0].address, selectedDetails[0].alias);
      } else {
        this.props.actions.voteCandidateIn(selectedDetails[0].address, selectedDetails[0].alias);
      }
    } else if (this.props.buttonClicked === 'edit') {
      this.props.actions.updateAdmin(form.alias);
    } else if (this.props.buttonClicked === 'rescind') {
      const { selectedDetails } = this.props;
      if (this.props.view === 'members') {
        this.props.actions.rescindVoteAgainst(selectedDetails[0].address, selectedDetails[0].alias);
      } else {
        this.props.actions.rescindVoteFor(selectedDetails[0].address, selectedDetails[0].alias);
      }
    } else if (this.props.buttonClicked === 'settings') {
      this.props.handleSettingsSubmit(form.consortiumName);
    } else {
      this.props.actions.addAdmin(form.address, form.alias);
    }
    this.props.handleDismiss();
  }

  renderFooterContent = () => (
    <div className="custom-panel-footer">
      <PrimaryButton
        onClick={this.handleSubmit}
        disabled={this.state.submitButtonDisabled}
        className="custom-panel-footer-primary"
      >
        {this.getButtonText()}
      </PrimaryButton>
      <DefaultButton
        onClick={() => this.props.handleDismiss()}
      >
        Cancel
      </DefaultButton>
    </div>
  )

  render() {
    const { showPanel, handleDismiss } = this.props;
    return (
      <Panel
        isOpen={showPanel}
        type={PanelType.smallFixedFar}
        isLightDismiss
        onDismiss={handleDismiss}
        onRenderFooterContent={this.renderFooterContent}
        isFooterAtBottom
        headerText={this.getHeaderText()}
        className="custom-flyout"
      >
        {this.getPanel()}
      </Panel>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      addAdmin,
      updateAdmin,
      voteAdminOut,
      voteCandidateIn,
      rescindVoteAgainst,
      rescindVoteFor,
    },
    dispatch,
  ),
});

Flyout.propTypes = {
  showPanel: PropTypes.bool.isRequired,
  handleDismiss: PropTypes.func.isRequired,
  buttonClicked: PropTypes.string.isRequired,
  actions: PropTypes.shape({
    addAdmin: PropTypes.func,
    updateAdmin: PropTypes.func,
    voteAdminOut: PropTypes.func,
    voteCandidateIn: PropTypes.func,
    rescindVoteAgainst: PropTypes.func,
    rescindVoteFor: PropTypes.func,
  }).isRequired,
  view: PropTypes.string,
  selectedDetails: PropTypes.arrayOf(PropTypes.object),
  handleSettingsSubmit: PropTypes.func.isRequired,
};

Flyout.defaultProps = {
  view: '',
  selectedDetails: null,
};

export default connect(null, mapDispatchToProps)(Flyout);
