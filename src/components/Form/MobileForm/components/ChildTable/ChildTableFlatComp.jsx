import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Checkbox } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import CustomFields from 'src/components/Form';
import { checkValueAvailable } from 'src/components/Form/core/formUtils';
import { getAvailableFilters } from 'src/components/Form/core/formUtils/ruleUtils';
import { getTitleTextFromControls } from 'src/utils/domain/control/display';
import { controlState } from 'src/utils/domain/control/state';
import { getRecordCardStyle } from 'src/utils/domain/control/style';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import MobileCardCellControls from '../MobileCardCellControls/MobileCardCellControls';
import SummaryCom from '../MobileCardCellControls/SummaryCom';

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
    position: relative;
    border-radius: 8px;
    background: var(--color-background-secondary);
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    ${({ $cardBackgroundColor }) => $cardBackgroundColor && `background-color: ${$cardBackgroundColor};`}
    ${({ $cardBorderColor }) => $cardBorderColor && `border: 1px solid ${$cardBorderColor};`}
    &.noBoxShadow {
      box-shadow: none !important;
    }
    &.allowOverflow {
      overflow: visible;
    }
    &.hasCardDelete {
      overflow: visible;

      .rowHeader {
        padding-right: 64px;
      }
    }
    .childTableCellValue {
      font-weight: 500;
    }
    .cardSummaryRow .childTableCellValue {
      font-weight: 400;
    }
  }
  .rowHeader.batchSelecting {
    position: relative;
    padding-right: 56px !important;
  }
  .batchSelectArea {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
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
    .cardDelete {
      position: absolute;
      top: -9px;
      right: -9px;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      font-size: 26px;
      color: var(--color-text-tertiary);
    }
    .edit {
      color: var(--color-primary);
    }
    &.alwaysExpand {
      cursor: default;
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
    ${({ $recordTitleStyle }) => $recordTitleStyle}
    ${({ $recordTitleSize }) => $recordTitleSize && `font-size: ${$recordTitleSize} !important;`}
  }
  .cardSummaryRow {
    width: 100%;
    min-width: 0;
    padding-left: 25px;
    margin-top: 6px;
  }
  .cardSummaryRow .summaryControlsCon {
    min-width: 0;
    display: block;
    line-height: 20px;
    overflow: hidden !important;
  }
  .cardSummaryRow .childTableSummaryCell .childTableCellValue,
  .cardSummaryRow .splitLine,
  .cardSummaryRow .childTableSummaryCell .cellOption {
    line-height: 20px !important;
  }
  .cardSummaryRow .childTableSummaryCell:has(.cellOptionsParent),
  .cardSummaryRow .childTableSummaryCell .cellOptions {
    vertical-align: middle;
    .cellOption {
      padding: 1px 8px;
    }
  }
  .cardSummaryRow .childTableSummaryCell .cellUser,
  .cardSummaryRow .childTableSummaryCell .cellDepartment {
    margin: 0 !important;
  }
  .cardSummaryRow .splitLine {
    vertical-align: middle;
  }
  .cardSummaryRow .childTableSummaryCell .customFormNull {
    display: inline-block;
    margin: 0;
    vertical-align: middle;
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
  ${({ $inheritCardStyle }) =>
    $inheritCardStyle &&
    `
    .expandedCardContent {
      .childTableCellName {
        line-height: 1.4;
        margin-bottom: 6px;
      }
      .childTableCellValue {
        line-height: 1.4;
      }
    }
  `}
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
    hideExpandAll,
    alwaysExpand,
    openRecordOnClick,
    showCardDelete,
    defaultMaxLength = 10,
    filterControlsByPermission = true,
    widgetStyle,
    control,
    inheritCardStyle = false,
    isBatchOperate = false,
    selectedRowIds = [],
    onSelectRow = () => {},
    onOpen = () => {},
    getMasterFormData = () => [],
    onSave = () => {},
    submitChildTableCheckData = () => {},
    updateIsAddByLine = () => {},
  } = props;
  const { columnnum, showtitleid } = control.advancedSetting;
  const recordCardStyle = inheritCardStyle ? getRecordCardStyle(control) : {};
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
      !alwaysExpand &&
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
    .filter(
      c =>
        _.find(props.showControls || [], scid => scid === c.controlId) &&
        (!filterControlsByPermission || controlState(c).visible),
    )
    .map(formatMobileCardControl); // 配置可显示字段
  const expandedFields = isEdit ? showFields : showFields.filter(c => c.controlId !== showtitleid);
  const hasExpandedFields = expandedFields.length > 0;
  const canOpenRecordDirectly = control.type === 34 || openRecordOnClick;

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
    <FlattenContent
      $cardBackgroundColor={_.get(recordCardStyle, 'cardStyle.backgroundColor')}
      $cardBorderColor={_.get(recordCardStyle, 'cardStyle.borderColor')}
      $recordTitleStyle={_.get(recordCardStyle, 'recordTitleStyle.valueStyle')}
      $recordTitleSize={_.get(recordCardStyle, 'recordTitleStyle.size')}
      $inheritCardStyle={inheritCardStyle}
    >
      {hasExpandedFields && !alwaysExpand && !hideExpandAll && !isEdit && showRows.length ? (
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
        const isExpand = hasExpandedFields && (alwaysExpand || expandIds.includes(rowid));
        const selected = selectedRowIds.includes(rowid);
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
              hasCardDelete: showCardDelete && !disabled && (allowcancel || /^temp/.test(rowid)),
            })}
            key={rowid}
            ref={el => (rowRefs.current[index] = el)}
            style={{ scrollMarginTop: '10px' }}
            onClick={() => {
              if (!hasExpandedFields) {
                if (canOpenRecordDirectly) {
                  onOpen(index);
                }

                return;
              }

              if (!alwaysExpand && !isExpand) {
                handleExpandFlat(isExpand, index, rowid);
              }
            }}
          >
            <div
              className={cx('rowHeader flexColumn pRight6', {
                errorRow: _.some(controls, v => cellErrors[rowid + '-' + v.controlId]),
                bgSecondary: isEdit && !disabled,
                alwaysExpand: alwaysExpand && hasExpandedFields,
                batchSelecting: isBatchOperate,
              })}
              onClick={event => {
                event.stopPropagation();
                if (!hasExpandedFields) {
                  if (canOpenRecordDirectly) {
                    onOpen(index);
                  }

                  return;
                }

                if (!alwaysExpand) {
                  handleExpandFlat(isExpand, index, rowid);
                }
              }}
            >
              <div className="cardTitleRow">
                {hasExpandedFields && !alwaysExpand && (
                  <i
                    className={`icon ${
                      isExpand ? 'icon-arrow-up-border' : 'icon-arrow-down-border'
                    } LineHeight22 mRight10 Font15`}
                    onClick={event => {
                      event.stopPropagation();
                      handleExpandFlat(isExpand, index, rowid);
                    }}
                  />
                )}
                <div className="cardTitleText flex bold Font17 ellipsis">
                  {showNumber ? index + 1 + '.' : ''}
                  {title}
                </div>
                {!disabled && (isEdit || showCardDelete) && (
                  <Fragment>
                    {(allowcancel || /^temp/.test(rowid)) && (
                      <div
                        className={cx('delete Hand', { cardDelete: showCardDelete })}
                        onClick={event => {
                          event.stopPropagation();
                          onDelete(rowid);
                        }}
                      >
                        <i className={cx('icon', showCardDelete ? 'icon-cancel' : 'icon-trash Red Font18')} />
                      </div>
                    )}
                  </Fragment>
                )}
              </div>
              {hasExpandedFields && !isExpand && (
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
              {isBatchOperate && (
                <Checkbox
                  className="batchSelectArea"
                  style={{ '--icon-size': '18px', '--font-size': '14px', '--gap': '6px' }}
                  onClick={event => {
                    event.stopPropagation();
                  }}
                  onChange={checked => onSelectRow(rowid, checked)}
                  checked={selected}
                />
              )}
            </div>
            {isExpand &&
              (!isEdit ? (
                <div
                  onClick={event => {
                    event.stopPropagation();
                    if (canOpenRecordDirectly) {
                      onOpen(index);
                    }
                  }}
                >
                  <MobileCardCellControls
                    isMobileTable
                    showMultipleValue
                    className="pTop0 expandedCardContent"
                    colNuber={columnnum === '2' ? 2 : 1}
                    controls={getFieldsAfterRules(
                      expandedFields,
                      showFields.map(c => ({ ...c, value: item[c.controlId] })),
                      rules,
                      rowid,
                    )}
                    inheritCardStyle={inheritCardStyle}
                    controlTitleStyle={{ ...recordCardStyle.controlTitleStyle, direction: '2' }}
                    controlValueStyle={recordCardStyle.controlValueStyle}
                    row={item}
                    sheetSwitchPermit={sheetSwitchPermit}
                    worksheetId={worksheetId}
                    projectId={projectId}
                    appId={appId}
                    from={from}
                    masterData={masterData}
                    rowFormData={() => control.relationControls.map(c => ({ ...c, value: item[c.controlId] }))}
                  />
                </div>
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
                    data={expandedFields.map(c => ({
                      ...c,
                      value: item[c.controlId],
                      ignoreDisabled: c.type === 36 && controlPermission.editable,
                      fieldPermission: isRelateRecordTableControl(c) ? '000' : c.fieldPermission,
                      controlPermissions: isRelateRecordTableControl(c) ? '000' : c.controlPermissions,
                      isSubList: true,
                    }))}
                    widgetStyle={{ ...widgetStyle, titlelayout_app: '1' }}
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
                    getMasterFormData={getMasterFormData}
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
  getMasterFormData: PropTypes.func,
  h5abstractids: PropTypes.array,
  hideExpandAll: PropTypes.bool,
  alwaysExpand: PropTypes.bool,
  openRecordOnClick: PropTypes.bool,
  showCardDelete: PropTypes.bool,
  isBatchOperate: PropTypes.bool,
  selectedRowIds: PropTypes.arrayOf(PropTypes.string),
  onSelectRow: PropTypes.func,
  defaultMaxLength: PropTypes.number,
  filterControlsByPermission: PropTypes.bool,
  onOpen: PropTypes.func,
};
