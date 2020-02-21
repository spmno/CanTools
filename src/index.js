import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import NetManager from './NetManager'
import Diagnose from './DiagnoseManager'
import ProtocalChecker from './ProtocolChecker'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import * as serviceWorker from './serviceWorker';
import 'antd/dist/antd.css';

ReactDOM.render(<Router>
                    <Switch>
                        <Route exact path="/" component={App} />
                        <Route path="/netmanager" component={NetManager} />
                        <Route path="/diagnose" component={Diagnose} />
                        <Route path="/protocol-checker" component={ProtocalChecker} />
                    </Switch>
                </Router>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
