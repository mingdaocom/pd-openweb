import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { TIME_TYPE, TIME_PERIOD_TYPE, WEEKS } from './enum';
import CountDown from './common/CountDown';

export function getNewControlColRow(controls, halfOfNewControl = true) {
  if (!controls.length) {
    return { col: 0, row: 0 };
  }
  const maxRow = Math.max(...controls.map(c => c.row));
  const lastRowWidgets = controls.filter(c => c.row === maxRow);
  const lastRowFirstWidget = _.find(controls, c => c.row === maxRow && c.col === 0) || { half: true };
  const maxCol = Math.max(...lastRowWidgets.map(c => c.col));
  return {
    col: halfOfNewControl && lastRowFirstWidget.half ? (maxCol > 0 ? 0 : 1) : 0,
    row: halfOfNewControl && lastRowFirstWidget.half ? (maxCol > 0 ? maxRow + 1 : maxRow) : maxRow + 1,
  };
}

const defaultHidedControlTypes = [26, 27, 21, 48];

export function getDisabledControls(controls, systemRelatedIds = {}) {
  const defaultHided = controls
    .filter(
      control =>
        defaultHidedControlTypes.includes(control.type) ||
        (defaultHidedControlTypes.includes(control.sourceControlType) && control.type !== 29),
    )
    .map(control => control.controlId);
  const hidedWhenNew = controls
    .filter(control => (control.controlPermissions || '000')[2] === '0')
    .map(control => control.controlId);
  const systemRelated = controls
    .filter(control =>
      [
        systemRelatedIds.ipControlId,
        systemRelatedIds.browserControlId,
        systemRelatedIds.deviceControlId,
        systemRelatedIds.systemControlId,
        systemRelatedIds.extendSourceId,
        _.get(systemRelatedIds, 'weChatSetting.fieldMaps.openId'),
        _.get(systemRelatedIds, 'weChatSetting.fieldMaps.nickName'),
        _.get(systemRelatedIds, 'weChatSetting.fieldMaps.headImgUrl'),
      ].includes(control.controlId),
    )
    .map(control => control.controlId);
  return _.uniqBy(defaultHided.concat(systemRelated).concat(hidedWhenNew));
}

export function overridePos(controls = [], newPosControls = []) {
  const newPos = [{}, ...newPosControls].reduce((a, b) =>
    _.assign({}, a, { [(b || {}).controlId]: _.pick(b || {}, ['col', 'row', 'size']) }),
  );
  const newControls = controls.map(control =>
    _.assign({}, control, newPos[control.controlId] ? newPos[control.controlId] : { col: -1, row: -1 }),
  );
  newControls.forEach((control, index) => {
    if (control.type === 34) {
      const hiddenIds = control.relationControls
        .filter(c => _.includes(defaultHidedControlTypes, c.type))
        .map(c => c.controlId);
      if (hiddenIds.length) {
        control.showControls = control.showControls.filter(id => !_.includes(hiddenIds, id));
      }
    }
    if (control.col === -1 && control.row === -1) {
      newControls[index] = {
        ...control,
        ...getNewControlColRow(newControls, control.half),
      };
    }
  });
  return newControls;
}

export function getLimitWriteTimeDisplayText(type, limitWriteTime) {
  const setting = limitWriteTime[`${type}Setting`];
  if (type === TIME_TYPE.MONTH) {
    switch (setting.monthType) {
      case TIME_PERIOD_TYPE.MONTHLY:
        return _l('每月');
      case TIME_PERIOD_TYPE.SPECIFY_MONTH:
        return setting.defineMonth.join('、') + _l('月');
      case TIME_PERIOD_TYPE.SPECIFY_RANGE_MONTH:
        return setting.defineMonth[0] + _l('至') + setting.defineMonth[setting.defineMonth.length - 1] + _l('月');
      default:
        return;
    }
  } else if (type === TIME_TYPE.DAY) {
    switch (setting.dayType) {
      case TIME_PERIOD_TYPE.DAILY:
        return _l('每天');
      case TIME_PERIOD_TYPE.SPECIFY_DAY:
        return setting.defineDay.join('、') + _l('日');
      case TIME_PERIOD_TYPE.SPECIFY_RANGE_DAY:
        return setting.defineDay[0] + _l('至') + setting.defineDay[setting.defineDay.length - 1] + _l('日');
      case TIME_PERIOD_TYPE.WEEKLY:
        const weekTextArr = setting.defineWeek.map(item => {
          return WEEKS.filter(w => w.value === item)[0].text;
        });
        return weekTextArr.join('、');
      default:
        return;
    }
  } else {
    return setting.hourType === TIME_PERIOD_TYPE.SPECIFY_RANGE_HOUR ? setting.rangHour.join('、') : '';
  }
}

export function isDisplayPromptText(worksheetSettings) {
  const displayPromptText =
    _.get(worksheetSettings, 'linkSwitchTime.isEnable') ||
    _.get(worksheetSettings, 'limitWriteCount.isEnable') ||
    _.get(worksheetSettings, 'limitWriteTime.isEnable');
  return displayPromptText;
}

export function renderLimitInfo(worksheetSettings) {
  const { linkSwitchTime = {}, limitWriteCount = {}, completeNumber, limitWriteTime } = worksheetSettings;

  return (
    <React.Fragment>
      {linkSwitchTime.isEnable && (
        <span className="pRight8">
          {linkSwitchTime.isShowCountDown ? (
            <CountDown
              className="bold Gray mLeft5 mRight5"
              endTime={linkSwitchTime.endTime}
              beforeText={_l('链接将于')}
              afterText={_l('后结束收集')}
              arriveText={_l('链接已结束收集') + ';'}
            />
          ) : (
            <React.Fragment>
              <span> {_l('链接将于')}</span>
              <span className="bold Gray mLeft5 mRight5">
                {moment(linkSwitchTime.endTime).format('YYYY-MM-DD HH:mm')}
              </span>
              <span>{_l('结束收集')};</span>
            </React.Fragment>
          )}
        </span>
      )}
      {limitWriteCount.isEnable && (
        <span className="pRight8">
          <span>{_l('已收集')}</span>
          <span className="bold Gray mLeft5 mRight5">
            {`${completeNumber || 0}/${limitWriteCount.limitWriteCount}`}
          </span>
          <span>{_l('份, 还剩')}</span>
          <span className="bold Gray mLeft5 mRight5">{limitWriteCount.limitWriteCount - (completeNumber || 0)}</span>
          <span>{_l('份结束收集')};</span>
        </span>
      )}
      {limitWriteTime.isEnable && (
        <span>
          <span className="bold Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.MONTH, limitWriteTime)}</span>
          <span className="mLeft5 mRight5">{_l('的')}</span>
          <span className="bold Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.DAY, limitWriteTime)}</span>
          {!!getLimitWriteTimeDisplayText(TIME_TYPE.HOUR, limitWriteTime) && (
            <span className="mLeft5 mRight5">{_l('的')}</span>
          )}
          <span className="bold Gray">{getLimitWriteTimeDisplayText(TIME_TYPE.HOUR, limitWriteTime)}</span>
          <span className="mLeft5">{_l('可填写')}</span>
        </span>
      )}
    </React.Fragment>
  );
}
