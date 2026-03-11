import React, { useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import CellControl from 'worksheet/components/CellControls';
import { getAdvanceSetting, getControlStyles } from 'src/utils/control';
import { updateRulesData } from '../../../core/formUtils/updateRulesData';

const MobileTableContent = styled.div`
  .mobileTableHeader {
    background-color: var(--color-background-secondary);
    margin-bottom: 6px;
    .mobileTableItem {
      height: auto;
      min-height: 40px !important;
    }
  }
  .tableIndex {
    width: 32px !important;
    .icon-trash {
      margin-left: -4px;
    }
  }
  .mobileTableItem {
    width: 0;
    padding: 8px 0 8px 12px;
    min-height: 48px;
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
  tbody tr:nth-child(even) {
    background-color: #00000003;
  }
  .showAll {
    color: var(--color-primary);
    padding: 10px 0;
    justify-content: center;
  }
  .icon-arrow-right-tip {
    width: 15px;
    text-align: center;
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
    onSave = () => {},
    submitChildTableCheckData = () => {},
  } = props;

  const defaultMaxLength = 10;
  const [maxShowLength, setMaxShowLength] = useState(defaultMaxLength);

  const showRows = isEdit || showExpand ? rows : rows.slice(0, maxShowLength);

  const showFields = controls.filter(c => _.find(props.showControls || [], scid => scid === c.controlId));

  const showControlsFilter =
    _.isEmpty(h5abstractids) || _.isEmpty(showFields.filter(v => _.includes(h5abstractids, v.controlId)))
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

  // 记录为空
  const showEmpty = () =>
    !isEdit && _.isEmpty(rows) && <div className="textTertiary mTop15 bold">{_l('暂无记录')}</div>;

  const showHeaderDelete =
    _.findIndex(
      showRows,
      row => /^temp/.test(row.rowid) || (allowcancel && (useUserPermission && !!recordId ? row.allowdelete : true)),
    ) > -1;

  // 列表
  return (
    <MobileTableContent controlStyles={getControlStyles(showControls)}>
      <div className="mobileTableHeader flexRow valignWrapper bold">
        {!_.isEmpty(showRows) && isEdit && !disabled && showHeaderDelete && (
          <div className="mobileTableItem tableIndex"></div>
        )}
        {showControls.map((c, cIndex) => (
          <div
            key={cIndex}
            className={cx(`mobileTableItem flex Font13 control-head-${c.controlId}`, {
              mRight30: cIndex === showControls.length - 1,
            })}
          >
            <div className={cx('w100 controlName', { overflow_ellipsis: !titleWrap })}>{c.controlName}</div>
          </div>
        ))}
      </div>
      {showRows.map((row, i) => {
        const allowDelete =
          /^temp/.test(row.rowid) || (allowcancel && (useUserPermission && !!recordId ? row.allowdelete : true));

        return (
          <div className="flexRow valignWrapper" key={i}>
            {isEdit && !disabled && allowDelete && (
              <div className="mobileTableItem tableIndex">
                <div className="action" onClick={() => onDelete(row.rowid)}>
                  <i className="icon icon-trash Font16 Red mRight10"></i>
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
                    className="mobileTableItem flex"
                    onClick={() => {
                      onOpen(i);
                    }}
                  ></div>
                );
              }

              return (
                <div
                  key={cIndex}
                  className={`mobileTableItem flex control-val-${c.controlId}`}
                  onClick={() => {
                    onOpen(i);
                  }}
                >
                  {!row[c.controlId] ? (
                    <div className="customFormNull"></div>
                  ) : (
                    <CellControl
                      isMobileTable
                      className="cell flex ellipsis"
                      sheetSwitchPermit={sheetSwitchPermit}
                      cell={{
                        ...c,
                        value: row[c.controlId],
                        advancedSetting: c.type === 36 ? { ...getAdvanceSetting(c), showtype: '0' } : c.advancedSetting,
                      }}
                      row={row}
                      rowHeight={30}
                      from={4}
                      mode="mobileSub"
                      masterData={masterData}
                      rowFormData={() => controls.map(c => Object.assign({}, c, { value: row[c.controlId] }))}
                      projectId={projectId}
                      worksheetId={worksheetId}
                      canedit={c.type === 36 && controlPermission.editable}
                      appId={appId}
                      updateCell={({ value }) => {
                        if (c.type !== 36) return;

                        onSave({ ...row, [c.controlId]: value }, [c.controlId]);

                        if (isEdit) return;
                        clearTimeout(timer);
                        timer = setTimeout(() => {
                          submitChildTableCheckData();
                        }, 500);
                      }}
                    />
                  )}
                </div>
              );
            })}

            <div className="flexRow valignWrapper">
              <Icon className="textTertiary" icon="arrow-right-tip" />
            </div>
          </div>
        );
      })}
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
