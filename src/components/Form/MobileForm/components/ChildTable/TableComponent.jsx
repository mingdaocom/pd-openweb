import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Table } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CellControl from 'worksheet/components/CellControls';
import { getAdvanceSetting } from 'src/utils/control';
import { updateRulesData } from '../../../core/formUtils';
import * as actions from './redux/actions';

const TableWrap = styled(Table)`
  height: 100%;
  .ant-spin-nested-loading,
  .ant-spin-container,
  .ant-table,
  .ant-table-container {
    height: 100%;
  }
  .ant-table {
    font-size: 1em !important;
    color: #151515 !important;
  }
  .ant-table-thead
    > tr
    > th:not(:last-child):not(.ant-table-selection-column):not(.ant-table-row-expand-icon-cell):not([colspan])::before,
  .ant-table-ping-right:not(.ant-table-has-fix-right) .ant-table-container::before,
  .ant-table-ping-right:not(.ant-table-has-fix-right) .ant-table-container::after {
    display: none;
  }
  .ant-table-tbody > tr.ant-table-row:hover > td,
  .ant-table-tbody > tr > td.ant-table-cell-row-hover {
    background-color: #fff;
  }

  .ant-table-tbody > tr > td {
    padding: 0 12px;
  }

  .ant-table-thead > tr > th {
    padding: 0px 12px;
    height: 40px;
    line-height: 36px;
    color: #151515;
    background: #f7f7f7;
    font-size: 13px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: top;
  }
  .ant-table-body {
    max-height: calc(100% - 40px);
  }

  .ant-table-placeholder {
    display: none !important;
  }
  .compactness {
    height: 44px;
  }
  /* 中等 */
  .mediumTable {
    height: 64px;
    .cell,
    .cell .ellipsis {
      display: -webkit-box !important;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
    }
  }
  /* 高 */
  .heightTable {
    height: 88px;
    .cell,
    .cell .ellipsis {
      display: -webkit-box !important;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
    }
  }
  /* 自适应 */
  .adaptive {
    min-height: 44px;
    td {
      padding: 5px 12px;
    }
    .cell,
    .cell .ellipsis {
      display: -webkit-box !important;
      -webkit-box-orient: vertical;
      white-space: pre-wrap;
    }

    .customFormNull {
      width: 22px;
      height: 6px;
      background: var(--gray-e0);
      margin: 15px 0;
      border-radius: 3px;
    }
  }
`;

const Pagination = styled.div`
  display: flex;
  text-align: center;
  align-items: center;
  height: 36px;
  margin-top: 10px;
  .prev,
  .next {
    height: 100%;
    line-height: 36px;
    color: #fff;
    padding: 0 12px;
    background: #2196f3;
    border-radius: 3px;
    &.disabled {
      background: #e0e0e0;
    }
  }
`;
function TableComponent(props) {
  const {
    disabled,
    controls,
    rows,
    isEdit,
    sheetSwitchPermit,
    masterData,
    worksheetId,
    projectId,
    controlPermission,
    recordId,
    showControls = [],
    h5height,
    allowcancel,
    useUserPermission,
    showExpand,
    rules,
    pagination = {},
    onSave = () => {},
    submitChildTableCheckData = () => {},
    updatePagination = () => {},
    onOpen = () => {},
    onDelete = () => {},
  } = props;
  const { pageIndex, count, pageSize } = pagination;
  const totalPage = Math.ceil(count / pageSize);
  const dataSource = rows.slice((pageIndex - 1) * pageSize, pageIndex * pageSize);
  const showDeleteCol =
    _.findIndex(
      rows,
      row => /^temp/.test(row.rowid) || (allowcancel && (useUserPermission && !!recordId ? row.allowdelete : true)),
    ) > -1;
  let columns = showControls.map(item => _.find(controls, c => c.controlId === item)).filter(_.identity);
  columns =
    !disabled && isEdit && !_.isEmpty(rows) && showDeleteCol
      ? [{ controlId: 'delete', controlName: '', className: 'deleteAction', width: 30 }].concat(columns)
      : columns;
  const lineHeightInfo = { 0: 'compactness', 1: 'mediumTable', 2: 'heightTable', 3: 'adaptive' }; // h5height: 0=>紧凑 1=>中等 2=>高 3=>自适应
  let timer = null;

  const changePage = type => {
    if ((type === 'prev' && pageIndex === 1) || (type === 'next' && pageIndex >= totalPage)) {
      return;
    }
    updatePagination({ pageIndex: type === 'prev' ? pageIndex - 1 : pageIndex + 1 });
  };

  return (
    <Fragment>
      <div className="flex overflowHidden" style={{ marginRight: showExpand ? -20 : 0 }}>
        <TableWrap
          tableLayout="fixed"
          rowClassName={lineHeightInfo[h5height]}
          pagination={false}
          dataSource={dataSource}
          scroll={{ x: '100%', y: true }}
          rowKey="rowid"
          columns={columns.map(item => ({
            dataIndex: item.controlId,
            title: item.controlName,
            align: 'left',
            className: item.className,
            textWrap: 'word-break',
            width: item.width || 180,
            onCell: () => {
              return {
                style: {
                  maxWidth: item.width || 180,
                  minWidth: item.width || 180,
                },
              };
            },
            render: (text, record) => {
              if (item.controlId === 'delete') {
                const allowDelete =
                  /^temp/.test(record.rowid) ||
                  (allowcancel && (useUserPermission && !!recordId ? record.allowdelete : true));
                return allowDelete ? (
                  <div
                    className="action"
                    onClick={event => {
                      event.stopPropagation();
                      onDelete(record.rowid);
                    }}
                  >
                    <i className="icon icon-task-new-delete Font16 Red"></i>
                  </div>
                ) : null;
              }

              const tableFormData = updateRulesData({
                rules,
                recordId: record.rowid,
                data: controls.map(v => ({ ...v, value: record[v.controlId] })),
              });

              const currentCell = _.find(tableFormData, v => v.controlId === item.controlId);
              item = { ...item, fieldPermission: currentCell.fieldPermission };

              const visible =
                item.fieldPermission[0] === '1' &&
                item.fieldPermission[2] === '1' &&
                item.controlPermissions[2] === '1';

              if (!visible) {
                return <div className="cell"></div>;
              }

              if (!record[item.controlId]) {
                return <div className="customFormNull"></div>;
              }

              return (
                <CellControl
                  isMobileTable
                  className="cell flex ellipsis"
                  sheetSwitchPermit={sheetSwitchPermit}
                  cell={{
                    ...item,
                    value: record[item.controlId],
                    advancedSetting:
                      item.type === 36 ? { ...getAdvanceSetting(item), showtype: '0' } : item.advancedSetting,
                  }}
                  row={record}
                  from={item.type == 29 ? 3 : 4}
                  style={
                    _.includes([29, 51], item.type)
                      ? {
                          width: 180,
                          height: h5height === '0' ? 44 : h5height === '1' ? 64 : h5height === '2' ? 88 : 'auto',
                        }
                      : {}
                  }
                  mode="mobileSub"
                  masterData={masterData}
                  rowFormData={() => controls.map(c => Object.assign({}, c, { value: record[c.controlId] }))}
                  projectId={projectId}
                  worksheetId={worksheetId}
                  canedit={item.type === 36 && controlPermission.editable}
                  updateCell={({ value }) => {
                    if (item.type !== 36) return;

                    onSave({ ...record, [item.controlId]: value }, [item.controlId]);

                    if (isEdit) return;
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                      submitChildTableCheckData();
                    }, 500);
                  }}
                />
              );
            },
          }))}
          onRow={(record, index) => {
            return {
              onClick: event => {
                event.stopPropagation();
                onOpen((pageIndex - 1) * pageSize + +index);
              },
            };
          }}
        ></TableWrap>
      </div>
      {!isEdit && _.isEmpty(rows) && <div className="Gray_9e mTop15 bold">{_l('暂无记录')}</div>}
      {totalPage > 1 && (
        <Pagination className="Font14">
          <div className={cx('prev mLeft16', { disabled: pageIndex === 1 })} onClick={() => changePage('prev')}>
            {_l('上一页')}
          </div>
          <div className="flex Gray Font15">
            <span className="ThemeColor bold">{pageIndex}</span>/<span>{totalPage}</span>
          </div>
          <div className={cx('next mRight16', { disabled: pageIndex >= totalPage })} onClick={() => changePage('next')}>
            {_l('下一页')}
          </div>
        </Pagination>
      )}
    </Fragment>
  );
}

TableComponent.propTypes = {
  controls: PropTypes.array, //子表值字段
  rows: PropTypes.array, // 子表记录
  isEdit: PropTypes.bool, // 是否可编辑
  sheetSwitchPermit: PropTypes.array, // 权限
  masterData: PropTypes.array, //主记录数据
  worksheetId: PropTypes.string,
  projectId: PropTypes.string,
  controlPermission: PropTypes.object, // 字段权限
  showControls: PropTypes.array, // 展示字段
  h5height: PropTypes.number, // 行高
  onSave: PropTypes.func, // 保存
  submitChildTableCheckData: PropTypes.func, // 更新检查项字段
  updatePagination: PropTypes.func,
  onOpen: PropTypes.func,
};

const mapStateToProps = (state, props) => ({
  pagination: state.pagination,
});

const mapDispatchToProps = dispatch => ({
  updatePagination: bindActionCreators(actions.updatePagination, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(TableComponent);
