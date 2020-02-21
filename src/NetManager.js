import React, { Component } from 'react'
import AppLayout from './AppLayout'
import { Button, Row, Col, Input } from 'antd'

const { TextArea } = Input;

const { ipcRenderer } = window.require('electron')

class NetManager extends Component {

    constructor(props) {
        super(props)
        this.state = {
            displayInfo: "请先输入网络管理ID"
        }
        this.isStartTest = false;
        this.displayRow = 20;
        this.displayContent = "";
        this.currentLine = 0;
    }

    componentWillMount() {
        ipcRenderer.on('netmanager-callback', (event, arg) => {
            console.log('callback:', arg);
            this.updateDisplayInfo(arg);
        });
    }

    updateDisplayInfo = (arg) => {
        if (this.isStartTest) {
            if (this.currentLine === this.displayRow) {
                this.displayContent = arg;
                this.displayContent += "\r\n";
                this.currentLine = 0;
            } else {
                this.displayContent += arg;
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
        ipcRenderer.send('netmanager', 'start command');
    }

    render() {
        return (
            <AppLayout>
                <Row type="flex" justify="start">
                    <Col span="4">
                    NetManager ID: 
                    </Col>
                    <Col span="6">
                    <Input></Input>
                    </Col>
                </Row>
                <div  style={{ margin: '20' }}>
                    <TextArea rows={ this.displayRow } 
                        defaultValue={"请先输入网络管理ID"} 
                        value={this.state.displayInfo}
                        style={{ margin: '5' }} >
                    </TextArea>
                </div>
                <Row>
                    <Button onClick={this.startNetManager}>开始测试</Button>
                </Row>
            </AppLayout>
        );
    }
}

export default NetManager;