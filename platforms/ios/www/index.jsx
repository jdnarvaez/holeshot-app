import React from 'react';
import ReactDOM from 'react-dom';
import Application from '../src/components/Application';


if (window.cordova) {
  document.addEventListener('deviceready', () => {
    ReactDOM.render(React.createElement(Application, {}), document.getElementById('root'));
  }, false);
} else {
  ReactDOM.render(React.createElement(Application, {}), document.getElementById('root'));
}
