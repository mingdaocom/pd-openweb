import React, { Fragment, Component } from 'react';
import Icon from 'ming-ui/components/Icon';
import { Dropdown } from 'antd';
import Trigger from 'rc-trigger';
import api from 'api/homeApp';
import cx from 'classnames';
import 'rc-trigger/assets/index.css';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';
import _ from 'lodash';

export default class AppFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apps: [],
      app: {},
      menuVisible: false,
      searchValue: '',
    };
  }
  componentDidMount() {
    api.getAllHomeApp().then(data => {
      this.setState({
        dataSource: data.validProject,
        apps: data.validProject,
      });
    });
  }
  handleSelection = app => {
    this.setState({
      app,
      menuVisible: false,
    });
    this.props.onChange(app.id);
  };
  handleSearch = () => {
    const { dataSource, searchValue } = this.state;
    const apps = _.cloneDeep(dataSource);
    apps.forEach(item => {
      item.projectApps = (item.projectApps || []).filter(app =>
        _.includes(app.name.toLowerCase(), searchValue.toLowerCase()),
      );
    });
    this.setState({
      apps: apps.filter(item => item.projectApps.length),
    });
  };
  renderAppList(apps) {
    const { app } = this.state;
    return (
      <Fragment>
        {apps.map(item => (
          <div
            className={cx('appWrapper valignWrapper', { active: item.id === app.id })}
            key={item.id}
            onClick={() => {
              this.handleSelection(item);
            }}>
            <div className="valignWrapper iconWrqaper" style={{ backgroundColor: item.iconColor }}>
              <SvgIcon url={item.iconUrl} fill="#fff" size={20} addClassName="mTop2" />
            </div>
            <span className="flex overflow_ellipsis">{item.name}</span>
          </div>
        ))}
      </Fragment>
    );
  }
  renderProjectList() {
    const { apps, searchValue } = this.state;
    return (
      <div className="appFilterWrapper">
        <div className="searchWrapper valignWrapper">
          <input
            autoFocus
            value={searchValue}
            type="text"
            placeholder={_l('搜索应用名称')}
            onChange={event => {
              this.setState(
                {
                  searchValue: event.target.value.trim(),
                },
                _.debounce(this.handleSearch),
              );
            }}
          />
          <Icon icon="search" className="Gray_9e Font20" />
        </div>
        {apps.map(item => (
          <div className={cx('appListWrapper', {hide: !item.projectApps.length})} key={item.projectId}>
            <div className="Gray_9e Font13 pBottom5 projectName">{item.projectName}</div>
            {this.renderAppList(item.projectApps)}
          </div>
        ))}
        {apps.length ? null : <div className="pTop100 pBottom100 TxtCenter Font17">{_l('暂无应用搜索结果')}</div>}
      </div>
    );
  }
  render2() {
    const { app } = this.state;
    const { apkId } = this.props;
    return (
      <Trigger
        popupVisible={this.state.menuVisible}
        onPopupVisibleChange={menuVisible => {
          this.setState({ menuVisible });
        }}
        action={['click']}
        popupAlign={{
          points: ['tl', 'bl'],
          offset: [0, 10],
        }}
        popup={this.renderProjectList()}
      >
        <div>
          <div className="Font12 mBottom10">{_l('应用')}</div>
          <div className="itemWrapper valignWrapper pointer">
            {
              apkId ? (
                <div className="flex">{app.name}</div>
              ) : (
                <div className="flex Gray_c">{_l('请选择')}</div>
              )
            }
            <Icon icon="expand_more" className="Gray_9e Font20" />
          </div>
        </div>
      </Trigger>
    );
  }
  render() {
    const { app, menuVisible } = this.state;
    const { apkId } = this.props;
    return (
      <div>
        <div className="Font12 mBottom10">{_l('应用')}</div>
        <Dropdown overlay={this.renderProjectList()} trigger={['click']} visible={menuVisible} onVisibleChange={menuVisible => { this.setState({ menuVisible }) }}>
          <div className={cx('itemWrapper valignWrapper pointer', { active: menuVisible })}>
            {
              apkId ? (
                <div className="flex ellipsis">{app.name}</div>
              ) : (
                <div className="flex Gray_c">{_l('请选择')}</div>
              )
            }
            <Icon icon="expand_more" className="Gray_9e Font20" />
          </div>
        </Dropdown>
      </div>
    );
  }
}
