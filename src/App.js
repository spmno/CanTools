import React, {Component} from 'react';
import './App.css';
import {Button, ButtonToolbar,} from 'react-bootstrap';

const { ipcRenderer } = window.require('electron')

class App extends Component {

    componentWillMount() {
        ipcRenderer.on('start-canbox-complete', (event, arg) => {
            console.log('start complete.');
        });
    }

    _showAlert() {
        alert('Hello');
        console.log('hello where.');
    }

    showLog = () => {
      console.log("where hello");
      ipcRenderer.send('start-canbox', 'start command');
    }

    render() {
        return (
            <div className="App">
                <ButtonToolbar>
                    {/* Standard button */}
                    <Button onClick={this._showAlert.bind(this)}>Default</Button>

                    {/* Provides extra visual weight and identifies the primary action in a set of buttons */}
                    <Button variant="primary" onClick={this.showLog}>Primary</Button>

                    {/* Indicates a successful or positive action */}
                    <Button variant="success">Success</Button>

                    {/* Contextual button for informational alert messages */}
                    <Button variant="info">Info</Button>

                    {/* Indicates caution should be taken with this action */}
                    <Button variant="warning">Warning</Button>

                    {/* Indicates a dangerous or potentially negative action */}
                    <Button variant="danger">Danger</Button>

                    {/* Deemphasize a button by making it look like a link while maintaining button behavior */}
                    <Button variant="link" href='http://www.baidu.com'>Link</Button>
                </ButtonToolbar>
            </div>
        );
    }
}

export default App;