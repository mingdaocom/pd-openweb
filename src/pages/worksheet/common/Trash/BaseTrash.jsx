import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Input, Modal, Tooltip } from 'ming-ui/antd-components';

const Content = styled.div`
  height: 100%;
`;

const TrashHeader = styled.div`
  width: 100%;
  padding-right: 25px;
  .headerTop {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .title {
    flex: 1;
    min-width: 0;
  }
  .search {
    flex: none;
  }
  .desc {
    margin-top: 6px;
    line-height: 20px;
    white-space: normal;
  }
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid var(--color-border-primary);
  padding: 0 12px;
  .operateIcon {
    opacity: 0;
  }
  &:hover {
    background: var(--color-background-secondary);
    .operateIcon {
      opacity: 1;
    }
  }
`;

const TableHeader = styled(TableRow)`
  padding: 0 142px 0 12px;
  height: 40px;
  &:hover {
    background: inherit;
  }
`;

const TableBody = styled(ScrollView)`
  height: calc(100% - 60px) !important;
  overflow-y: auto;
`;
const TableBodyPadding = styled.div`
  height: 100%;
`;

const Cell = styled.div`
  display: flex;
  align-items: center;
`;

const EmptyCon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100% !important;
  .emptyIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 130px;
    height: 130px;
    border-radius: 130px;
    background: var(--color-background-secondary);
    .icon {
      color: var(--color-text-disabled);
      font-size: 66px;
    }
  }
`;

export default function AppTrash(props) {
  const {
    loading,
    title,
    desc,
    searchPlaceholder,
    columns = [],
    data = [],
    keyword = '',
    onRestore = () => {},
    onDelete = () => {},
    onCancel = () => {},
    onKeyWordChange = () => {},
    onScrollEnd = () => {},
  } = props;
  const [searchValue, setSearchValue] = useState(keyword);
  const debounceOnKeyWordChange = useMemo(() => _.debounce(onKeyWordChange, 300), [onKeyWordChange]);

  useEffect(() => () => debounceOnKeyWordChange.cancel(), [debounceOnKeyWordChange]);

  return (
    <Modal
      open
      width={976}
      type="fixed"
      title={
        <TrashHeader>
          <div className="headerTop">
            <div className="title Font17 textPrimary ellipsis">{title}</div>
            <Input
              allowClear
              radius
              variant="filled"
              className="search"
              placeholder={searchPlaceholder}
              prefix={<Icon icon="search" className="textSecondary Font16" />}
              value={searchValue}
              style={{ width: 184, height: 30 }}
              onChange={event => {
                const value = event.target.value;

                setSearchValue(value);
                if (!value) {
                  debounceOnKeyWordChange.cancel();
                  onKeyWordChange(value);
                } else {
                  debounceOnKeyWordChange(value);
                }
              }}
            />
          </div>
          {desc && <div className="desc Font13 textTertiary">{desc}</div>}
        </TrashHeader>
      }
      styles={{ body: { padding: 0, position: 'relative' } }}
      onCancel={onCancel}
    >
      {loading && !data.length && <LoadDiv className="mTop80" />}
      {!loading && !data.length && (
        <EmptyCon>
          <div className="emptyIcon">
            <i className="icon icon-recycle"></i>
          </div>
          <div className="Font17 textTertiary mTop16">
            {keyword ? _l('没有找到符合条件的结果') : _l('回收站暂无内容')}
          </div>
        </EmptyCon>
      )}
      {!!data.length && (
        <Content>
          {!!data.length && (
            <TableHeader>
              {columns.map((c, i) => (
                <Cell
                  key={i}
                  className={cx('Font14 textSecondary', { flex: c.flex })}
                  style={{
                    width: c.width,
                  }}
                >
                  {c.name}
                </Cell>
              ))}
            </TableHeader>
          )}
          <TableBody onScrollEnd={onScrollEnd}>
            <TableBodyPadding>
              {!!data.length &&
                data.map((cells, rowKey) => (
                  <TableRow key={rowKey}>
                    {columns.map((c, cellIndex) => (
                      <Cell
                        key={cellIndex}
                        className={c.flex ? 'flex' : ''}
                        style={{
                          width: c.width,
                        }}
                      >
                        {cells[cellIndex]}
                      </Cell>
                    ))}
                    <Tooltip title={_l('恢复')} placement="bottom">
                      <span className="mLeft40 mRight25">
                        <i
                          className="operateIcon icon icon-restart Font14 textTertiary Hand"
                          onClick={() => onRestore(rowKey)}
                        ></i>
                      </span>
                    </Tooltip>
                    <Tooltip title={_l('彻底删除')} placement="bottom">
                      <span className="mRight35">
                        <i
                          className="operateIcon icon icon-trash Font16 textTertiary Hand"
                          onClick={() => onDelete(rowKey)}
                        ></i>
                      </span>
                    </Tooltip>
                  </TableRow>
                ))}
              {loading && !!data.length && <LoadDiv className="mTop20" />}
            </TableBodyPadding>
          </TableBody>
        </Content>
      )}
    </Modal>
  );
}

AppTrash.propTypes = {
  loading: bool,
  keyword: string,
  title: string,
  searchPlaceholder: string,
  desc: string,
  columns: arrayOf(shape({})),
  data: arrayOf(arrayOf(shape({}))),
  onRestore: func,
  onDelete: func,
  onCancel: func,
  onKeyWordChange: func,
  onScrollEnd: func,
};
