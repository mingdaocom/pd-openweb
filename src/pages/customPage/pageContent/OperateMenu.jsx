import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Menu, Switch } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Dropdown } from 'ming-ui';
import homeApp from 'src/api/homeApp';
import { APP_ROLE_TYPE } from 'src/pages/worksheet/constants/enum';
import { moveSheet } from 'src/pages/worksheet/redux/actions/sheetList';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util.js';
import './index.less';

const { SubMenu, Divider } = Menu;

const AdjustScreenWrap = styled.div`
  width: 360px;
  padding: 14px 20px;
  padding-bottom: 16px;
  line-height: 20px;
  h3 {
    margin: 0;
  }
  .hint {
    margin: 12px 0;
    font-size: 12px;
    color: #757575;
  }
`;

const CONFIG = [
  {
    type: 'editCanvas',
    text: _l('编辑画布%07005'),
    icon: 'settings',
  },
  {
    type: 'editPage',
    text: _l('编辑外部链接'),
    icon: 'settings',
  },
  { type: 'divider' },
  {
    type: 'editName',
    text: _l('修改名称和图标%07004'),
    icon: 'edit',
  },
  {
    type: 'editIntro',
    text: _l('编辑页面说明%07003'),
    icon: 'info',
  },
  {
    type: 'displaySetting',
    text: _l('显示设置%07002'),
    icon: 'desktop',
  },
  // { type: 'divider' },
  // {
  //   type: 'copy',
  //   text: _l('复制'),
  //   icon: 'content-copy',
  // },
  // {
  //   type: 'move',
  //   text: _l('移动到'),
  //   icon: 'swap_horiz',
  // },
  { type: 'divider' },
  {
    type: 'delete',
    text: _l('删除页面%07000'),
    icon: 'trash',
    className: 'delete',
  },
];

function OperateMenu(props) {
  const [otherAppVisible, setVisible] = useState(false);
  const { currentSheet, projectId, appGroups, ids, onClick, moveSheet, adjustScreen } = props;
  const [values, setValue] = useState({ selectedApp: '', selectedGroup: '' });
  const [valueList, setList] = useState({ appList: [], groupList: [] });
  const { selectedApp, selectedGroup } = values;
  const { appList, groupList } = valueList;
  const { appId, groupId } = ids;

  const formatApps = function (validProject) {
    const appList = [];
    const project = validProject.filter(item => item.projectId === projectId)[0];
    if (project && project.projectApps && project.projectApps.length) {
      project.projectApps.forEach(app => {
        const isCharge = canEditApp(app.permissionType);
        if (isCharge && appId !== app.id) {
          appList.push({
            text: app.name,
            value: app.id,
          });
        }
      });
    }
    return appList;
  };
  useEffect(() => {
    homeApp.getAllHomeApp().then(result => {
      const { validProject } = result;
      setList({ ...valueList, appList: formatApps(validProject) });
    });
  }, []);
  useEffect(() => {
    if (selectedApp) {
      homeApp
        .getApp({
          appId: selectedApp,
          getSection: true,
        })
        .then(res => {
          const { sections } = res;
          setList({
            ...valueList,
            groupList: sections.map(item => ({ value: item.appSectionId, text: item.name || _l('未命名分组') })),
          });
        });
    }
  }, [selectedApp]);

  const cancel = () => {
    setVisible(false);
  };
  const onOk = () => {
    setVisible(false);
    moveSheet({
      sourceAppId: appId,
      sourceAppSectionId: groupId,
      resultAppId: selectedApp,
      ResultAppSectionId: selectedGroup,
      workSheetsInfo: [currentSheet],
    });
  };
  const moveSheetToOtherGroup = targetGroupId => {
    setVisible(false);
    moveSheet({
      sourceAppId: appId,
      sourceAppSectionId: groupId,
      resultAppId: appId,
      ResultAppSectionId: targetGroupId,
      workSheetsInfo: [currentSheet],
    });
  };
  const renderFooter = () => {
    return (
      <div>
        <Button type="link" onClick={cancel}>
          {_l('取消')}
        </Button>
        <Button
          type="primary"
          onClick={onOk}
          disabled={!selectedGroup}
          className={cx({ 'Button--disabled': !selectedGroup })}
        >
          {_l('确认')}
        </Button>
      </div>
    );
  };
  const renderDialog = () => {
    return (
      <Dialog
        visible
        className="movePage"
        anim={false}
        title={_l('移动自定义页面到其他应用')}
        width={560}
        onCancel={cancel}
        footer={renderFooter()}
      >
        <div className="Gray_75">{_l('自定义页面下的所有配置会移动到目标应用中')}</div>
        <div className="flexRow valignWrapper mTop25">
          <span className="Gray_75 mRight10 TxtRight name">{_l('应用')}</span>
          <Dropdown
            isAppendToBody
            placeholder={_l('请选择你作为管理员或开发者的应用')}
            menuClass="sheetMoveApp"
            className={cx('flex', { empty: !selectedApp })}
            border
            value={selectedApp}
            data={appList}
            onChange={value => {
              setValue({ ...values, selectedApp: value });
            }}
          />
        </div>
        <div className="flexRow valignWrapper mTop15">
          <span className="Gray_75 mRight10 TxtRight name">{_l('分组')}</span>
          <Dropdown
            disabled={!selectedApp}
            isAppendToBody
            className={cx('flex', { empty: !selectedGroup })}
            border
            value={selectedGroup}
            data={groupList}
            onChange={group => {
              setValue({ ...values, selectedGroup: group });
            }}
          />
        </div>
      </Dialog>
    );
  };
  return otherAppVisible ? (
    renderDialog()
  ) : (
    <Menu className="customPageOperateMenu" activeKey={null} selectable={false}>
      {CONFIG.filter(o => {
        // 加锁| 运营者=>修改名称和图标(详情页) 编辑页面说明
        if (
          _.get(props, ['appPkg', 'isLock']) ||
          _.get(props, ['appPkg', 'permissionType']) === APP_ROLE_TYPE.RUNNER_ROLE
        ) {
          return ['editName', 'editIntro'].includes(o.type);
        } else {
          return true;
        }
      })
        .filter(o => {
          if (o.type === 'editCanvas' || o.type === 'displaySetting') {
            return !currentSheet.urlTemplate;
          }
          if (o.type === 'editPage') {
            return !!currentSheet.urlTemplate;
          }
          return true;
        })
        .map(({ type, text, icon, ...rest }, index) => {
          if (type === 'divider') return <Divider key={index} />;
          if (type === 'move') {
            return (
              <SubMenu
                data-event={type}
                key={index}
                popupClassName="customPageSubMenu"
                title={
                  <Fragment>
                    <i className={`icon-${icon} `}></i>
                    <span>{text}</span>
                  </Fragment>
                }
              >
                {appGroups.map(item => {
                  return (
                    <Menu.Item
                      data-event={`group_${item.appSectionId}`}
                      className="pointer"
                      key={item.appSectionId}
                      disabled={item.appSectionId === ids.groupId}
                      onClick={() => moveSheetToOtherGroup(item.appSectionId)}
                    >
                      <span>{item.name || _l('未命名分组')}</span>
                    </Menu.Item>
                  );
                })}
                <Divider />
                <Menu.Item data-event="otherApp" className="otherApp pointer" onClick={() => setVisible(true)}>
                  <span>{_l('其他应用')}</span>
                </Menu.Item>
              </SubMenu>
            );
          }
          if (type === 'displaySetting') {
            return (
              <SubMenu
                data-event={type}
                key={index}
                popupClassName="customPageSubMenu"
                title={
                  <Fragment>
                    <i className={`icon-${icon} `}></i>
                    <span>{text}</span>
                  </Fragment>
                }
              >
                <AdjustScreenWrap onClick={e => e.stopPropagation()}>
                  <h3>{_l('强制适应屏幕%07001')}</h3>
                  <div className="hint">
                    {_l(
                      '强制页面适应一屏显示，适合需要在所有尺寸屏幕下始终铺满的情况。（ 如果原始页面过长，组件会被压缩，导致无法正常显示 ）',
                    )}
                  </div>
                  <Switch
                    checked={adjustScreen}
                    onChange={() => {
                      onClick('adjustScreen', { adjustScreen: !adjustScreen });
                    }}
                  />
                </AdjustScreenWrap>
              </SubMenu>
            );
          }
          return (
            <Menu.Item data-event={type} key={type} onClick={() => onClick(type)} {...rest}>
              <i className={`icon-${icon}`}></i>
              <span>{text}</span>
            </Menu.Item>
          );
        })}
    </Menu>
  );
}

export default connect(
  ({ appPkg }) => ({ projectId: appPkg.projectId, appGroups: appPkg.appGroups }),
  dispatch => bindActionCreators({ moveSheet }, dispatch),
)(OperateMenu);
