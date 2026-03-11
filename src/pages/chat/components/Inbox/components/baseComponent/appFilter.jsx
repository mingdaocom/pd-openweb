import React, { Component, Fragment } from 'react';
import { Dropdown } from 'antd';
import api from 'api/homeApp';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';
import Icon from 'ming-ui/components/Icon';
import 'rc-trigger/assets/index.css';

const AppFilterWrap = styled.div`
  width: 315px;
  border-radius: 4px;
  background-color: var(--color-background-primary);
  max-height: 360px;
  overflow-y: auto;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.13),
    0 2px 6px rgba(0, 0, 0, 0.1);

  .appListWrapper {
    border-bottom: 1px solid var(--color-border-primary);
    padding-bottom: 10px;
    .projectName {
      padding: 15px 15px 0;
    }
  }
  .appWrapper {
    padding: 10px 15px;
    cursor: pointer;
    &:hover {
      background-color: var(--color-background-hover);
    }
    &.active {
      background-color: var(--color-primary-focus) 1a;
    }
  }
  .searchWrapper {
    margin: 10px 10px 0;
    padding: 7px;
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    input {
      border: 0;
      padding: 0 0 0 5px;
    }
  }
  .iconWrqaper {
    color: var(--color-white);
    width: 23px;
    height: 23px;
    margin-right: 10px;
    border-radius: 4px;
    justify-content: center;
    > div {
      line-height: normal;
    }
  }
`;

const SelectAppTrigger = styled.div`
  font-size: 13px;
  padding: 5px 10px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
`;

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
      data.validProject.push({
        projectId: 'validProject',
        projectName: _l('外部协作应用'),
        projectApps: data.externalApps,
      });
      this.setState({
        dataSource: data.validProject,
        apps: data.validProject,
      });
    });
  }
  handleSelection = app => {
    this.setState(
      {
        app,
        menuVisible: false,
      },
      () => {
        this.props.onChange(app.id);
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
    return (
      <AppFilterWrap
        className="inboxAppFilterWrapper"
        style={{ maxHeight: window.innerHeight < 700 ? 300 : undefined }}
      >
        <div className="searchWrapper valignWrapper">
          <input
            autoFocus
            value={searchValue}
            className="flex"
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
          <Icon icon="search" className="textSecondary Font20" />
        </div>
        {apps.map(item => (
          <div className={cx('appListWrapper', { hide: !item.projectApps.length })} key={item.projectId}>
            <div className="textSecondary Font13 pBottom5 projectName">{item.projectName}</div>
            {this.renderAppList(item.projectApps)}
          </div>
        ))}
        {apps.length ? null : (
          <div className="pTop100 pBottom100 TxtCenter Font17 textTertiary">{_l('暂无应用搜索结果')}</div>
        )}
      </AppFilterWrap>
    );
  }
  render() {
    const { app, menuVisible } = this.state;
    const { apkId } = this.props;
    return (
      <Fragment>
        <Dropdown
          overlay={this.renderProjectList()}
          trigger={['click']}
          visible={menuVisible}
          onVisibleChange={menuVisible => {
            this.setState({ menuVisible });
            if (menuVisible) {
              setTimeout(() => {
                const input = document.querySelector('.inboxAppFilterWrapper .searchWrapper input');
                input && input.focus();
              }, 200);
            }
          }}
        >
          <SelectAppTrigger className={cx('itemWrapper valignWrapper pointer', { active: menuVisible })}>
            {apkId && app.id ? (
              <Fragment>
                <div className="flex ellipsis">{app.name}</div>
                <Icon
                  icon="close"
                  className="textSecondary Font16"
                  onClick={() => {
                    this.handleSelection({});
                  }}
                />
              </Fragment>
            ) : (
              <Fragment>
                <div className="flex textPlaceholder">{_l('请选择')}</div>
                <Icon icon="expand_more" className="textTertiary Font20" />
              </Fragment>
            )}
          </SelectAppTrigger>
        </Dropdown>
      </Fragment>
    );
  }
}
