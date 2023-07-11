import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Pagination } from 'antd';
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  min-height: 0;
  padding: 12px;
  .ant-pagination {
    .ant-pagination-prev,
    .ant-pagination-next {
      height: unset;
      line-height: unset;
      a {
        display: inline-block;
        padding: 3px 8px;
        border: 1px solid #ccc;
        color: #666;
        font-size: 12px;
      }
    }
    .ant-pagination-disabled a {
      color: #ccc;
      border: 1px solid #fff;
      font-size: 12px;
    }
    .ant-pagination-item {
      height: unset;
      line-height: unset;
      margin-right: 10px;
      min-width: 0;
      border: 1px solid #fff;
      a {
        color: #666;
        display: inline-block;
        padding: 3px 8px;
        text-align: center;
        vertical-align: middle;
        border: 1px solid #fff;
        font-size: 12px;
      }
      a:hover {
        border: 1px solid #ccc;
        color: #666;
      }
    }
    .ant-pagination-item-active {
      // border: none;
      border: 1px solid #fff;
      color: #333;
      a {
        // border: none;
        border: 1px solid #fff;
        text-decoration: underline;
        color: #333;
      }
    }
    .ant-pagination-jump-prev .ant-pagination-item-container .ant-pagination-item-link-icon,
    .ant-pagination-jump-next .ant-pagination-item-container .ant-pagination-item-link-icon {
      color: #666;
    }
    .ant-pagination-options {
      display: none;
    }
  }
`;

export default class PaginationWrap extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  itemRender(current, type, originalElement) {
    if (type === 'prev') {
      return <a className="page">{_l('上一页')}</a>;
    }
    if (type === 'next') {
      return <a className="page">{_l('下一页')}</a>;
    }
    return originalElement;
  }

  render() {
    const { total, pageSize, pageIndex, onChange = () => {} } = this.props;
    return (
      <Wrap>
        <Pagination
          total={total}
          pageSize={pageSize || 50}
          current={pageIndex || 1}
          itemRender={this.itemRender}
          onChange={onChange}
          {...this.props}
        />
      </Wrap>
    );
  }
}

PaginationWrap.propTypes = {
  count: PropTypes.number,
  pageSize: PropTypes.number,
  pageIndex: PropTypes.number,
  onChange: PropTypes.func,
};
