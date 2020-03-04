import React, {Component} from 'react';
import './App.css';
import { Button, Row, Col, Table } from 'antd'
const { ipcRenderer } = window.require('electron')


class App extends Component {

  columns = [
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
      width: 200,
    },
    {
      title: "ID",
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      width: 500,
    }
  ];

  constructor(props) {
    super(props)
    this.state = {
        displayInfo: [{key:1, time:"0", id: "0", data:"0 0 0 0 0 0 0 0"}]
    }
    this.isStartTest = false;
    this.displayRow = 20;
    this.loopRow = 15;
    this.displayContent = [];
    this.currentLine = 0;
    this.dataMap = new Map();
    this.currentId = "";
    this.currentData = "";
  }

  componentDidMount() {
    ipcRenderer.on('netmanager-callback', (event, arg) => {
        console.log('callback:', arg);
        this.updateDisplayInfo(arg);
    });

    ipcRenderer.on('start-canbox-complete', (event, arg) => {
      console.log('start-canbox-complete', arg);
      alert(arg);
    });
  }

  componentWillUnmount() {
      ipcRenderer.send('netmanager', 'stop');
  }

  updateDisplayInfo = (arg) => {
    let key = 1;
    let time = (new Date()).valueOf();
    this.currentData = arg.split(',');
    //data[0] -> id, data[1] -> data+time array
    this.dataMap.set(this.currentData[0], [this.currentData[1], time]);
    for (const [id, value] of this.dataMap) {
      this.displayContent[key-1] = {key: key, time: value[1], id: id, data: value[0]}
      key++;
    }
    key = 1;
    this.setState({
        displayInfo: this.displayContent
    });
  }


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

  receiveMessage = () => {
    this.isStartTest = true;
    ipcRenderer.send('netmanager', 'start');
  }

  stopReceive = () =>　{
    this.isStartTest = false;
    ipcRenderer.send('netmanager', 'stop');
  }

  render() {
      return (
        <div>
          <h3>欢迎使用CANTBOX工具</h3>
          <Table columns={this.columns} dataSource={this.displayContent} />
          <Row type="flex" justify="start" gutter={[16, 32]} >
            <Col span={4} >
              <Button onClick = {this.startBox} >打开盒子</Button>
            </Col>
            <Col span={4} >
              <Button onClick = {this.closeBox} >关闭盒子</Button>
            </Col>
            <Col span={4} >
            <Button onClick = {this.receiveMessage} >接收报文</Button>
            </Col>
            <Col span={4} >
            <Button onClick = {this.stopReceive} >停止接收</Button>
            </Col>
          </Row>
          </div>
      );
  }
}

export default App;