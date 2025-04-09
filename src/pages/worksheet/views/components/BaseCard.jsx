import React, { memo, useRef, useState } from 'react';
import styled from 'styled-components';
import CellControl from 'worksheet/components/CellControls';
import renderCellText from 'worksheet/components/CellControls/renderText';
import Switch from 'worksheet/components/CellControls/Switch';
import RecordOperate from 'worksheet/components/RecordOperate';
import update from 'immutability-helper';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Checkbox } from 'antd-mobile';
import { FlexCenter, Text } from 'worksheet/styled';
import { checkCellIsEmpty, getRecordColor, getControlStyles } from 'src/pages/worksheet/util';
import { get, includes, findIndex, isEmpty, noop } from 'lodash';
import { getAdvanceSetting, browserIsMobile } from 'src/util';
import CardCoverImage from './CardCoverImage';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { getCardDisplayPara, getMultiRelateViewConfig } from '../util';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import addRecord from 'worksheet/common/newRecord/addRecord';
import { handleRowData } from 'src/util/transControlDefaultValue';
import { getCanDisplayControls } from 'src/pages/worksheet/common/ViewConfig/util.js';
import {  getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';

const RecordItemWrap = styled.div`
  display: flex;
  flex-direction: ${props => props.coverDirection};
  justify-content: space-between;
  cursor: ${props => (props.canDrag ? 'grab' : 'pointer')};
  width: 100%;
  position: relative;
  min-height: 42px;
  ${({ controlStyles }) => controlStyles || ''}
  .hoverShowAll {
    display: none;
  }
  .fieldContentWrap {
    flex: 1;
    padding: 10px 0;
    overflow: hidden;
  }
  .titleText {
    padding: 0 14px;
    font-size: 14px;
    font-weight: bold;
    word-break: break-word;
    white-space: normal;
    &.isGalleryView {
      white-space: nowrap;
    }
    &.maskHoverTheme {
      cursor: pointer;
      &:hover {
        color: #1d5786;
        .i.icon-eye_off {
          color: #9e9e9e !important;
        }
      }
    }
  }
  .abstractWrap {
    margin: 10px 14px 3px;
    max-height: 59px;
    overflow: hidden;
    color: #757575;
    text-overflow: ellipsis;
    white-space: break-spaces;
    word-break: break-all;
    display: -webkit-box;
    /*! autoprefixer: off */
    -webkit-line-clamp: 3 !important;
    -webkit-box-orient: vertical;
    /* autoprefixer: on */
    &.galleryViewAbstract {
      height: 72px;
    }
    &.maxLine1 {
      -webkit-line-clamp: 1 !important;
      max-height: 20px;
    }
    &.maxLine2 {
      -webkit-line-clamp: 2 !important;
      max-height: 38px;
    }
    &.maxLine3 {
      -webkit-line-clamp: 3 !important;
      max-height: 59px;
    }
    &.maxLine4 {
      -webkit-line-clamp: 4 !important;
      max-height: 77px;
    }
    &.maxLine5 {
      -webkit-line-clamp: 5 !important;
      max-height: 96px;
      &.galleryViewAbstract {
        height: 96px;
      }
    }
  }

  .fieldItem {
    max-width: 96%;
    margin-top: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .editTitleTextInput {
      border: none;
      width: 100%;
      padding: 0;
    }
    .worksheetCellPureString {
      max-width: 100%;
      padding-left: 4px;
    }
  }
  .emptyHolder {
    height: 6px;
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    width: 20px;
  }
  .moreOperate {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    line-height: 24px;
    border-radius: 3px;
    background-color: rgba(255, 255, 255, 0.9);
    text-align: center;
    font-size: 18px;
    &:hover {
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
      background-color: #fff;
      i {
        color: #2196f3;
      }
    }
  }
  .recordOperateWrap {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    right: 0;
    visibility: hidden;
  }
  .hoverShow {
    visibility: hidden;
  }
  &:hover {
    .hoverShow {
      visibility: visible;
    }
  }
`;

const RecordFieldsWrap = styled(FlexCenter)`
  box-sizing: border-box;
  max-width: 100%;
  flex-grow: 1;
  flex-direction: column;
  align-items: start;
  padding: 0 14px;
  border-radius: 4px;
  /* &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);
  } */
  .contentWrap {
    flex: 1;
    overflow: auto;
    scrollbar-color: auto;
    &::-webkit-scrollbar {
      height: 0;
    }
  }
  .linelimitcomp {
    white-space: break-spaces;
  }

  textarea {
    resize: none;
  }
`;

const ControlName = styled(Text)`
  flex-shrink: 0;
  margin: 0 8px 0 0;
  color: #9e9e9e;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const ColorTag = styled.div`
  position: absolute;
  width: 4px;
  top: 0px;
  bottom: 0px;
  left: 0px;
`;

const BaseCard = props => {
  const {
    data = {},
    stateData = {},
    className,
    canDrag,
    currentView,
    viewParaOfRecord,
    allowCopy,
    allowRecreate,
    isCharge,
    isDevAndOps,
    sheetSwitchPermit = [],
    editTitle,
    onUpdate = noop,
    onDelete = noop,
    onCopySuccess = noop,
    showNull = false,
    onAdd = noop,
    hoverShowAll,
    fieldShowCount,
    isQuickEditing,
  } = props;
  const isMobile = browserIsMobile();
  let { rowId, coverImage, allowEdit, allowDelete, abstractValue, allowAdd } = data;
  const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
  const fields = data.fields
    ? !isShowWorkflowSys && _.isArray(data.fields)
      ? data.fields.filter(
          it =>
            !_.includes(
              ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfdtime', 'wfcaid', 'wfctime', 'wfcotime'],
              it.controlId,
            ),
        )
      : data.fields
    : [];
  const { path = [] } = stateData;
  const para = getCardDisplayPara({ currentView, data: stateData });
  const { appId, projectId, viewType, viewControls, childType, showControlName } = para;

  const getCurrentView = () => {
    if (String(viewType) === '2' && String(childType) === '2') {
      if (path.length < 2) return currentView;
      return viewControls[path.length - 1];
    }
    return currentView;
  };

  const viewtitle = _.get(getCurrentView(), 'advancedSetting.viewtitle');
  const viewtitleControlIndex = findIndex(fields, item => item.controlId === viewtitle);
  const titleIndex =
    viewtitleControlIndex < 0 ? findIndex(fields, item => item.attribute === 1) : viewtitleControlIndex;
  const titleField = fields[titleIndex] || {};
  const [forceShowFullValue, setForceShowFullValue] = useState(_.get(titleField, 'advancedSetting.datamask') !== '1');
  let viewId, worksheetId;
  let paramForOperatePrint = {};
  if (viewParaOfRecord) {
    viewId = viewParaOfRecord.viewId;
    worksheetId = viewParaOfRecord.worksheetId;
    paramForOperatePrint = {
      printAppId: appId,
    };
  } else {
    viewId = para.viewId;
    worksheetId = para.worksheetId;
  }
  const $ref = useRef(null);

  const multiRelateViewConfig = getMultiRelateViewConfig(currentView, stateData);
  const { abstract, checkradioid } = getAdvanceSetting(multiRelateViewConfig);
  const { coverPosition = '0' } = getCoverStyle(multiRelateViewConfig);
  const showCover = !!currentView.coverCid;

  if (isEmpty(data)) return null;

  const isGalleryView = String(viewType) === '3';
  const isVerticalHierarchy =
    String(viewType) === '2' && ['1', '2'].includes(_.get(para, 'advancedSetting.hierarchyViewType'));

  const showControlStyle =
    _.get(para, 'advancedSetting.controlstyle') === '1' || _.get(para, 'advancedSetting.controlstyleapp') === '1';
  abstractValue = abstract ? abstractValue : '';
  const otherFields = update(fields, { $splice: [[titleIndex, 1]] });
  const titleMasked =
    (isCharge || _.get(titleField, 'advancedSetting.isdecrypt') === '1') &&
    _.get(titleField, 'advancedSetting.datamask') === '1' &&
    !forceShowFullValue &&
    ((titleField.type === 2 && titleField.enumDefault === 2) || _.includes([6, 8, 3, 5, 7], titleField.type));

  const isShowControlName = () => {
    if (String(viewType) === '2' && String(childType) === '2') {
      if (path.length < 2) return showControlName;
      const viewConfig = viewControls[path.length - 1];
      return get(viewConfig, 'showControlName');
    }
    return showControlName;
  };

  const isCanQuickEdit = () => {
    const viewtitle = _.get(getCurrentView(), 'advancedSetting.viewtitle');
    const titleField = fields.find(item => (!viewtitle ? item.attribute === 1 : item.controlId === viewtitle)) || {};
    return isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, viewId) && titleField.type === 2 && allowEdit;
  };

  const renderTitleControl = () => {
    const titleValue = renderCellText(titleField, { noMask: forceShowFullValue });
    const content = titleValue || _l('未命名');
    if (props.renderTitle) return props.renderTitle({ content, titleField });

    const showCheckItem = _.find(data.formData || [], v => v.controlId === checkradioid) || {};
    const canEdit =
      !_.get(window, 'shareState.isPublicView') &&
      !_.get(window, 'shareState.isPublicPage') &&
      isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, para.viewId) &&
      allowEdit &&
      controlState(showCheckItem).editable;

    return (
      <div
        className={cx('titleText', `control-val-${titleField.controlId}`, {
          haveOtherField: !isEmpty(otherFields),
          overflow_ellipsis: titleField.type === 2,
          isGalleryView,
          maskHoverTheme: titleMasked,
        })}
        title={content}
        onClick={e => {
          if (!titleMasked) return;
          e.stopPropagation();
          setForceShowFullValue(true);
        }}
      >
        {isMobile && checkradioid && !_.isEmpty(showCheckItem) && (
          <Checkbox
            className="mRight10"
            disabled={!canEdit}
            checked={showCheckItem.value === '1'}
            style={{ '--icon-size': '18px' }}
            onChange={() => props.onChange(showCheckItem, showCheckItem.value === '1' ? '0' : '1')}
            onClick={e => {
              e.stopPropagation();
            }}
          />
        )}
        {content}
        {titleMasked && titleValue && (
          <i
            className="icon icon-eye_off Hand maskData Font16 Gray_bd mLeft4 mTop4 hoverShow"
            style={{ verticalAlign: 'middle' }}
          />
        )}
      </div>
    );
  };

  const isEmptyCell = item => {
    return (
      checkCellIsEmpty(item.value) ||
      (item.type === 29 && _.get(item, 'advancedSetting.showtype') === '2' && item.value <= 0)
    );
  };

  const renderContent = ({ item, content }) => {
    let currentContent = content;

    if (item.type === 36) {
      const canEdit =
        _.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage')
          ? false
          : isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, para.viewId) &&
            allowEdit &&
            controlState(item).editable;
      currentContent = (
        <div onClick={e => e.stopPropagation()}>
          <Switch
            className="overflowHidden"
            cell={item}
            from={4}
            editable={isMobile ? false : canEdit}
            updateCell={({ value }) => props.onChange(item, value)}
          />
        </div>
      );
    }

    const displayContent = !isEmptyCell(item) ? (
      <div className="contentWrap">{currentContent}</div>
    ) : (
      <div className="emptyHolder"> </div>
    );

    if (isShowControlName() && item.controlName) {
      return (
        <FlexCenter>
          <ControlName>{item.controlName}</ControlName>
          {displayContent}
        </FlexCenter>
      );
    }
    return displayContent;
  };

  const renderAbstract = () => {
    const maxLine = _.get(getCurrentView(), 'advancedSetting.maxlinenum');
    const isShowAbstract = abstract && !!(data.formData || []).filter(item => item.controlId === abstract).length;
    if (isEmptyCell({ value: abstractValue }) && !isGalleryView && !showNull) return null;
    return isShowAbstract ? (
      <div
        className={cx(
          'abstractWrap',
          { galleryViewAbstract: isGalleryView || isVerticalHierarchy },
          `maxLine${maxLine}`,
        )}
        title={abstractValue}
      >
        {abstractValue || <div className="emptyHolder"></div>}
      </div>
    ) : null;
  };

  const getPopAlign = () => {
    if ($ref.current) {
      const { right } = $ref.current.getBoundingClientRect();
      /**
       * 如果右侧放不下就放卡片的左侧
       * 208 = 目录的宽度(200) + 间隔(8)
       */
      if (window.innerWidth - 208 < right) {
        return {
          points: ['tr', 'tr'],
          offset: [8, 30],
        };
      }
    }
    return {
      points: ['tl', 'tr'],
      offset: [16, -8],
    };
  };
  const hideOperate = isMobile || _.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage');
  const { recordColorConfig, rawRow } = data;
  const recordColor =
    recordColorConfig &&
    getRecordColor({
      controlId: recordColorConfig.controlId,
      colorItems: recordColorConfig.colorItems,
      controls: data.formData,
      row: _.isObject(rawRow) ? rawRow : safeParse(rawRow),
    });
  let fieldList = otherFields;
  if (!isGalleryView && !showNull) {
    //不显示空的内容
    fieldList = otherFields.filter(item => !isEmptyCell(item));
  }
  const showFields = getCanDisplayControls(
    fieldShowCount && fieldShowCount !== 'undefined' && (!hoverShowAll || isQuickEditing)
      ? fieldList.slice(0, fieldShowCount)
      : fieldList,
  ).filter(l => controlState(l).visible);
  const canHoverShowAll =
    fieldShowCount &&
    fieldShowCount !== 'undefined' &&
    hoverShowAll &&
    !(_.get(window, 'shareState.isPublicView') || _.get(window, 'shareState.isPublicPage'));
  const renderCell = (item, i) => {
    if (isEmptyCell(item) && !isGalleryView && !showNull) return null;
    const cell = _.find(data.formData, c => c.controlId === item.controlId) || item;

    const content = (
      <CellControl
        className={'control-val-' + item.controlId}
        from={4}
        cell={cell}
        rowFormData={() => data.formData || []}
        sheetSwitchPermit={sheetSwitchPermit}
        worksheetId={worksheetId}
        viewId={viewId}
        row={{ rowid: rowId }}
        isCharge={isCharge}
        appId={appId}
        projectId={projectId}
        disabled={cell.type === 26 && String(viewType) === '8'}
      />
    );
    // 画廊视图或有内容控件则渲染
    return (
      <div key={item.controlId} className={cx('fieldItem')} style={item.type === 6 ? { width: '100%' } : {}}>
        {renderContent({ content, item })}
      </div>
    );
  };
  return (
    <RecordItemWrap
      ref={$ref}
      style={{
        backgroundColor: recordColor && recordColorConfig.showBg ? recordColor.lightColor : undefined,
      }}
      className={className}
      coverDirection={includes(['0', '1'], coverPosition) ? 'row' : 'column'}
      canDrag={canDrag}
      controlStyles={showControlStyle && getControlStyles(showFields.concat(titleField))}
    >
      {/* // 封面图片左、上放置 */}
      {recordColor && recordColorConfig.showLine && (
        <ColorTag
          style={Object.assign(
            { backgroundColor: recordColor.color },
            showCover && coverPosition === '1'
              ? { left: 'auto', right: 0, borderRadius: '0 3px 3px 0' }
              : { borderRadius: '3px 0 0 3px' },
          )}
        />
      )}
      {includes(['1', '2'], coverPosition) && <CardCoverImage {...props} viewId={viewId} projectId={projectId} />}
      <div className="fieldContentWrap">
        {renderTitleControl({ forceShowFullValue })}
        {renderAbstract()}
        {!_.isEmpty(showFields) && (
          <RecordFieldsWrap hasCover={!!coverImage}>
            {(canHoverShowAll ? showFields.slice(0, fieldShowCount) : showFields).map(item => {
              return renderCell(item);
            })}
            {canHoverShowAll && showFields.length > fieldShowCount ? (
              <div className="hoverShowAll w100">
                {showFields.slice(fieldShowCount, showFields.length).map(item => {
                  return renderCell(item);
                })}
              </div>
            ) : (
              ''
            )}
          </RecordFieldsWrap>
        )}
      </div>
      {/* // 封面图片右放置 */}
      {includes(['0'], coverPosition) && <CardCoverImage {...props} viewId={viewId} projectId={projectId} />}
      {!hideOperate && (
        <div className="recordOperateWrap" onClick={e => e.stopPropagation()}>
          <RecordOperate
            isCharge={isCharge}
            isDevAndOps={isDevAndOps}
            shows={['share', 'print', 'copy', 'copyId', 'openinnew', 'recreate', 'fav']}
            popupAlign={getPopAlign()}
            allowDelete={allowDelete}
            allowCopy={allowCopy}
            allowRecreate={allowAdd || allowRecreate}
            projectId={projectId}
            formdata={fields}
            appId={worksheetId === currentView.worksheetId ? appId : undefined}
            worksheetId={worksheetId}
            sheetSwitchPermit={sheetSwitchPermit}
            viewId={viewId}
            recordId={rowId}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onCopySuccess={onCopySuccess}
            onRecreate={() => {
              handleRowData({
                rowId: rowId,
                worksheetId: worksheetId,
                columns: data.formData,
              }).then(res => {
                const { defaultData, defcontrols } = res;
                addRecord({
                  worksheetId,
                  appId,
                  viewId,
                  defaultFormData: defaultData,
                  defaultFormDataEditable: true,
                  directAdd: false,
                  writeControls: defcontrols,
                  onAdd: record => {
                    onAdd({ item: record });
                  },
                });
              });
            }}
            {...paramForOperatePrint}
          >
            <div
              className="moreOperate"
              onClick={() => {
                if (isCanQuickEdit()) {
                  editTitle();
                }
              }}
            >
              <Icon type="link" icon="task-point-more Font18" className="Gray_9e ThemeHoverColor3" />
            </div>
          </RecordOperate>
        </div>
      )}
    </RecordItemWrap>
  );
};

export default BaseCard;
