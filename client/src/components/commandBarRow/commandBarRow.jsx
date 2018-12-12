import React from 'react';
import PropTypes from 'prop-types';
import { IconType } from 'office-ui-fabric-react/lib/Icon';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { SearchBox } from 'office-ui-fabric-react/lib/SearchBox';
import VoteOutIcon from '../../assets/icons/voteOut.svg';
import NominateIcon from '../../assets/icons/nominate.svg';
import VoteInIcon from '../../assets/icons/voteIn.svg';
import RescindIcon from '../../assets/icons/rescind.svg';
import './commandBarRow.scss';

const CommandBarRow = ({ ...props }) => {
  const makeItems = () => {
    const {
      showAddButton, handleFlyout, showVote, showRescindVote, selectedDetails, handleVoteFlyout,
    } = props;

    const leftSideCommandBar = [];
    let toggleButton;
    if (selectedDetails.length > 0) {
      toggleButton = selectedDetails[0].hasVoted;
    }

    if (showAddButton) {
      const addButtonItem = {
        key: 'new',
        className: 'addButtonStyle',
        name: 'Nominate',
        iconProps: {
          iconType: IconType.Image,
          imageProps: {
            className: 'customIconButton',
            src: NominateIcon,
          },
        },
        onClick: () => handleFlyout('add'),
      };
      leftSideCommandBar.push(addButtonItem);
    }

    if (showVote) {
      const showVoteItem = {
        key: 'vote',
        className: 'voteButton',
        name: (props.view === 'members' ? 'Vote against' : 'Vote in'),
        disabled: (selectedDetails.length === 0 || toggleButton),
        onClick: () => handleVoteFlyout('vote'),
        iconProps: {
          iconType: IconType.Image,
          imageProps: {
            className: (selectedDetails.length === 0 || toggleButton ? 'customIconButton-disabled' : 'customIconButton'),
            src: (props.view === 'members' ? VoteOutIcon : VoteInIcon),
          },
        },
      };

      leftSideCommandBar.push(showVoteItem);
    }

    if (showRescindVote) {
      const rescindButtomItem = {
        key: 'rescind',
        className: 'rescind-button',
        name: 'Rescind vote',
        disabled: (selectedDetails.length === 0 || !toggleButton),
        onClick: () => handleVoteFlyout('rescind'),
        iconProps: {
          iconType: IconType.Image,
          imageProps: {
            className: (selectedDetails.length === 0 || !toggleButton ? 'customIconButton-disabled' : 'customIconButton'),
            src: RescindIcon,
          },
        },
      };

      leftSideCommandBar.push(rescindButtomItem);
    }

    return leftSideCommandBar;
  };

  const items = props.showLeft ? makeItems() : [];
  return (
    <div className="commandBarRowContainer">
      {props.showTextField &&
        <SearchBox
          placeholder="Search"
          onChange={props.handleSearch}
          className="custom-searchBox"
        />
      }
      <CommandBar
        className="custom-commandBar"
        items={items}
      />
    </div>
  );
};

CommandBarRow.propTypes = {
  showTextField: PropTypes.bool,
  showAddButton: PropTypes.bool,
  showEditButton: PropTypes.bool,
  showLeft: PropTypes.bool,
  showVote: PropTypes.bool,
  showRescindVote: PropTypes.bool,
  view: PropTypes.string.isRequired,
  handleSearch: PropTypes.func.isRequired,
};

CommandBarRow.defaultProps = {
  showTextField: false,
  showAddButton: false,
  showEditButton: false,
  showLeft: false,
  showVote: false,
  showRescindVote: false,
};

export default CommandBarRow;
