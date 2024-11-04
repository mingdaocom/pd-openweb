import React, { Component, Fragment, useState, useEffect } from 'react';
import { Tooltip } from 'ming-ui';
import cx from 'classnames';
import update from 'immutability-helper';
import { getControlType, getControls } from '../util';
import { OtherFieldWrap } from '../styled';
import {
  SYSTEM_FIELD_TO_TEXT,
  USER_LIST,
  SYSTEM_LIST,
  CURRENT_TYPES,
  CUR_SEARCH_TYPES,
  CUR_OCR_TYPES,
  CUR_OCR_URL_TYPES,
  WATER_MASK_TYPES,
  DYNAMIC_FROM_MODE,
  CUR_EMPTY_TYPES,
  CUSTOM_PHP_TYPES,
  CUR_LOCATION_TYPES,
} from '../config';
import _ from 'lodash';
import { SYS_CONTROLS } from 'src/pages/widgetConfig/config/widget';

export default function OtherField(props) {
  const {
    dynamicValue,
    onDynamicValueChange,
    item = {},
    data,
    text,
    className,
    globalSheetInfo,
    globalSheetControls = [],
    from,
  } = props;
  const { worksheetId } = globalSheetInfo;
  const originControls = props.controls.concat(globalSheetControls);
  const [controls, setControls] = useState(originControls);

  useEffect(() => {
    setControls(originControls);
  }, [data.controlId, props.controls]);

  const getFieldName = (controls, fieldId) => {
    if (_.includes(['ctime', 'utime', 'ownerid', 'caid', ...SYS_CONTROLS], fieldId))
      return SYSTEM_FIELD_TO_TEXT[fieldId];
    if (fieldId === 'search-keyword') return CUR_SEARCH_TYPES[0].text;
    if (fieldId === 'ocr-file') return CUR_OCR_TYPES[0].text;
    if (fieldId === 'ocr-file-url') return CUR_OCR_URL_TYPES[0].text;
    if (fieldId === 'empty') return CUR_EMPTY_TYPES[0].text;
    if (fieldId === 'current-time') return WATER_MASK_TYPES[1].text;
    if (fieldId === 'current-location') return CUR_LOCATION_TYPES[0].text;
    if (_.includes(['codeResult', 'triggerTime', 'triggerUser', 'triggerDepartment', 'triggerOrg'], fieldId)) {
      return _.get(
        _.find(_.flatten(Object.values(CUSTOM_PHP_TYPES)), i => i.id === fieldId),
        'text',
      );
    }
    if (from === DYNAMIC_FROM_MODE.WATER_MASK && fieldId === 'user-self') return WATER_MASK_TYPES[0].text;
    if (
      _.includes(
        [
          'userId',
          'phone',
          'email',
          'language',
          'projectId',
          'appId',
          'groupId',
          'worksheetId',
          'viewId',
          'recordId',
          'ua',
          'timestamp',
          'user-self',
        ],
        fieldId,
      )
    ) {
      const formatList = _.flatten(Object.values(CURRENT_TYPES));
      return _.get(
        _.find(USER_LIST.concat(SYSTEM_LIST, formatList), i => i.id === fieldId),
        'text',
      );
    }
    return (
      _.get(
        _.find(controls, item => _.includes([item.controlId, item.id], fieldId)),
        'controlName',
      ) || (
        <Tooltip text={<span>{_l('ID: %0', fieldId)}</span>} popupPlacement="bottom">
          <span>{_l('已删除')}</span>
        </Tooltip>
      )
    );
  };
  const getFieldNameById = (item, controls) => {
    const { cid, rcid } = item;
    const filterControls = getControls({ data, controls, isCurrent: true, from });
    if (rcid) {
      // 子表控件中 如果是主记录
      if (rcid === worksheetId) {
        return { fieldName: getFieldName(filterControls, cid) };
      }
      const record = _.find(controls, item => item.controlId === rcid);
      const reFilterControls = getControls({ data, controls: _.get(record, 'relationControls'), from });
      return {
        recordName: _.get(record, 'controlName'),
        fieldName: getFieldName(reFilterControls, cid),
      };
    } else {
      return { fieldName: getFieldName(filterControls, cid) };
    }
  };
  const delField = tag => {
    const { cid, rcid, staticValue } = tag;
    const index = _.findIndex(dynamicValue, d =>
      cid ? d.cid === cid && d.rcid === rcid : d.staticValue === staticValue,
    );
    onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
  };
  const isFieldDeleteFn = (item, controls = []) => {
    const { cid, rcid } = item;
    const isFieldNotInControls = (controls, cid) => {
      if (
        _.includes(
          [
            'ctime',
            'utime',
            'ownerid',
            'caid',
            'search-keyword',
            'ocr-file',
            'ocr-file-url',
            'current-time',
            'empty',
            ...SYS_CONTROLS,
          ],
          cid,
        )
      )
        return false;
      if (
        _.includes(
          [
            'userId',
            'phone',
            'email',
            'language',
            'projectId',
            'appId',
            'groupId',
            'worksheetId',
            'viewId',
            'recordId',
            'ua',
            'timestamp',
            'user-self',
          ],
          cid,
        )
      )
        return false;
      return !_.some(controls, item => _.includes([item.controlId, item.id], cid));
    };
    if (rcid) {
      // 子表控件中 主记录控件
      if (rcid === worksheetId) {
        return isFieldNotInControls(controls, cid);
      }
      const record = _.find(controls, item => item.controlId === rcid);
      if (!record) return true;
      return isFieldNotInControls(_.get(record, 'relationControls'), cid);
    } else {
      return isFieldNotInControls(controls, cid);
    }
  };
  if (text) return <span style={{ height: '26px' }}>{text}</span>;
  const isText = getControlType(data) === 'text' || data.type === 45;
  const { fieldName, recordName } = getFieldNameById(item, controls);
  const isFieldDelete = isFieldDeleteFn(item, controls);
  const isGreenTag = item.cid === 'search-keyword' && !item.staticValue;
  return (
    <OtherFieldWrap
      className={cx(className, { pointer: !isText, haveCloseIcon: !isText, deleted: isFieldDelete, isGreenTag })}
    >
      <span className="overflow_ellipsis">
        {isGreenTag && <i className="icon-search searchIcon"></i>}
        <span>{fieldName}</span>
        {recordName && <span className="recordName">{recordName}</span>}
      </span>
      {!isText && (
        <i
          className="icon-close"
          onClick={e => {
            e.stopPropagation();
            delField(item);
          }}
        ></i>
      )}
    </OtherFieldWrap>
  );
}
