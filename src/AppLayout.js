import React, {Component} from 'react';
import './App.css';
import { Layout, Menu, Icon } from 'antd';
import { Link } from 'react-router-dom';
const { Sider, Content } = Layout;
const SubMenu = Menu.SubMenu; 

class AppLayout extends Component {


    render() {
        return (
            <Layout>
            <Sider width={240} style={{ minHeight: '100vh' }}>
                <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
                    <Menu.Item key="1">
                    <Link to="/netmanager">
                        <Icon type="pie-chart" />
                        <span>网络管理</span>
                    </Link>
                    </Menu.Item>
                    <SubMenu
                    key="sub1"
                    title={<span><Icon type="dashboard" /><span>诊断相关</span></span>}
                    >
                    <Menu.Item key="2">
                        <Link to="/diagnose">
                            基本配置
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="3">监控页</Menu.Item>
                    <Menu.Item key="4">工作台</Menu.Item>
                    </SubMenu>
                    <Menu.Item key="5">
                    <Link to="/protocol-checker">
                        <Icon type="pie-chart" />
                        <span>32960工具</span>
                    </Link>
                </Menu.Item>
                </Menu>

            </Sider>
            <Layout >
              <Content style={{ margin: '1', minHeight: '100vh' }}>
                <div style={{ padding: 20, background: '#fff', minHeight: 480 }}>
                  {this.props.children}
                </div>
              </Content>
            </Layout>
          </Layout>
        );
    }
}

export default AppLayout;