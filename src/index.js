import React from 'react';
import { render } from 'react-dom';
// import './styles/index.css';
import './i18n';
import App from './components/App';

document.addEventListener('DOMContentLoaded', () => {
  render(<App/>, document.getElementById('root'));
});
