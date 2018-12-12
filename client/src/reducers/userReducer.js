import * as types from '../actions/actionTypes';

const initialState = {
  validatorCapacity: 0,
  userLoggedIn: false,
  isAdmin: false,
  error: {
    webServerNetworkError: '',
  },
};

export default function userReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_NODES:
      return {
        ...state,
        data: action.payload,
      };

    case types.SAVE_HELPER:
      return {
        ...state,
        helper: action.payload,
      };

    case types.SET_ACCOUNT:
      return {
        ...state,
        currentAccount: action.payload,
      };

    case types.SET_WEB_SERVER_NETWORK_ID:
      return {
        ...state,
        webServerNetworkId: action.payload,
      };

    case types.SET_WEB_SERVER_NETWORK_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          webServerNetworkError: action.payload,
        },
      };

    case types.SET_BLOCK_ERROR:
      return {
        ...state,
        error: {
          ...state.error,
          blockError: action.payload,
        },
      };

    case types.SET_VALIDATOR_CAPACITY:
      return {
        ...state,
        validatorCapacity: action.payload,
      };

    case types.CURRENT_ALIAS:
      return {
        ...state,
        currentAlias: action.payload,
      };

    case types.USER_LOGGED_IN:
      return {
        ...state,
        userLoggedIn: action.payload,
      };

    case types.SAVE_BASE_NETWORKINFO:
      return {
        ...state,
        baseNetworkInfo: action.payload,
      };

    case types.SET_CONSORTIUM_NAME:
      return {
        ...state,
        consortiumName: action.payload,
      };

    default:
      return state;
  }
}
