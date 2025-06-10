import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon, SvgIcon, Tooltip } from 'ming-ui';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'worksheet/constants/enum';
import { getTranslateInfo } from 'src/utils/app';
import SettingMenu from './SettingMenu';

export default function HideItem(props) {
  const {
    appId,
    item = {},
    currentViewId,
    type,
    toView,
    isCharge,
    updateAdvancedSetting,
    updateViewName,
    onRecycle,
  } = props;

  const [visible, setVisible] = useState(false);
  const [edit, setEdit] = useState(false);
  const nameRef = useRef(null);
  let focusFlag = false;
  const isSimple = type === 'recycle';

  const clickEditName = () => {
    setEdit(true);
    setVisible(false);
  };

  const renderSettingMenu = () => {
    return (
      <SettingMenu
        {...props}
        editName={true}
        clickEditName={clickEditName}
        onChangeHidden={async showhiden => {
          setVisible(false);
          await toView();
          updateAdvancedSetting({
            ...item,
            advancedSetting: {
              showhide: showhiden,
            },
            editAttrs: ['advancedSetting'],
            editAdKeys: ['showhide'],
          });
        }}
        handleClose={() => setVisible(false)}
      />
    );
  };

  const handleSaveName = event => {
    const value = event.target.value.trim();
    const { name } = item;
    if (!edit) return;
    if (value && name !== value) {
      item.name = value;
      updateViewName(item);
    }
    setEdit(false);
  };

  const handleFocus = _.debounce(event => {
    focusFlag = true;
    nameRef && nameRef.current && nameRef.current.select();
  }, 500);

  const clickHandle = e => {
    toView();
  };

  const viewInfo = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[item.viewType]) || {};
  const isCustomize = ['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType]);
  return (
    <li
      style={{ zIndex: 999999 }}
      className={cx('drawerWorksheetShowListItem', {
        active: item.viewId === currentViewId,
        pLeft16: isSimple,
        pRight12: isSimple,
      })}
      onClick={clickHandle}
    >
      {!isSimple && <Icon icon="drag_indicator" className="Font16" style={isCharge ? {} : { opacity: 0 }} />}
      {isCustomize ? (
        <SvgIcon
          url={_.get(item, 'pluginInfo.iconUrl') || 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg'}
          fill={_.get(item, 'pluginInfo.iconColor') || '#445A65'}
          size={18}
        />
      ) : (
        <Icon style={{ color: viewInfo.color, fontSize: '20px' }} icon={viewInfo.icon} />
      )}
      {edit ? (
        <input
          autoFocus
          ref={nameRef}
          className="viewName sideEditName"
          defaultValue={item.name}
          onBlur={handleSaveName}
          onKeyDown={event => {
            if (event.which === 13) {
              handleSaveName(event);
            }
          }}
          onFocus={handleFocus}
        />
      ) : (
        <span className="viewName ellipsis">{getTranslateInfo(appId, null, item.viewId).name || item.name}</span>
      )}
      {isCharge &&
        type === 'drawerWorksheetShowList' &&
        _.get(item, 'advancedSetting.showhide') &&
        _.get(item, 'advancedSetting.showhide').search(/hpc|happ/g) > -1 && (
          <Icon
            icon={_.get(item, 'advancedSetting.showhide').includes('hpc') ? 'desktop_off' : 'mobile_off'}
            style={{ color: '#EE6F08' }}
            className="Font17 hideicon"
          />
        )}
      {isCharge && !isSimple && (
        <Trigger
          popupVisible={visible}
          onPopupVisibleChange={value => setVisible(value)}
          popupClassName="HiddenItemTrigger"
          action={['click']}
          popup={renderSettingMenu()}
          popupAlign={{ points: ['tl', 'bl'], overflow: { adjustX: true, adjustY: true } }}
        >
          <Icon className="Font20 Gray_9e more" icon="more_horiz" />
        </Trigger>
      )}
      {isSimple && (
        <span className="recycleWrap">
          <span className="time Gray_9e Font13">{createTimeSpan(item.deleteTime)}</span>
          <Tooltip text={_l('还原')}>
            <Icon
              icon="back"
              className="recycleIcon Font18 Gray_9d Hover_21 mTop3"
              onClick={() => onRecycle(item.viewId)}
            />
          </Tooltip>
        </span>
      )}
    </li>
  );
}
