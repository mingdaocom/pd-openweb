import React, { useState } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon, Menu, MenuItem, SvgIcon } from 'ming-ui';
import { checkIsAppAdmin } from 'ming-ui/functions';
import { navigateTo } from 'src/router/navigateTo';

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

const MenuWrap = styled(Menu)`
  width: 200px !important;
  max-height: 200px !important;
  overflow: auto !important;
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
          <Trigger
            action={['hover']}
            popupAlign={{
              points: ['tl', 'bl'],
              offset: [-190, 2],
              overflow: { adjustX: true, adjustY: true },
            }}
            popupVisible={popupVisible}
            onPopupVisibleChange={visible => setPopupVisible(visible)}
            getPopupContainer={() => document.body}
            popup={() => {
              return (
                <MenuWrap className="Relative">
                  {apps.map(item => (
                    <MenuItem key={item.appId} onClick={() => handleClick(item)}>
                      <div className="flexRow alignItemsCenter">
                        <div className="iconWrap" style={{ backgroundColor: item.iconColor }}>
                          <SvgIcon url={item.icon} fill="#fff" size={16} />
                        </div>
                        <span className="flex ellipsis">{item.appName}</span>
                      </div>
                    </MenuItem>
                  ))}
                </MenuWrap>
              );
            }}
          >
            <span className="moreIcon hoverColorPrimary Font16 Hand mLeft3">
              <Icon icon="arrow-down-border" />
            </span>
          </Trigger>
        )}
      </div>
    </AppDisplayWrap>
  );
}
