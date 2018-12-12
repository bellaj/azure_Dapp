import * as types from '../actions/actionTypes';

const initialState = {
  isLoadingValidators: false,
  showAddValidatorButton: null,
};

export default function validatorReducer(state = initialState, action) {
  switch (action.type) {
    case types.SET_LOADING_VALIDATORS:
      return {
        ...state,
        isLoadingValidators: action.payload,
      };

    case types.SHOW_ADD_VALIDATOR_BUTTON:
      return {
        ...state,
        showAddValidatorButton: action.payload,
      };

    case types.SET_VALIDATORS:
      return {
        ...state,
        validatorNodes: action.payload,
      };

    default:
      return state;
  }
}
