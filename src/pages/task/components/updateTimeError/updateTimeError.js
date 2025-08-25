﻿import React from 'react';
import moment from 'moment';
import { Dialog } from 'ming-ui';
import './updateTimeError.less';

const errorMessage = startTime => {
  const time = moment(startTime).format(`MM${_l('月')}DD${_l('日')}HH${_l('点')}`);

  return [
    _l('默认值'),
    _l('所有子任务不早于%0开始，截止时间不变', time),
    _l('母任务开始时间设为当前最早子任务开始时间相同'),
    _l('修改后的母任务截止时间早于子任务列表中的最晚截止时间，晚于此截止时间的子任务的截止时间将设为和母任务相同'),
    _l('子任务的开始时间不能早于母任务的开始时间，是否继承母任务的开始时间?'),
    _l('子任务的截止时间不能晚于母任务的截止时间，是否继承母任务的截止时间?'),
  ];
};

/**
 * 修改时间一个错误的提示
 * @param  {string} startTime
 * @param  {array} updateTypes
 * @param  {func} callback
 */
const singleErrorDialog = (startTime, updateTypes, callback) => {
  const message = errorMessage(startTime);

  Dialog.confirm({
    closable: false,
    title: message[updateTypes[0]],
    okText: _l('确定'),
    onOk: () => {
      callback(updateTypes[0]);
    },
  });
};

/**
 * 修改时间多个错误的提示
 * @param  {string} startTime
 * @param  {array} updateTypes
 * @param  {func} callback
 */
const moreErrorDialog = (startTime, updateTypes, callback) => {
  const message = errorMessage(startTime);
  let updateType = updateTypes[0];

  Dialog.confirm({
    closable: false,
    dialogClasses: 'moreErrorDialog',
    title: _l('修改后的母任务开始时间晚于子任务的开始时间。'),
    children: (
      <React.Fragment>
        {updateTypes.map((item, i) => (
          <div className="tanttRadio" data-type={item}>
            <span
              className="tanttRadioItem"
              onClick={e => {
                $('.moreErrorDialog .tanttRadioChcked').removeClass('tanttRadioChcked');
                $(e.target).find('.tanttRadioIcon').addClass('tanttRadioChcked');
                updateType = $(e.target).closest('.tanttRadio').data('type');
              }}
            >
              <span className={`tanttRadioIcon ThemeBorderColor3 ${i === 0 ? 'tanttRadioChcked' : ''}`}>
                <i className="ThemeBGColor3"></i>
              </span>
              {message[item]}
            </span>
          </div>
        ))}
      </React.Fragment>
    ),
    onOk: () => {
      callback(updateType);
    },
  });
};

/**
 * 修改时间二次确认修改
 * @param  {object} source
 * @param  {string} startTime
 * @param  {func} callback
 */
export const updateTimeErrorDialog = (source, startTime, callback) => {
  // 错误需二次确认修改
  if (source.data.updateTypes.length === 1) {
    singleErrorDialog(startTime, source.data.updateTypes, callback);
  } else {
    moreErrorDialog(startTime, source.data.updateTypes, callback);
  }
};

export const updateTimeError = source => {
  // 完全错误
  if (source.error.code === 600) {
    alert(_l('不可早于上级任务的开始时间'), 2);
  } else if (source.error.code === 601) {
    alert(_l('不可晚于上级任务的截止时间'), 2);
  } else if (source.error.code === 602) {
    alert(_l('不可晚于截止时间'), 2);
  } else if (source.error.code === 603) {
    alert(_l('不可早于开始时间'), 2);
  } else if (source.error.code === 1001) {
    alert(_l('有实际开始时间时，计划不可为空'), 2);
  } else if (source.error.code === 30002 || source.error.code === 300020202) {
    alert(_l('权限不足，操作失败'), 2);
  } else {
    alert(_l('操作失败，请稍后重试'), 2);
  }
};

/**
 * 修改任务状态二次确认
 */
export const updateTaskErrorDialog = callback => {
  Dialog.confirm({
    closable: false,
    title: _l('任务还未开始，是否仍要完成此任务？'),
    children: (
      <span style="font-size: 12px;color: #757575;">
        {_l('开始时间不可以晚于结束时间，如果您仍要完成任务，开始时间将被置空')}
      </span>
    ),
    okText: _l('完成任务'),
    onOk: () => {
      callback();
    },
  });
};
