import React, { useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import MobileCardCellControl from 'src/components/MobileCardCellControls/MobileCardCellControl';
import { controlState, getControlStyles } from 'src/utils/control';
import { updateRulesData } from '../../../core/formUtils/updateRulesData';

const MobileTableContent = styled.div`
  .mobileTableHeader {
    display: grid !important;
    grid-template-columns: ${({ columnTemplate }) => columnTemplate};
    gap: 10px;
    align-items: center;
    margin-bottom: 0;
    padding: 11px 12px;
    border-bottom: 1px solid var(--color-border-secondary);
    background: var(--color-background-tertiary);
    border-radius: 8px 8px 0 0;
    .mobileTableItem {
      height: auto;
      min-height: 22px !important;
      padding: 0;
      font-size: 13px;
      font-weight: 700;
      color: var(--color-text-tertiary);
    }
  }
  .listCard {
    overflow: hidden;
    border-radius: 8px;
    background: var(--color-background-primary);
    border: 1px solid var(--color-border-primary);
    margin-bottom: 10px;
    &.noBorderBottom {
      border-bottom: none;
    }
  }
  .listBody {
    border-radius: 0 0 8px 8px;
    overflow: hidden;
  }
  .tableIndex {
    width: 24px !important;
    .icon-trash {
      margin-left: 0;
    }
  }
  .mobileTableItem {
    width: auto;
    min-width: 0;
    min-height: 20px;
    display: flex;
    align-items: center;
    .editableCellCon {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: top;
    }
    .Block {
      width: 100%;
    }
  }
  .listRow {
    width: 100%;
    min-height: 44px;
    padding: 4px 12px;
    border-bottom: 1px solid var(--color-border-secondary);
    background: var(--color-background-primary);
    cursor: pointer;
    gap: 10px;
    display: grid;
    align-items: center;
    grid-template-columns: ${({ columnTemplate }) => columnTemplate};
  }
  .listRow:last-child {
    border-bottom: none;
  }
  .listRow:active {
    background-color: var(--color-background-hover);
  }
  .listRow.withDelete {
    padding-left: 12px;
  }
  .listMainCell {
    min-width: 0;
    font-weight: 600;
    color: var(--color-text-title);
  }
  .listSubCell {
    min-width: 0;
    color: var(--color-text-secondary);
    font-size: 13px;
  }
  .listArrow {
    color: var(--color-text-tertiary);
    justify-self: end;
  }
  .listRow.errorRow {
    background-color: rgba(244, 67, 54, 0.1);
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
  ${({ controlStyles }) => controlStyles || ''}
`;

export default function MobileTable(props) {
  const {
    onOpen,
    controls,
    rows,
    isEdit,
    allowcancel,
    disabled,
    sheetSwitchPermit,
    onDelete,
    masterData,
    h5abstractids = [],
    worksheetId,
    rules,
    projectId,
    controlPermission,
    titleWrap,
    useUserPermission,
    recordId,
    showExpand,
    appId,
    control,
    cellErrors = {},
    onSave = () => {},
    submitChildTableCheckData = () => {},
  } = props;

  const defaultMaxLength = 10;
  const [maxShowLength, setMaxShowLength] = useState(defaultMaxLength);
  const timerRef = useRef(null);

  const showRows = isEdit || showExpand ? rows : rows.slice(0, maxShowLength);

  const showFields = controls.filter(
    c => _.find(props.showControls || [], scid => scid === c.controlId) && controlState(c).visible,
  );

  const showControlsFilter =
    _.isEmpty(h5abstractids) || _.isEmpty(showFields.filter(v => _.includes(h5abstractids, v.controlId)))
      ? showFields.slice(0, 3)
      : showFields.filter(v => _.includes(h5abstractids, v.controlId));

  // 根据h5abstractids，重新排序
  const showControls = showControlsFilter
    .sort((a, b) => h5abstractids.indexOf(a.controlId) - h5abstractids.indexOf(b.controlId))
    .slice(0, 3);
  const fieldColumnTemplate = ['minmax(0, 40%)', 'minmax(0, 1fr)', 'minmax(0, 1fr)']
    .slice(0, showControls.length)
    .join(' ');

  const showHeaderDelete =
    _.findIndex(
      showRows,
      row => /^temp/.test(row.rowid) || (allowcancel && (useUserPermission && !!recordId ? row.allowdelete : true)),
    ) > -1;
  const columnTemplate = `${isEdit && !disabled && showHeaderDelete ? '22px ' : ''}${fieldColumnTemplate || 'minmax(0, 1fr)'} 18px`;

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

  // 记录为空
  const showEmpty = () =>
    !isEdit && _.isEmpty(rows) && <div className="textTertiary mTop15 bold">{_l('暂无记录')}</div>;

  // 列表
  return (
    <MobileTableContent controlStyles={getControlStyles(showControls)} columnTemplate={columnTemplate}>
      <div className={`listCard ${showRows.length ? '' : 'noBorderBottom'}`}>
        <div className="mobileTableHeader flexRow valignWrapper bold">
          {!_.isEmpty(showRows) && isEdit && !disabled && showHeaderDelete && (
            <div className="mobileTableItem tableIndex"></div>
          )}
          {showControls.map((c, cIndex) => (
            <div key={cIndex} className={`mobileTableItem flex Font13 control-head-${c.controlId}`}>
              <div className={cx('w100 controlName', { overflow_ellipsis: !titleWrap })}>{c.controlName}</div>
            </div>
          ))}
        </div>
        <div className="listBody">
          {showRows.map((row, i) => {
            const allowDelete =
              /^temp/.test(row.rowid) || (allowcancel && (useUserPermission && !!recordId ? row.allowdelete : true));

            return (
              <div
                className={cx('listRow', {
                  withDelete: isEdit && !disabled && allowDelete,
                  errorRow: _.some(controls, v => cellErrors[row.rowid + '-' + v.controlId]),
                })}
                key={i}
              >
                {isEdit && !disabled && allowDelete && (
                  <div className="tableIndex">
                    <div className="action" onClick={() => onDelete(row.rowid)}>
                      <i className="icon icon-trash Font16 Red"></i>
                    </div>
                  </div>
                )}
                {showControls.map((c, cIndex) => {
                  const tableFormData = updateRulesData({
                    rules,
                    recordId: row.rowid,
                    data: controls.map(v => ({ ...v, value: row[v.controlId] })),
                  });

                  const currentCell = _.find(tableFormData, v => v.controlId === c.controlId);
                  c = { ...c, fieldPermission: currentCell.fieldPermission };

                  const visible =
                    c.fieldPermission[0] === '1' && c.fieldPermission[2] === '1' && c.controlPermissions[0] === '1';

                  if (!visible) {
                    return (
                      <div
                        key={cIndex}
                        className={cx('mobileTableItem', {
                          listMainCell: cIndex === 0,
                          listSubCell: cIndex > 0,
                        })}
                        onClick={() => {
                          onOpen(i);
                        }}
                      ></div>
                    );
                  }

                  return (
                    <div
                      key={cIndex}
                      className={cx(`mobileTableItem control-val-${c.controlId}`, {
                        listMainCell: cIndex === 0,
                        listSubCell: cIndex > 0,
                      })}
                      onClick={() => {
                        onOpen(i);
                      }}
                    >
                      <MobileCardCellControl
                        control={c}
                        row={row}
                        showControlName={false}
                        isMain={cIndex === 0}
                        sheetSwitchPermit={sheetSwitchPermit}
                        worksheetId={worksheetId}
                        projectId={projectId}
                        appId={appId}
                        rowHeight={30}
                        masterData={masterData}
                        rowFormData={() => controls.map(c => Object.assign({}, c, { value: row[c.controlId] }))}
                        canedit={c.type === 36 && controlPermission.editable && !control.mobileCheckRuleLocked}
                        updateCell={({ value }) => {
                          if (c.type !== 36) return;

                          onSave({ ...row, [c.controlId]: value }, [c.controlId]);

                          if (isEdit) return;
                          clearTimeout(timerRef.current);
                          timerRef.current = setTimeout(() => {
                            submitChildTableCheckData();
                          }, 500);
                        }}
                      />
                    </div>
                  );
                })}
                <div
                  className="listArrow"
                  onClick={() => {
                    onOpen(i);
                  }}
                >
                  <Icon className="textTertiary" icon="arrow-right-tip" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showEmpty()}
      {showAll()}
    </MobileTableContent>
  );
}

MobileTable.propTypes = {
  onOpen: PropTypes.func,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  rows: PropTypes.arrayOf(PropTypes.shape({})),
  isEdit: PropTypes.bool,
};
