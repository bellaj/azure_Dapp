import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import HamburgerIcon from '../../assets/icons/Hamburger.svg';
import leftNavAdminIcon from '../../assets/icons/leftNavAdmin.svg';
import leftNavValidatorIcon from '../../assets/icons/leftNavValidator.svg';
import './leftNav.scss';

class LeftNav extends React.Component {
  toggleExpansion = () => {
    this.props.menuToggleCallback();
  }

  renderTablinks = () => {
    const tabConfig = [
      {
        path: '/administrators',
        name: 'Administrators',
        icon: leftNavAdminIcon,
      },
    ];

    const validatorTab = {
      path: '/validators',
      name: 'Validators',
      icon: leftNavValidatorIcon,
    };

    if (this.props.isAdmin) {
      tabConfig.push(validatorTab);
    }

    return tabConfig.map(item => (
      <NavLink
        to={item.path}
        key={item.name}
        className="leftnav-item-container"
      >
        <div className="leftnav-item-icon_16">
          <img src={item.icon} alt={item.name} />
        </div>
        <div className="leftnav-item-text">{item.name}</div>
      </NavLink>
    ));
  }

  render() {
    const { menuExpanded } = this.props;
    return (
      <div className={`left-nav ${menuExpanded ? 'expanded' : ''}`}>
        <div>
          <div
            className="leftnav-item-container hamburger"
            onClick={this.toggleExpansion}
            role="button"
            tabIndex="0"
            onKeyPress={this.toggleExpansion}
          >
            <div className="leftnav-item-icon_16">
              <img src={HamburgerIcon} alt="HamburgerIcon" />
            </div>
          </div>
        </div>
        {this.renderTablinks()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAdmin: state.administrator.isAdmin,
});

LeftNav.propTypes = {
  menuExpanded: PropTypes.bool.isRequired,
  menuToggleCallback: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
};

LeftNav.defaultProps = {
  isAdmin: false,
};

export default withRouter(connect(mapStateToProps, {})(LeftNav));
