import React, { Fragment, useEffect, useState } from 'react';
import { useMeasure } from 'react-use';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Input, SvgIcon } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import { MINGO_TASK_STATUS } from 'src/components/Mingo/ChatBot/enum';
import { emitter } from 'src/utils/common';

const Con = styled.div`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #f7f8f9;
  margin-bottom: 10px;
  .label {
    font-size: 13px;
    color: #757575;
    margin-bottom: 5px;
    font-weight: bold;
  }
  .content:not(:last-child) {
    margin-bottom: 10px;
  }
  .generate-worksheet-controls {
    margin: 6px 0;
    background: var(--ai-primary-color);
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
    border-radius: 18px;
    color: #fff;
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
  }
  .icon-select-trigger {
    height: 36px;
    border-radius: 6px;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    background: #fff;
    padding: 0 10px;
  }
  &:not(.is-editing) {
    padding: 9px;
    background: #f7f8f9;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .iconCon {
      width: 46px;
      height: 46px;
      border-radius: 8px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .worksheetName {
      font-size: 15px;
      color: #151515;
      margin-left: 13px;
    }
  }
`;

const IconSelector = styled.div`
  padding: 10px;
  border-radius: 3px;
  background: #fff;
  box-shadow: 0px 3px 12px 1px rgba(0,0,0,0.16);
  .title {
    font-size: 12px;
    color: #9e9e9e;
  }
  .iconList {
    margin-top: 10px;
    .iconItem {
      width: 36px;
      height: 36px;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #757575;
      &:hover {
        background: #f5f5f5;
      }
      &.active {
        color: #732ED1
        background: #732ED112;
      }
    }
  }
`;

function checkIsEditing(taskStatus) {
  return (
    taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_BEGIN_CREATE_WORKSHEET ||
    taskStatus === MINGO_TASK_STATUS.CREATE_WORKSHEET_ASSIGNMENT_CREATE_WORKSHEET_SUCCESS
  );
}

export default function MingoEditWorksheetInfo({
  taskStatus,
  icons,
  onBeginGenerateWidgets = () => {},
  appId,
  worksheetId,
  ...rest
}) {
  const [worksheetName, setWorksheetName] = useState(rest.worksheetName);
  const [selectedIconName, setSelectedIconName] = useState(rest.iconName);
  const [isEditing, setIsEditing] = useState(checkIsEditing(taskStatus));
  const [popupVisible, setPopupVisible] = useState(false);
  const [ref, { width }] = useMeasure();
  useEffect(() => {
    setIsEditing(checkIsEditing(taskStatus));
  }, [taskStatus]);
  return (
    <Con className={cx(isEditing && 'is-editing')} ref={ref}>
      {isEditing && (
        <Fragment>
          <div className="label">{_l('名称')}</div>
          <div className="content">
            <Input
              className="w100 Font14"
              value={worksheetName}
              onChange={value => {
                setWorksheetName(value);
              }}
              onBlur={() => {
                //
              }}
            />
          </div>
          <div className="label">{_l('图标')}</div>
          <div className="content">
            <Trigger
              action={['click']}
              popupVisible={popupVisible}
              onPopupVisibleChange={setPopupVisible}
              destroyPopupOnHide
              popup={
                <IconSelector style={{ width: width }}>
                  <div className="title">{_l('AI推荐')}</div>
                  <div className="iconList t-flex t-flex-row t-flex-wrap">
                    {icons.map(icon => (
                      <div
                        className={cx('iconItem', { active: selectedIconName === icon.fileName })}
                        key={icon.icon}
                        onClick={e => {
                          setSelectedIconName(icon.fileName);
                          setPopupVisible(false);
                          e.stopPropagation();
                        }}
                      >
                        <SvgIcon
                          url={`https://fp1.mingdaoyun.cn/customIcon/${icon.fileName}.svg`}
                          size={22}
                          fill={selectedIconName === icon.fileName ? '#732ED1' : '#757575'}
                        />
                      </div>
                    ))}
                  </div>
                </IconSelector>
              }
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [0, 2],
              }}
            >
              <div className="icon-select-trigger">
                <SvgIcon
                  url={`https://fp1.mingdaoyun.cn/customIcon/${selectedIconName}.svg`}
                  fill={selectedIconName === selectedIconName ? '#732ED1' : '#757575'}
                  size={22}
                />
                <i className="icon icon-arrow-down-border Gray_9e Font15"></i>
              </div>
            </Trigger>
          </div>
          <div
            className="generate-worksheet-controls"
            onClick={() => {
              if (checkIsEditing(taskStatus)) {
                onBeginGenerateWidgets();
              } else {
                if (isEmpty(worksheetName)) {
                  alert(_l('请输入名称'), 3);
                  return;
                }
                appManagementAjax
                  .editWorkSheetInfoForApp({
                    worksheetId,
                    appId,
                    worksheetName,
                    icon: selectedIconName,
                    sourceType: 1,
                  })
                  .then(() => {
                    alert(_l('保存成功'));
                    setIsEditing(false);
                    emitter.emit('UPDATE_WORKSHEET_NAME', { worksheetId, worksheetName });
                  })
                  .catch(() => {});
              }
            }}
          >
            {checkIsEditing(taskStatus) ? _l('下一步，生成表单字段') : _l('确定')}
          </div>
        </Fragment>
      )}
      {!isEditing && (
        <Fragment>
          <div className="t-flex t-flex-row t-items-center t-space-between">
            <div className="iconCon">
              <SvgIcon
                url={`https://fp1.mingdaoyun.cn/customIcon/${selectedIconName}.svg`}
                fill={'#732ED1'}
                size={22}
              />
            </div>
            <span className="worksheetName">{worksheetName}</span>
          </div>
          <i className="icon icon-edit Gray_9e Font15 Hand" onClick={() => setIsEditing(true)}></i>
        </Fragment>
      )}
    </Con>
  );
}
