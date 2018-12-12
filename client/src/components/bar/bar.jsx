import React from 'react';
import PropTypes from 'prop-types';
import './bar.scss';

const Bar = ({ ...props }) => {
  const getClassName = () => {
    let className;
    if (props.percentVoted === 100) {
      className = 'labelStyle-hundred';
    } else if (props.percentVoted <= 10) {
      className = 'labelStyle-right';
    } else {
      className = 'labelStyle';
    }
    return className;
  };

  return (
    <div className={props.view === 'members' ? 'barContainerMember' : 'barContainerCandidate'}>
      <div className="halfWay" />
      <div
        className={props.view === 'members' ? 'barStyle darkBlue' : 'barStyle lightBlue'}
        style={{
          width: `${props.percentVoted}%`,
        }}
      >
        <div className={getClassName()}>{props.percentVotedDisplay}%</div>
      </div>
    </div>
  );
};

Bar.propTypes = {
  percentVoted: PropTypes.number.isRequired,
  percentVotedDisplay: PropTypes.number.isRequired,
  view: PropTypes.string.isRequired,
};

export default Bar;
