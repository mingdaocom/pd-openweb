import React, { useState, useEffect, useRef } from 'react';
import Trigger from 'rc-trigger';
import { Icon, SvgIcon } from 'ming-ui';
import { VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { getTranslateInfo } from 'src/util';
import _ from 'lodash';
import cx from 'classnames';
import SettingMenu from './SettingMenu';

export default function HideItem(props) {
  const {
    appId,
    item = {},
    viewList,
    currentViewId,
    type,
    toView,
    isCharge,
    updateAdvancedSetting,
    updateViewName,
    handleSortEnd,
  } = props;
  const [visible, setVisible] = useState(false);
  const [edit, setEdit] = useState(false);
  const [status, setStatus] = useState(undefined);
  const nameRef = useRef(null);
  let focusFlag = false;

  useEffect(() => {
    let _prop = {};
    _prop.newIndex = _.findIndex(viewList, l => l.viewId === item.viewId) + 1;
    _prop.oldIndex = viewList.length - 1;
    if (_prop.newIndex === _prop.oldIndex || status !== 'copy') {
      return;
    }
    status !== 'copy' && handleSortEnd(_prop);
    setStatus(undefined);
  }, [viewList]);

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
        onCopy={() => setStatus('copy')}
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
      })}
      onClick={clickHandle}
    >
      <Icon icon="drag_indicator" className="Font16" style={isCharge ? {} : { opacity: 0 }} />
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
      {isCharge && (
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
    </li>
  );
}
