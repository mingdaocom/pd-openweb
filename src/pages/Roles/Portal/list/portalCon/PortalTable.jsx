import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Pagination, Table, ConfigProvider } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../../redux/actions';
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
  .ant-table-ping-right:not(.ant-table-has-fix-right) .ant-table-container::after,
  .ant-table-ping-right .ant-table-cell-fix-right-first::after,
  .ant-table-ping-right .ant-table-cell-fix-right-last::after,
  .ant-table-ping-left .ant-table-cell-fix-left-first::after,
  .ant-table-ping-left .ant-table-cell-fix-left-last::after {
    box-shadow: none;
  }
  .ant-table-sticky-scroll {
    display: none;
  }
  .linelimit,
  .linelimitcomp:not(.singleLine) {
    display: block;
  }
  .ant-pagination {
    margin: 20px 20px 0;
    text-align: center;
  }
  .ant-table-expanded-row-fixed {
    height: 360px;
  }
  .ant-table.ant-table-bordered > .ant-table-container > .ant-table-content > table > thead,
  .ant-table.ant-table-bordered > .ant-table-container > .ant-table-content > table > thead > tr,
  .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > thead > tr,
  .ant-table.ant-table-bordered > .ant-table-container > .ant-table-body > table > thead > tr,
  .ant-table.ant-table-bordered > .ant-table-container > .ant-table-content > table > tbody > tr,
  .ant-table.ant-table-bordered > .ant-table-container > .ant-table-header > table > tbody > tr,
  .ant-table.ant-table-bordered > .ant-table-container > .ant-table-body > table > tbody > tr {
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
      .ming.Dropdown.disabled,
      .dropdownTrigger.disabled {
        background-color: transparent;
      }
      .ming.Dropdown,
      .dropdownTrigger {
        display: flex;
        .Dropdown--input {
          padding: 0;
          display: flex;
          width: 100%;
          .Dropdown--placeholder,
          .value {
            flex: 1;
          }
          .icon {
            line-height: 20px;
          }
        }
      }
    }
  }

  .ant-table-tbody,
  .ant-table-header {
    & > tr.ant-table-row-selected {
      &:hover > td {
        background: #fafafa;
      }
    }
    input[type='radio'],
    input[type='checkbox'],
    .ant-table-cell-scrollbar {
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
  .ant-table-tbody > tr.ant-table-row-selected > td {
    background: #fff;
  }
`;

function PorTalTable(props) {
  const [pageSize, setPageSize] = useState(props.pageSize || 10);
  const [currentData, setCurrentData] = useState([]);
  const { onOk, type, clickRow, portal, noShowCheck, scrolly } = props;
  const [listCell, setList] = useState([]);
  const [columnsCell, setColumns] = useState([]);

  useEffect(() => {
    setList(props.list || []);
    setColumns(props.columns || []);
  }, [props.list, props.columns]);

  const customizeRenderEmpty = () => (
    <div className="emptyCon">
      <div className="TxtCenter">
        <i class="iconBox mBottom12"></i>
        <span class="Gray_9e Block mBottom20 TxtCenter Font17 Gray_9e">{_l('暂无数据')}</span>
      </div>
    </div>
  );
  return (
    <Wrap>
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
          loading={portal.loading}
          dataSource={listCell}
          bordered
          size="small"
          locale={_l('暂无数据')}
          rowKey={record => record.rowid}
          pagination={false}
          scroll={{
            x: props.width - 1,
            //  y: listCell.length <= 0 ? false : scrolly || 'calc(100vh - 550px)'
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
              }, // 点击行
              // onDoubleClick: event => {},
              // onContextMenu: event => {},
              // onMouseEnter: event => {}, // 鼠标移入行
              // onMouseLeave: event => {},
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
const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PorTalTable);
