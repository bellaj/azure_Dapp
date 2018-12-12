import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import Flyout from '../flyout/flyout';
import Header from './../header/header';
import Loading from './../loading/loading';
import PivotContent from '../pivotContent/pivotContent';
import Status from '../status/status';
import * as constants from '../../common/constants';
import Notification from '../notification/notification';
import './administrators.scss';

class Administrators extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPanel: false,
      buttonClicked: '',
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.nodeInfo !== nextProps.nodeInfo ||
      this.props.members !== nextProps.members ||
      this.props.candidates !== nextProps.candidates ||
      this.state.showPanel !== nextState.showPanel ||
      this.props.currentAlias !== nextProps.currentAlias ||
      this.props.isAdmin !== nextProps.isAdmin
    ) {
      return true;
    }
    return false;
  }

  handleFlyout = (buttonName) => {
    this.setState({ showPanel: true, buttonClicked: buttonName });
  }

  handleFlyoutDismiss = () => this.setState({ showPanel: false })

  render() {
    const {
      nodeInfo, members, candidates = [], currentAccount, isAdmin,
    } = this.props;

    if (
      typeof nodeInfo === 'string' ||
      !nodeInfo ||
      !members
    ) {
      return <Loading />;
    }

    return (
      <div className="administrators-page">
        <Header
          className="header-container"
          headerText="Administrators"
        />
        {isAdmin &&
        <div>
          <Status
            members={members}
            currentAccount={currentAccount}
          />
          <Notification />
        </div>
      }
        <Pivot className="pivot-container">
          <PivotItem
            headerText={`Admins (${members.length})`}
          >
            <PivotContent
              data={members}
              description={constants.membersDescription}
              view="members"
              handleFlyout={this.handleFlyout}
              currentAccount={currentAccount}
              handleVoteAction={this.handleVoteAction}
              isAdmin={isAdmin}
            />
          </PivotItem>
          <PivotItem
            headerText={`Candidates (${candidates.length})`}
          >
            <PivotContent
              data={candidates}
              description={constants.candidatesDescription}
              view="candidates"
              handleFlyout={this.handleFlyout}
              currentAccount={currentAccount}
              handleVoteAction={this.handleVoteAction}
              isAdmin={isAdmin}
              className="AAAAAAAA"
            />
          </PivotItem>
        </Pivot>
        {this.state.showPanel &&
          <Flyout
            showPanel={this.state.showPanel}
            handleDismiss={this.handleFlyoutDismiss}
            buttonClicked={this.state.buttonClicked}
          />
        }
      </div>
    );
  }
}

const mapStateToProps = state => ({
  nodeInfo: state.user.data,
  members: state.administrator.members,
  candidates: state.administrator.candidates,
  currentAccount: state.user.currentAccount,
  currentAlias: state.user.currentAlias,
  isAdmin: state.administrator.isAdmin,
});

Administrators.propTypes = {
  nodeInfo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  members: PropTypes.arrayOf(PropTypes.object),
  candidates: PropTypes.arrayOf(PropTypes.object),
  currentAccount: PropTypes.string,
  currentAlias: PropTypes.string,
  isAdmin: PropTypes.bool.isRequired,
};

Administrators.defaultProps = {
  members: null,
  candidates: [],
  currentAccount: '',
  currentAlias: '',
};

export default connect(mapStateToProps)(Administrators);
