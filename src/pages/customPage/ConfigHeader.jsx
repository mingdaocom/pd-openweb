import React, { useState, useRef } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import { editWorkSheetInfoForApp } from 'src/api/appManagement';
import { Button, Dialog } from 'ming-ui';
import cx from 'classnames';
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
        color: #333;
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
      border-bottom: 2px solid #2196f3;
    }
  }
  .displayType {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    li {
      height: 100%;
      line-height: 50px;
      padding: 0 20px;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.25s;
      font-size: 22px;
      color: #9e9e9e;
      &.highlight,
      &:hover {
        color: #2196f3;
      }
      &:hover {
        border-color: #2196f3;
      }
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
export default ({
  appId,
  groupId,
  pageId,
  pageName,
  displayType,
  updateSheetList,
  saveLoading = false,
  cancelModified = _.noop,
  modified,
  updatePageInfo = _.noop,
  onBack = _.noop,
  onSave = _.noop,
  switchType = _.noop,
}) => {
  const [isEdit, setEdit] = useState(false);
  const [name, setName] = useState(pageName);
  const { current: originName } = useRef(pageName);
  const save = () => {
    onSave();
    if (originName !== name) {
      editWorkSheetInfoForApp({ appId, appSectionId: groupId, workSheetId: pageId, workSheetName: name }).then(res => {
        if (res) {
          updatePageInfo({ pageName: name });
          updateSheetList(pageId, { workSheetName: name });
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
      <div className="iconWrap" onClick={handleClose}>
        <i className="back icon-backspace Font24"></i>
      </div>
      <div className="pageName">
        <span className="Bold mRight10">{_l('编辑自定义页面:  ')}</span>
        {isEdit ? (
          <input
            autoFocus
            value={name}
            onChange={e => {
              const newName = e.target.value.trim();
              setName(newName);
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
      <div className="flex"></div>
      <Button type="link" className="close" onClick={handleClose}>
        {_l('关闭')}
      </Button>
      <Button onClick={save} loading={saveLoading}>{_l('保存')}</Button>
    </ConfigHeader>
  );
};
