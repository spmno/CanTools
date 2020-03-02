import React, {Component} from 'react';
import App from './App';
import NetManager from './NetManager'
import Diagnose from './DiagnoseManager'
import ProtocalChecker from './ProtocolChecker'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import { Layout, Menu, Icon } from 'antd';
const { Sider, Content } = Layout;
const SubMenu = Menu.SubMenu; 

class AppLayout extends Component {

    render() {
        return (
            <Router>
                <Layout>
                <Sider width={240} style={{ minHeight: '100vh' }}>
                    <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                        <Menu.Item key="1">
                            <Link to="/">
                                <Icon type="home" />
                                <span>首页</span>
                            </Link>
                        </Menu.Item>
                        <Menu.Item key="2">
                            <Link to="/netmanager">
                                <Icon type="api" />
                                <span>网络管理</span>
                            </Link>
                        </Menu.Item>
                        <SubMenu key="sub1" title={<span><Icon type="dashboard" /><span>诊断相关</span></span>} >
                            <Menu.Item key="3">
                                <Link to="/diagnose">
                                    基本配置
                                </Link>
                            </Menu.Item>
                            <Menu.Item key="4">监控页</Menu.Item>
                            <Menu.Item key="5">工作台</Menu.Item>
                        </SubMenu>
                        <Menu.Item key="6">
                            <Link to="/protocol-checker">
                                <Icon type="tool" />
                                <span>32960工具</span>
                            </Link>
                        </Menu.Item>
                    </Menu>

                </Sider>
                <Layout >
                <Content style={{ margin: '1', minHeight: '100vh' }}>
                    <div style={{ padding: 20, background: '#fff', minHeight: 480 }}>
                    <Switch>
                        <Route exact path="/" component={App} />
                        <Route path="/netmanager" component={NetManager} />
                        <Route path="/diagnose" component={Diagnose} />
                        <Route path="/protocol-checker" component={ProtocalChecker} />
                    </Switch>
                    </div>
                </Content>
                </Layout>
            </Layout>
            </Router>
        );
    }
}

export default AppLayout;