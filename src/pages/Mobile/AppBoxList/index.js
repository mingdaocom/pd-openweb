import React, { Fragment, Component } from 'react';
import { Flex, ActivityIndicator, List, Toast } from 'antd-mobile';
import Back from '../components/Back';
import AddDialog from 'mobile/AppBoxInfo/AppDetails/AddDialog';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import axios from 'axios';
import _ from 'lodash';
const { Item } = List;

export default class AddBoxList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      dataBysearch: [],
      libraryId: '',
      showDialog: false,
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    this.getlibraryByCategory(params.categoryId);
  }
  getlibraryByCategory(categoryId) {
    this.setState({
      loading: true,
    });
    let baseUrl = (md && md.global && md.global.SysSettings && md.global.SysSettings.templateLibraryTypes === '2') ? __api_server__.main : 'https://pd.mingdao.com/api/';
    axios.post(`${baseUrl}AppManagement/GetAppsLibraryInfo`, { categoryId }).then(result => {
      const { data } = result.data;
      if (data) {
        this.setState({
          dataBysearch: data,
          loading: false,
        });
      }
    });
  }
  handleAddProject = item => {
    const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
    if (isWxWork) {
      const { projects } = md.global.Account;
      if (projects.length) {
        this.addDialogEl.installApp(projects[0].projectId, item.libraryId);
      } else {
        Toast.info(_l('您没有可安装模板的组织'), 3);
      }
    } else {
      this.setState({
        showDialog: true,
        libraryId: item.libraryId,
      });
    }
  };
  renderAppsInfo() {
    const { dataBysearch } = this.state;
    return (
      <List className="appsLibraryList">
        {dataBysearch.map(item => (
          <Item
            key={item.libraryId}
            thumb={
              <div className="iconWrapper" style={{ backgroundColor: item.iconColor }}>
                <SvgIcon url={item.iconUrl} fill="#fff" size={34} />
              </div>
            }
            extra={
              <div
                className="valignWrapper install bold"
                onClick={() => {
                  this.handleAddProject(item);
                }}
              >
                {_l('添加')}
              </div>
            }
            onClick={() => {
              if (event.target.classList.contains('install')) {
                return;
              }
              this.props.history.push(`/mobile/appBoxInfo/${item.libraryId}`);
            }}
          >
            <div className="bold Font16">{item.name}</div>
          </Item>
        ))}
      </List>
    );
  }
  renderHome() {
    const { loading } = this.state;
    return (
      <Fragment>
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          this.renderAppsInfo()
        )}
      </Fragment>
    );
  }
  render() {
    return (
      <div className="appBox h100">
        <div className="content">
          {this.renderHome()}
          <AddDialog
            getRef={ref => (this.addDialogEl = ref)}
            visible={this.state.showDialog}
            isMobile={true}
            onCancel={() => this.setState({ showDialog: false })}
            libraryId={this.state.libraryId}
          />
        </div>
      </div>
    );
  }
}
