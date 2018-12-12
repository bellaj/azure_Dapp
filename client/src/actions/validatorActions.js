import * as types from './actionTypes';
import { localStorageService } from '../services';
import { containsIgnoreCase, helper } from '../common/utils';

const setLoadingValidators = bool => ({
  type: types.SET_LOADING_VALIDATORS,
  payload: bool,
});

const setValidators = validatorNodes => ({
  type: types.SET_VALIDATORS,
  payload: validatorNodes,
});

const getValidators = () => (dispatch, getState) => {
  const { data } = getState().user;
  helper.GetValidators()
    .then((res) => {
      const { nodeRows } = data;
      const modifiedNodeRows = nodeRows.map((nodeRow) => {
        if (res.includes(nodeRow.address)) {
          return {
            ...nodeRow,
            nodeType: 'Validator',
          };
        }
        return {
          ...nodeRow,
          nodeType: 'Transaction',
        };
      });
      dispatch(setValidators(modifiedNodeRows));
    });
};

const showAddValidatorsButton = bool => ({
  type: types.SHOW_ADD_VALIDATOR_BUTTON,
  payload: bool,
});


export const showAddValidatorOption = () => (dispatch, getState) => {
  console.log('shouldShowAddValidatorOption -- VALIDATOR ACTIONS');
  const {
    currentAccount, baseNetworkInfo, validatorCapacity,
  } = getState().user;
  const { isAdmin } = getState().administrator;
  const { isLoadingValidators } = getState().validator;
  if (isAdmin) {
    helper.GetValidatorsForAdmin(currentAccount).then((validatorsResult) => {
      if (validatorsResult.length >= validatorCapacity) {
        dispatch(showAddValidatorsButton(false));
        dispatch(getValidators());
      } else {
        helper.GetValidators().then((validators) => {
          const transactionNodes = baseNetworkInfo.nodeMetadata.some(node =>
            !containsIgnoreCase(validators, node.address));
          if (transactionNodes && isLoadingValidators) {
            console.log('current loading nodes');
          } else if (transactionNodes) {
            dispatch(showAddValidatorsButton(true));
            dispatch(setValidators());
          } else {
            dispatch(setLoadingValidators(false));
            dispatch(getValidators());
          }
        });
      }
    });
  }
};

export const addValidators = () => (dispatch, getState) => {
  const {
    validatorCapacity,
  } = getState().user;
  dispatch(showAddValidatorsButton(false));
  dispatch(setLoadingValidators(true));
  fetch(`${location.protocol}//${location.hostname}:3001/selectValidators/${validatorCapacity}`)
    .then(response => response.json())
    .then((listOfAddresses) => {
      helper.AddValidators(listOfAddresses)
        .then((res) => {
          console.log('adding validators');
        })
        .catch((err) => {
          dispatch(showAddValidatorsButton(true));
          dispatch(setLoadingValidators(false));
        });
    });
};

