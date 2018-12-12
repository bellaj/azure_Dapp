import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { dismissToast } from '../../actions/adminActions';
// ACTIONS
import './notification.scss';

const Notification = ({ ...props }) => {
  const onDismissNotification = () => {
    props.actions.dismissToast(false);
  };

  if (props.isToastVisible) {
    return (
      <div className="notification" >
        <p>{props.toastMessage.row1}</p>
        <p>{props.toastMessage.row2}</p>
        <div className="notification-dismiss" >
          <span onClick={onDismissNotification} role="button" onKeyPress={onDismissNotification} tabIndex="0" >
            <Icon iconName="ChromeClose" />
          </span>
        </div>
      </div>
    );
  }
  return <div className="no-notification" />;
};


const mapStateToProps = state => ({
  toastMessage: state.administrator.toastMessage,
  isToastVisible: state.administrator.isToastVisible,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({
    dismissToast,
  }, dispatch),
});

Notification.propTypes = {
  isToastVisible: PropTypes.bool,
  toastMessage: PropTypes.string,
  actions: PropTypes.shape({
    dismissToast,
  }).isRequired,
};

Notification.defaultProps = {
  isToastVisible: false,
  toastMessage: '',
};

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
