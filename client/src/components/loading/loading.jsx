import React from 'react';
import PropTypes from 'prop-types';
import { PrimaryButton } from 'office-ui-fabric-react/lib/Button';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getNodes } from '../../actions/userActions';

const Loading = ({ ...props }) => (
  <div>
      Waiting on local ethereum node to boot...
    <PrimaryButton
      text="Refresh"
      onClick={() => props.actions.getNodes()}
    />
  </div>
);

Loading.propTypes = {
  actions: PropTypes.shape({
    getNodes: PropTypes.func,
  }).isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    getNodes,
  }, dispatch),
});

export default connect(null, mapDispatchToProps)(Loading);
