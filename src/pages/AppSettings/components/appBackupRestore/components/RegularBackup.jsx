// 定期备份
import React, { useEffect, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Button, Checkbox, Dialog, Dropdown } from 'ming-ui';
import { Days, RegularBackupTabs } from '../enum';

const RegularBackupWrap = styled.div`
  width: 350px;
  padding: 14px 20px 20px;
  background: #fff;
  box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
  .icon-close {
    position: absolute;
    right: 10px;
    top: 10px;
    font-size: 16px;
  }
  .label {
    width: 70px;
    font-size: 17px;
  }
  .weekWrap {
    border: 1px solid #f5f5f5;
    margin: 6px 0 16px;
  }
  .weekItem {
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-right: 1px solid #f5f5f5;
    &:hover,
    &.active {
      background-color: #1e88e5;
      color: #fff;
    }
  }
  .weekItem:last-child {
    border: none;
  }
`;

const TabWrap = styled.div`
  display: flex;
  padding: 2px;
  background: #f0f0f0;
  border-radius: 3px;
  .tabItem {
    height: 24px;
    border-radius: 3px;
    display: flex;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #757575;
    flex: 1;
  }
  .active {
    color: #1e88e5;
    background-color: #fff;
  }
`;

const DaySelectWrap = styled.div`
  width: 240px;
  height: 190px;
  -webkit-flex-wrap: wrap;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  display: flex;
  background-color: #fff;
  box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
  padding: 15px;
  font-weight: 500;
  .dayItem {
    width: 30px;
    height: 30px;
    text-align: center;
    line-height: 30px;
    border-radius: 1px;
    &.active {
      color: #fff;
      background-color: #1e88e5;
    }
  }
`;

export default function RegularBackup(props) {
  const { editBackupTaskInfo = () => {}, updatePopupVisibleChange = () => {} } = props;
  const [backupTask, setBackupTask] = useState(props.backupTask ? props.backupTask : {});
  const { cycleType, cycleValue, datum = false } = backupTask;

  const updateData = data => {
    setBackupTask(data.status === 0 ? { status: 0 } : { ...backupTask, ...data });
  };

  // 开启/更新定期备份
  const handleSave = () => {
    updatePopupVisibleChange(false);
    if (_.get(props, 'backupTask.status') === 1) {
      editBackupTaskInfo({ ...backupTask, status: 1 });
      return;
    }
    Dialog.confirm({
      title: _l('开启定期备份'),
      description: _l('备份将于下个周期凌晨时段开始自动执行'),
      okText: _l('立即开启'),
      onOk: () => editBackupTaskInfo({ ...backupTask, status: 1 }),
    });
  };

  // 关闭定期备份
  const handleCloseBackupTask = () => {
    updatePopupVisibleChange(false);
    Dialog.confirm({
      title: _l('关闭定期备份'),
      description: _l('系统将不再定期备份您的应用数据'),
      okText: _l('确认关闭'),
      onOk: () => {
        setBackupTask({ status: 0, datum: false });
        editBackupTaskInfo({ ...backupTask, status: 0, datum: false });
      },
    });
  };

  // 取消（关闭弹层）
  const handleCancel = () => {
    updateData(props.backupTask);
    updatePopupVisibleChange(false);
  };

  useEffect(() => {
    setBackupTask(props.backupTask);
  }, [props.backupTask]);

  const renderDay = () => {
    return (
      <DaySelectWrap>
        {Days.map(item => (
          <div
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
      <div className="flexRow mBottom16">
        <div className="Font17 bold">{_l('定期备份')}</div>
        <i className="icon icon-close Hand" onClick={handleCancel} />
      </div>

      <div className="flexRow">
        <div className="label mTop6">{_l('周期：')}</div>
        <div className="flex">
          <Dropdown
            className={cx('w100', { mBottom24: !cycleType || cycleType === 1 })}
            menuClass="w100"
            placeholder={_l('请选择')}
            border={true}
            data={RegularBackupTabs}
            value={cycleType}
            onChange={value => updateData({ cycleType: value, cycleValue: undefined })}
          />
          {cycleType === 2 && (
            <div className="flexRow weekWrap">
              {[_l('日'), _l('一'), _l('二'), _l('三'), _l('四'), _l('五'), _l('六')].map((item, index) => (
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
            <Trigger
              action={['click']}
              popup={renderDay}
              destroyPopupOnHide={true}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [0, 1],
                overflow: {
                  adjustX: true,
                  adjustY: true,
                },
              }}
            >
              <div className="ming Dropdown pointer mTop18 mBottom15 w100 ">
                <div className="Dropdown--input Dropdown--border">
                  <div className="flex">
                    {cycleValue ? _l('%0日', cycleValue) : <span className="Gray_bd">{_l('请选择')}</span>}
                  </div>
                  <i className="icon icon-arrow-down-border mLeft8 Gray_9e" />
                </div>
              </div>
            </Trigger>
          )}
        </div>
      </div>
      <div className="flexRow alignItemsCenter">
        <div className="label">{_l('范围：')}</div>
        <div className="flex flexRow">
          <Checkbox className="mRight16" text={_l('备份应用')} disabled={true} checked={true} />
          {(!md.global.Config.IsLocal || md.global.SysSettings.enableBackupWorksheetData) && (
            <Checkbox text={_l('备份数据')} checked={datum} onClick={checked => updateData({ datum: !checked })} />
          )}
        </div>
      </div>

      <div className="flexRow mTop24 alignItemsCenter">
        {_.get(props, 'backupTask.status') === 1 && (
          <div className="Font15 Hand Gray_75" onClick={handleCloseBackupTask}>
            {_l('关闭定期备份')}
          </div>
        )}
        <div className="flex"></div>
        <Button type="link" onClick={handleCancel}>
          {_l('取消')}
        </Button>
        <Button
          disabled={
            _.isEqual(backupTask, props.backupTask) ||
            !backupTask.cycleType ||
            (_.isUndefined(backupTask.cycleValue) && backupTask.cycleType !== 1)
          }
          onClick={handleSave}
        >
          {_l('保存')}
        </Button>
      </div>
    </RegularBackupWrap>
  );
}
