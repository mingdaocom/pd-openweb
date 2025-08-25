import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { getTranslateInfo } from 'src/utils/app';

const Wrap = styled.div`
  position: relative;
  .searchWorksheet {
    width: 180px;
    height: 36px;
    box-shadow: 0px 2px 6px 1px rgba(0, 0, 0, 0.16);
    border-radius: 22px;
    border: none;
  }
  .optionList {
    position: absolute;
    top: 40px;
    left: 0;
    width: 180px;
    padding: 6px 0;
    font-size: 13px;
    background: #fff;
    max-height: 189px;
    overflow-y: scroll;
    box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.16);
    border-radius: 3px;
    li {
      height: 36px;
      line-height: 36px;
      padding: 0 17px;
      &:hover,
      &.current {
        background: #1677ff;
        color: #fff !important;
      }
    }
  }
  .emptyWrap {
    height: 36px;
    text-align: center;
    line-height: 36px;
  }
`;

function Search(props) {
  const { list, appId, openList, className = '', onClick, setOpenList } = props;

  const [options, setOptions] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setOptions(
      list.map(l => {
        return {
          value: l.worksheetId,
          label: getTranslateInfo(appId, null, l.worksheetId).name || l.worksheetName,
        };
      }),
    );
  }, [list]);

  const clickWorksheet = id => {
    onClick(id);
    setOpenList(false);
  };

  return (
    <Wrap className={className}>
      <Input
        className="searchWorksheet Font14"
        size="large"
        prefix={<Icon icon="search" className="Gray_9e Font18" />}
        value={searchValue}
        placeholder={_l('搜索工作表')}
        onChange={e => setSearchValue(e.target.value.trim())}
        onFocus={() => !openList && setOpenList(true)}
      />
      <ul className={cx('optionList', { hide: !openList })}>
        {options
          .filter(l => l.label.toLowerCase().includes(searchValue.toLowerCase()))
          .map(l => {
            return (
              <li
                className="overflow_ellipsis Gray Hand"
                key={`erSearchItem-${l.value}`}
                onClick={() => clickWorksheet(l.value)}
              >
                {l.label}
              </li>
            );
          })}
        {options.filter(l => l.label.toLowerCase().includes(searchValue.toLowerCase())).length === 0 && (
          <div className="emptyWrap Font13 Gray_bd">{_l('无匹配结果')}</div>
        )}
      </ul>
    </Wrap>
  );
}

export default withClickAway(Search);
