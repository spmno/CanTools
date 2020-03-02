import React, {Component} from 'react';
import './App.css';
import './AppLayout'
import AppLayout from './AppLayout';
import { Button, Row, Col } from 'antd'

const { ipcRenderer } = window.require('electron')


class App extends Component {

    _showAlert() {
        alert('Hello');
        console.log('hello where.');
    }

    startBox = () => {
      console.log("start box");
      ipcRenderer.send('start-canbox', 'start command');
    }

    closeBox = () => {
      console.log("close box");
      ipcRenderer.send('close-canbox', 'close command');
    }

    render() {
        return (
          <div>
            <h1>欢迎使用CANTBOX工具</h1>
            <br/>
            <Row type="flex" justify="start" gutter={[16, 32]} >
              <Col span={4} >
                <Button onClick = {this.startBox} >打开盒子</Button>
              </Col>
              <Col span={4} >
                <Button onClick = {this.closeBox} >关闭盒子</Button>
              </Col>
            </Row>
            </div>
        );
    }
}

export default App;