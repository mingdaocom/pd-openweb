import React, { Component } from 'react';
import { Pagination } from 'antd';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Wrap = styled.div`
  display: flex;
  justify-content: center;
  min-height: 0;
  .ant-pagination {
    padding: 12px;
    .ant-pagination-options {
      display: none;
    }
    .ant-pagination-item {
      height: unset;
      line-height: unset;
      margin-right: 10px;
      min-width: 0;
      border: 1px solid #fff;
      a {
        color: #151515;
        display: inline-block;
        padding: 3px 8px;
        text-align: center;
        vertical-align: middle;
        border: 1px solid #fff;
        font-size: 13px;
        border-radius: 5px;
      }
      a:hover {
        background-color: #f5f5f5;
        border: 1px solid #f5f5f5;
        color: #151515;
      }
    }
    .ant-pagination-item-active {
      border: 1px solid #fff;
      color: #151515;
      a {
        text-decoration: none;
        color: #1294f7;
        font-weight: 600;
        border: 1px solid #1294f7 !important;
        &:hover {
          background-color: #fff;
        }
      }
    }
    .ant-pagination-prev,
    .ant-pagination-next {
      a {
        color: #151515;
        &:hover {
          color: #1294f7;
        }
      }
      a[disabled] {
        color: rgba(0, 0, 0, 0.25);
        cursor: not-allowed;
      }
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
    const { className, total, pageSize, pageIndex, onChange = () => {} } = this.props;
    return (
      <Wrap className={className}>
        <Pagination
          total={total}
          pageSize={pageSize || 50}
          current={pageIndex || 1}
          hideOnSinglePage={true}
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
