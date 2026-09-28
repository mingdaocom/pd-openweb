import React, { Fragment, useEffect, useState } from 'react';
import { useMeasure } from 'react-use';
import cx from 'classnames';
import { isEmpty } from 'lodash';
import styled from 'styled-components';
import { SvgIcon } from 'ming-ui';
import { Input, Popover } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import { MINGO_TASK_STATUS } from 'src/components/Mingo/ChatBot/enum';
import { getCustomIconUrl } from 'src/utils/domain/shared/applicationIcons';
import { emitter } from 'src/utils/platform/browser/dom';

const Con = styled.div`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border-primary);
  background: var(--color-primary-transparent);
  margin-bottom: 10px;
  .label {
    font-size: 13px;
    color: var(--color-text-secondary);
    margin-bottom: 5px;
    font-weight: bold;
  }
  .content:not(:last-child) {
    margin-bottom: 10px;
  }
  .generate-worksheet-controls {
    margin: 6px 0;
    background: var(--color-mingo);
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 12px;
    border-radius: 18px;
    color: var(--color-white);
    font-size: 13px;
    font-weight: bold;
    cursor: pointer;
  }
  .icon-select-trigger {
    height: 36px;
    border-radius: 6px;
    border: 1px solid var(--color-border-primary);
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    background: var(--color-background-input);
    padding: 0 10px;
  }
  &:not(.is-editing) {
    padding: 9px;
    background: var(--color-primary-transparent);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    .iconCon {
      width: 46px;
      height: 46px;
      border-radius: 8px;
      background: var(--color-background-tertiary);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .worksheetName {
      font-size: 15px;
      color: var(--color-text-title);
      margin-left: 13px;
    }
  }
`;

const IconSelector = styled.div`
  padding: 10px;
  .title {
    font-size: 12px;
    color: var(--color-text-tertiary);
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
      color: var(--color-text-secondary);
      &:hover {
        background: var(--color-background-hover);
      }
      &.active {
        color: #732ed1;
        background: #732ed112;
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
              className="w100"
              value={worksheetName}
              onChange={event => {
                setWorksheetName(event.target.value);
              }}
              onBlur={() => {
                //
              }}
            />
          </div>
          <div className="label">{_l('图标')}</div>
          <div className="content">
            <Popover
              noPadding
              trigger="click"
              open={popupVisible}
              onOpenChange={setPopupVisible}
              destroyOnHidden
              content={
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
                          url={getCustomIconUrl(icon.fileName)}
                          size={22}
                          fill={selectedIconName === icon.fileName ? '#732ED1' : 'var(--color-text-secondary)'}
                        />
                      </div>
                    ))}
                  </div>
                </IconSelector>
              }
              placement="bottomLeft"
            >
              <div className="icon-select-trigger">
                <SvgIcon
                  url={getCustomIconUrl(selectedIconName)}
                  fill={selectedIconName === selectedIconName ? '#732ED1' : 'var(--color-text-secondary)'}
                  size={22}
                />
                <i className="icon icon-arrow-down-border textTertiary Font15"></i>
              </div>
            </Popover>
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
              <SvgIcon url={getCustomIconUrl(selectedIconName)} fill={'#732ED1'} size={22} />
            </div>
            <span className="worksheetName">{worksheetName}</span>
          </div>
          <i className="icon icon-edit textTertiary Font15 Hand" onClick={() => setIsEditing(true)}></i>
        </Fragment>
      )}
    </Con>
  );
}
