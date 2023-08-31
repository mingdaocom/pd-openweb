import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Tabs, Checkbox, Tooltip } from 'antd';
import { Icon, RadioGroup } from 'ming-ui';
import Navigation from './Navigation';
import AppNavStyle from '../AppNavStyle';
import cx from 'classnames';
import './index.less';

export default function NavigationConfig(props) {
  const { projectId, appId, visible, onClose } = props;
  const { app, onChangeApp } = props;
  const [loading, setLoading] = useState(false);
  const [gridDisplayMode, setGridDisplayMode] = useState(app.gridDisplayMode || 0);
  const [appNavDisplayType, setAppNavDisplayType] = useState(app.appNavDisplayType || 0);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
  }, [visible]);

  const renderNavStyleConfig = type => {
    return (
      <Fragment>
        <div className="content mBottom20">
          <div className="title Font13 mBottom20 pAll0 bold">{_l('导航方式')}</div>
          <AppNavStyle
            type={type}
            data={app}
            onChangeApp={data => {
              onChangeApp(data);
            }}
          />
        </div>
      </Fragment>
    );
  };

  const renderPcConfig = () => {
    return (
      <Fragment>
        {renderNavStyleConfig('pcNaviStyle')}
        <div className="content mBottom20">
          <div className="title Font13 mBottom20 pAll0 bold">{_l('默认选中')}</div>
          <RadioGroup
            size="middle"
            className="mBottom30 mobileNavRadio"
            data={[
              {
                text: _l('第一个%0', app.pcNaviStyle === 2 ? _l('分组') : _l('应用项')),
                value: 1,
              },
              {
                text: _l('记住上次使用'),
                value: 2,
              },
            ]}
            checkedValue={app.selectAppItmeType}
            onChange={value => {
              onChangeApp({ selectAppItmeType: value });
            }}
          ></RadioGroup>
        </div>
        <div className="flexRow alignItemsCenter mBottom20 title">
          <div className="flex Font13 bold">{_l('导航管理')}</div>
          <Checkbox
            checked={app.viewHideNavi}
            onChange={e => {
              onChangeApp({ viewHideNavi: e.target.checked });
            }}
          >
            <span className="Normal">{_l('查看隐藏项')}</span>
          </Checkbox>
          <Tooltip
            title={_l('勾选时，管理员可以在应用中查看隐藏的应用项。取消勾选时，对管理员也同时隐藏')}
            arrowPointAtCenter={true}
            placement="topRight"
          >
            <Icon className="Font16 Gray_9e pointer" icon="info_outline" />
          </Tooltip>
        </div>
        <div className="content">
          <Navigation {...props} />
        </div>
      </Fragment>
    );
  };

  const renderDisplayWay = () => {
    return (
      <div className="pLeft24">
        {app.appNaviStyle === 1 && (
          <Fragment>
            <div className="bold mTop30 mBottom14 Font13">{_l('显示模式')}</div>
            <RadioGroup
              size="middle"
              className="mBottom30 mobileNavRadio"
              data={[
                {
                  text: _l('九宫格'),
                  value: 0,
                },
                {
                  text: _l('十六宫格'),
                  value: 1,
                },
              ]}
              checkedValue={gridDisplayMode}
              onChange={value => {
                setGridDisplayMode(value);
                onChangeApp({ gridDisplayMode: value });
              }}
            ></RadioGroup>
          </Fragment>
        )}
        <div className={cx('bold mBottom14 Font13', { mTop30: app.appNaviStyle === 0 })}>{_l('分组展开方式')}</div>
        <RadioGroup
          size="middle"
          className="mBottom20 mobileNavRadio"
          data={[
            {
              text: _l('默认全展开'),
              value: 0,
            },
            {
              text: _l('默认全收起'),
              value: 1,
            },
            {
              text: _l('每次展开一个分组（其他自动收起）'),
              value: 2,
            },
          ]}
          checkedValue={appNavDisplayType}
          onChange={value => {
            setAppNavDisplayType(value);
            onChangeApp({ appNavDisplayType: value });
          }}
        ></RadioGroup>
      </div>
    );
  };

  return (
    <div className="navigationConfig">
      <div className="flexRow alignItemsCenter title">
        <div className="flex Font17 bold">{_l('导航设置')}</div>
        <Icon icon="close" className="Font20 Gray_9e pointer" onClick={onClose} />
      </div>
      <Tabs defaultActiveKey="pc">
        <Tabs.TabPane tab={_l('PC端')} key="pc">
          {renderPcConfig()}
        </Tabs.TabPane>
        <Tabs.TabPane tab={_l('移动端')} key="mobile">
          {renderNavStyleConfig('appNaviStyle')}
          {app.appNaviStyle !== 2 && renderDisplayWay()}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
