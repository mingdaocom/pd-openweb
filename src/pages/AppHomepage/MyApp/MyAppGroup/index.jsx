import React, { Component, Fragment } from 'react';
import { LoadDiv, ScrollView, Dialog } from 'ming-ui';
import cx from 'classnames';
import { COLORS } from 'src/pages/AppHomepage/components/SelectIcon/config';
import api from 'api/homeApp';
import update from 'immutability-helper';
import appManagementApi from 'api/appManagement';
import MyAppGroupItem from './MyAppGroupItem';
import AppGroupSkeleton from './AppGroupSkeleton';
import { every, get, head, isEmpty } from 'lodash';
import { ADVANCE_AUTHORITY } from 'src/pages/PageHeader/AppPkgHeader/config';
const { app: {addAppItem} } = window.private

export default class MyAppGroup extends Component {
  state = {
    data: {},
    isLoading: true,
    newAppItemId: '',
  };

  componentDidMount() {
    this.getIndexApp();
  }

  dealData = data => {
    const isExternalApp = id => data.externalApps.findIndex(item => item.id === id) > -1;
    // 判断星标应用是不是外部应用
    return update(data, {
      markedApps: {
        $apply: apps => {
          return apps
            .filter(o => !(o.pcDisplay && o.permissionType < ADVANCE_AUTHORITY))
            .map(app => ({ ...app, isExternalApp: isExternalApp(app.id) }));
        },
      },
    });
  };
  getIndexApp = () => {
    api.getAllHomeApp().then(data => {
      this.setState({ data: this.dealData(data), isLoading: false });
    });
  };

  /**
   * 更新应用数据
   * 1. 如果操作的是星标应用,则更新星标应用对应的应用
   * 2. 如果操作的是除星标应用的其他应用则只更新自身
   * 3. 最后更新星标应用
   */
  updateData = ({ type, ...obj }) => {
    const { data } = this.state;
    const { projectId: updateProjectId, appId: id, ...rest } = obj;
    const temp = _.cloneDeep(data);

    // 如果操作的是星标应用，则需要更新对应的应用
    if (_.includes(['markedApps'], type)) {
      // 判断是否是个人应用标星
      if (!updateProjectId) {
        let updateIndex = temp.aloneApps.findIndex(({ id: appId }) => appId === id);
        if (updateIndex > -1) {
          let updatedItem = { ...temp.aloneApps[updateIndex], ...rest };
          temp.aloneApps.splice(updateIndex, 1, updatedItem);
        }
      }

      // 获取星标应用关联的应用类型
      let relativeMarkAppType = '';
      Object.keys(_.pick(temp, ['expireProject', 'validProject', 'externalApps'])).forEach(key => {
        if (temp[key].findIndex(({ projectId }) => updateProjectId === projectId) > -1) {
          relativeMarkAppType = key;
        }
      });

      const item = temp[relativeMarkAppType];

      // 星标应用关联类型为过期网络或正常网络应用
      if (_.includes(['expireProject', 'validProject'], relativeMarkAppType)) {
        const updateProjectIndex = item.findIndex(({ projectId }) => projectId === updateProjectId);
        const updateApps = item[updateProjectIndex].projectApps;
        const updateAppIndex = updateApps.findIndex(({ id: updateAppId }) => updateAppId === id);
        if (updateAppIndex > -1) {
          let updatedItem = { ...updateApps[updateAppIndex], ...rest };
          updateApps.splice(updateAppIndex, 1, updatedItem);
        }
      }

      // 星标应用关联类型为外部协作应用
      if (_.includes(['externalApps'], relativeMarkAppType)) {
        const updateProjectIndex = item.findIndex(({ id: updateAppId }) => updateAppId === id);
        if (updateProjectIndex > -1) {
          let updatedItem = { ...item[updateProjectIndex], ...rest };
          item.splice(updateProjectIndex, 1, updatedItem);
        }
      }
    }
    if (_.includes(['validProject', 'expireProject'], type)) {
      temp[type].forEach(({ projectApps, projectId }) => {
        if (projectId === updateProjectId) {
          projectApps.forEach(app => {
            if (app.id === id) {
              Object.assign(app, rest);
            }
          });
        }
      });
    } else {
      temp[type].forEach(app => {
        if (app.id === id) {
          Object.assign(app, rest);
        }
      });
    }
    // 更新星标应用
    temp.markedApps.forEach(item => {
      if (item.id === id) {
        Object.assign(item, rest);
      }
    });
    this.setState({ data: temp });
  };

  // 应用图标和名字更新
  handleAppChange = obj => {
    api.editAppInfo(_.omit(obj, 'type')).then(({ data }) => {
      if (data) this.updateData(obj);
    });
  };

  handleModify = obj => {
    this.updateData(obj);
  };

  // 删除与退出应用
  handleApp = ({ mode, ...para }) => {
    switch (mode) {
      case 'del':
        api
          .deleteApp({
            ...para,
            isHomePage: true,
          })
          .then(res => {
            if (res) this.getIndexApp();
          });
        break;
      case 'mark':
        api.markApp(para).then(({ data }) => {
          if (data) this.getIndexApp();
        });
        break;
      case 'quit':
        appManagementApi.quitRole(para).then(res => {
          if (res.isRoleForUser) {
            if (res.isRoleDepartment) {
              this.getIndexApp();
            } else {
              Dialog.confirm({
                title: <span style={{ color: '#f44336' }}>{_l('无法退出通过部门加入的应用')}</span>,
                description: _l('您所在的部门被加入了此应用，只能由应用管理员进行操作'),
                closable: false,
                removeCancelBtn: true,
                okText: _l('关闭'),
              });
            }
          } else {
            alert(_l('退出失败'), 2);
          }
        });
        break;
      default:
        break;
    }
  };

  createAppFromEmpty = ({ type, ...para }) => {
    api.createApp(para).then(res => {
      if (_.has(res, ['id'])) {
        const temp = _.cloneDeep(this.state.data);
        const app = { ...para, ...res };
        if (_.includes(['validProject'], type)) {
          temp[type].forEach(({ projectId, projectApps }) => {
            if (projectId === res.projectId) {
              if (Array.isArray(projectApps)) {
                projectApps.push(app);
              } else {
                projectApps = [app];
              }
            }
          });
        } else {
          temp[type].push(app);
        }
        // 必须先生成分组后选择图标和名字弹层才能定位
        this.setState({ data: temp }, () => {
          this.setState({ newAppItemId: res.id });
        });
      }
    });
  };

  handleAppSorted = (obj, sortedObj) => {
    const { data } = this.state;
    api.updateAppSort(obj).then(res => {
      if (res) {
        const { type, projectId, sortedItems } = sortedObj;
        if (type === 'validProject') {
          const projectIndex = _.findIndex(data[type], item => item.projectId === projectId);
          this.setState({ data: update(data, { [type]: { [projectIndex]: { projectApps: { $set: sortedItems } } } }) });
        } else {
          this.setState({ data: update(data, { [type]: { $set: sortedItems } }) });
        }
      }
    });
  };

  clearNewAppItemId = () => {
    this.setState({ newAppItemId: '' });
  };

  locateApp = id => {
    const $wrap = document.querySelector('.myAppScrollContent');
    const $app = document.getElementById(id);
    if ($app && $wrap) {
      $wrap.scrollTop = $app.getBoundingClientRect().bottom - 300;
    }
  };

  onCopy = ({ type, id, appId, projectId }) => {
    const { data } = this.state;

    const updateValidProject = projectIndex => {
      const projects = data.validProject;
      const apps = projects[projectIndex].projectApps;
      const app = _.find(apps, item => item.id === id);
      this.setState(
        {
          data: update(data, {
            validProject: {
              [projectIndex]: {
                projectApps: {
                  $push: [{ ...app, name: _l('%0-复制', app.name), id: appId, isNew: true }],
                },
              },
            },
          }),
        },
        () => this.locateApp(`validProject-${projectId}`),
      );
    };
    const updateCommonApp = (key = 'aloneApps') => {
      const projects = data[key];
      const app = _.find(projects, item => item.id === id);
      this.setState(
        {
          data: update(data, {
            [key]: {
              $push: [{ ...app, name: _l('%0-复制', app.name), id: appId, isNew: true }],
            },
          }),
        },
        () => this.locateApp(key),
      );
    };
    if (type === 'markedApps') {
      _.keys(_.pick(data, ['aloneApps', 'validProject', 'externalApps'])).forEach(key => {
        const projects = data[key] || [];
        const projectIndex = _.findIndex(projects, item => item.projectId === projectId);
        if (projectIndex > -1) {
          if (_.includes(['aloneApps', 'externalApps'], key)) {
            updateCommonApp(key);
          } else {
            updateValidProject(projectIndex);
          }
        }
      });
      return;
    }
    if (_.includes(['aloneApps', 'externalApps'], type)) {
      updateCommonApp(type);
      return;
    }
    if (type === 'validProject') {
      const projects = data.validProject;
      const projectIndex = _.findIndex(projects, item => item.projectId === projectId);
      updateValidProject(projectIndex);
      return;
    }
  };

  renderAppGroup = () => {
    const { data, newAppItemId } = this.state;
    const { aloneApps = [], externalApps = [], markedApps = [], validProject = [] } = data;
    const propsAndMethods = {
      onCancel: this.handleCancel,
      createAppFromEmpty: this.createAppFromEmpty,
      handleApp: this.handleApp,
      onAppChange: this.handleAppChange,
      handleModify: this.handleModify,
      onAppSorted: this.handleAppSorted,
      clearNewAppItemId: this.clearNewAppItemId,
      onCopy: this.onCopy,
    };
    return (
      <Fragment>
        {markedApps.length > 0 && <MyAppGroupItem type="markedApps" items={markedApps} {...propsAndMethods} />}
        {validProject.map((item, index) => (
          <MyAppGroupItem
            key={index}
            type={'validProject'}
            {...item}
            {...propsAndMethods}
            newAppItemId={newAppItemId}
          />
        ))}
        {externalApps.length > 0 && <MyAppGroupItem type="externalApps" items={externalApps} {...propsAndMethods} />}
        {aloneApps.length > 0 && (
          <MyAppGroupItem type="aloneApps" items={aloneApps} newAppItemId={newAppItemId} {...propsAndMethods} />
        )}
      </Fragment>
    );
  };

  renderAppIndexPage = () => {
    const { data } = this.state;
    const { aloneApps = [], externalApps = [], validProject = [], markedApps = [] } = data;
    const projects = get(md, ['global', 'Account', 'projects']);
    if (isEmpty(projects)) {
      if (every([aloneApps, externalApps, validProject, markedApps], isEmpty)) {
        return (
          <div className="noNetworkBox flexColumn h100">
            <div className="noNetworkBoxBG" />
            <div className="Font20 bold mTop40">{_l('申请加入一个组织，开始创建应用')}</div>
            <div className="flexRow mTop50">
              <button
                type="button"
                className="joinNetwork ThemeBGColor3 ThemeHoverBGColor2"
                onClick={() => window.open('/enterpriseRegister.htm?type=add', '__blank')}
              >
                {_l('加入组织')}
              </button>
            </div>
          </div>
        );
      }
      return null;
    }
    return null;
  };

  renderProjects = () => {
    const { data } = this.state;
    const { validProject = [], expireProject = [], externalApps = [] } = data;
    const projects = get(md, ['global', 'Account', 'projects']);
    // 当没有外部应用 且只有一个有效网络或过期网络(现为免费版)且用户为网络创建者时，若网络无应用 则显示创建界面
    if (validProject.length + expireProject.length === 1 && !externalApps.length) {
      const { projectId, projectApps } = head(validProject.concat(expireProject));
      const { cannotCreateApp } = _.find(projects, item => item.projectId === projectId) || {};
      const { accountId: currentUserId, projects: allProjects } = _.get(md, ['global', 'Account']);
      if (!projectApps.length && !cannotCreateApp && currentUserId === _.get(head(allProjects), 'createAccountId')) {
        const INTRO_CONFIG = [
          {
            type: 'create',
            icon: 'add',
            iconColor: '#2196f3',
            title: _l('创建空白应用'),
            desc: _l('从头开始创造您自己的应用'),
            key: 'addAppIcon',
          },
          {
            icon: 'custom_store',
            iconColor: '#3cca8e',
            title: _l('从应用库安装'),
            desc: _l('安装应用库中现成的开箱模板，您可以直接使用，也可以继续按需修改'),
            href: `/app/lib?projectId=${projectId}`,
            key: 'installFromLib',
          },
        ].filter(item => !addAppItem[item.key]);
        return (
          <div className="functionIntro">
            <div className="welcomeImg" />
            <h2>{_l('欢迎使用')}</h2>
            <p className="Font17">{_l('现在，从创建一个应用开始吧')}</p>
            <div className="introWrap">
              {INTRO_CONFIG.map(({ type, icon, iconColor, title, desc, href }) => (
                <div
                  className="introItem"
                  onClick={() => {
                    if (type === 'create') {
                      api
                        .createApp({
                          projectId,
                          name: _l('未命名应用'),
                          icon: '0_lego',
                          iconColor: COLORS[_.random(0, COLORS.length - 1)],
                          permissionType: 200,
                        })
                        .then(res => {
                          location.href = `/app/${res.id}`;
                        });
                      return;
                    }
                    if (type === 'solution') {
                      window.open(href, '__blank');
                      return;
                    }

                    location.href = href;
                  }}
                >
                  <div className="iconWrap">
                    <i className={`icon-${icon}`} style={{ color: iconColor }} />
                  </div>
                  <div className="title">
                    {title}
                    {type === 'solution' && <i className="icon-launch Font12" style={{ verticalAlign: 'super' }} />}
                  </div>
                  <div className="desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }
    }
    return (
      <ScrollView scrollContentClassName="myAppScrollContent">
        <div className="myAppGroupBox">{this.renderAppGroup()}</div>
      </ScrollView>
    );
  };

  render() {
    const { data, isLoading } = this.state;
    return (
      <div className="myAppGroupWrap">
        {isLoading ? (
          <AppGroupSkeleton />
        ) : (
          Object.keys(data).length && (
            <Fragment>
              {this.renderAppIndexPage()}
              {this.renderProjects()}
            </Fragment>
          )
        )}
      </div>
    );
  }
}
