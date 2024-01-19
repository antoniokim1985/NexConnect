import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Layout from '../src/front/js/layout.js';
import './front/styles/styles.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import 'jquery';
import 'popper.js';


ReactDOM.render(<Layout/>, document.querySelector("#app"))