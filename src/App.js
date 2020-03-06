import React, {Component} from 'react';
import './App.css';
import { Button, Row, Col, Table, Input, message } from 'antd'
const { ipcRenderer } = window.require('electron')

const div1 = {
  margin: "3px 0px"
};

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
        displayInfo: [{key:1, time:"0", id: "0", data:"0 0 0 0 0 0 0 0"}],
        id:"",
        data:""
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
      message.info(arg);
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

  sendData = () => {
    const id = parseInt(this.state.id, 16);
    console.log(id);
    const data = this.state.data.slice(0, -1);
    const dataArray = data.split(',').map(x => parseInt(x, 16));
    const dataBuffer = new Uint8Array(dataArray).buffer;
    console.log('databuffer:', dataBuffer);
    ipcRenderer.send('send-buffer', [id, dataBuffer]);
  }

  handleChange = (event) => {
    console.log(event, ",", event.target.value);
    const field = event.target.name;
    this.setState({
        [field]: event.target.value
    })
  }

  handleDataChange = (event) => {
    console.log(event, ",target:", event.target.value, ',state:', this.state.data);
    if (event.target.value.length > 2*8+7) {
      message.warning('长度够了');
      return;
    }
    if ((event.target.value.length+1)%3 === 0) {
      if (event.target.value.length > this.state.data.length) {
        this.setState ({
          data: event.target.value + ','
        }); 
      } else {
        this.setState ({
          data: event.target.value.slice(0, -1)
        });
      }

    } else {
      this.setState ({
        data: event.target.value
      });
    }
  }

  render() {
      return (
        <div>
          <h3>欢迎使用CANTBOX工具</h3>
          
          <Row type="flex" justify="start" gutter={[16, 32]} style={div1}>
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
          <Table columns={this.columns} dataSource={this.displayContent} />
          <Row gutter={[16, 32]} style={div1}>
            <Col span={1}>ID:</Col>
            <Col span={3}><Input name='id' value={this.state.id} onChange={this.handleChange}></Input></Col>
            <Col span={2}>Data:</Col>
            <Col span={10}><Input name='data' value={this.state.data} onChange={this.handleDataChange}></Input></Col>
            <Col span={2}><Button onClick = {this.sendData} >发送</Button></Col>
          </Row>
          </div>
      );
  }
}

export default App;