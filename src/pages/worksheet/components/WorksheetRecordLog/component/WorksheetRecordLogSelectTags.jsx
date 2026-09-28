import React, { lazy, Suspense, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { renderText as renderTextCell } from 'src/utils/domain/control/display';
import { dealMaskValue } from 'src/utils/domain/control/mask';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import '../WorksheetRecordLogValue.less';

const LoadableRecordInfoWrapper = lazy(() => import('src/pages/worksheet/common/recordInfo/RecordInfoWrapper'));

// 点击时基于当前日志生成预览快照，避免日志刷新后旧列表索引指向错误记录。
const getPreviewRecordInfo = (data, onlyNew) => {
  const oldObj = safeParse(data?.oldValue) || {};
  const newObj = safeParse(data?.newValue) || {};
  const oldList = safeParse(oldObj.rows, 'array');
  const newList = safeParse(newObj.rows, 'array');

  return {
    appId: oldObj.appId || newObj.appId,
    worksheetId: oldObj.worksheetId || newObj.worksheetId,
    viewId: oldObj.viewId || newObj.viewId,
    delList: onlyNew ? newList : _.differenceBy(oldList, newList, 'recordId'),
    addList: onlyNew ? newList : _.differenceBy(newList, oldList, 'recordId'),
    defList: onlyNew ? newList : _.intersectionBy(oldList, newList, 'recordId'),
  };
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
  const advancedSetting = _.get(control, ['advancedSetting']) || {};
  const [previewRecordInfo, setPreviewRecordInfo] = useState(undefined);
  const [maskList, setMaskList] = useState([]);
  const showMaskData = Boolean(advancedSetting.masktype);
  const isdecrypt = advancedSetting.isdecrypt;

  const clickHandle = (type, index) => {
    if (isMobile) return;

    const recordInfo = getPreviewRecordInfo(data, onlyNew);
    const recordList =
      type === 'old' ? recordInfo?.delList : type === 'new' ? recordInfo?.addList : recordInfo?.defList;
    const recordId = recordList?.[index]?.recordId;

    if (recordId) setPreviewRecordInfo({ ...recordInfo, recordId });
  };

  const renderText = item => {
    let text = item;

    if (control) {
      const { type, enumDefault } = control;

      if (type === 3) {
        let _value = enumDefault === 1 ? text.replace(/\+86/, '') : text;

        return showMaskData && _.indexOf(maskList, text) < 0 ? dealMaskValue({ ...control, value: _value }) : _value;
      }

      if (type === 35) {
        if (item === _l('未命名')) return item;
        const titleControl = (control.relationControls || []).find(l => l.controlId === control.sourceTitleControlId);
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
            {
              noneTextLineThrough: isChangeValue,
            },
            {
              hoverHighline: needPreview && !isMobile,
            },
            {
              oldValue: listType === 'old',
            },
            {
              newValue: listType === 'new',
            },
            {
              defaultValue: listType === 'default',
            },
          )}
          style={
            type === 'circle'
              ? {
                  borderRadius: '10px',
                }
              : {}
          }
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
      <div
        className={cx('WorksheetRocordLogSelectTags paddingLeft27', {
          flexDirectionRever: isChangeValue,
        })}
      >
        {renderList(oldValue, 'old')}
        {renderList(newValue, 'new')}
        {renderList(defaultValue, 'default')}
      </div>
      {previewRecordInfo && (
        <Suspense fallback={null}>
          <LoadableRecordInfoWrapper
            visible
            allowAdd={false}
            appId={previewRecordInfo.appId}
            viewId={previewRecordInfo.viewId}
            from={1}
            hideRecordInfo={() => {
              setPreviewRecordInfo(undefined);
            }}
            recordId={previewRecordInfo.recordId}
            worksheetId={previewRecordInfo.worksheetId}
          />
        </Suspense>
      )}
    </React.Fragment>
  );
}

export default WorksheetRecordLogSelectTags;
