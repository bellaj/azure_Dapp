import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { isEqual } from 'lodash';
import Loading from '../loading/loading';
import ValidatorsBody from './validatorsBody';
import { validatorColumnsNames } from '../../common/constants';
import { getNodes } from '../../actions/userActions';
import { addValidators, showAddValidatorOption } from '../../actions/validatorActions';
import './validators.scss';

class Validators extends Component {
  constructor(props) {
    super(props);
    const columns = this.renderColumns();
    this.state = {
      columns,
    };
  }

  componentDidMount() {
    if (!this.props.nodeInfo) {
      this.props.actions.getNodes();
    }
    this.props.actions.showAddValidatorOption();
  }

  shouldComponentUpdate(nextProps) {
    if (
      this.props.nodeInfo !== nextProps.nodeInfo ||
      this.props.currentAlias !== nextProps.currentAlias ||
      this.props.members !== nextProps.members ||
      this.props.isAdmin !== nextProps.isAdmin ||
      this.props.showAddValidatorButton !== nextProps.showAddValidatorButton ||
      !isEqual(this.props.isLoadingValidators, nextProps.isLoadingValidators) ||
      !isEqual(this.props.validatorNodes, nextProps.validatorNodes)
    ) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.nodeInfo !== prevProps.nodeInfo ||
      this.props.isAdmin !== prevProps.isAdmin ||
      this.props.showAddValidatorButton !== prevProps.showAddValidatorButton ||
      !isEqual(this.props.isLoadingValidators, prevProps.isLoadingValidators) ||
      !isEqual(this.props.validatorNodes, prevProps.validatorNodes)
    ) {
      this.props.actions.showAddValidatorOption();
    }

    if (
      !isEqual(this.props.isLoadingValidators, prevProps.isLoadingValidators) ||
      !isEqual(this.props.validatorNodes, prevProps.validatorNodes) ||
      this.props.showAddValidatorButton !== prevProps.showAddValidatorButton
    ) {
      this.validatorDisplay();
    }
  }

  handleClick = () => {
    this.props.actions.addValidators();
  }

  validatorDisplay = () => {
    if (this.props.validatorNodes) {
      return (
        <ValidatorsBody
          showList={this.props.validatorNodes}
          columns={this.state.columns}
          items={this.props.validatorNodes}
          validatorCapacity={this.props.validatorCapacity}
        />
      );
    } else if (this.props.showAddValidatorButton) {
      return (
        <ValidatorsBody
          currentAlias={this.props.currentAlias}
          validatorCapacity={this.props.validatorCapacity}
          handleClick={this.handleClick}
          showAddValidatorButton={this.props.showAddValidatorButton}
        />
      );
    } else if (this.props.isLoadingValidators) {
      return (
        <ValidatorsBody
          currentAlias={this.props.currentAlias}
          validatorCapacity={this.props.validatorCapacity}
          isLoadingValidators={this.props.isLoadingValidators}
        />
      );
    }
    return <div>cannot see this page</div>;
  }

  renderColumns = () => validatorColumnsNames.map((column, index) => {
    let maxWidth = 150;
    let minWidth = 70;
    if (column.fieldName === 'address') {
      maxWidth = 280;
      minWidth = 70;
    }

    const newColumn = {
      key: `column${index}`,
      name: column.name,
      isResizable: true,
      fieldName: column.fieldName,
      maxWidth,
      minWidth,
      onColumnClick: this.onColumnClick,
      isSorted: false,
      isSortedDecending: false,
      isRowHeader: true,
    };

    if (newColumn.fieldName === 'nodeType') {
      newColumn.onRender = item => (<div>{item.nodeType} node</div>);
    }

    return newColumn;
  })

  render() {
    const {
      nodeInfo, isAdmin,
    } = this.props;

    if (typeof nodeInfo === 'string' || !nodeInfo || isAdmin === null) {
      return <Loading />;
    }


    return (
      <div className="validators-page">
        {this.validatorDisplay()}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  nodeInfo: state.user.data,
  validatorCapacity: state.user.validatorCapacity,
  currentAlias: state.user.currentAlias,
  isLoadingValidators: state.validator.isLoadingValidators,
  members: state.administrator.members,
  isAdmin: state.administrator.isAdmin,
  showAddValidatorButton: state.validator.showAddValidatorButton,
  validatorNodes: state.validator.validatorNodes,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    addValidators,
    showAddValidatorOption,
    getNodes,
  }, dispatch),
});

Validators.propTypes = {
  nodeInfo: PropTypes.shape({
    nodeRows: PropTypes.arrayOf(PropTypes.object),
  }),
  validatorCapacity: PropTypes.number,
  currentAlias: PropTypes.string,
  isLoadingValidators: PropTypes.bool,
  actions: PropTypes.shape({
    addValidators: PropTypes.func,
    showAddValidatorOption: PropTypes.func,
    getNodes: PropTypes.func,
  }).isRequired,
  showAddValidatorButton: PropTypes.bool,
  isAdmin: PropTypes.bool,
  validatorNodes: PropTypes.arrayOf(PropTypes.object),
  members: PropTypes.arrayOf(PropTypes.object),
};

Validators.defaultProps = {
  nodeInfo: null,
  validatorCapacity: '',
  currentAlias: '',
  isLoadingValidators: false,
  showAddValidatorButton: null,
  isAdmin: null,
  validatorNodes: null,
  members: null,
};

export default connect(mapStateToProps, mapDispatchToProps)(Validators);
