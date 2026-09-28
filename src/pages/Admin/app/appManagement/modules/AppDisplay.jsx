import React, { useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import checkIsAppAdmin from 'src/components/checkIsAppAdmin';
import { navigateTo } from 'src/router/navigation/navigateTo';

const AppDisplayWrap = styled.div`
  .iconWrap {
    width: 36px;
    height: 36px;
    border-radius: 5px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
`;

const AppMenuLabel = styled.div`
  .iconWrap {
    width: 24px;
    height: 24px;
    line-height: 24px;
    border-radius: 5px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    div {
      display: flex;
      align-items: center;
    }
  }
`;

export default function AppDisplay(props) {
  const { className, apps = [] } = props;
  const isMultiple = apps.length > 1;
  const [popupVisible, setPopupVisible] = useState(false);

  const app = apps.length ? apps[0] : {};

  const handleClick = (app, multiple) => {
    if (multiple) {
      return;
    }

    if (app.status === 2) {
      alert(_l('应用已删除'), 2);
      return;
    }

    setPopupVisible(false);
    checkIsAppAdmin({
      appId: app.appId,
      appName: app.appName,
      callback: () => navigateTo(`/app/${app.appId}`),
    });
  };

  // apps 为空时物理删除，app.status === 2 逻辑删除
  if (
    !apps.length ||
    (apps.length === 1 && [0, 2].includes(app.status)) ||
    apps.every(item => [0, 2].includes(item.status))
  )
    return <div>{_l('应用已删除')}</div>;

  return (
    <AppDisplayWrap className={`${className} flexRow alignItemsCenter`}>
      <div className="iconWrap" style={{ backgroundColor: app.iconColor }}>
        <SvgIcon url={app.icon} fill="#fff" size={24} />
      </div>
      <div
        className={cx('flex flexRow', { 'Hand hoverColorPrimary': !isMultiple })}
        onClick={() => handleClick(app, isMultiple)}
      >
        <span className="ellipsis">
          {isMultiple ? _l('%0个应用', apps.length) : ''}
          {isMultiple ? apps.map(app => app.appName).join('、') : app.appName}
        </span>

        {isMultiple && (
          <Dropdown
            trigger={['hover']}
            open={popupVisible}
            onOpenChange={setPopupVisible}
            getPopupContainer={() => document.body}
            menu={{
              items: apps.map(item => ({
                key: item.appId,
                label: (
                  <AppMenuLabel className="flexRow alignItemsCenter">
                    <div className="iconWrap" style={{ backgroundColor: item.iconColor }}>
                      <SvgIcon url={item.icon} fill="#fff" size={16} />
                    </div>
                    <span className="flex ellipsis">{item.appName}</span>
                  </AppMenuLabel>
                ),
                onClick: () => handleClick(item),
              })),
              style: { width: 200, maxHeight: 200, overflow: 'auto' },
            }}
          >
            <span className="moreIcon hoverColorPrimary Font16 Hand mLeft3">
              <Icon icon="arrow-down-border" />
            </span>
          </Dropdown>
        )}
      </div>
    </AppDisplayWrap>
  );
}
