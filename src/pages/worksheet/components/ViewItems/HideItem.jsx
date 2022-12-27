import React, { useState, useEffect, useRef } from 'react';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import HiddenMenu from './HiddenMenu';
import _ from 'lodash';

export default function HideItem(props) {
  const {
    item = {},
    viewList,
    currentViewId,
    type,
    toView,
    onCopyView,
    isCharge,
    updateAdvancedSetting,
    onRemoveView,
    updateViewName,
    handleSortEnd,
  } = props;
  const [visible, setVisible] = useState(false);
  const [changeHiddenTypeVisible, setChangeHiddenTypeVisible] = useState(false);
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
    setStatus(undefined);
    handleSortEnd(_prop);
  }, [viewList]);

  const clickEditName = () => {
    setEdit(true);
    setVisible(false);
  };

  const renderSettingMenu = () => {
    return (
      <Menu className="viewItemMoreOperate">
        {isCharge && (
          <MenuItem icon={<Icon icon="workflow_write" className="Font18" />} onClick={clickEditName}>
            <span className="text">{_l('重命名')}</span>
          </MenuItem>
        )}
        {isCharge && (
          <MenuItem
            icon={<Icon icon="content-copy" className="Font16" />}
            onClick={() => {
              onCopyView(item);
              setStatus('copy');
              setVisible(false);
            }}
          >
            <span className="text">{_l('复制')}</span>
          </MenuItem>
        )}
        {isCharge && <hr className="splitLine" />}
        {isCharge && (
          <MenuItem
            icon={
              <Icon
                icon={item.advancedSetting.showhide !== 'hide' ? 'visibility_off' : 'visibility'}
                className="Font16"
              />
            }
            className="hiddenTypeMenuWrap"
            onMouseEnter={() => setChangeHiddenTypeVisible(true)}
            onMouseLeave={() => setChangeHiddenTypeVisible(false)}
          >
            <span className="text">
              {item.advancedSetting.showhide !== 'hide' ? _l('从导航栏中隐藏') : _l('取消隐藏')}
            </span>
            <Icon icon="arrow-right-tip Font14" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            {changeHiddenTypeVisible && (
              <HiddenMenu
                showhide={item.advancedSetting.showhide || 'show'}
                onClick={async showhiden => {
                  setVisible(false);
                  await toView();
                  updateAdvancedSetting({
                    ...item,
                    advancedSetting: {
                      ...item.advancedSetting,
                      showhide: showhiden,
                    },
                  });
                }}
                style={{ top: '-6px', left: '100%' }}
              />
            )}
          </MenuItem>
        )}
        {isCharge && (
          <MenuItem
            icon={<Icon icon="hr_delete" className="Font18" />}
            className="delete"
            onClick={() => {
              onRemoveView(item);
              setVisible(false);
            }}
          >
            <span className="text">{_l('删除视图')}</span>
          </MenuItem>
        )}
      </Menu>
    );
  };

  const handleSaveName = (event) => {
    if(!focusFlag) return;
    const value = event.target.value.trim();
    const { name } = item;
    if (value && name !== value) {
      item.name = value;
      updateViewName(item);
    }
    setEdit(false);
  };

  const handleFocus = _.debounce((event) => {
    focusFlag=true;
    nameRef && nameRef.current && nameRef.current.select();
  }, 500);

  const clickHandle = e => {
    if (!e.target.className.includes('icon')) {
      toView();
    }
  };

  const viewInfo = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[item.viewType]) || {};

  return (
    <li
      style={{ zIndex: 999999 }}
      className={`${item.viewId === currentViewId ? 'active' : ''} drawerWorksheetShowListItem`}
      onClick={clickHandle}
    >
      <Icon icon="drag_indicator" className="Font16"/>
      <Icon
        style={{ color: viewInfo.color, fontSize: '20px' }}
        icon={viewInfo.icon}
      />
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
        <span className="viewName ellipsis">{item.name}</span>
      )}
      {type === 'drawerWorksheetShowList' &&
        item.advancedSetting.showhide &&
        item.advancedSetting.showhide.search(/hpc|happ/g) > -1 && (
          <Icon
            icon={item.advancedSetting.showhide.includes('hpc') ? 'desktop_off' : 'mobile_off'}
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
