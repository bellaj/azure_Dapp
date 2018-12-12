import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { DetailsList, SelectionMode, DetailsListLayoutMode, Selection } from 'office-ui-fabric-react/lib/DetailsList';
import CommandBarRow from '../commandBarRow/commandBarRow';
import { administratorColumnsNames } from '../../common/constants';
import Bar from '../bar/bar';
import { voteAdminOut, voteCandidateIn } from '../../actions/adminActions';
import Flyout from '../flyout/flyout';
import Description from '../description/description';
import VoteInIcon from '../../assets/icons/voteIn.svg';
import VoteOutIcon from '../../assets/icons/voteOut.svg';
import './pivotContent.scss';

class PivotContent extends Component {
  constructor(props) {
    super(props);
    this.selection = new Selection({
      onSelectionChanged: () => this.getSelectionDetails(),
    });
    const columns = this.renderColumns();
    const items = this.initialSortItems();

    this.state = {
      showVotePanel: false,
      buttonClicked: '',
      selectedDetails: [],
      items,
      columns,
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (
      this.props.data !== nextProps.data ||
      this.state !== nextState ||
      this.props.isAdmin !== nextProps.isAdmin ||
      this.props.view !== nextProps.view
    ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.data !== prevProps.data
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(prevState => ({
        ...prevState,
        items: this.initialSortItems(),
        columns: this.renderColumns(),
      }));
    }
  }

  onColumnClick = (ev, column) => {
    const { columns, items } = this.state;
    let newItems = items.slice();
    const newColumns = columns.slice();
    const currColumn = newColumns.filter((currCol, idx) => column.key === currCol.key)[0];
    newColumns.forEach((newCol) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        // eslint-disable-next-line no-param-reassign
        newCol.isSorted = false;
        // eslint-disable-next-line no-param-reassign
        newCol.isSortedDescending = true;
      }
    });
    newItems = this.sortItems(newItems, currColumn.fieldName || '', currColumn.isSortedDescending);
    this.setState({
      columns: newColumns,
      items: newItems,
    });
  };

  getSelectionDetails = () => {
    const selectedDetails = this.selection.getSelection();
    this.setState({
      selectedDetails,
    });
  }

  initialSortItems = () => {
    const signedInUser = this.props.data.filter(member =>
      member.address === this.props.currentAccount);
    const otherUsers = this.props.data.filter(member =>
      member.address !== this.props.currentAccount);

    otherUsers.sort((a, b) => {
      if (a.alias.toLowerCase() < b.alias.toLowerCase()) {
        return -1;
      }
      if (a.alias.toLowerCase() > b.alias.toLowerCase()) {
        return 1;
      }
      return 0;
    });

    return [...signedInUser, ...otherUsers];
  }

  handleSearch = (inputValue) => {
    const filteredItems = this.props.data.filter((itemRow) => {
      const newItems = Object.values(itemRow)
        .filter(search => search.toString().toLowerCase()
          .includes(inputValue.toLowerCase()));
      return newItems.length > 0;
    });
    this.setState({ items: filteredItems });
  }

  handleVoteFlyout = (buttonName) => {
    this.setState({ showVotePanel: true, buttonClicked: buttonName });
  }

  handleFlyoutDismiss = () => this.setState({ showVotePanel: false })

  handleVoteAction = (address) => {
    if (this.props.view === 'members') {
      this.props.actions.voteAdminOut(address);
    } else {
      this.props.actions.voteCandidateIn(address);
    }
  }

  sortItems = (items, sortBy, descending = false) => {
    if (descending) {
      return items.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) {
          return 1;
        }
        if (a[sortBy] > b[sortBy]) {
          return -1;
        }
        return 0;
      });
    }
    return items.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) {
        return -1;
      }
      if (a[sortBy] > b[sortBy]) {
        return 1;
      }
      return 0;
    });
  }

  renderColumns = () => administratorColumnsNames.map((column, index) => {
    let columnName = column.name;

    if (column.fieldName === 'percentVoted') {
      const wordToggle = this.props.view === 'members' ? 'support' : 'vote';
      columnName = `${columnName} ${wordToggle} %`;
    }

    if (column.fieldName === 'votesNeeded') {
      if (this.props.view === 'members') {
        columnName = `${columnName} till removal`;
      } else {
        columnName = `${columnName} till admin`;
      }
    }
    let maxWidth = 90;
    let minWidth = 70;
    if (column.fieldName === 'address') {
      maxWidth = 280;
      minWidth = 70;
    }

    let headerClassName = 'defaultColumn';
    let isColumnResizeable = true;
    if (column.fieldName === 'voteCount') {
      headerClassName = 'right-align-column-normal';
      isColumnResizeable = false;
      minWidth = 70;
      maxWidth = 70;
    }

    if (column.fieldName === 'votesNeeded') {
      headerClassName = 'right-align-column-large';
      isColumnResizeable = false;
      minWidth = 60;
      maxWidth = 65;
    }

    if (column.fieldName === 'percentVoted') {
      maxWidth = 250;
      minWidth = 200;
    }

    const newColumn = {
      key: `column${index}`,
      name: columnName,
      isResizable: isColumnResizeable,
      fieldName: column.fieldName,
      maxWidth,
      minWidth,
      onColumnClick: this.onColumnClick,
      isSorted: false,
      isSortedDecending: false,
      isRowHeader: true,
      headerClassName,
    };

    if (newColumn.fieldName === 'alias') {
      newColumn.onRender = (item) => {
        if (item.address === this.props.currentAccount) {
          return (<div>{item.alias} (You)</div>);
        }
        return (<div>{item.alias}</div>);
      };
    }

    if (newColumn.fieldName === 'percentVoted') {
      newColumn.onRender = (item) => {
        let { percentVoted } = item;
        const percentVotedDisplay = percentVoted;

        if (percentVotedDisplay === '0') {
          percentVoted = 1;
        }
        if (percentVoted) {
          return (
            <Bar
              percentVoted={percentVoted}
              percentVotedDisplay={percentVotedDisplay}
              view={this.props.view}
            />
          );
        }
        return 'Loading...';
      };
    }

    if (newColumn.fieldName === 'voteCount') {
      newColumn.onRender = item => (<div className="right-align">{item.voteCount}</div>);
    }

    if (newColumn.fieldName === 'votesNeeded') {
      newColumn.onRender = item => (<div className="right-align">{item.votesNeeded}</div>);
    }

    if (newColumn.fieldName === 'yourVote') {
      newColumn.onRender = (item) => {
        if (item.hasVoted) {
          return (
            <div>
              <img
                className="yourVoteIconSize"
                src={this.props.view === 'members' ? VoteOutIcon : VoteInIcon}
                alt={this.props.view === 'members' ? 'vote out icon' : 'vote in icon'}
              />
              <span>{this.props.view === 'members' ? 'voted against' : 'voted for'}</span>
            </div>
          );
        }
        return (
          <div>
            -
          </div>
        );
      };
    }

    return newColumn;
  });

  render() {
    const { isAdmin } = this.props;
    const { items, columns } = this.state;

    return (
      <div className="pivot-content-container">
        <Description
          description={this.props.description}
          className={
            this.props.view === 'members' ?
            'description-container' :
            'description-container-candidates'
          }
        />
        <CommandBarRow
          showLeft
          showTextField
          showAddButton
          handleFlyout={this.props.handleFlyout}
          showVote={isAdmin}
          showRescindVote={isAdmin}
          view={this.props.view}
          selectedDetails={this.state.selectedDetails}
          voteAction={this.handleVoteAction}
          handleSearch={this.handleSearch}
          handleVoteFlyout={this.handleVoteFlyout}
        />
        <div className="detailslist-container">
          <DetailsList
            items={items}
            columns={columns}
            selectionMode={SelectionMode.single}
            layoutMode={DetailsListLayoutMode.justified}
            selectionPreservedOnEmptyClick
            isHeaderVisible
            selection={this.selection}
          />
        </div>
        {this.state.showVotePanel &&
          <Flyout
            showPanel={this.state.showVotePanel}
            view={this.props.view}
            buttonClicked={this.state.buttonClicked}
            selectedDetails={this.state.selectedDetails}
            handleDismiss={this.handleFlyoutDismiss}
          />
        }
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    voteAdminOut,
    voteCandidateIn,
  }, dispatch),
});

PivotContent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  description: PropTypes.objectOf(PropTypes.string).isRequired,
  view: PropTypes.string.isRequired,
  handleFlyout: PropTypes.func.isRequired,
  currentAccount: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    voteAdminOut: PropTypes.func,
    voteCandidateIn: PropTypes.func,
  }).isRequired,
};

export default connect(null, mapDispatchToProps)(PivotContent);
