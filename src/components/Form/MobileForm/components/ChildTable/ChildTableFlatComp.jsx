import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import CustomFields from 'src/components/Form';
import { checkValueAvailable } from 'src/components/Form/core/formUtils';
import { getAvailableFilters } from 'src/components/Form/core/formUtils/ruleUtils';
import MobileCardCellControls from 'src/components/MobileCardCellControls/MobileCardCellControls';
import SummaryCom from 'src/components/MobileCardCellControls/SummaryCom';
import { controlState, getTitleTextFromControls, isRelateRecordTableControl } from 'src/utils/control';

function getFieldsAfterRules(displayFields, formData, rules, rowId) {
  if (!rules || !rules.length) return displayFields;
  const { defaultRules = [] } = getAvailableFilters(rules, formData, rowId);
  const hiddenIds = new Set();
  defaultRules.forEach(rule => {
    const { isAvailable } = checkValueAvailable(rule, formData, rowId);
    (rule.ruleItems || []).forEach(({ type, controls: ruleControls = [] }) => {
      const shouldHide = type === 1 ? !isAvailable : type === 2 ? isAvailable : false;
      if (shouldHide) ruleControls.forEach(rc => hiddenIds.add(rc.controlId));
    });
  });
  return displayFields.filter(c => !hiddenIds.has(c.controlId));
}

const FlattenContent = styled.div`
  .flatCardItem {
    border-radius: 8px;
    background: var(--color-background-secondary);
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-md);
    &.noBoxShadow {
      box-shadow: none !important;
    }
    &.allowOverflow {
      overflow: visible;
    }
    .childTableCellValue {
      font-weight: 500;
    }
  }
  .rowHeader {
    min-height: 48px;
    line-height: 22px;
    padding: 12px;
    border-radius: 0;
    cursor: pointer;
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
  .cardTitleRow {
    display: flex;
    align-items: center;
    width: 100%;
    min-width: 0;
  }
  .cardTitleText {
    min-width: 0;
    color: var(--color-text-primary);
  }
  .cardSummaryRow {
    width: 100%;
    min-width: 0;
    padding-left: 25px;
    margin-top: 6px;
  }
  .cardSummaryRow .summaryControlsCon {
    min-width: 0;
    overflow: hidden;
    flex-wrap: wrap;
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
  .mobileRelateRecordWrap {
    overflow: hidden;
    word-break: break-all;
    text-overflow: ellipsis;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
  /* 卡片内标题字段字号单独处理 */
  .childTableTitleField {
    .childTableCellName {
      font-size: 13px !important;
    }
    .childTableCellValue {
      font-size: 15px !important;
    }
  }
`;

const ExpandAllCon = styled.span`
  position: absolute;
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
    searchConfig,
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
  const timerRef = useRef(null);
  const customWidgetRefs = useRef([]);
  const rowRefs = useRef([]);

  const showRows = isEdit || showExpand ? rows : rows.slice(0, maxShowLength);

  const [expandIds, setExpandIds] = useState([]);

  const isShowAll = maxShowLength === rows.length;

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

  const handleCheckControlChange = (row, currentControl, value) => {
    onSave({ ...row, [currentControl.controlId]: value }, [currentControl.controlId]);

    if (isEdit) return;

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      submitChildTableCheckData({ isQuickUpdateCheck: true });
    }, 500);
  };

  const formatMobileCardControl = c => {
    if (c.type !== 36) return c;

    return {
      ...c,
      canEdit: controlPermission.editable && !control.mobileCheckRuleLocked,
      updateCell: ({ row, value }) => handleCheckControlChange(row, c, value),
    };
  };

  const showFields = controls
    .filter(c => _.find(props.showControls || [], scid => scid === c.controlId) && controlState(c).visible)
    .map(formatMobileCardControl); // 配置可显示字段
  const titleControl = showtitleid && _.find(controls, { controlId: showtitleid });
  const fieldsWithTitle = titleControl
    ? [
        formatMobileCardControl({
          ...titleControl,
          controlName: _l('标题'),
          className: 'childTableTitleField',
        }),
      ].concat(showFields.filter(c => c.controlId !== titleControl.controlId))
    : showFields;

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
    setExpandIds([]);
  }, [isEdit]);

  useEffect(() => {
    if (!isAddRowByLine) return;
    setExpandRowIndex(rows.length - 1, isAddRowByLine);
  }, [isAddRowByLine, rows]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  // 记录为空
  const showEmpty = () =>
    !isEdit && _.isEmpty(rows) && <div className="textTertiary mTop15 bold">{_l('暂无记录')}</div>;

  return (
    <FlattenContent>
      {!isEdit && showRows.length ? (
        <ExpandAllCon
          className="expandAll bold"
          style={{ top: showExpand ? 53 : 8 }}
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
        const title =
          getTitleTextFromControls(
            controls.map(v => (v.controlId === showtitleid ? { ...v, attribute: 1 } : { ...v, attribute: 0 })),
            item,
            control.advancedSetting.titleSourceControlType,
            { appId },
          ) || _l('未命名');
        return (
          <div
            className={cx('flatCardItem', {
              'noBoxShadow allowOverflow': isEdit && !disabled && isExpand,
            })}
            key={rowid}
            ref={el => (rowRefs.current[index] = el)}
            style={{ scrollMarginTop: '10px' }}
          >
            <div
              className={cx('rowHeader flexColumn pRight6', {
                errorRow: _.some(controls, v => cellErrors[rowid + '-' + v.controlId]),
                bgSecondary: isEdit && !disabled,
              })}
              onClick={() => handleExpandFlat(isExpand, index, rowid)}
            >
              <div className="cardTitleRow">
                <i
                  className={`icon ${
                    isExpand ? 'icon-arrow-up-border' : 'icon-arrow-down-border'
                  } LineHeight22 mRight10 Font15`}
                />
                <div className="cardTitleText flex bold Font17 ellipsis">
                  {showNumber ? index + 1 + '.' : ''}
                  {title}
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
              {!isExpand && (
                <SummaryCom
                  className="cardSummaryRow"
                  controls={showFields}
                  showControls={props.showControls}
                  h5AbstractIds={h5abstractids}
                  row={item}
                  projectId={projectId}
                  worksheetId={worksheetId}
                  sheetSwitchPermit={sheetSwitchPermit}
                  appId={appId}
                />
              )}
            </div>
            {isExpand &&
              (!isEdit ? (
                <MobileCardCellControls
                  isMobileTable
                  className="pTop0"
                  colNuber={columnnum === '2' ? 2 : 1}
                  controls={getFieldsAfterRules(
                    fieldsWithTitle,
                    showFields.map(c => ({ ...c, value: item[c.controlId] })),
                    rules,
                    rowid,
                  )}
                  row={item}
                  sheetSwitchPermit={sheetSwitchPermit}
                  worksheetId={worksheetId}
                  projectId={projectId}
                  appId={appId}
                  from={from}
                  masterData={masterData}
                  rowFormData={() => control.relationControls.map(c => ({ ...c, value: item[c.controlId] }))}
                />
              ) : (
                <div
                  className="h100"
                  onClick={e => {
                    e.stopPropagation();
                  }}
                >
                  <CustomFields
                    className="mobileChildTableFlatForm"
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
                      widgetStyle
                        ? widgetStyle
                        : isEdit && isExpand
                          ? {}
                          : { titlelayout_app: '2', titlewidth_app: '80' }
                    }
                    disabled={!(isEdit && isExpand) || (!/^temp/.test(rowid) && !allowedit)}
                    disabledChildTableCheck={!(isEdit && isExpand) || (!/^temp/.test(rowid) && !allowedit)}
                    appId={appId}
                    worksheetId={worksheetId}
                    sheetSwitchPermit={sheetSwitchPermit}
                    rules={rules}
                    // 查询默认值配置需要继续透传给展开行内的 CustomFields
                    searchConfig={searchConfig}
                    projectId={projectId}
                    masterData={masterData}
                    onChange={(data, ids) => {
                      handleChangeFlattenRow(data, ids, item, customWidgetRefs.current[index]);

                      if (isEdit) return;

                      clearTimeout(timerRef.current);
                      timerRef.current = setTimeout(() => {
                        submitChildTableCheckData({ isQuickUpdateCheck: true });
                      }, 500);
                    }}
                  />
                </div>
              ))}
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
