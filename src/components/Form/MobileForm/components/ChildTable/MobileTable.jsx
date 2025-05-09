import React, { Fragment, useEffect, useRef, useState } from 'react';
import { ActionSheet, Button } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import CellControl from 'worksheet/components/CellControls';
import { isRelateRecordTableControl } from 'worksheet/util';
import CustomFields from 'src/components/newCustomFields';
import { getAdvanceSetting } from 'src/util';
import { onValidator, updateRulesData } from '../../../core/formUtils';

const MobileTableContent = styled.div`
  .mobileTableHeader {
    background-color: #f7f7f7;
    margin-bottom: 6px;
    .mobileTableItem {
      height: auto;
      min-height: 40px !important;
    }
  }
  .tableIndex {
    width: 32px !important;
    .icon-task-new-delete {
      margin-left: -4px;
    }
  }
  .mobileTableItem {
    width: 0;
    padding: 8px 0 8px 6px;
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
    color: #2196f3;
    padding: 10px 0;
    justify-content: center;
  }
  .icon-arrow-right-tip {
    width: 15px;
    text-align: center;
  }
`;

const FlattenContent = styled.div`
  .childTableErrorMessage {
    color: #f44336;
  }
  .rowHeader {
    height: 36px;
    line-height: 40px;
    background-color: #f7f7f7;
    padding-left: 10px;
    border-radius: 3px;
    margin-inline-end: 6px;
    &.expandHeader {
      background-color: rgba(33, 150, 243, 0.1);
    }
    .delete,
    .edit {
      width: 38px;
      text-align: center;
    }
    .delete {
      color: #f44336;
    }
    .edit {
      color: #2196f3;
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
    color: #2196f3;
    padding: 10px 0;
    justify-content: center;
  }
`;

export default function MobileTable(props) {
  const {
    onOpen,
    controls,
    rows,
    isEdit,
    allowcancel,
    allowadd,
    disabled,
    sheetSwitchPermit,
    onDelete,
    showNumber,
    masterData,
    h5showtype,
    h5abstractids = [],
    appId,
    worksheetId,
    rules,
    cellErrors,
    projectId,
    controlPermission,
    allowedit,
    titleWrap,
    isAddRowByLine,
    from,
    ignoreLock,
    isDraft,
    useUserPermission,
    recordId,
    onSave = () => {},
    submitChildTableCheckData = () => {},
    updateIsAddByLine = () => {},
  } = props;

  const defaultMaxLength = 10;
  const [maxShowLength, setMaxShowLength] = useState(defaultMaxLength);
  const [expandRowIndex, setExpandRowIndex] = useState();
  const [random, setRandom] = useState(Date.now());
  const customWidgetRefs = useRef([]);

  const showRows = isEdit ? rows : rows.slice(0, maxShowLength);
  const showControlsFilter =
    _.isEmpty(h5abstractids) || _.isEmpty(controls.filter(v => _.includes(h5abstractids, v.controlId)))
      ? controls.slice(0, 3)
      : controls.filter(v => _.includes(h5abstractids, v.controlId));

  // 根据h5abstractids，重新排序
  const showControls = showControlsFilter.sort(
    (a, b) => h5abstractids.indexOf(a.controlId) - h5abstractids.indexOf(b.controlId),
  );

  const isShowAll = maxShowLength === rows.length;
  let deleteConformAction = null;

  let timer = null;

  // 删除记录
  const deleteRecord = rowid => {
    deleteConformAction = ActionSheet.show({
      popupClassName: 'md-adm-actionSheet',
      actions: [],
      extra: (
        <div className="flexColumn w100">
          <div className="bold Gray Font17 pTop10">{_l('确定删除此记录 ?')}</div>
          <div className="valignWrapper flexRow confirm mTop24">
            <Button
              className="flex mRight6 bold Gray_75 flex ellipsis Font13"
              onClick={() => deleteConformAction.close()}
            >
              {_l('取消')}
            </Button>
            <Button
              className="flex mLeft6 bold flex ellipsis Font13"
              color="danger"
              onClick={() => {
                deleteConformAction.close();
                onDelete(rowid);
              }}
            >
              {_l('确定')}
            </Button>
          </div>
        </div>
      ),
    });
  };

  // 展示全部
  const showAll = () => {
    return (
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
    let errorType = onValidator({ item, data });
    onSave({ ...item, ...row, empty: false }, updateControlIds);
  };

  useEffect(() => {
    setRandom(Date.now());
  }, [isEdit]);

  useEffect(() => {
    if (h5showtype !== '2' || !isAddRowByLine) return;
    setExpandRowIndex(rows.length - 1, isAddRowByLine);
  }, [rows]);

  // 记录为空
  const showEmpty = () =>
    !isEdit && _.isEmpty(rows) && <div className="Gray_9e mTop15 mLeft15 bold">{_l('暂无记录')}</div>;

  // 平铺
  if (h5showtype === '2') {
    return (
      <FlattenContent>
        {showRows.map((item, index) => {
          const { rowid } = item;
          const isExpand = expandRowIndex === index;
          const ignoreLock = /^(temp|default|empty)/.test(rowid);

          return (
            <div key={rowid}>
              <div
                className={cx('rowHeader flexRow LineHeight40 pRight6 alignItemsCenter', {
                  expandHeader: isExpand,
                })}
              >
                <i
                  className={`icon ${
                    expandRowIndex === index ? 'icon-unfold_less' : 'icon-unfold_more'
                  } LineHeight40 mRight10 Font17`}
                  onClick={() => {
                    setRandom(Date.now());
                    setExpandRowIndex(!isExpand ? index : undefined);
                    updateIsAddByLine(false);
                  }}
                />
                <div
                  className="flex bold Font15"
                  onClick={() => {
                    setRandom(Date.now());
                    setExpandRowIndex(!isExpand ? index : undefined);
                    updateIsAddByLine(false);
                  }}
                >
                  {showNumber ? index + 1 : ''}
                </div>
                {!disabled && isEdit && (
                  <Fragment>
                    {(allowcancel || /^temp/.test(rowid)) && (
                      <div className="delete pTop3" onClick={() => deleteRecord(rowid)}>
                        <i className="icon icon-task-new-delete Red Font18" />
                      </div>
                    )}
                  </Fragment>
                )}
              </div>
              <CustomFields
                className={cx('mobileChildTableFlatForm', { packUp: !isExpand })}
                from={/^temp/.test(rowid) ? 2 : from}
                flag={random}
                disabledFunctions={isEdit ? ['controlRefresh'] : []}
                ignoreLock={ignoreLock}
                isDraft={isDraft}
                ref={el => (customWidgetRefs.current[index] = el)}
                recordId={rowid}
                data={(expandRowIndex === index ? controls : showControls).map(c => ({
                  ...c,
                  value: item[c.controlId],
                  ignoreDisabled: c.type === 36 && controlPermission.editable,
                  fieldPermission: isRelateRecordTableControl(c) ? '000' : c.fieldPermission,
                  controlPermissions: isRelateRecordTableControl(c) ? '000' : c.controlPermissions,
                  isSubList: true,
                }))}
                widgetStyle={isEdit && isExpand ? {} : { titlelayout_app: '2', titlewidth_app: '80' }}
                disabled={!(isEdit && isExpand) || (!/^temp/.test(rowid) && !allowedit)}
                disabledChildTableCheck={!/^temp/.test(rowid) && !allowedit}
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
          );
        })}
        {showEmpty()}
        {showAll()}
      </FlattenContent>
    );
  }

  const showHeaderDelete =
    _.findIndex(
      showRows,
      row => /^temp/.test(row.rowid) || (allowcancel && (useUserPermission && !!recordId ? row.allowdelete : true)),
    ) > -1;

  // 列表
  return (
    <MobileTableContent>
      <div className="mobileTableHeader flexRow valignWrapper bold">
        {!_.isEmpty(showRows) && isEdit && !disabled && showHeaderDelete && (
          <div className="mobileTableItem tableIndex"></div>
        )}
        {showControls.map((c, cIndex) => (
          <div
            key={cIndex}
            className={cx('mobileTableItem flex Font13', { mRight30: cIndex === showControls.length - 1 })}
          >
            <div className={cx('w100', { overflow_ellipsis: !titleWrap })}>{c.controlName}</div>
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
                <div className="action" onClick={() => deleteRecord(row.rowid)}>
                  <i className="icon icon-task-new-delete Font16 Red mRight10"></i>
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
                c.fieldPermission[0] === '1' && c.fieldPermission[2] === '1' && c.controlPermissions[2] === '1';

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
                  className="mobileTableItem flex"
                  onClick={() => {
                    onOpen(i);
                  }}
                >
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
                </div>
              );
            })}

            <div className="flexRow valignWrapper">
              <Icon className="Gray_9e" icon="arrow-right-tip" />
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
