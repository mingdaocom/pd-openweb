import React, { useState, useEffect } from 'react';
import { browserIsMobile } from 'src/util';
import '../WorksheetRecordLogValue.less';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import cx from 'classnames';
import _ from 'lodash';
import { dealMaskValue } from 'src/pages/widgetConfig/widgetSetting/components/WidgetSecurity/util';
import renderTextCell from 'src/pages/worksheet/components/CellControls/renderText.js';

const getTitle = (value, sourceControl) => {
  const data = safeParse(value, 'array');

  switch (sourceControl.type) {
    case 26:
    case 27:
    case 48:
      return data
        .map(m => m.departmentName || m.fullname || m.organizeName)
        .filter(m => m)
        .join('、');
    case 40:
      return data.address || `${_l('经度')}：${_.round(data.x, 6)} ${_l('纬度')}：${_.round(data.y, 6)}`;
    default:
      return renderTextCell({ ...sourceControl, value: value });
  }
};

function WorksheetRecordLogSelectTags(props) {
  const {
    oldValue,
    newValue,
    defaultValue = [],
    type = 'circle',
    needPreview,
    data,
    control,
    onlyNew = false,
    isChangeValue = false,
  } = props;
  const isMobile = browserIsMobile();
  const [preview, setPreview] = useState(false);
  const [preType, setPreType] = useState(undefined);
  const [recordInfo, setRecordInfo] = useState(undefined);
  const [showMaskData, setShowMaskData] = useState(false);
  const [maskList, setMaskList] = useState([]);
  const advancedSetting = _.get(control, ['advancedSetting']) || {};
  const isdecrypt = advancedSetting.isdecrypt;
  const clickHandle = (type, index) => {
    if (isMobile) return;
    setPreview(index);
    setPreType({
      type: type,
      index: index,
    });
  };

  useEffect(() => {
    if (advancedSetting.masktype) {
      setShowMaskData(true);
    }
    if (needPreview) {
      let oldObj = safeParse(data.oldValue);
      let newObj = safeParse(data.newValue);
      let Record = {
        appId: oldObj.appId || newObj.appId,
        worksheetId: oldObj.worksheetId || newObj.worksheetId,
        viewId: oldObj.viewId || newObj.viewId,
        delList: [],
        addList: [],
        defList: [],
      };
      let oldList = safeParse(oldObj.rows, 'array');
      let newList = safeParse(newObj.rows, 'array');

      if (onlyNew) {
        Record.delList = newList;
        Record.addList = newList;
        Record.defList = newList;
      } else {
        Record.delList = _.differenceBy(oldList, newList, 'recordId');
        Record.addList = _.differenceBy(newList, oldList, 'recordId');
        Record.defList = _.intersectionBy(oldList, newList, 'recordId');
      }

      setRecordInfo(Record);
    }
  }, []);

  const renderText = item => {
    let text = item;
    if (needPreview && text && ['[', '{'].includes(text[0])) {
      let sourceControlType = (control || {}).sourceControlType;
      let sourceControl = { ...(control || {}).sourceControl, type: sourceControlType };
      if (!sourceControlType && control) {
        sourceControl = control.relationControls.find(l => l.attribute === 1) || control.relationControls[0];
      }

      text = getTitle(item, sourceControl);
    }
    if (control) {
      const { type, enumDefault } = control;
      if (type === 3) {
        let _value = enumDefault === 1 ? text.replace(/\+86/, '') : text;
        return showMaskData && _.indexOf(maskList, text) < 0 ? dealMaskValue({ ...control, value: _value }) : _value;
      }
      if (type === 35) {
        const titleControl = control.relationControls.find(l => l.controlId === control.sourceTitleControlId);
        return titleControl ? renderTextCell({ ...titleControl, value: item }) || text : text;
      }
    }
    return showMaskData && _.indexOf(maskList, text) < 0 ? dealMaskValue({ ...control, value: text }) : text;
  };

  const renderList = (list, listType) => {
    let prefix = isChangeValue ? (listType === 'old' ? '-' : '+') : '';
    return list.map((item, index) => {
      return item ? (
        <span
          key={`WorksheetRocordLogSelectTag-${listType}-${item}-${index}`}
          className={cx(
            'WorksheetRocordLogSelectTag',
            { noneTextLineThrough: isChangeValue },
            { hoverHighline: needPreview && !isMobile },
            { oldValue: listType === 'old' },
            { newValue: listType === 'new' },
            { defaultValue: listType === 'default' },
          )}
          style={type === 'circle' ? { borderRadius: '10px' } : {}}
          onClick={() => {
            if (needPreview) {
              clickHandle(listType, index);
            }
            if (showMaskData && isdecrypt === '1') {
              setMaskList(maskList.concat(item));
            }
          }}
        >
          {`${prefix} ${renderText(item)}`}
        </span>
      ) : null;
    });
  };

  return (
    <React.Fragment>
      <div className={cx('WorksheetRocordLogSelectTags paddingLeft27', { flexDirectionRever: isChangeValue })}>
        {renderList(oldValue, 'old')}
        {renderList(newValue, 'new')}
        {renderList(defaultValue, 'default')}
      </div>
      {preview !== false && preType && recordInfo && (
        <RecordInfoWrapper
          visible
          allowAdd={false}
          appId={recordInfo.appId}
          viewId={recordInfo.viewId}
          from={1}
          hideRecordInfo={() => {
            setPreview(false);
          }}
          recordId={
            preType.type === 'old'
              ? recordInfo.delList[preview].recordId
              : preType.type === 'new'
              ? recordInfo.addList[preview].recordId
              : recordInfo.defList[preview].recordId
          }
          worksheetId={recordInfo.worksheetId}
        />
      )}
    </React.Fragment>
  );
}

export default WorksheetRecordLogSelectTags;
