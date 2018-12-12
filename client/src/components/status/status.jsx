import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { adminStatusMessages } from '../../common/constants';

const Status = ({ ...props }) => {
  const currentUser = props.members.filter(member => member.address === props.currentAccount).pop();
  if (props.members.length === 1) {
    return '';
  }
  if (currentUser.votesNeeded === 1) {
    return (
      <p className="status">
        <span><Icon iconName="Warning" className="blocked" /></span>{' '}
        {adminStatusMessages.extremelyPoor}
      </p>
    );
  } else if (currentUser.percentVoted >= 80 && currentUser.percentVoted <= 100) {
    return (
      <p className="status">
        <Icon iconName="Completed" className="good" />{' '}
        {adminStatusMessages.excellent}
      </p>
    );
  } else if (currentUser.percentVoted >= 59 && currentUser.percentVoted <= 79) {
    return (
      <p className="status">
        <span><Icon iconName="Blocked2" className="neutral" /></span>{' '}
        {adminStatusMessages.moderate}
      </p>
    );
  }
  return (
    <p className="status">
      <span><Icon iconName="Warning" className="blocked" /></span>{' '}
      {adminStatusMessages.poor}
    </p>
  );
};

Status.propTypes = {
  members: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentAccount: PropTypes.string.isRequired,
};

export default Status;

