import React, { Fragment, useState } from 'react';
import { Checkbox, Tabs } from 'antd';
import cx from 'classnames';
import { Icon, RadioGroup } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import AppNavStyle from '../AppNavStyle';
import MobileCustomNav from './MobileCustomNav';
import Navigation from './Navigation';
import './index.less';

export default function NavigationConfig(props) {
  const { onClose } = props;
  const { app, onChangeApp } = props;
  const [gridDisplayMode, setGridDisplayMode] = useState(app.gridDisplayMode || 0);
  const [appNaviDisplayType, setAppNaviDisplayType] = useState(app.appNaviDisplayType || 0);
  const [expandType, setExpandType] = useState(app.expandType || 0);
  const [displayIcon, setDisplayIcon] = useState(app.displayIcon || '011');
  const [hideFirstSection, setHideFirstSection] = useState(app.hideFirstSection || false);

  const renderNavStyleConfig = type => {
    return (
      <Fragment>
        <div className="content mBottom24">
          <div className="title Font13 mBottom12 pAll0 bold">{_l('导航方式')}</div>
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

  const renderDisplayIcon = list => {
    return (
      <Fragment>
        {list.map((item, index) => (
          <Checkbox
            className={cx('mLeft0 mRight10', { hide: !item.show })}
            checked={displayIcon.split('')[index] === '1'}
            onChange={e => {
              const value = e.target.checked ? '1' : '0';
              const res = displayIcon
                .split('')
                .map((n, i) => (i === index ? value : n))
                .join('');
              setDisplayIcon(res);
              onChangeApp({ displayIcon: res });
            }}
          >
            <span className="Normal">{item.name}</span>
          </Checkbox>
        ))}
      </Fragment>
    );
  };

  const renderPcConfig = () => {
    return (
      <Fragment>
        {renderNavStyleConfig('pcNaviStyle')}
        <div className="content mBottom24">
          <div className="title Font13 mBottom15 pAll0 bold">{_l('设置')}</div>
          {app.currentPcNaviStyle === 3 && (
            <div className="flexRow alignItemsCenter mBottom15">
              <div style={{ width: 100 }}>{_l('展开方式')}</div>
              <RadioGroup
                size="middle"
                data={[
                  {
                    text: _l('常规'),
                    value: 0,
                  },
                  {
                    text: _l('手风琴'),
                    value: 1,
                  },
                ]}
                checkedValue={expandType}
                onChange={value => {
                  setExpandType(value);
                  onChangeApp({ expandType: value });
                }}
              ></RadioGroup>
            </div>
          )}
          <div className="flexRow alignItemsCenter mBottom15">
            <div style={{ width: 100 }}>{_l('显示图标')}</div>
            {app.currentPcNaviStyle === 0 &&
              renderDisplayIcon([
                {
                  name: _l('第1级'),
                  show: true,
                },
                {
                  name: _l('第2级'),
                  show: true,
                },
                {
                  name: _l('第3级'),
                  show: true,
                },
              ])}
            {app.currentPcNaviStyle === 1 &&
              renderDisplayIcon([
                {
                  name: _l('第1级'),
                  show: false,
                },
                {
                  name: _l('第2级'),
                  show: false,
                },
                {
                  name: _l('第3级'),
                  show: true,
                },
              ])}
            {app.currentPcNaviStyle === 2 &&
              renderDisplayIcon([
                {
                  name: _l('第1级'),
                  show: true,
                },
                {
                  name: _l('第2级'),
                  show: true,
                },
                {
                  name: _l('第3级'),
                  show: false,
                },
              ])}
            {app.currentPcNaviStyle === 3 &&
              renderDisplayIcon([
                {
                  name: _l('第1级'),
                  show: false,
                },
                {
                  name: _l('第2级'),
                  show: true,
                },
                {
                  name: _l('第3级'),
                  show: true,
                },
              ])}
          </div>
          <div className="flexRow">
            <div style={{ width: 100 }}>{_l('其他')}</div>
            <div className="flex">
              <Checkbox
                checked={app.selectAppItmeType === 2}
                onChange={() => {
                  onChangeApp({ selectAppItmeType: app.selectAppItmeType === 2 ? 1 : 2 });
                }}
              >
                <span className="Normal">{_l('记住上次访问的应用项')}</span>
              </Checkbox>
              {app.currentPcNaviStyle === 3 && (
                <div className="flexRow alignItemsCenter mTop3">
                  <Checkbox
                    checked={hideFirstSection}
                    onChange={e => {
                      setHideFirstSection(e.target.checked);
                      onChangeApp({ hideFirstSection: e.target.checked });
                    }}
                  >
                    <span className="Normal">{_l('隐藏首个分组标题')}</span>
                  </Checkbox>
                  <Tooltip
                    title={_l(
                      '在树形列表中，隐藏第 1 级分组标题，直接显示分组内应用项。通常用于首个分组中的应用项作为应用首页的场景',
                    )}
                    arrowPointAtCenter={true}
                    placement="bottom"
                  >
                    <Icon className="Font16 Gray_9e pointer" icon="info_outline" />
                  </Tooltip>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flexRow alignItemsCenter mBottom12 title">
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
        <div className={cx('bold mBottom12 Font13', { mTop20: app.appNaviStyle === 0 })}>{_l('分组展开方式')}</div>
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
              text: _l('每次展开单个一级分组（其他自动收起）'),
              value: 2,
            },
          ]}
          checkedValue={appNaviDisplayType}
          onChange={value => {
            setAppNaviDisplayType(value);
            onChangeApp({ appNaviDisplayType: value });
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
          {app.appNaviStyle !== 2 ? renderDisplayWay() : <MobileCustomNav app={app} onChangeApp={onChangeApp} />}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
