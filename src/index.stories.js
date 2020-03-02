import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Layout, Menu, Icon } from 'antd';
const { Sider, Content } = Layout;
//import NetManager from './NetManager'
import Diagnose from './DiagnoseManager'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import 'antd/dist/antd.css';

export default {
    title: 'Route',
    component: Router,
};

export const embeded = () => (<Router>
<Switch>
    <Route exact path="/" component={App} />
    <Route path="/diagnose" component={Diagnose} />
</Switch>
</Router>);