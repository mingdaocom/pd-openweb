import React, { Component, Fragment } from 'react';
import { Dropdown, Select } from 'antd';
import api from 'api/homeApp';
import cx from 'classnames';
import _ from 'lodash';
import { SvgIcon } from 'ming-ui';
import Icon from 'ming-ui/components/Icon';
import processVersionApi from '../../api/processVersion';
import { TYPES } from '../../WorkflowList/utils';
import 'rc-trigger/assets/index.css';
import './index.less';

export default class AppFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apps: [],
      app: {},
      menuVisible: false,
      searchValue: '',
      processList: [],
      processType: undefined,
      processId: undefined,
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
  componentWillReceiveProps(nextProps) {
    if (nextProps.apkId !== this.props.apkId && _.isEmpty(nextProps.apkId)) {
      this.setState({
        processList: [],
        processType: undefined,
        processId: undefined,
      });
    }
  }
  getWorkFlowList() {
    const { app, processType } = this.state;
    let request = null;
    if (processType) {
      request = processVersionApi.list;
    } else {
      request = processVersionApi.listAll;
    }
    request({
      relationId: app.id,
      processListType: processType || undefined,
    }).then(data => {
      this.setState({
        processList: _.flatten(data.map(n => n.processList)),
      });
    });
  }
  handleSelection = app => {
    this.setState(
      {
        app,
        menuVisible: false,
        processId: undefined,
        processList: [],
      },
      () => {
        this.props.onChange(app.id, this.state.processId);
      },
    );
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
            }}
          >
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
    const selectAppTriggerEl = document.querySelector('.selectAppTrigger');
    const height = selectAppTriggerEl
      ? document.body.clientHeight - selectAppTriggerEl.offsetTop - selectAppTriggerEl.clientHeight - 20
      : undefined;
    return (
      <div className="appFilterWrapper" style={{ maxHeight: height }}>
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
          <Icon icon="search" className="Gray_75 Font20" />
        </div>
        {apps.map(item => (
          <div className={cx('appListWrapper', { hide: !item.projectApps.length })} key={item.projectId}>
            <div className="Gray_75 Font13 pBottom5 projectName">{item.projectName}</div>
            {this.renderAppList(item.projectApps)}
          </div>
        ))}
        {apps.length ? null : <div className="pTop100 pBottom100 TxtCenter Font17">{_l('暂无应用搜索结果')}</div>}
      </div>
    );
  }
  renderWorkflowList() {
    const { app, processType, processId, processList } = this.state;
    return (
      <div className="mTop16">
        <Select
          value={processType}
          placeholder={_l('请选择流程类型')}
          className="w100 selectWrapper selectProcessTypeWrapper"
          suffixIcon={<Icon icon="expand_more" className="Gray_75 Font20" />}
          onChange={value => {
            this.setState(
              {
                processType: value,
                processId: undefined,
              },
              () => {
                this.getWorkFlowList();
              },
            );
          }}
        >
          {TYPES.map(item => (
            <Select.Option className="processOptionWrapper" value={item.value}>
              <div className="flexRow valignWrapper">
                <i className={`icon ${item.icon} Gray_9e Font18 mRight5`} />
                {item.text}
              </div>
            </Select.Option>
          ))}
        </Select>
        <Select
          value={processId}
          placeholder={_l('请选择流程')}
          notFoundContent={<div className="valignWrapper">{_l('暂无数据')}</div>}
          className="w100 selectWrapper mTop16"
          suffixIcon={<Icon icon="expand_more" className="Gray_75 Font20" />}
          onChange={value => {
            this.setState({ processId: value });
            this.props.onChange(app.id, value);
          }}
        >
          {processList.map(item => (
            <Select.Option className="processOptionWrapper" value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  render() {
    const { app, menuVisible } = this.state;
    const { apkId } = this.props;
    return (
      <div>
        <div className="Font12 mBottom10">{_l('应用')}</div>
        <Dropdown
          overlay={this.renderProjectList()}
          trigger={['click']}
          visible={menuVisible}
          onVisibleChange={menuVisible => {
            this.setState({ menuVisible });
            if (menuVisible) {
              setTimeout(() => {
                const input = document.querySelector('.appFilterWrapper .searchWrapper input');
                input && input.focus();
              }, 200);
            }
          }}
        >
          <div className={cx('itemWrapper valignWrapper pointer selectAppTrigger', { active: menuVisible })}>
            {apkId && app.id ? (
              <div className="flex ellipsis">{app.name}</div>
            ) : (
              <div className="flex Gray_c">{_l('请选择')}</div>
            )}
            <Icon icon="expand_more" className="Gray_75 Font20" />
          </div>
        </Dropdown>
        {app.id && this.renderWorkflowList()}
      </div>
    );
  }
}
