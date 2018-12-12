import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import LeftNav from './components/leftNav/leftNav';
import TopBar from './components/topBar/topBar';
import Administrators from './components/administrators/administrators';
import Validators from './components/validators/validators';
import { getNodes } from './actions/userActions';
import Flyout from './components/flyout/flyout';
import './App.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuExpanded: true,
      settingsFlyout: false,
      buttonClicked: '',
    };
  }

  componentDidMount() {
    window.addEventListener('load', this.handleLoad);
  }

  handleLoad = () => {
    this.props.actions.getNodes();
  }

  toggleMenuExpanded = () => {
    this.setState({ menuExpanded: !this.state.menuExpanded });
  }

  render() {
    return (
      <div className="App">
        <div className="AppTop">
          <TopBar handleFlyout={this.handleFlyout} />
        </div>
        <div className="AppBottom">
          <LeftNav
            menuExpanded={this.state.menuExpanded}
            menuToggleCallback={this.toggleMenuExpanded}
          />
          <div className={`main-component ${!this.state.menuExpanded ? 'full' : ''}`}>
            <Switch>
              <Route path="/validators" component={Validators} />
              <Route path="/administrators" component={Administrators} />
              <Route exact path="/" component={Administrators} />
            </Switch>
          </div>
        </div>
        {this.state.settingsFlyout &&
          <Flyout
            showPanel={this.state.settingsFlyout}
            buttonClicked={this.state.buttonClicked}
            handleDismiss={this.handleFlyoutDismiss}
          />
        }
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ getNodes }, dispatch),
});

App.propTypes = {
  actions: PropTypes.shape({
    getNodes: PropTypes.func,
  }).isRequired,
};

export default connect(null, mapDispatchToProps)(App);
