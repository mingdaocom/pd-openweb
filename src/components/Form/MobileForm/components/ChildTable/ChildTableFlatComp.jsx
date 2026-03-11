import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import CustomFields from 'src/components/Form';
import { getTitleTextFromControls } from 'src/utils/control';
import { isRelateRecordTableControl } from 'src/utils/control';
import CardCellControls from '../RelateRecordCards/CardCellControls';

const FlattenContent = styled.div`
  .childTableErrorMessage {
    color: var(--color-error);
  }
  .rowHeader {
    height: 40px;
    line-height: 40px;
    background-color: var(--color-background-secondary);
    padding-left: 10px;
    border-radius: 3px;
    &.errorRow {
      background-color: rgba(244, 67, 54, 0.1);
    }
    .delete,
    .edit {
      width: 38px;
      text-align: center;
    }
    .delete {
      color: var(--color-error);
    }
    .edit {
      color: var(--color-primary);
    }
  }
  .mobileChildTableFlatForm {
    &.customMobileFormContainer {
      padding: 0 !important;
    }
    &.packUp {
      .customFormItem {
        padding: 0 12px !important;
      }
      .customFormLine {
        height: 0px;
      }
    }
  }
  .showAll {
    color: var(--color-primary);
    padding: 10px 0;
    justify-content: center;
  }

  .childTableAbstractContent {
    flex-wrap: wrap;
    line-height: 26px;
    padding: 0 10px;
    margin-bottom: 10px;
    background-color: var(--color-background-secondary);
    .label {
      padding-bottom: 0px !important;
      max-width: 100% !important;
    }
    > .controlWrap {
      padding-bottom: 8px;
    }
  }

  .rowColumn1 {
    padding: 16px 0 8px;
    .label {
      max-width: 120px !important;
    }
  }
  .rowColumn2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
    padding: 16px 0 8px;
    grid-column-gap: 4px;
    .controlWrap {
      padding-bottom: 10px;
      overflow: hidden;
      .label {
        width: 80px !important;
        padding-bottom: 2px !important;
      }
    }
  }
`;

const ExpandAllCon = styled.span`
  display: inline-block;
  color: var(--color-primary);
  font-size: 13px;
`;

export default function ChildTableFlatComp(props) {
  const {
    controls,
    rows,
    isEdit,
    allowcancel,
    disabled,
    sheetSwitchPermit,
    onDelete,
    showNumber,
    masterData,
    h5abstractids = [],
    appId,
    worksheetId,
    rules,
    cellErrors,
    projectId,
    controlPermission,
    allowedit,
    isAddRowByLine,
    from,
    isDraft,
    showExpand,
    widgetStyle,
    control,
    onSave = () => {},
    submitChildTableCheckData = () => {},
    updateIsAddByLine = () => {},
  } = props;
  const { columnnum, showtitleid } = control.advancedSetting;
  const defaultMaxLength = 10;
  const [maxShowLength, setMaxShowLength] = useState(defaultMaxLength);
  const [expandRowIndex, setExpandRowIndex] = useState();
  const [random, setRandom] = useState(Date.now());
  const customWidgetRefs = useRef([]);
  const rowRefs = useRef([]);

  const showRows = isEdit || showExpand ? rows : rows.slice(0, maxShowLength);

  const [expandIds, setExpandIds] = useState(isEdit ? [] : showRows.map(item => item.rowid));

  const showFields = controls.filter(c => _.find(props.showControls || [], scid => scid === c.controlId)); // 配置可显示字段

  const showControlsFilter =
    _.isEmpty(h5abstractids) || _.isEmpty(controls.filter(v => _.includes(h5abstractids, v.controlId)))
      ? showFields.slice(0, 3)
      : showFields.filter(v => _.includes(h5abstractids, v.controlId));

  // 根据h5abstractids，重新排序
  const showControls = showControlsFilter.sort(
    (a, b) => h5abstractids.indexOf(a.controlId) - h5abstractids.indexOf(b.controlId),
  );

  const isShowAll = maxShowLength === rows.length;

  let timer = null;

  // 展示全部
  const showAll = () => {
    return (
      !showExpand &&
      !isEdit &&
      rows.length > defaultMaxLength && (
        <div
          className="flexRow valignWrapper showAll"
          onClick={() => {
            setMaxShowLength(isShowAll ? defaultMaxLength : rows.length);
          }}
        >
          <span>{isShowAll ? _l('收起') : _l('查看全部')}</span>
          <Icon className="mLeft5" icon={isShowAll ? 'arrow-up' : 'arrow-down'} />
        </div>
      )
    );
  };

  // 编辑平铺记录
  const handleChangeFlattenRow = (data, ids, item, customWidgetRef) => {
    if (!customWidgetRef) return;
    const updateControlIds = customWidgetRef.dataFormat.getUpdateControlIds();
    const row = [{}, ...data].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
    onSave({ ...item, ...row, empty: false }, updateControlIds);
  };

  // 平铺展开收起
  const handleExpandFlat = (isExpand, index, rowid) => {
    setRandom(Date.now());
    setExpandRowIndex(!isExpand ? index : undefined);
    // 呈现&编辑均可同时展开多条
    setExpandIds(isExpand ? expandIds.filter(id => id !== rowid) : [...expandIds, rowid]);
    updateIsAddByLine(false);
  };

  // 监听展开状态变化，执行置顶滚动
  useEffect(() => {
    if (isEdit && expandRowIndex !== undefined && rowRefs.current[expandRowIndex]) {
      const element = rowRefs.current[expandRowIndex];
      if (!element) return;

      // 当展开内容较长时，需要等待内容完全渲染
      // 使用多重 requestAnimationFrame + setTimeout 确保 DOM 和内容都渲染完成
      let rafId1, rafId2, timeoutId;

      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => {
          // 增加延迟，确保 CustomFields 等组件内容已渲染
          timeoutId = setTimeout(() => {
            const currentElement = rowRefs.current[expandRowIndex];
            if (currentElement) {
              // 将当前元素滚动置顶
              currentElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 100);
        });
      });

      return () => {
        if (rafId1) cancelAnimationFrame(rafId1);
        if (rafId2) cancelAnimationFrame(rafId2);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [expandRowIndex, isEdit, expandIds]);

  useEffect(() => {
    setRandom(Date.now());
    setExpandIds(isEdit ? [] : showRows.map(item => item.rowid));
  }, [isEdit]);

  useEffect(() => {
    if (!isAddRowByLine) return;
    setExpandRowIndex(rows.length - 1, isAddRowByLine);
  }, [rows]);

  // 记录为空
  const showEmpty = () =>
    !isEdit && _.isEmpty(rows) && <div className="textTertiary mTop15 bold">{_l('暂无记录')}</div>;

  return (
    <FlattenContent>
      {!isEdit && showRows.length ? (
        <ExpandAllCon
          className="expandAll mBottom12 bold"
          onClick={() => setExpandIds(expandIds.length === showRows.length ? [] : showRows.map(item => item.rowid))}
        >
          <Icon
            className="mRight5 TxtMiddle Font16"
            icon={expandIds.length === showRows.length ? 'Subtable_Collapse' : 'Subtable_Expand'}
          />
          <span className="TxtMiddle"> {expandIds.length === showRows.length ? _l('全部收起') : _l('全部展开')}</span>
        </ExpandAllCon>
      ) : null}
      {showRows.map((item, index) => {
        const { rowid } = item;
        const isExpand = expandIds.includes(rowid);
        const ignoreLock = /^(temp|default|empty)/.test(rowid);

        return (
          <div key={rowid} ref={el => (rowRefs.current[index] = el)} style={{ scrollMarginTop: '10px' }}>
            <div
              className={cx('rowHeader flexRow LineHeight40 pRight6 alignItemsCenter', {
                errorRow: _.some(controls, v => cellErrors[rowid + '-' + v.controlId]),
              })}
              onClick={() => handleExpandFlat(isExpand, index, rowid)}
            >
              <i
                className={`icon ${
                  isExpand ? 'icon-arrow-up-border' : 'icon-arrow-down-border'
                } LineHeight40 mRight10 Font15`}
              />
              <div className="flex bold Font15 ellipsis">
                {showNumber ? index + 1 + '.' : ''}
                {getTitleTextFromControls(
                  controls.map(v => (v.controlId === showtitleid ? { ...v, attribute: 1 } : { ...v, attribute: 0 })),
                  item,
                  control.advancedSetting.titleSourceControlType,
                  { appId },
                ) || _l('未命名')}
              </div>
              {!disabled && isEdit && (
                <Fragment>
                  {(allowcancel || /^temp/.test(rowid)) && (
                    <div className="delete pTop3" onClick={() => onDelete(rowid)}>
                      <i className="icon icon-trash Red Font18" />
                    </div>
                  )}
                </Fragment>
              )}
            </div>
            {!isExpand || (!isEdit && isExpand) ? (
              <CardCellControls
                className={!isExpand ? 'childTableAbstractContent' : columnnum === '2' ? 'rowColumn2' : 'rowColumn1'}
                hideTitle={true}
                from={from}
                projectId={projectId}
                disabled={true}
                key={item.controlId}
                controls={!isExpand ? showControls : showFields}
                sheetSwitchPermit={sheetSwitchPermit}
                data={item}
                allowlink={false}
                appId={appId}
                parentControl={{
                  ...control,
                  formData: control.relationControls.map(c => ({ ...c, value: item[c.controlId] })),
                  advancedSetting:
                    columnnum === '2'
                      ? {
                          ...control.advancedSetting,
                          cardtitlestyle: JSON.stringify({ direction: '1' }),
                          cardvaluestyle: JSON.stringify({ size: '1' }),
                        }
                      : { ...control.advancedSetting, cardvaluestyle: JSON.stringify({ size: '1' }) },
                }}
              />
            ) : (
              <div
                className="h100 mLeft10"
                onClick={e => {
                  if (isEdit) return;
                  e.stopPropagation();
                  handleExpandFlat(isExpand, index, rowid);
                }}
              >
                <CustomFields
                  className={cx('mobileChildTableFlatForm', { packUp: !isExpand })}
                  from={/^temp/.test(rowid) ? 2 : from}
                  flag={random}
                  disabledFunctions={isEdit ? ['controlRefresh'] : []}
                  ignoreLock={ignoreLock}
                  isDraft={isDraft}
                  ref={el => (customWidgetRefs.current[index] = el)}
                  recordId={rowid}
                  data={showFields.map(c => ({
                    ...c,
                    value: item[c.controlId],
                    ignoreDisabled: c.type === 36 && controlPermission.editable,
                    fieldPermission: isRelateRecordTableControl(c) ? '000' : c.fieldPermission,
                    controlPermissions: isRelateRecordTableControl(c) ? '000' : c.controlPermissions,
                    isSubList: true,
                  }))}
                  widgetStyle={
                    widgetStyle ? widgetStyle : isEdit && isExpand ? {} : { titlelayout_app: '2', titlewidth_app: '80' }
                  }
                  disabled={!(isEdit && isExpand) || (!/^temp/.test(rowid) && !allowedit)}
                  disabledChildTableCheck={!(isEdit && isExpand) || (!/^temp/.test(rowid) && !allowedit)}
                  appId={appId}
                  worksheetId={worksheetId}
                  sheetSwitchPermit={sheetSwitchPermit}
                  rules={rules}
                  projectId={projectId}
                  masterData={masterData}
                  onChange={(data, ids) => {
                    handleChangeFlattenRow(data, ids, item, customWidgetRefs.current[index]);

                    if (isEdit) return;

                    clearTimeout(timer);
                    timer = setTimeout(() => {
                      submitChildTableCheckData();
                    }, 500);
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
      {showEmpty()}
      {showAll()}
    </FlattenContent>
  );
}

ChildTableFlatComp.propTypes = {
  control: PropTypes.shape({}),
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  isEdit: PropTypes.bool,
  allowcancel: PropTypes.bool,
  disabled: PropTypes.bool,
  sheetSwitchPermit: PropTypes.array,
  onDelete: PropTypes.func,
  showNumber: PropTypes.bool,
  masterData: PropTypes.object,
  h5abstractids: PropTypes.array,
};
