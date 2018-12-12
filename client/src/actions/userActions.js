import Web3 from 'web3';
import * as types from './actionTypes';
import ValidatorContract from '../common/validatorContract';
import { getAdmins, getCandidates, isToastVisible, setToastMessage, startToastTimer } from '../actions/adminActions';
import { showAddValidatorOption } from '../actions/validatorActions';
import { setBlockErrorMessage } from '../common/constants';
import { helper, setHelper } from '../common/utils';

const { web3 } = window;
let localWeb3;
// eslint-disable-next-line no-unused-vars
let accountInterval;

const setNodes = data => ({
  type: types.SET_NODES,
  payload: data,
});

const setAccount = account => ({
  type: types.SET_ACCOUNT,
  payload: account,
});

const currentAccountAlias = alias => ({
  type: types.CURRENT_ALIAS,
  payload: alias,
});

const setWebServerNetworkId = id => ({
  type: types.SET_WEB_SERVER_NETWORK_ID,
  payload: id,
});

const setWebServerNetworkError = rpcEndpoint => ({
  type: types.SET_WEB_SERVER_NETWORK_ERROR,
  payload: rpcEndpoint,
});

const showLogInError = bool => ({
  type: types.SHOW_LOG_IN_ERROR,
  payload: bool,
});

const saveHelper = object => ({
  type: types.SAVE_HELPER,
  payload: object,
});

const saveBaseNetworkInfo = object => ({
  type: types.SAVE_BASE_NETWORKINFO,
  payload: object,
});

const setBlockError = error => ({
  type: types.SET_BLOCK_ERROR,
  payload: error,
});

const setValidatorCapacity = capacityNumber => ({
  type: types.SET_VALIDATOR_CAPACITY,
  payload: capacityNumber,
});

const setConsortiumName = consortiumName => ({
  type: types.SET_CONSORTIUM_NAME,
  payload: consortiumName,
});

const getAccounts = () => (dispatch) => {
  let signedInAccount;
  localWeb3.eth.getAccounts((error, accounts) => {
    if (`${accounts[0]}` === 'undefined') {
      dispatch(showLogInError(true));
    } else {
      [signedInAccount] = accounts;
      dispatch(setAccount(signedInAccount));
      helper.GetAliasForAdmin(signedInAccount)
        .then((res) => {
          console.log(`Current Account Alias ${res}`);
          dispatch(currentAccountAlias(res));
        });
    }
    accountInterval = setInterval(() => {
      localWeb3.eth.getAccounts((err, acc) => {
        if (acc[0] !== signedInAccount) {
          window.location.reload();
        }
      });
    }, 100);
  });
};

const getValidatorCapacity = () => (dispatch) => {
  helper.GetValidatorCapacityAsync()
    .then((res) => {
      dispatch(setValidatorCapacity(Number(res.toString())));
    });
};

const checkSameNetwork = (paritySpec, rpcEndpoint) => dispatch => new Promise((resolve, reject) => {
  localWeb3.version.getNetwork((error, networkId) => {
    const webServerNetworkId = parseInt(paritySpec.params.networkID, 16);
    if (webServerNetworkId !== Number(networkId)) {
      dispatch(setWebServerNetworkError(rpcEndpoint));
      resolve(false);
    }
    dispatch(setWebServerNetworkId(webServerNetworkId));
    resolve(true);
  });
});

const getBlock = baseNetworkInfo => (dispatch) => {
  localWeb3.eth.getBlock(baseNetworkInfo.recentBlock.number, ((error, result) => {
    console.log(`Web Server recent block# ${baseNetworkInfo.recentBlock.number} - hash: ${baseNetworkInfo.recentBlock.hash}`);
    console.log(`Local web3 hash: ${result.hash}`);
    if (baseNetworkInfo.recentBlock.hash !== result.hash) {
      dispatch(setBlockError(setBlockErrorMessage));
    }
  }));
};

export const updateConsortiumName = consortiumName => (dispatch) => {
  console.log(consortiumName, 'in actions');
  helper.SetConsortiumName(consortiumName)
    .then((txHash) => {
      dispatch(setToastMessage({
        row1: 'You updated the consortium name',
        row2: txHash,
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log('Updated consortium name');
    })
    .catch((error) => {
      dispatch(setToastMessage({
        row1: 'You cancelled your request',
      }));
      dispatch(isToastVisible(true));
      dispatch(startToastTimer());
      console.log(error, 'transaction cancelled');
    });
};

export const getConsortiumName = () => (dispatch) => {
  helper.GetConsortiumName().then(consortiumName => dispatch(setConsortiumName(consortiumName)));
};

export const getNetworkInfo = () => async (dispatch, getState) => {
  console.log('getNetworkInfo -- actions ');
  try {
    const isLoaded = false;
    const response = await fetch(`${location.protocol}//${location.hostname}:3001/networkinfo`);
    const baseNetworkInfo = await response.json();
    console.log(`NetworkInfo returned: ${baseNetworkInfo}`);
    const paritySpec = JSON.parse(baseNetworkInfo.paritySpec);
    const nodeInfo = getState().user;

    if (typeof nodeInfo.data === 'object' && typeof helper === 'undefined') {
      let web3Provider = new Web3.providers.HttpProvider(nodeInfo.data.rpcEndpoint);
      localWeb3 = new Web3(web3Provider);

      // Modern dapp browsers...
      if (window.ethereum) {
        localWeb3= new Web3(window.ethereum);
          try {
              // Request account access if needed
              await window.ethereum.enable();
              // Acccounts now exposed
          } catch (error) {
              // User denied account access...
              console.log('User denied account access');
              localWeb3 = new Web3(web3Provider);
          }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        localWeb3 = new Web3(web3.currentProvider);
      }

      dispatch(checkSameNetwork(paritySpec, nodeInfo.data.rpcEndpoint))
        .then((res) => {
          if (!res) {
          // if not on the same network, then reset it to use the HttpProvider
            web3Provider = new Web3.providers.HttpProvider(nodeInfo.data.rpcEndpoint);
            localWeb3 = new Web3(web3Provider);
          }

          setHelper(new ValidatorContract(
            localWeb3,
            nodeInfo.data.contractAbi,
            (() => isLoaded),
          ));

          dispatch(saveBaseNetworkInfo(baseNetworkInfo));
          dispatch(saveHelper(helper));

          dispatch(getAccounts());
          dispatch(getBlock(baseNetworkInfo));
          dispatch(getAdmins());
          dispatch(getValidatorCapacity());
          dispatch(showAddValidatorOption());
          dispatch(getConsortiumName());
          helper.RegisterAdminSetSubscription(() => dispatch(getAdmins()));
          helper.RegisterCandidateSetSubscription(() => dispatch(getCandidates()));
          helper.RegisterAdminAliasSubscription(() => {
            dispatch(getAccounts());
            dispatch(getAdmins());
          });
          helper.RegisterVotesAgainstAdminSubscription(() => dispatch(getAdmins()));
          helper.RegisterVotesForProposedAdminSubscription(() => {
            dispatch(getCandidates());
            dispatch(getAdmins());
          });
          helper.RegisterConsortiumNameSubscription(() => dispatch(getConsortiumName()));
          helper.RegisterValidatorSetSubscription(() => dispatch(showAddValidatorOption()));
        });
    }
  } catch (error) {
    console.log(error);
  }
};


export const getNodes = () => (dispatch) => {
  console.log('getNodes -- actions');
  fetch(`${location.protocol}//${location.hostname}:3001/getNodes`)
    .then(res => res.json())
    .then((jsonData) => {
      dispatch(setNodes(jsonData.data));
      dispatch(getNetworkInfo());
    })
    .catch(error => console.log(error));
};
