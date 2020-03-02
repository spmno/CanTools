import React, { Component } from 'react'
import { Button, Row, Col, Input, Form } from 'antd'


const { TextArea } = Input;

const { ipcRenderer } = window.require('electron');

const div1 = {
    margin: "5px 0px"
};

const divCenter = {
    padding:"2px"
}

class NetManager extends Component {

    constructor(props) {
        super(props)
        this.state = {
            displayInfo: "请先输入网络管理ID"
        }
        this.isStartTest = false;
        this.displayRow = 20;
        this.loopRow = 15;
        this.displayContent = "";
        this.currentLine = 0;
    }

    componentDidMount() {
        ipcRenderer.on('netmanager-callback', (event, arg) => {
            console.log('callback:', arg);
            this.updateDisplayInfo(arg);
        });
    }

    componentWillUnmount() {
        ipcRenderer.send('netmanager', 'stop');
    }

    updateDisplayInfo = (arg) => {
        if (this.isStartTest) {
            if (this.currentLine === this.loopRow) {
                this.displayContent = arg[0] + "," + arg[1];
                this.displayContent += "\r\n";
                this.currentLine = 0;
            } else {
                this.displayContent += arg[0] + "," + arg[1];
                this.displayContent += "\r\n";
                this.currentLine++;
            }
        }
        this.setState({
            displayInfo: this.displayContent
        });
    }

    startNetManager = () => {
        this.isStartTest = true;
        ipcRenderer.send('netmanager', 'start');
    }

    render() {
        return (
            <div>
                <Row type="flex" justify="start" >
                    <Col span={4} style={divCenter}>
                    NetManager ID: 
                    </Col>
                    <Col span={6}>
                    <Input style={divCenter}></Input>
                    </Col>
                </Row>
                <TextArea rows={ this.displayRow } 
                    defaultValue={"请先输入网络管理ID"} 
                    value={this.state.displayInfo}
                    style={div1} >
                </TextArea>
                <Row>
                    <Button onClick={this.startNetManager}>开始测试</Button>
                </Row>
            </div>
        );
    }
}

export default NetManager;