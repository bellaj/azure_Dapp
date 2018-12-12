import { combineReducers } from 'redux';
import adminReducer from './adminReducer';
import validatorReducer from './validatorReducer';
import userReducer from './userReducer';

const rootReducer = combineReducers({
  administrator: adminReducer,
  validator: validatorReducer,
  user: userReducer,
});

export default rootReducer;
