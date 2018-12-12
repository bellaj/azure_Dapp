import React from 'react';
import PropTypes from 'prop-types';
import { ActionButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Callout, DirectionalHint } from 'office-ui-fabric-react/lib/Callout';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { Icon, IconType } from 'office-ui-fabric-react/lib/Icon';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import LogOut from '../../assets/icons/logout.svg';
import Warning from '../../assets/icons/warning.svg';
import Flyout from '../flyout/flyout';
import './topBar.scss';

const Persona = ({ ...props }) => {
  if (props.webServerNetworkError) {
    return (
      <div className="eth-account-button">
        <ActionButton onClick={() => props.handleCallout()}>
          <Icon
            iconType={IconType.Image}
            imageProps={{
            className: 'logout-icon',
            src: LogOut,
          }}
          />
        </ActionButton>
        {props.isCalloutVisible &&
        <Callout
          target=".eth-account-button"
          directionalHint={DirectionalHint.bottomRightEdge}
          isBeakVisible={false}
          onDismiss={() => props.handleCallout()}
          className="eth-account-callout"
          gapSpace={4}
        >
          <div className="eth-no-account-callout-content">
            <div className="callout-top">
              <div className="callout-left">
                <img src={Warning} alt="Warning, Please sign into Metamask" className="warningIcon" />
              </div>

              <div className="callout-right">
                <h2>Incorrect network connection</h2>
                <p>Connect to the following network using Metamask:</p>
                <p>{props.webServerNetworkError}</p>
              </div>

            </div>
          </div>
        </Callout>
          }
      </div>
    );
  } else if (props.doesBrowserHaveWeb3 && props.currentAccount) {
    return (
      <div className="eth-account-button">
        <ActionButton
          onClick={() => props.handleCallout()}
        >
          <p className="eth-account-text">
            {props.currentAlias}{' '}
          </p>
          <Jazzicon seed={jsNumberForAddress(props.currentAccount)} diameter={20} />
        </ActionButton>
        {props.isCalloutVisible &&
        <Callout
          target=".eth-account-button"
          directionalHint={DirectionalHint.bottomRightEdge}
          isBeakVisible={false}
          onDismiss={() => props.handleCallout()}
          className="eth-account-callout"
          gapSpace={4}
        >
          <div className="eth-account-callout-content">
            <div className="callout-top">
              <div className="callout-left">
                <Jazzicon seed={jsNumberForAddress(props.currentAccount)} diameter={72} />
              </div>
              <div className="callout-right">
                <h2>{props.currentAlias}</h2>
                <p>{props.currentAccount}</p>
              </div>
            </div>
            {props.isAdmin &&
            <div className="callout-bottom">
              <DefaultButton
                text="Change alias"
                className="change-alias-button"
                onClick={() => { props.handleCallout(); props.handleFlyout('edit'); }}
              />
            </div>
        }
          </div>
        </Callout>
    }
        {props.showPanel &&
        <Flyout
          showPanel={props.showPanel}
          handleDismiss={props.handleFlyoutDismiss}
          buttonClicked={props.buttonClicked}
        />
        }
      </div>
    );
  }
  return (
    <div className="eth-account-button">
      <ActionButton onClick={() => props.handleCallout()}>
        <Icon
          iconType={IconType.Image}
          imageProps={{
            className: 'logout-icon',
            src: LogOut,
          }}
        />
      </ActionButton>
      {props.isCalloutVisible &&
        <Callout
          target=".eth-account-button"
          directionalHint={DirectionalHint.bottomRightEdge}
          isBeakVisible={false}
          onDismiss={() => props.handleCallout()}
          className="eth-account-callout"
          gapSpace={4}
        >
          <div className="eth-no-account-callout-content">
            <div className="callout-top">
              <div className="callout-left">
                <img src={Warning} alt="Warning, Please sign into Metamask" className="warningIcon" />
              </div>
              {props.doesBrowserHaveWeb3 && !props.currentAccount ? (
                <div className="callout-right">
                  <h2>Sign into Metamask</h2>
                </div>
              ) : (
                <div className="callout-right">
                  <h2>Ethereum wallet required</h2>
                  <p>Install and sign in using a browser-based</p>
                  <p>Ethereum wallet such as <Link href="https://metamask.io/" target="_blank">MetaMask</Link>.</p>
                </div>
              )}
            </div>
          </div>
        </Callout>
          }
    </div>
  );
};

Persona.propTypes = {
  doesBrowserHaveWeb3: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  currentAccount: PropTypes.string,
  currentAlias: PropTypes.string,
  handleFlyout: PropTypes.func,
  handleCallout: PropTypes.func,
  isCalloutVisible: PropTypes.bool,
  showPanel: PropTypes.bool,
  handleFlyoutDismiss: PropTypes.func,
  buttonClicked: PropTypes.string,
};

Persona.defaultProps = {
  currentAccount: null,
  currentAlias: null,
  handleFlyout: null,
  handleCallout: null,
  isCalloutVisible: false,
  showPanel: false,
  handleFlyoutDismiss: null,
  buttonClicked: '',
};

export default Persona;
