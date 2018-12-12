import React from 'react';
import PropTypes from 'prop-types';

const VotePanel = ({ ...props }) => {
  const getActionText = () => {
    if (props.buttonClicked === 'rescind') {
      return 'Rescind vote';
    } else if (props.view === 'members') {
      return 'Vote out';
    }
    return 'Vote in';
  };

  return (
    <div className="panel-content-container">
      <div className="panel-content-box">
        <p>ALIAS</p>
        <p>{props.selectedDetails[0].alias}</p>
      </div>
      <div className="panel-content-box">
        <p>ACTION</p>
        <p>{getActionText()}</p>
      </div>
    </div>
  );
};

VotePanel.propTypes = {
  view: PropTypes.string.isRequired,
  selectedDetails: PropTypes.arrayOf(PropTypes.object).isRequired,
  buttonClicked: PropTypes.string.isRequired,
};

export default VotePanel;

