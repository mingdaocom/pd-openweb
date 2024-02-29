import React, { Fragment, Component } from 'react';
import { Icon, ScrollView, LoadDiv, Tooltip } from 'ming-ui';
import PropTypes from 'prop-types';
import PaginationWrap from 'src/pages/Admin/components/PaginationWrap';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

export default class TableCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource,
      sorterInfo: props.defaultSorter || {},
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.dataSource, nextProps.dataSource)) {
      this.setState({ dataSource: nextProps.dataSource });
    }
  }

  renderEmpty = () => {
    const { emptyInfo = {} } = this.props;
    const { emptyIcon, emptyContent, emptyDescription = '' } = emptyInfo;
    return (
      <div className="emptyWrap flex flexColumn">
        <div className="iconWrap">
          <Icon icon={emptyIcon || 'draft-box'} />
        </div>
        <div className="emptyExplain">{emptyContent || _l('无数据')}</div>
        <div className="Gray_75">{emptyDescription}</div>
      </div>
    );
  };

  clickSorter = item => {
    const { sorterInfo = {} } = this.state;
    if (!item.sorter) return;
    this.setState(
      {
        sorterInfo: {
          order: sorterInfo.sortFiled === item.dataIndex && sorterInfo.order === 'asc' ? 'desc' : 'asc',
          sortFiled: item.dataIndex,
        },
      },
      () => {
        this.props.dealSorter(this.state.sorterInfo);
      },
    );
  };

  render() {
    const { columns = [], loading, total, pageIndex } = this.props;
    let { dataSource = [], sorterInfo = {} } = this.state;
    return (
      <div className="tableWrap flexColumn">
        <div className="tableHeader flexRow">
          {columns.map(item => {
            return (
              <div className={`${item.className} flexRow alignItemsCenter`}>
                <div
                  className={cx({
                    ThemeHoverColor3: item.sorter,
                    pointer: item.sorter,
                    mRight12: !item.explain,
                    mRight0: !!item.explain,
                  })}
                  style={{ zIndex: 1 }}
                  onClick={() => {
                    this.clickSorter(item);
                  }}
                >
                  {item.title}
                </div>
                {!!item.explain && (
                  <Tooltip text={<span>{item.explain}</span>} popupPlacement="bottom">
                    <Icon icon="info" className="Font16 Gray_9e mLeft3 mRight12 hover_f3" />
                  </Tooltip>
                )}
                {item.sorter && (
                  <div className="flexColumn sorter">
                    <Icon
                      icon="arrow-up"
                      className={cx({
                        ThemeColor3: sorterInfo.order === 'asc' && sorterInfo.sortFiled === item.dataIndex,
                      })}
                    />
                    <Icon
                      icon="arrow-down"
                      className={cx({
                        ThemeColor3: sorterInfo.order === 'desc' && sorterInfo.sortFiled === item.dataIndex,
                      })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="tableContent flex">
          {loading ? (
            <LoadDiv className="top20" />
          ) : _.isEmpty(dataSource) ? (
            this.renderEmpty()
          ) : (
            <ScrollView>
              {dataSource.map(item => {
                return (
                  <div className="row flexRow alignItemsCenter">
                    {columns.map(it => {
                      if (it.render) {
                        return <div className={it.className}>{it.render(item)}</div>;
                      } else {
                        return <div className={it.className}>{item[it.dataIndex]}</div>;
                      }
                    })}
                  </div>
                );
              })}
            </ScrollView>
          )}
        </div>
        <PaginationWrap total={total} pageIndex={pageIndex} pageSize={50} onChange={this.props.changePage} />
      </div>
    );
  }
}
TableCom.propTypes = {
  loading: PropTypes.bool,
  columns: PropTypes.array,
  dataSource: PropTypes.array,
  dealSorter: PropTypes.func,
  defaultSorter: PropTypes.object,
};
