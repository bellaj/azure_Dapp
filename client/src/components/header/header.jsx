import React from 'react';
import PropTypes from 'prop-types';
import './header.scss';

const Header = ({ ...props }) => (
  <div className={props.className}>
    <h1>{props.headerText}</h1>
  </div>
);

Header.propTypes = {
  headerText: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
};

export default Header;
