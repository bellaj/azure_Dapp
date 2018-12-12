import React from 'react';
import PropTypes from 'prop-types';
import { DetailsList, SelectionMode, DetailsListLayoutMode } from 'office-ui-fabric-react/lib/DetailsList';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { Link } from 'office-ui-fabric-react/lib/Link';
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import Description from '../description/description';
import { inWords } from '../../common/utils';
import Header from '../header/header';
import ValidatorSplash from '../../assets/icons/validatorSplash.svg';
import './validators.scss';

const ValidatorsBody = ({ ...props }) => {
  const getDescription = () => {
    const numToWord = inWords(props.validatorCapacity);
    const link = () => (
      (<Link href="https://aka.ms/ethereum-poa-deployment-guide" target="_blank">Learn more <span><Icon iconName="Share" /></span></Link>)
    );
    if (props.showList) {
      return {
        top: `Validator nodes participate in the consensus. Each administrator is allowed ${numToWord}. `,
        link: link(),
      };
    }
    return {
      top: `Validator nodes participate in the consensus. Each administrator is allowed ${numToWord}.`,
      bottom: 'Click the Add my validators button to begin.',
    };
  };

  if (props.showList) {
    return (
      <div className="validators-body">
        <Header
          className="header-container"
          headerText="Validators"
        />
        <Description
          className="description-container"
          description={getDescription()}
        />
        <DetailsList
          className="validators-list"
          items={props.items}
          columns={props.columns}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.justified}
          isHeaderVisible
        />
      </div>
    );
  }

  return (
    <div className="no-validators">
      <img src={ValidatorSplash} alt="validator splash" />
      <Header
        className="header-container-splash"
        headerText={`Welcome, ${props.currentAlias}`}
      />
      <Description
        className="description-container-center"
        description={getDescription()}
      />
      {props.isLoadingValidators ? (
        <p className="addValidatorsMessage">
          <span>
            <Icon
              iconName="Sync"
              className="syncIcon"
            />
          </span>
          Adding your validators ...
        </p>
        ) : (
          <ActionButton
            text="Add my validators"
            primary
            className="custom-actionButton"
            onClick={props.handleClick}
          />
        )
      }

    </div>
  );
};

ValidatorsBody.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  showValidators: PropTypes.bool.isRequired,
  validatorCapacity: PropTypes.number.isRequired,
  currentAlias: PropTypes.string.isRequired,
  handleClick: PropTypes.func,
  isLoadingValidators: PropTypes.bool,
  showList: PropTypes.bool,
};

ValidatorsBody.defaultProps = {
  handleClick: null,
  isLoadingValidators: false,
  showList: false,
};

export default ValidatorsBody;
