import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, LoadDiv, Tooltip, Checkbox } from 'ming-ui';
import { Table, ConfigProvider, Dropdown } from 'antd';
import PaginationWrap from '../PaginationWrap';
import _ from 'lodash';
import cx from 'classnames';
import './index.less';

export default class PageTableCon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1, // 页码
      pageSize: 50, // 条数
      searchParams: {},
      columns: props.columns || [],
      checkedCols: props.columns.map(it => it.dataIndex),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.paginationInfo !== nextProps.paginationInfo) {
      this.setState({ pageIndex: nextProps.paginationInfo.pageIndex, pageSize: nextProps.paginationInfo.pageSize });
    }
  }

  // 分页
  changPage = page => {
    this.setState({ pageIndex: page }, () => {
      this.props.getDataSource({ pageIndex: page });
    });
  };

  setCheckedCols = checkedCols => {
    this.setState({ checkedCols });
    if (this.props.getShowColumns) {
      this.props.getShowColumns(checkedCols);
    }
  };

  // 自定义显示列
  renderShowColumns = () => {
    const { checkedCols = [], columns = [] } = this.state;

    return (
      <div className="customColsWrap">
        <div className="statistics">
          <Checkbox
            clearselected={checkedCols.length && checkedCols.length !== columns.length}
            checked={_.every(columns, item => _.includes(checkedCols, item.dataIndex))}
            onClick={checked => {
              let checkedCols = [];
              if (checked) {
                checkedCols = columns.filter(it => it.disabled).map(it => it.dataIndex);
              } else {
                checkedCols = columns.map(it => it.dataIndex);
              }
              this.setCheckedCols(checkedCols);
            }}
          >
            <span className="verticalAlign">{_l('显示列 %0/%1', checkedCols.length, columns.length)}</span>
          </Checkbox>
        </div>
        <ul>
          {columns.map((item, index) => {
            return (
              <li key={item.dataIndex}>
                <Checkbox
                  checked={_.includes(checkedCols, item.dataIndex)}
                  disabled={item.disabled}
                  onClick={checked => {
                    let copyCheckedCols = [...checkedCols];
                    if (checked) {
                      copyCheckedCols = copyCheckedCols.filter(it => it !== item.dataIndex);
                    } else {
                      copyCheckedCols = copyCheckedCols.concat(item.dataIndex);
                    }
                    this.setCheckedCols(copyCheckedCols);
                  }}
                >
                  <span className="verticalAlign">{item.title}</span>
                </Checkbox>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  render() {
    const { className, loading, dataSource = [], count, moreAction, moreActionContent, fixedShowCols } = this.props;
    let { pageSize, pageIndex, columns = [], dropDownVisible, checkedCols = [] } = this.state;
    columns = columns.filter(item => _.includes(checkedCols, item.dataIndex));
    columns =
      moreAction && !fixedShowCols
        ? columns.concat({
            title: (
              <Dropdown
                overlay={this.renderShowColumns}
                trigger={['click']}
                visible={dropDownVisible}
                onVisibleChange={visible => this.setState({ dropDownVisible: visible })}
                placement="bottomRight"
              >
                <Tooltip text={<span>{_l('自定义显示列')} </span>} popupPlacement="top">
                  <Icon
                    icon="visibility"
                    className={cx('Hover_21', {
                      Gray_bd: checkedCols.length === this.state.columns.length,
                      ThemeColor: checkedCols.length !== this.state.columns.length,
                    })}
                  />
                </Tooltip>
              </Dropdown>
            ),
            width: 80,
            fixed: 'right',
            align: 'right',
            dataIndex: 'moreAction',
            render: (text, record) => {
              if (!moreActionContent) return;
              return moreActionContent(record);
            },
          })
        : columns;
    const scrollWidth = _.reduce(columns, (total, item) => total + item.width, 0);

    const scroll = _.isEmpty(dataSource)
      ? { x: scrollWidth }
      : {
          x: scrollWidth,
          y: count > pageSize ? `calc(100% - 52px )` : `calc(100% - 50px )`,
        };

    return (
      <div className={`tableWrap flexColumn Relative ${className}`}>
        <div className="flex" style={{ overflow: 'hidden', minHeight: 0 }}>
          {loading ? (
            <LoadDiv className="mTop40" />
          ) : (
            <ConfigProvider
              renderEmpty={() => (
                <div className="flexColumn emptyBox">
                  <div className="emptyIcon">
                    <Icon icon="verify" className="Font40" />
                  </div>
                  {_l('无数据')}
                </div>
              )}
            >
              <Table
                columns={columns.map(item => ({
                  ...item,
                  onCell: () => {
                    return {
                      style: {
                        maxWidth: item.width || 150,
                        minWidth: item.width || 150,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      },
                    };
                  },
                }))}
                dataSource={dataSource}
                pagination={false}
                tableLayout="auto"
                scroll={scroll}
              />
            </ConfigProvider>
          )}
        </div>
        {count > pageSize && !loading && (
          <PaginationWrap total={count} pageSize={pageSize} pageIndex={pageIndex} onChange={this.changPage} />
        )}
        {fixedShowCols && (
          <div className="showColsWrap">
            <Dropdown
              overlay={this.renderShowColumns}
              trigger={['click']}
              visible={dropDownVisible}
              onVisibleChange={visible => this.setState({ dropDownVisible: visible })}
              placement="bottomRight"
            >
              <Tooltip text={<span>{_l('自定义显示列')} </span>} popupPlacement="top">
                <Icon
                  icon="visibility"
                  className={cx('Hover_21', {
                    Gray_bd: checkedCols.length === this.state.columns.length,
                    ThemeColor: checkedCols.length !== this.state.columns.length,
                  })}
                />
              </Tooltip>
            </Dropdown>
          </div>
        )}
      </div>
    );
  }
}

PageTableCon.propTypes = {
  className: PropTypes.string,
  loading: PropTypes.bool,
  columns: PropTypes.array.isRequired,
  dataSource: PropTypes.array.isRequired,
  count: PropTypes.number,
  moreAction: PropTypes.bool,
  moreActionContent: PropTypes.func,
  getDataSource: PropTypes.func,
  getShowColumns: PropTypes.func,
  fixedShowCols: PropTypes.bool,
};
