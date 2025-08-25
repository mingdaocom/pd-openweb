import React, { useCallback } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { LoadDiv, Modal, ScrollView } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';

const Header = styled.div`
  height: 52px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.09) !important;
`;

const Content = styled.div`
  height: calc(100% - 53px);
`;

const TableRow = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid #ddd;
  padding: 0 12px;
  .operateIcon {
    opacity: 0;
  }
  &:hover {
    background: #f5f5f5;
    .operateIcon {
      opacity: 1;
    }
  }
`;

const TableHeaderCon = styled.div`
  padding: 0 20px;
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
  padding: 0 20px;
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
  height: calc(100% - 60px) !important;
  .emptyIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 130px;
    height: 130px;
    border-radius: 130px;
    background: #f5f5f5;
    .icon {
      color: #bdbdbd;
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
  const debounceOnKeyWordChange = useCallback(_.debounce(onKeyWordChange, 300), []);
  return (
    <Modal
      visible
      width={976}
      type="fixed"
      bodyStyle={{ padding: 0, position: 'relative' }}
      closeStyle={{ width: '52px', height: '52px', lineHeight: '52px' }}
      onCancel={onCancel}
    >
      <Header>
        <div className="title Font17 Gray">{title}</div>
        <div className="desc flex Font13 Gray_9e mTop4">{desc}</div>
        <div className="search mRight20">
          <SearchInput
            clickShowInput
            placeholder={searchPlaceholder}
            value={keyword}
            onChange={v => {
              if (!v) {
                onKeyWordChange(v);
              } else {
                debounceOnKeyWordChange(v);
              }
            }}
          />
        </div>
      </Header>
      {loading && !data.length && <LoadDiv className="mTop80" />}
      {!loading && !data.length && (
        <EmptyCon>
          <div className="emptyIcon">
            <i className="icon icon-recycle"></i>
          </div>
          <div className="Font17 Gray_9e mTop16">{keyword ? _l('没有找到符合条件的结果') : _l('回收站暂无内容')}</div>
        </EmptyCon>
      )}
      {!!data.length && (
        <Content>
          {!!data.length && (
            <TableHeaderCon>
              <TableHeader>
                {columns.map((c, i) => (
                  <Cell
                    key={i}
                    className={cx('Font14 Gray_75', { flex: c.flex })}
                    style={{
                      width: c.width,
                    }}
                  >
                    {c.name}
                  </Cell>
                ))}
              </TableHeader>
            </TableHeaderCon>
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
                    <span data-tip={_l('恢复')} className="tip-bottom mLeft40 mRight25">
                      <i
                        className="operateIcon icon icon-restart Font14 Gray_9e Hand"
                        onClick={() => onRestore(rowKey)}
                      ></i>
                    </span>
                    <span data-tip={_l('彻底删除')} className="tip-bottom mRight35">
                      <i
                        className="operateIcon icon icon-trash Font16 Gray_9e Hand"
                        onClick={() => onDelete(rowKey)}
                      ></i>
                    </span>
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
