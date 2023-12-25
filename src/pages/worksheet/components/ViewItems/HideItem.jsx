import React, { useState, useEffect, useRef } from 'react';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { VIEW_TYPE_ICON, VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import HiddenMenu from './HiddenMenu';
import _ from 'lodash';
import cx from 'classnames';
import SvgIcon from 'src/components/SvgIcon';

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
            <span className="text">{_l('重命名%05004')}</span>
          </MenuItem>
        )}
        {isCharge && !['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType]) && (
          <MenuItem
            icon={<Icon icon="content-copy" className="Font16" />}
            onClick={() => {
              onCopyView(item);
              setStatus('copy');
              setVisible(false);
            }}
          >
            <span className="text">{_l('复制%05003')}</span>
          </MenuItem>
        )}
        {isCharge && <hr className="splitLine" />}
        {isCharge && (
          <MenuItem
            icon={
              <Icon
                icon={_.get(item, 'advancedSetting.showhide') !== 'hide' ? 'visibility_off' : 'visibility'}
                className="Font16"
              />
            }
            className="hiddenTypeMenuWrap"
            onMouseEnter={() => setChangeHiddenTypeVisible(true)}
            onMouseLeave={() => setChangeHiddenTypeVisible(false)}
          >
            <span className="text">
              {_.get(item, 'advancedSetting.showhide') !== 'hide' ? _l('从导航栏中隐藏%05001') : _l('取消隐藏%05002')}
            </span>
            <Icon icon="arrow-right-tip Font14" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
            {changeHiddenTypeVisible && (
              <HiddenMenu
                showhide={_.get(item, 'advancedSetting.showhide') || 'show'}
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
            <span className="text">{_l('删除视图%05000')}</span>
          </MenuItem>
        )}
      </Menu>
    );
  };

  const handleSaveName = event => {
    if (!focusFlag) return;
    const value = event.target.value.trim();
    const { name } = item;
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
    if (!e.target.className.includes('icon')) {
      toView();
    }
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
        <span className="viewName ellipsis">{item.name}</span>
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
