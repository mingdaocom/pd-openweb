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
      border: 1px solid var(--color-white);
      a {
        color: var(--color-text-title);
        display: inline-block;
        padding: 3px 8px;
        text-align: center;
        vertical-align: middle;
        border: 1px solid transparent;
        font-size: 13px;
        border-radius: 5px;
      }
      a:hover {
        background-color: var(--color-background-hover);
        border: 1px solid var(--color-background-secondary);
        color: var(--color-text-title);
      }
    }
    .ant-pagination-item-active {
      border: 1px solid var(--color-white);
      color: var(--color-text-title);
      a {
        text-decoration: none;
        color: var(--color-link);
        font-weight: 600;
        border: 1px solid var(--color-link) !important;
        &:hover {
          background-color: var(--color-background-primary);
        }
      }
    }
    .ant-pagination-prev,
    .ant-pagination-next {
      a {
        color: var(--color-text-title);
        &:hover {
          color: var(--color-link);
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
