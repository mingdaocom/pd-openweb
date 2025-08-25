import React, { useRef, useState } from 'react';
import store from 'redux/configureStore';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Icon } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import { updateSheetListAppItem } from 'worksheet/redux/actions/sheetList';
import ConfigSideWrap from 'src/pages/customPage/components/ConfigSideWrap';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { FlexCenter } from './util';

const DisplayType = [
  { type: 'web', icon: 'desktop', text: _l('桌面配置') },
  { type: 'mobile', icon: 'mobile_phone', text: _l('移动配置') },
];
const ConfigHeader = styled(FlexCenter)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  padding: 0 24px;
  z-index: 9;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.24);
  .iconWrap {
    padding-right: 24px;
    cursor: pointer;
    .back {
      color: #757575;
      &:hover {
        color: #151515;
      }
    }
  }
  .pageName {
    display: flex;
    align-items: center;
    font-size: 17px;
    .name {
      box-sizing: border-box;
      max-width: 240px;
      margin-top: 1px;
      padding: 0 10px;
      border-bottom: 1px dashed #9e9e9e;
      cursor: pointer;
    }
    input {
      border: none;
      font-size: 17px;
      border-bottom: 2px solid #1677ff;
    }
  }
  .displayType {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    margin-right: 20px;
    li {
      height: 32px;
      padding: 1px 5px;
      cursor: pointer;
      transition: all 0.25s;
      font-size: 22px;
      color: #9e9e9e;
      border-radius: 4px;
      margin-right: 4px;
      &.highlight {
        background-color: #efefef;
      }
      &:hover {
        background-color: #f5f5f5;
      }
    }
    &::after {
      content: '';
      position: absolute;
      right: -11px;
      width: 1px;
      height: 12px;
      background: #dfdfdf;
    }
  }
  .pageSetting {
    &:hover * {
      color: #1677ff !important;
    }
  }
  .close {
    background-color: #f5f5f5;
    color: #9e9e9e;
    margin-right: 10px;
    &:hover {
      background-color: #eaeaea;
      color: #9e9e9e;
    }
  }
  .complete {
    width: 80px;
    cursor: pointer;
  }
`;
export default props => {
  const {
    appId,
    groupId,
    pageId,
    pageName,
    displayType,
    currentSheet,
    apk = {},
    saveLoading = false,
    cancelModified = _.noop,
    modified,
    updatePageInfo = _.noop,
    onBack = _.noop,
    onSave = _.noop,
    switchType = _.noop,
  } = props;
  const [isEdit, setEdit] = useState(false);
  const [name, setName] = useState(pageName);
  const [configVisible, setConfigVisible] = useState(false);
  const { current: originName } = useRef(pageName);
  const save = () => {
    onSave();
    const newName = name.trim();
    if (originName !== newName) {
      appManagementAjax
        .editWorkSheetInfoForApp({
          appId,
          appSectionId: currentSheet.parentGroupId || groupId,
          workSheetId: pageId,
          workSheetName: newName,
        })
        .then(res => {
          if (res) {
            updatePageInfo({ pageName: newName });
            const { currentPcNaviStyle } = store.getState().appPkg;
            if ([1, 3].includes(currentPcNaviStyle)) {
              const singleRef = getAppSectionRef(groupId);
              singleRef.dispatch(
                updateSheetListAppItem(pageId, {
                  workSheetName: newName,
                }),
              );
            } else {
              props.updateSheetListAppItem(pageId, { workSheetName: newName });
            }
          }
        });
    }
  };
  const handleClose = () => {
    if (!modified) {
      onBack();
      return;
    }
    Dialog.confirm({
      width: 520,
      onlyClose: true,
      className: 'customButtonConfirm',
      title: _l('您是否要保存本次更改'),
      description: _l('当前有未保存的更改，您在离开页面前是否要保存这些更改'),
      okText: _l('是，保存修改'),
      cancelText: _l('否，放弃保存'),
      onOk: save,
      onCancel: cancelModified,
    });
  };
  return (
    <ConfigHeader>
      {apk.appId && (
        <div className="iconWrap" onClick={handleClose}>
          <i className="back icon-backspace Font24"></i>
        </div>
      )}
      <div className="pageName">
        <span className="Bold mRight10">{_l('编辑自定义页面：')}</span>
        {isEdit ? (
          <input
            autoFocus
            value={name}
            onChange={e => {
              const newName = e.target.value;
              setName(newName);
              updatePageInfo({ modified: true });
            }}
            onBlur={() => {
              if (!name) {
                setName(originName);
              }
              setEdit(false);
            }}
          />
        ) : (
          <div className="name overflow_ellipsis" onClick={() => setEdit(true)}>
            {name}
          </div>
        )}
      </div>
      <div className="flex"></div>
      <ul className="displayType">
        {DisplayType.map(({ type, icon, text }) => (
          <li
            data-tip={text}
            className={cx({ highlight: type === displayType })}
            key={type}
            onClick={() => switchType(type)}
          >
            <i className={`icon-${icon}`}></i>
          </li>
        ))}
      </ul>
      <div className="flexRow alignItemsCenter pointer mRight20 pageSetting" onClick={() => setConfigVisible(true)}>
        <Icon className="Font20 Gray_75" icon="design-services" />
        <div className="mLeft5 Font13 bold">{_l('页面配置')}</div>
      </div>
      {apk.appId && (
        <Button type="link" className="close" onClick={handleClose}>
          {_l('关闭')}
        </Button>
      )}
      <Button onClick={save} loading={saveLoading}>
        {_l('保存')}
      </Button>
      {configVisible && <ConfigSideWrap {...props} onClose={() => setConfigVisible(false)} />}
    </ConfigHeader>
  );
};
