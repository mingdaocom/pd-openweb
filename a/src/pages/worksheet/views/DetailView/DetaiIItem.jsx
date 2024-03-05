import React from 'react';
import _ from 'lodash';
import { getRecordAttachments, RENDER_RECORD_NECESSARY_ATTR } from '../util';
import { transferValue } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import { getEmbedValue } from 'src/components/newCustomFields/tools/utils.js';
import { getRecordColorConfig, getRecordColor } from 'worksheet/util';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getAdvanceSetting } from 'src/util';
import cx from 'classnames';
import EditableCard from '../components/EditableCard';
import worksheetAjax from 'src/api/worksheet';

export default function DetailItem(props) {
  const {
    viewId,
    appId,
    worksheetId,
    groupId,
    views,
    sheetSwitchPermit,
    worksheetInfo,
    isCharge,
    controls,
    itemData,
    currentRecordId,
    onClick,
    onUpdateFn,
  } = props;
  const currentView = views.find(o => o.viewId === viewId) || {};
  const coverCid = currentView.coverCid || _.get(worksheetInfo, ['advancedSetting', 'coverid']);
  let { coverposition = '2', abstract = '' } = getAdvanceSetting(currentView);

  let formData = controls.map(o => {
    return { ...o, value: itemData[o.controlId] };
  });
  const { coverImage, allAttachments } = getRecordAttachments(itemData[coverCid]);
  let coverData = { ...(controls.find(it => it.controlId === coverCid) || {}), value: itemData[coverCid] };
  if (coverData.type === 45) {
    //嵌入字段 dataSource需要转换
    let dataSource = transferValue(coverData.value);
    let urlList = [];
    dataSource.map(o => {
      if (!!o.staticValue) {
        urlList.push(o.staticValue);
      } else {
        urlList.push(
          getEmbedValue(
            {
              projectId: worksheetInfo.projectId,
              appId,
              groupId,
              worksheetId,
              viewId,
              recordId: currentRecordId,
            },
            o.cid,
          ),
        );
      }
    });
    coverData = { ...coverData, value: urlList.join('') };
  }

  const transFieldData = row => {
    const { displayControls = [] } = currentView;
    const parsedRow = row;
    const arr = [];

    const titleControl = _.find(controls, itemData => itemData.attribute === 1);
    if (titleControl) {
      // 标题字段
      arr.push({ ..._.pick(titleControl, RENDER_RECORD_NECESSARY_ATTR), value: parsedRow[titleControl.controlId] });
    }
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    let displayControlsCopy = !isShowWorkflowSys
      ? displayControls.filter(
          it =>
            !_.includes(
              ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfdtime', 'wfcaid', 'wfctime', 'wfcotime'],
              it,
            ),
        )
      : displayControls;
    // 配置的显示字段
    displayControlsCopy.forEach(id => {
      const currentControl = _.find(controls, ({ controlId }) => controlId === id);
      if (currentControl) {
        const value = parsedRow[id];
        arr.push({ ..._.pick(currentControl, RENDER_RECORD_NECESSARY_ATTR), value });
      }
    });
    return arr;
  };

  const recordColorConfig = getRecordColorConfig(currentView);
  const recordColor =
    recordColorConfig &&
    getRecordColor({
      controlId: recordColorConfig.controlId,
      colorItems: recordColorConfig.colorItems,
      controls: formData,
      row: _.isObject(itemData) ? itemData : safeParse(itemData),
    });
  let abstractData = controls.find(it => it.controlId === abstract) || {};
  let data = {
    coverData,
    coverImage,
    allAttachments,
    allowEdit: itemData.allowedit,
    allowDelete: itemData.allowdelete,
    rawRow: itemData,
    recordColorConfig,
    fields: transFieldData(itemData),
    formData,
    rowId: itemData.rowid,
    abstractValue: abstract
      ? renderCellText({
          ...abstractData,
          value: itemData[abstract],
        })
      : '',
  };

  const updateTitleData = control => {
    worksheetAjax
      .updateWorksheetRow({
        rowId: data.rowId,
        ..._.pick(currentView, ['worksheetId', 'viewId']),
        newOldControl: [control],
      })
      .then(({ data, resultCode }) => {
        if (data && resultCode === 1) {
          onUpdateFn([data.rowid], _.omit(data, ['allowedit', 'allowdelete']));
        }
      });
  };

  return (
    <div
      className={cx('detailItem', {
        isActive: currentRecordId === itemData.rowid,
        hasBgColor: recordColor && recordColorConfig.showBg,
      })}
      onClick={onClick}
    >
      <EditableCard
        data={data}
        type="board"
        className="detailCardItem"
        isCharge={isCharge}
        currentView={{
          ...currentView,
          projectId: worksheetInfo.projectId,
          appId,
        }}
        sheetSwitchPermit={sheetSwitchPermit}
        updateTitleData={updateTitleData}
      />
    </div>
  );
}
