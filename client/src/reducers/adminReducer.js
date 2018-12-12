import * as types from '../actions/actionTypes';

const initialState = {
  validatorCapacity: 0,
  userLoggedIn: false,
  isAdmin: null,
};

export default function adminReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_MEMBERS:
      return {
        ...state,
        members: action.payload,
      };

    case types.SET_CANDIDATES:
      return {
        ...state,
        candidates: action.payload,
      };

    case types.IS_ADMIN:
      return {
        ...state,
        isAdmin: action.payload,
      };

    case types.IS_TOAST_VISIBLE:
      return {
        ...state,
        isToastVisible: action.payload,
      };

    case types.SET_TOAST_MESSAGE:
      return {
        ...state,
        toastMessage: action.payload,
      };

    default:
      return state;
  }
}
