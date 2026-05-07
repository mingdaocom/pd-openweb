import React, { memo, useCallback } from 'react';
import { Pagination } from 'antd';
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
      border: 1px solid transparent;

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
      border: 1px solid transparent;
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

const PaginationWrap = props => {
  const { className, total, pageSize = 50, pageIndex = 1, onChange = () => {}, ...rest } = props;

  const itemRender = useCallback((current, type, originalElement) => {
    if (type === 'prev') {
      return <a className="page">{_l('上一页')}</a>;
    }
    if (type === 'next') {
      return <a className="page">{_l('下一页')}</a>;
    }
    return originalElement;
  }, []);

  return (
    <Wrap className={className}>
      <Pagination
        total={total}
        pageSize={pageSize}
        current={pageIndex}
        hideOnSinglePage
        itemRender={itemRender}
        onChange={onChange}
        {...rest}
      />
    </Wrap>
  );
};

export default memo(PaginationWrap);
