import React from 'react';
import ReactDOM from 'react-dom';
import App from './app.jsx';
import { GlobalStyles } from './styles';

ReactDOM.render(
  <React.Fragment>
    <GlobalStyles />
    <App />
  </React.Fragment>,
  document.getElementById('app')
);
