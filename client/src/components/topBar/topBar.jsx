import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { ActionButton, IconButton, PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import Persona from './persona';
import Flyout from '../flyout/flyout';
import { updateConsortiumName } from '../../actions/userActions';
import './topBar.scss';

class TopBar extends Component {
  constructor(props) {
    super(props);
    const doesBrowserHaveWeb3 = !!window.web3;
    this.state = {
      isCalloutVisible: false,
      showPanel: false,
      buttonClicked: '',
      doesBrowserHaveWeb3,
      showSettingsFlyout: false,
      newConsortiumName: '',
      showDialog: false,
    };
  }

  handleCallout = () => {
    this.setState({
      isCalloutVisible: !this.state.isCalloutVisible,
    });
  }

  handleFlyout = (buttonName) => {
    this.setState({ showPanel: true, buttonClicked: buttonName });
  }

  handleFlyoutDismiss = () => this.setState({ showPanel: false })

  handleSettingsFlyout = (buttonName) => {
    this.setState({ showSettingsFlyout: true, buttonClicked: buttonName });
  }

  handleSettingFlyoutDismiss = () => this.setState({ showSettingsFlyout: false })

  handleSettingsSubmit = (newConsortiumName) => {
    this.setState({
      newConsortiumName,
      showDialog: true,
    });
  }

  handleDialogDismiss = () => {
    this.setState({
      showDialog: false,
    });
  }

  handleDialogClick = () => {
    this.props.actions.updateConsortiumName(this.state.newConsortiumName);
    this.setState({
      showDialog: false,
    });
  }

  render() {
    return (
      <div className="topBar-container">
        <div className="topBar-left">
          <div className="topBar-item-text title">{this.props.consortiumName}
          </div>
        </div>
        <div className="topBar-right">
          {this.props.isAdmin &&
            <IconButton
              onClick={() => this.handleSettingsFlyout('settings')}
              iconProps={{ iconName: 'Settings' }}
            />
          }
          <ActionButton
            className="feedback-button"
            iconProps={{
              iconName: 'Emoji2',
            }}
            href="https://aka.ms/workbenchforum"
            target="_blank"
          />
          <Persona
            doesBrowserHaveWeb3={this.state.doesBrowserHaveWeb3}
            isAdmin={this.props.isAdmin}
            isCalloutVisible={this.state.isCalloutVisible}
            currentAccount={this.props.currentAccount}
            currentAlias={this.props.currentAlias}
            handleFlyout={this.handleFlyout}
            handleCallout={this.handleCallout}
            showPanel={this.state.showPanel}
            buttonClicked={this.state.buttonClicked}
            handleFlyoutDismiss={this.handleFlyoutDismiss}
            webServerNetworkError={this.props.webServerNetworkError}
          />
          {this.state.showSettingsFlyout &&
            <Flyout
              buttonClicked={this.state.buttonClicked}
              handleDismiss={this.handleSettingFlyoutDismiss}
              showPanel={this.state.showSettingsFlyout}
              handleSettingsSubmit={this.handleSettingsSubmit}
            />
          }

          <Dialog
            hidden={!this.state.showDialog}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Consortium Name',
                subText: 'This change will be viewed by everyone in the consortium.',
              }}
            onDismiss={this.handleDialogDismiss}
          >
            <DialogFooter>
              <PrimaryButton onClick={this.handleDialogClick} text="Continue" />
              <DefaultButton onClick={this.handleDialogDismiss} text="Cancel" />
            </DialogFooter>
          </Dialog>

        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAdmin: state.administrator.isAdmin,
  currentAccount: state.user.currentAccount,
  currentAlias: state.user.currentAlias,
  consortiumName: state.user.consortiumName,
  webServerNetworkError: state.user.error.webServerNetworkError,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    updateConsortiumName,
  }, dispatch),
});

TopBar.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  currentAccount: PropTypes.string,
  currentAlias: PropTypes.string,
  consortiumName: PropTypes.string,
  actions: PropTypes.shape({
    updateConsortiumName,
  }).isRequired,
  webServerNetworkError: PropTypes.string.isRequired,
};

TopBar.defaultProps = {
  currentAccount: null,
  currentAlias: null,
  consortiumName: '',
};

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);

