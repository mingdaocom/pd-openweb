import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Icon, Tooltip } from 'ming-ui';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import SvgIcon from 'src/components/SvgIcon';
import WorkSheetItem, { convertColor } from './WorkSheetItem';
import MoreOperation from './MoreOperation';
import Drag from './Drag';
import { getTranslateInfo } from 'src/util';

export default function WorkSheetGroup(props) {
  const { appItem, ...otherProps } = props;
  const { sheetListVisible, isCharge, activeSheetId, appPkg } = otherProps;
  const { workSheetId, icon, iconUrl, status, layerIndex, items = [] } = appItem;
  const { id, iconColor, viewHideNavi, currentPcNaviStyle, themeType } = appPkg;
  const workSheetName = getTranslateInfo(id, workSheetId).name || appItem.workSheetName;
  const childrenOpenKey = `${workSheetId}-open`;
  const isOperation = appPkg.permissionType === 2;
  const childrenItems = (isCharge || isOperation) && viewHideNavi ? items : items.filter(item => item.status === 1 && !item.navigateHide);
  const isCurrentChildren = !!_.find(childrenItems, { workSheetId: activeSheetId });
  const darkColor = currentPcNaviStyle === 1 && !['light'].includes(themeType);
  const [childrenVisible, setChildrenVisible] = useState(localStorage.getItem(childrenOpenKey) ? true : isCurrentChildren);
  const [popupVisible, setPopupVisible] = useState(false);
  const [isDrag, setIsDrag] = useState(false);
  const isActive = !childrenVisible && isCurrentChildren;

  useEffect(() => {
    if (!sheetListVisible) {
      setChildrenVisible(false);
    }
  }, [sheetListVisible]);

  const svgColor = () => {
    if (darkColor) {
      return `rgba(255, 255, 255, ${isActive ? 1 : 0.9})`;
    } else if (currentPcNaviStyle === 1) {
      return isActive || ['light'].includes(themeType) ? iconColor : '#757575';
    } else {
      return isActive ? iconColor : '#757575';
    }
  }

  const bgColor = () => {
    if (currentPcNaviStyle === 1 && !['light'].includes(themeType)) {
      return themeType === 'theme' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)';
    } else {
      return convertColor(iconColor);
    }
  }

  const renderGroupItems = () => {
    return (
      childrenItems.map((item, index) => (
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
            index
          }}
          {...otherProps}
        />
      ))
    );
  }

  const renderContent = () => {
    return (
      <Drag appItem={appItem} appPkg={appPkg} isCharge={isCharge} onDragEnd={() => { window.dragNow = null; }}>
        <div
          className={cx('workSheetItem flexRow workSheetGroup', `workSheetItem-${workSheetId}`)}
          onClick={(e) => {
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
            backgroundColor: isActive && bgColor()
          }}
        >
          <div className="NoUnderline valignWrapper h100 nameWrap">
            <div className="iconWrap">
              <SvgIcon url={iconUrl ? iconUrl : `${md.global.FileStoreConfig.pubHost}/customIcon/${icon}.svg`} fill={svgColor()} size={22} />
            </div>
            <span
              className={cx('name ellipsis Font14 mLeft10 mRight10', { bold: isActive })}
              title={workSheetName}
              style={{ color: darkColor ? '#FFF' : (isActive ? iconColor : undefined) }}
            >
              {workSheetName}
            </span>
            {status === 2 && (
              <Tooltip
                popupPlacement="right"
                text={<span>{_l('仅系统角色在导航中可见（包含管理员、运营者、开发者），应用项权限依然遵循角色权限原则')}</span>
              }>
                <Icon className="Font16 mRight10" icon="visibility_off" style={{ color: currentPcNaviStyle === 1 && themeType === 'theme' ? '#FCD8D3' : '#ee6f09' }} />
              </Tooltip>
            )}
          </div>
          {isCharge && (
            <MoreOperation {...props} isGroup>
              <div className="rightArea mRight10 moreBtn">
                <Icon icon="more_horiz" className="Font18 moreIcon" />
              </div>
            </MoreOperation>
          )}
          {sheetListVisible && (
            childrenVisible ? <Icon className="Font16 arrowIcon" icon="arrow-up-border" /> : <Icon className="Font16 arrowIcon" icon="arrow-down-border" />
          )}
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
  }

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
          popup={(
            <div className="card z-depth-2 pTop5 pBottom5">
              <div className="workSheetLeft BorderRight0">
                {renderGroupItems()}
              </div>
            </div>
          )}
        >
          <div>{renderContent()}</div>
        </Trigger>
      )}
    </Fragment>
  );
}
