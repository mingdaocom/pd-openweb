import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Icon, Tooltip, SvgIcon } from 'ming-ui';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import WorkSheetItem, { convertColor } from './WorkSheetItem';
import MoreOperation from './MoreOperation';
import Drag from './Drag';
import { getTranslateInfo } from 'src/util';

export default function WorkSheetGroup(props) {
  const { appItem, ...otherProps } = props;
  const { sheetListVisible, isCharge, activeSheetId, appPkg } = otherProps;
  const { workSheetId, icon, iconUrl, status, layerIndex, items = [] } = appItem;
  const { id, iconColor, viewHideNavi, currentPcNaviStyle, themeType, displayIcon = '', hideFirstSection } = appPkg;
  const workSheetName = getTranslateInfo(id, workSheetId).name || appItem.workSheetName;
  const childrenOpenKey = `${workSheetId}-open`;
  const isOperation = appPkg.permissionType === 2;
  const childrenItems =
    (isCharge || isOperation) && viewHideNavi
      ? items
      : items.filter(item => [1, 4].includes(item.status) && !item.navigateHide);
  const isCurrentChildren = !!_.find(childrenItems, { workSheetId: activeSheetId });
  const darkColor = [1, 3].includes(currentPcNaviStyle) && !['light'].includes(themeType);
  const [childrenVisible, setChildrenVisible] = useState(
    localStorage.getItem(childrenOpenKey) ? true : isCurrentChildren,
  );
  const [popupVisible, setPopupVisible] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const isActive = !childrenVisible && isCurrentChildren;
  const showIcon = currentPcNaviStyle === 3 && hideFirstSection && appItem.firstGroupIndex === 0 ? true : displayIcon.split('')[1] === '1';

  useEffect(() => {
    if (!sheetListVisible) {
      setChildrenVisible(false);
    }
  }, [sheetListVisible]);

  const svgColor = () => {
    if (darkColor) {
      return `rgba(255, 255, 255, ${0.9})`;
    } else if ([1, 3].includes(currentPcNaviStyle)) {
      return isActive || ['light'].includes(themeType) ? iconColor : '#757575';
    } else {
      return isActive ? iconColor : '#757575';
    }
  };

  const bgColor = () => {
    if ([1, 3].includes(currentPcNaviStyle) && !['light'].includes(themeType)) {
      return themeType === 'theme' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    } else {
      return convertColor(iconColor);
    }
  };

  const renderGroupItems = () => {
    return childrenItems.map((item, index) => (
      <WorkSheetItem
        key={item.workSheetId}
        className={cx({ pLeft40: sheetListVisible })}
        disableTooltip={true}
        appItem={{
          ...item,
          parentId: workSheetId,
          parentStatus: status,
          layerIndex: layerIndex + 1,
          isAppItem: item.type !== 2,
          index,
        }}
        {...otherProps}
      />
    ));
  };

  const renderIcon = () => {
    let icon = 'visibility_off';
    if (status === 3) {
      icon = 'desktop_off';
    }
    if (status === 4) {
      icon = 'mobile_off';
    }
    return (
      [2, 3, 4].includes(status) && (
        <Tooltip
          popupPlacement="right"
          text={<span>{_l('仅系统角色在导航中可见（包含管理员、开发者），应用项权限依然遵循角色权限原则')}</span>}
        >
          <Icon
            className="Font16 mRight10 visibilityIcon"
            icon={icon}
            style={{ color: [1, 3].includes(currentPcNaviStyle) && themeType === 'theme' ? '#FCD8D3' : '#ee6f09' }}
          />
        </Tooltip>
      )
    );
  };

  const renderContent = () => {
    return (
      <Drag
        appItem={appItem}
        appPkg={appPkg}
        isCharge={isCharge}
        onDragEnd={() => {
          window.dragNow = null;
        }}
      >
        <div
          className={cx('workSheetItem flexRow workSheetGroup', `workSheetItem-${workSheetId}`)}
          onClick={e => {
            if (sheetListVisible) {
              const { classList } = e.target;
              if (classList.contains('nameWrap') || classList.contains('name') || classList.contains('arrowIcon')) {
                setChildrenVisible(!childrenVisible);
                if (!childrenVisible) {
                  localStorage.setItem(childrenOpenKey, 1);
                } else {
                  localStorage.removeItem(childrenOpenKey);
                }
              }
            } else {
              setPopupVisible(!popupVisible);
            }
          }}
          onMouseDown={() => {
            window.dragNow = Date.now();
          }}
          onMouseMove={() => {
            const now = Date.now();
            if (window.dragNow && now - window.dragNow > 50) {
              setIsDrag(true);
              setChildrenVisible(false);
            }
          }}
          onMouseUp={() => {
            window.dragNow = null;
            setIsDrag(false);
          }}
          style={{
            backgroundColor: isActive && bgColor(),
          }}
        >
          <div className="NoUnderline valignWrapper h100 nameWrap">
            {showIcon && (
              <div className="iconWrap mRight10">
                <SvgIcon
                  url={iconUrl ? iconUrl : `${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`}
                  fill={svgColor()}
                  size={22}
                />
              </div>
            )}
            <span
              className={cx('name ellipsis Font14 mRight10', { bold: isActive })}
              title={workSheetName}
              style={{
                color: darkColor ? `rgba(255, 255, 255, ${ currentPcNaviStyle === 3 ? 0.9 : 1 })` : isActive ? iconColor : undefined
              }}
            >
              {workSheetName}
            </span>
            {renderIcon()}
          </div>
          {isCharge && (
            <MoreOperation {...props} isGroup>
              <div className="rightArea mRight10 moreBtn">
                <Icon icon="more_horiz" className="Font18 moreIcon" />
              </div>
            </MoreOperation>
          )}
          {sheetListVisible &&
            (childrenVisible ? (
              <Icon className="Font16 arrowIcon" icon="arrow-up-border" />
            ) : (
              <Icon className="Font16 arrowIcon" icon="arrow-down-border" />
            ))}
        </div>
        {sheetListVisible && (
          <div
            className={cx('groupItems overflowHidden', { hide: isDrag })}
            style={{ height: childrenVisible ? (childrenItems.length ? childrenItems.length * 44 + 1 : 0) : 0 }}
          >
            {renderGroupItems()}
          </div>
        )}
      </Drag>
    );
  };

  return (
    <Fragment>
      {sheetListVisible ? (
        renderContent()
      ) : (
        <Trigger
          popupVisible={childrenItems.length ? popupVisible : false}
          onPopupVisibleChange={setPopupVisible}
          action={['hover']}
          popupAlign={{ points: ['tl', 'tr'], offset: [0, -5], overflow: { adjustX: true, adjustY: true } }}
          popup={
            <div className="card z-depth-2 pTop5 pBottom5">
              <div className="workSheetLeft BorderRight0">{renderGroupItems()}</div>
            </div>
          }
        >
          <div>{renderContent()}</div>
        </Trigger>
      )}
    </Fragment>
  );
}
