import React, {Component} from 'react';
import './App.css';
import './AppLayout'
import AppLayout from './AppLayout';
import { Button } from 'antd'

const { ipcRenderer } = window.require('electron')


class App extends Component {

  componentDidMount() {
        ipcRenderer.on('start-canbox-complete', (event, arg) => {
            console.log('start complete.');
        });
    }

    _showAlert() {
        alert('Hello');
        console.log('hello where.');
    }

    startBox = () => {
      console.log("where hello");
      ipcRenderer.send('start-canbox', 'start command');
    }

    render() {
        return (
          <AppLayout>
            <h1>欢迎使用CANTBOX工具</h1>
            <Button onClick = {this.startBox} >打开盒子</Button>
          </AppLayout>
        );
    }
}

export default App;