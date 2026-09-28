import React from 'react';
import styled from 'styled-components';
import { ConfigProvider, Pagination } from 'ming-ui/antd-components';
import { Table } from 'src/ming-ui/antd-components/AsyncAntd';

const Wrap = styled.div`
  .userImgBox {
    img {
      height: 22px;
    }
    .name {
      word-wrap: break-word;
      word-break: break-all;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
      width: 100%;
    }
  }
  .hap-table-ping-right:not(.hap-table-has-fix-right) .hap-table-container::after,
  .hap-table-ping-right .hap-table-cell-fix-right-first::after,
  .hap-table-ping-right .hap-table-cell-fix-right-last::after,
  .hap-table-ping-left .hap-table-cell-fix-left-first::after,
  .hap-table-ping-left .hap-table-cell-fix-left-last::after {
    box-shadow: none;
  }
  .hap-table-sticky-scroll {
    display: none;
  }
  .linelimit,
  .linelimitcomp:not(.singleLine) {
    display: block;
  }
  .hap-pagination {
    margin: 20px 20px 0;
    text-align: center;
  }
  .hap-table-expanded-row-fixed {
    height: 360px;
  }
  .hap-table.hap-table-bordered > .hap-table-container > .hap-table-content > table > thead,
  .hap-table.hap-table-bordered > .hap-table-container > .hap-table-content > table > thead > tr,
  .hap-table.hap-table-bordered > .hap-table-container > .hap-table-header > table > thead > tr,
  .hap-table.hap-table-bordered > .hap-table-container > .hap-table-body > table > thead > tr,
  .hap-table.hap-table-bordered > .hap-table-container > .hap-table-content > table > tbody > tr,
  .hap-table.hap-table-bordered > .hap-table-container > .hap-table-header > table > tbody > tr,
  .hap-table.hap-table-bordered > .hap-table-container > .hap-table-body > table > tbody > tr {
    .tableCellPortal {
      text-overflow: ellipsis;
      word-wrap: break-word;
      word-break: break-all;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 100%;
    }
    th,
    td {
      height: 40px;
      .editableCellCon {
        padding: 0 !important;
      }
    }
  }

  .hap-table-tbody,
  .hap-table-header {
    & > tr.hap-table-row-selected {
      &:hover > td {
        background: var(--color-background-secondary);
      }
    }
    input[type='radio'],
    input[type='checkbox'],
    .hap-table-cell-scrollbar {
      display: none !important;
      width: 0 !important;
    }
    .cellOptions {
      max-width: 100%;
      .cellOption {
        max-width: 100%;
        margin-bottom: 0px;
      }
    }
  }
  .hap-table-tbody > tr.hap-table-row-selected > td {
    background: var(--color-background-primary);
  }
`;

const customizeRenderEmpty = () => (
  <div className="emptyCon">
    <div className="TxtCenter">
      <i class="iconBox mBottom12"></i>
      <span class="textTertiary Block mBottom20 TxtCenter Font17 textTertiary">{_l('暂无数据')}</span>
    </div>
  </div>
);

function PorTalTable(props) {
  const { pageSize = 10 } = props;
  const { type, clickRow, noShowCheck } = props;
  const listCell = props.list || [];
  const columnsCell = props.columns || [];

  return (
    <Wrap className={props.className}>
      <ConfigProvider renderEmpty={customizeRenderEmpty}>
        <Table
          rowSelection={
            noShowCheck
              ? null
              : {
                  selectedRowKeys: props.selectedIds,
                  onChange: selectedIds => {
                    props.setSelectedIds(selectedIds);
                  },
                  fixed: true,
                }
          }
          columns={columnsCell.map((o, i) => {
            return {
              width: 120,
              ...o,
              key: i,
              dataIndex: o.id,
              title: o.name,
              wordWrap: 'break-word',
              wordBreak: 'break-word',
            };
          })}
          sticky
          loading={props.loading}
          dataSource={listCell}
          bordered={props.bordered !== false}
          size="small"
          locale={_l('暂无数据')}
          rowKey={record => record.rowid}
          pagination={false}
          scroll={{
            x: props.width - 1,
            ...(props.scrollY ? { y: props.scrollY } : {}),
          }}
          showSorterTooltip={false}
          onChange={(pagination, filters, sorter) => {
            props.handleChangeSortHeader && props.handleChangeSortHeader(sorter);
          }}
          onRow={data => {
            return {
              onClick: event => {
                if (event.target.className.indexOf('checkbox') >= 0) {
                  return;
                }

                clickRow &&
                  clickRow(
                    columnsCell.map(item => {
                      return { ...item, value: data[item.controlId] };
                    }),
                    data.rowid,
                  );
              },
            };
          }}
        />
      </ConfigProvider>
      {type !== 2 && //角色不分页
        props.total > pageSize && (
          <Pagination
            showSizeChanger={false}
            pageSize={pageSize}
            total={props.total}
            current={props.pageIndex}
            onChange={data => {
              props.changePage(data);
            }}
          />
        )}
    </Wrap>
  );
}

export default PorTalTable;
