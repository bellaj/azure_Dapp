import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import './index.scss';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import store, { history } from './store/configureStore';
import MyRoute from './components/auth/route';

initializeIcons();
ReactDOM.render(
  <Provider store={store}>
    <Router history={history} >
      <MyRoute component={App} />
    </Router>
  </Provider>,
  document.getElementById('root'),
);
registerServiceWorker();
