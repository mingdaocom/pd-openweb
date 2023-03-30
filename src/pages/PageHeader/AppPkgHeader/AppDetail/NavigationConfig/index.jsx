import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Tabs, Checkbox, Tooltip } from 'antd';
import { Icon } from 'ming-ui';
import Navigation from './Navigation';
import AppNavStyle from '../AppNavStyle';
import './index.less';

export default function NavigationConfig(props) {
  const { projectId, appId, visible, onClose } = props;
  const { app, onChangeApp } = props;
  const [loading, setLoading] = useState(false);
  const [isChange, setIsChange] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
  }, [visible]);

  const renderNavStyleConfig = (type) => {
    return (
      <Fragment>
        <div className="content mBottom20">
          <div className="title Font13 mBottom20 pAll0 bold">{_l('导航方式')}</div>
          <AppNavStyle
            type={type}
            data={app}
            onChangeApp={(data) => {
              setIsChange(true);
              onChangeApp(data);
            }}
          />
        </div>
      </Fragment>
    );
  }

  const renderPcConfig = () => {
    return (
      <Fragment>
        {renderNavStyleConfig('pcNaviStyle')}
        <div className="flexRow alignItemsCenter mBottom20 title">
          <div className="flex Font13 bold">{_l('导航管理')}</div>
          <Checkbox
            checked={app.viewHideNavi}
            onChange={(e) => {
              setIsChange(true);
              onChangeApp({ viewHideNavi: e.target.checked });
            }}
          > 
            <span className="Normal">{_l('查看隐藏项')}</span>
          </Checkbox>
          <Tooltip title={_l('勾选时，管理员可以在应用中查看隐藏的应用项。取消勾选时，对管理员也同时隐藏')} arrowPointAtCenter={true} placement="topRight">
            <Icon className="Font16 Gray_9e pointer" icon="info_outline" />
          </Tooltip>
        </div>
        <div className="content">
          <Navigation {...props} setIsChange={setIsChange} />
        </div>
      </Fragment>
    );
  }

  return (
    <div className="navigationConfig">
      <div className="flexRow alignItemsCenter title">
        <div className="flex Font17 bold">{_l('导航设置')}</div>
        {isChange && (
          <div className="flexRow alignItemsCenter Gray_9e mRight10">
            <Icon icon="save_as_black_24dp" className="Gray_9e mRight5 Font20" />
            <div className="Font13">{_l('导航修改实时生效')}</div>
          </div>
        )}
        <Icon icon="close" className="Font20 Gray_9e pointer" onClick={onClose} />
      </div>
      <Tabs defaultActiveKey="pc">
        <Tabs.TabPane tab={_l('PC端')} key="pc">
          {renderPcConfig()}
        </Tabs.TabPane>
        <Tabs.TabPane tab={_l('移动端')} key="mobile">
          {renderNavStyleConfig('appNaviStyle')}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
