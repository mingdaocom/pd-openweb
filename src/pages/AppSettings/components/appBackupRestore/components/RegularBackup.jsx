// 定期备份
import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Checkbox, Modal, Popover, Select } from 'ming-ui/antd-components';
import { Days, RegularBackupTabs } from '../enum';

const RegularBackupWrap = styled.div`
  .label {
    width: 70px;
    font-size: 17px;
  }
  .weekWrap {
    border: 1px solid var(--color-background-secondary);
    margin: 6px 0 16px;
  }
  .weekItem {
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-right: 1px solid var(--color-background-secondary);
    &:hover,
    &.active {
      background-color: var(--color-primary);
      color: var(--color-white);
    }
  }
  .weekItem:last-child {
    border: none;
  }
`;

const DaySelectWrap = styled.div`
  width: 240px;
  height: 190px;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  display: flex;
  padding: 15px;
  font-weight: 500;
  .dayItem {
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    border-radius: 1px;
    &.active {
      color: var(--color-white);
      background-color: var(--color-primary);
    }
  }
`;

const DaySelectTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: 100%;
  height: 36px;
  padding: 5px 5px 5px 12px;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  background: var(--color-background-input);
  &:hover {
    border-color: var(--color-primary);
  }
`;

const isSaveDisabled = (backupTask, originalBackupTask) =>
  _.isEqual(backupTask, originalBackupTask) ||
  !backupTask.cycleType ||
  (_.isUndefined(backupTask.cycleValue) && backupTask.cycleType !== 1);

function RegularBackupContent({ originalBackupTask, onChange, onCloseBackupTask }) {
  const [backupTask, setBackupTask] = useState(originalBackupTask || {});
  const { cycleType, cycleValue, datum = false } = backupTask;

  const updateData = data => {
    const nextBackupTask = data.status === 0 ? { status: 0 } : { ...backupTask, ...data };
    setBackupTask(nextBackupTask);
    onChange(nextBackupTask);
  };

  const renderDay = () => {
    return (
      <DaySelectWrap>
        {Days.map(item => (
          <div
            key={item}
            className={cx('dayItem Hand', { active: Number(item) === cycleValue })}
            onClick={() => updateData({ cycleValue: Number(item) })}
          >
            {item}
          </div>
        ))}
      </DaySelectWrap>
    );
  };

  return (
    <RegularBackupWrap>
      <div className="flexRow">
        <div className="label mTop6">{_l('周期：')}</div>
        <div className="flex">
          <Select
            className={cx('w100', { mBottom24: !cycleType || cycleType === 1 })}
            placeholder={_l('请选择')}
            value={cycleType}
            options={RegularBackupTabs.map(item => ({ label: item.text, value: item.value }))}
            onChange={value => updateData({ cycleType: value, cycleValue: undefined })}
          />
          {cycleType === 2 && (
            <div className="flexRow weekWrap">
              {[_l('日%25011'), _l('一'), _l('二'), _l('三'), _l('四'), _l('五'), _l('六')].map((item, index) => (
                <div
                  key={index}
                  className={cx('weekItem flex Hand bold', { active: cycleValue === index })}
                  onClick={() => updateData({ cycleValue: index })}
                >
                  {item}
                </div>
              ))}
            </div>
          )}

          {cycleType === 3 && (
            <Popover trigger="click" placement="bottomLeft" noPadding content={renderDay()}>
              <DaySelectTrigger className="pointer mTop18 mBottom15">
                <div className="flex">
                  {cycleValue ? _l('%0日', cycleValue) : <span className="textDisabled">{_l('请选择')}</span>}
                </div>
                <i className="icon icon-arrow-down-border mLeft8 textTertiary" />
              </DaySelectTrigger>
            </Popover>
          )}
        </div>
      </div>
      <div className="flexRow alignItemsCenter">
        <div className="label">{_l('范围：')}</div>
        <div className="flex flexRow">
          <Checkbox className="mRight16" disabled checked>
            {_l('备份应用')}
          </Checkbox>
          {(window.platformENV.isHap ? true : md.global.SysSettings.enableBackupWorksheetData) && (
            <Checkbox
              checked={datum}
              onChange={event =>
                updateData({
                  datum: event.target.checked,
                })
              }
            >
              {_l('备份数据')}
            </Checkbox>
          )}
        </div>
      </div>
      {originalBackupTask.status === 1 && (
        <Button className="mTop24" color="default" variant="text" onClick={() => onCloseBackupTask(backupTask)}>
          {_l('关闭定期备份')}
        </Button>
      )}
    </RegularBackupWrap>
  );
}

export default function openRegularBackupModal({ backupTask = {}, editBackupTaskInfo = () => {} }) {
  const backupTaskRef = { current: backupTask };
  let modal;

  const handleCloseBackupTask = currentBackupTask => {
    modal.destroy();
    Modal.confirm({
      title: _l('关闭定期备份'),
      content: _l('系统将不再定期备份您的应用数据'),
      okText: _l('确认关闭'),
      onOk: () =>
        editBackupTaskInfo({
          ...currentBackupTask,
          status: 0,
          datum: false,
        }),
    });
  };

  const handleSave = () => {
    const currentBackupTask = backupTaskRef.current;
    if (isSaveDisabled(currentBackupTask, backupTask)) return false;

    if (backupTask.status === 1) {
      editBackupTaskInfo({ ...currentBackupTask, status: 1 });
      return;
    }

    Modal.confirm({
      title: _l('开启定期备份'),
      content: _l('备份将于下个周期凌晨时段开始自动执行'),
      okText: _l('立即开启'),
      onOk: () => editBackupTaskInfo({ ...currentBackupTask, status: 1 }),
    });
  };

  modal = Modal.confirm({
    width: 430,
    title: _l('定期备份'),
    content: (
      <RegularBackupContent
        originalBackupTask={backupTask}
        onChange={currentBackupTask => {
          backupTaskRef.current = currentBackupTask;
          modal.update({
            okButtonProps: {
              disabled: isSaveDisabled(currentBackupTask, backupTask),
            },
          });
        }}
        onCloseBackupTask={handleCloseBackupTask}
      />
    ),
    okText: _l('保存'),
    okButtonProps: { disabled: true },
    onOk: handleSave,
  });

  return modal;
}
