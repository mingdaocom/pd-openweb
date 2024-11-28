import React from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { browserIsMobile, createLinksForMessage, getTranslateInfo } from 'src/util';
import TriggerSelect from './TriggerSelect';
import WorksheetRecordLogSelectTags from './WorksheetRecordLogSelectTags';
import WorksheetRecordLogThumbnail from './WorksheetRecordLogThumbnail';
import WorksheetRecordLogDiffText from './WorksheetRecordLogDiffText';
import WorksheetRecordLogSubList from './WorksheetRecordLogSubList';
import {
  WIDGETS_TO_API_TYPE_ENUM,
  DEFAULT_CONFIG,
  WORKFLOW_SYSTEM_CONTROL,
} from 'src/pages/widgetConfig/config/widget';
import { CIRCLE_TAGS_CONTROL_TYPE, RECT_TAGS_CONTROL_TYPE } from '../enum.js';
import { handleSelectTagsValue, diffSelectTagsValue, getExtendParams } from '../util';

function renderContent(data, recordInfo, extendParam) {
  const { type, oldValue, newValue, id, editType } = data;
  const { requestType } = extendParam;
  let controls = recordInfo.controls && recordInfo.controls.length ? recordInfo.controls : recordInfo.formdata;
  let control = controls ? controls.find(l => id === l.controlId) : undefined;

  if (CIRCLE_TAGS_CONTROL_TYPE.includes(type) || RECT_TAGS_CONTROL_TYPE.includes(type)) {
    const { newList = [], oldList = [], onlyNew = false } = handleSelectTagsValue({ ...data, control, requestType });
    const { _oldValue, _newValue, _defaultValue } = diffSelectTagsValue({ newList, oldList, type, editType, control });

    return (
      <WorksheetRecordLogSelectTags
        oldValue={_oldValue}
        newValue={_newValue}
        defaultValue={_defaultValue || []}
        type={CIRCLE_TAGS_CONTROL_TYPE.includes(type) ? 'circle' : 'rect'}
        needPreview={type === 29}
        data={data}
        control={control}
        onlyNew={onlyNew}
        isChangeValue={[6, 8].includes(type) && editType !== 0}
        key={`WorksheetRecordLogSelectTags-${id}`}
      />
    );
  } else if (type === 2 && ['del_discussion', 'transf_task'].indexOf(id) > -1) {
    let message = newValue.replace(/\n/g, '<br>');
    message = createLinksForMessage({
      message,
    });

    return (message = <div className="singeText paddingLeft27" dangerouslySetInnerHTML={{ __html: message }} />);
  } else if ([2, 41].includes(type)) {
    return (
      <WorksheetRecordLogDiffText
        oldValue={oldValue ? oldValue.replace(/^"|"$/g, '') : ''}
        newValue={newValue ? newValue.replace(/^"|"$/g, '') : ''}
        control={type === 2 ? control : undefined}
        key={`WorksheetRecordLogDiffText-${id}`}
        type={type === 2 ? 'text' : 'rich_text'}
      />
    );
  } else if ([14, 42].includes(type)) {
    let newList = safeParse(newValue, 'array');
    let oldList = safeParse(oldValue, 'array');

    if (typeof newList[0] !== 'object') {
      newList = [];
    }

    if (typeof oldList[0] !== 'object') {
      oldList = [];
    }

    let _oldValue = _.differenceBy(oldList, newList, type === 14 ? 'fileId' : 'key');
    let _newValue = _.differenceBy(newList, oldList, type === 14 ? 'fileId' : 'key');
    let _defaultValue = newList.filter(l =>
      oldList.find(m => m[type === 14 ? 'fileId' : 'key'] === l[type === 14 ? 'fileId' : 'key']),
    );

    return (
      <WorksheetRecordLogThumbnail
        oldList={_oldValue}
        newList={_newValue}
        defaultList={_defaultValue}
        type={type}
        recordInfo={recordInfo}
        control={control}
        key={`WorksheetRecordLogThumbnail-${id}`}
      />
    );
  } else if (type === 34) {
    return (
      <WorksheetRecordLogSubList
        key={`WorksheetRecordLogSubList-${id}`}
        prop={data}
        control={control}
        recordInfo={recordInfo}
        extendParam={extendParam}
      />
    );
  } else {
    return null;
  }
}

export default function WorksheetRecordLogItem(props) {
  const { childData, recordInfo, extendParam, selectFieldChange } = props;
  const { selectField, moreList = [], setMoreList, lastMark, showFilter } = extendParam;
  const { operatContent } = childData;
  const isMobile = browserIsMobile();
  const uniqueId = moreList.find(l => l === operatContent.uniqueId);

  const handleLogData = data => {
    let logData = selectField && !uniqueId ? data.filter(l => l.id === selectField.controlId) : data;

    return logData.map(item => {
      return {
        ...item,
        name: getTranslateInfo(recordInfo.appId, recordInfo.worksheetId, item.id).name || item.name,
      };
    });
  };

  const getRemarkContent = () => {
    const btnRemarkName = getExtendParams(operatContent.extendParams, 'btnRemarkName');
    const btnRemark = getExtendParams(operatContent.extendParams, 'btnremark');

    if (btnRemark) {
      return (
        <div>
          {btnRemarkName}：{btnRemark}
        </div>
      );
    }

    return null;
  };

  const isVisibleLog = (item, control) => {
    if ((item.newValue === '' && item.oldValue === '') || ['thirdprimary'].includes(item.id)) return false;

    const controlPermissions = (control && control.controlPermissions) || '000';
    const visible = controlPermissions[0] === '1' || item.id.length !== 24;

    return visible;
  };

  const getExtendText = (item, control) => {
    let extendText = '';
    let showDelete = true;

    if (item.type === 29) {
      const { advancedSetting = {} } = control || {};

      if (operatContent.requestType === 8 || advancedSetting.showtype === '2') {
        const object = item.newValue || item.oldValue ? safeParse(item.newValue || item.oldValue) : undefined;

        if (object && object.rows) {
          let newValue = safeParse(item.newValue, 'object');
          let oldValue = safeParse(item.oldValue, 'object');
          let _text = ' ';

          if (item.editType === 1) {
            _text = _l(' 添加了');
          } else if (item.editType === 2) {
            _text = _l(' 取消了');
          } else {
            _text = item.newValue ? _l(' 添加了') : _l(' 取消了');
          }

          extendText = `${_text}${_l(
            '%0条',
            safeParse(item.newValue ? newValue.rows : oldValue.rows, 'array').length || 1,
          )}`;
        } else if (object) {
          showDelete = false;
          extendText = `${item.editType !== 2 ? _l(' 添加了') : _l(' 取消了')}${_l(
            '%0条',
            object.length || 1,
          )}关联记录`;
        }
      }

      if (operatContent.requestType === 8) {
        extendText += _l('（被动）');
      }
    }

    if (['transf_task', 'del_discussion'].indexOf(item.id) > -1) {
      showDelete = false;
    }

    if (item.isDeleted && showDelete) {
      extendText += _l('(已删除)');
    }

    return extendText;
  };

  const logData = handleLogData(operatContent.logData || []);

  return (
    <React.Fragment>
      {getRemarkContent()}
      {logData.map(item => {
        const control =
          _.find(
            recordInfo.controls && recordInfo.controls.length ? recordInfo.controls : recordInfo.formdata,
            it => item.id === it.controlId,
          ) || {};

        if (!isVisibleLog(item, control)) {
          return null;
        }

        const widgetInfo = DEFAULT_CONFIG[_.findKey(WIDGETS_TO_API_TYPE_ENUM, l => l === item.type)] || {};

        const extendText = getExtendText(item, control);

        return (
          <div
            className={cx('worksheet-rocord-log-item', { 'worksheet-rocord-log-item-Row': item.type === 34 })}
            key={`worksheet-rocord-log-item-${item.id}`}
          >
            <div className="widgetTitle">
              {item.isDeleted ||
              isMobile ||
              !showFilter ||
              WORKFLOW_SYSTEM_CONTROL.find(l => l.controlId === item.id) ? (
                <span className="selectTriggerChild WordBreak">
                  <Icon className="Font16 Gray_9e" icon={widgetInfo.icon} />
                  <span className='flex'>{item.name}</span>
                </span>
              ) : (
                <TriggerSelect
                  text={_l('筛选此字段')}
                  onSelect={() => {
                    if (!control.controlId) return;
                    selectFieldChange(control);
                  }}
                >
                  <span className="selectTriggerChild hasHover WordBreak">
                    <Icon className="Font16 Gray_9e" icon={widgetInfo.icon} />
                    <span className='flex'>{control.controlName || item.name}</span>
                  </span>
                </TriggerSelect>
              )}

              <span className="extendText">{extendText}</span>
            </div>
            {(!item.isDeleted || ['transf_task', 'del_discussion'].indexOf(item.id) > -1) &&
              renderContent(item, recordInfo, {
                createTime: operatContent.createTime,
                uniqueId: operatContent.uniqueId,
                lastMark: lastMark,
                requestType: operatContent.requestType,
                objectType: operatContent.objectType,
              })}
          </div>
        );
      })}
      {selectField && logData.length !== operatContent.logData.length && !uniqueId && (
        <span
          onClick={() => {
            setMoreList(moreList.concat(operatContent.uniqueId));
          }}
          className="moreLogData Gray_9e"
        >
          {_l('查看其他字段')} {operatContent.logData.length - logData.length}
        </span>
      )}
    </React.Fragment>
  );
}
