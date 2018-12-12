import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const MyRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => <Component {...props} />}
  />
);

MyRoute.propTypes = {
  component: PropTypes.func.isRequired,
};

export default MyRoute;
