import React from 'react';
import PropTypes from 'prop-types';
import './description.scss';

const Description = ({ ...props }) => (
  <div className={props.className}>
    <p>{props.description.top}{' '}{props.description.link}</p>
    <p>{props.description.bottom}</p>
  </div>
);

Description.propTypes = {
  description: PropTypes.objectOf(PropTypes.string).isRequired,
  className: PropTypes.string.isRequired,
};

export default Description;
