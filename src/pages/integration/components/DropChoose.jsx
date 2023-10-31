import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';

const WrapChoose = styled.div`
  width: 260px;
  max-height: 300px;
  background: #ffffff;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.24);
  border-radius: 3px;
  .search {
    border-bottom: 1px solid #eaeaea;
    min-height: 35px;
    max-height: 35px;
    line-height: 35px;
    overflow: hidden;
    padding: 0 15px;
    input {
      border: none;
    }
  }
  ul {
    overflow: auto;
  }
  li {
    height: 36px;
    line-height: 36px;
    padding: 0 15px;
    &:hover {
      background: #f5f5f5;
    }
  }
  .disabled {
    cursor: not-allowed;
    color: #9e9e9e;
  }
`;
export default function DropChoose(props) {
  const [{ keywords, list, visible }, setState] = useSetState({
    keywords: '',
    visible: false,
    list: [],
  });
  useEffect(() => {
    setState({
      list: props.list || [],
    });
  }, [props]);
  useEffect(() => {
    setState({
      list: !!keywords
        ? props.list.filter(o => o.alias.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0)
        : props.list,
    });
  }, [keywords]);
  return (
    <Trigger
      popupVisible={visible}
      action={['click']}
      popup={() => {
        return (
          <WrapChoose className="WrapChoose flexColumn">
            <div className="search flexRow alignItemsCenter">
              <i className="icon icon-search1 Gray_9d Hand Font16 mRight5"></i>
              <input
                type="text"
                className="flex"
                placeholder={_l('搜索')}
                value={keywords}
                onChange={e => {
                  setState({
                    keywords: e.target.value,
                  });
                }}
              />
            </div>
            <ul className="flex">
              {list.length <= 0 ? (
                <div className="TxtCenter pTop45 pBottom50 Gray_9e">{_l('暂无相关内容')}</div>
              ) : (
                list.map(o => {
                  return (
                    <li
                      onClick={() => {
                        if (o.disabled) {
                          return;
                        }
                        props.onChange(o);
                        setState({ visible: false, keywords: '' });
                      }}
                      className={`flexRow alignItemsCenter ${o.disabled ? 'disabled' : 'Hand'} flexRow`}
                    >
                      {!!o.mdType ? (
                        <Icon
                          icon={getIconByType(o.mdType, false)}
                          className={cx('Font16 Gray_bd customIcon TxtMiddle')}
                        />
                      ) : (
                        !!o.dataType && <span className="Gray_bd">{`[${o.dataType}]`}</span>
                      )}
                      <span className={cx('Gray flex WordBreak overflow_ellipsis mLeft5', { Gray_bd: o.disabled })}>
                        {o.alias || o.name}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </WrapChoose>
        );
      }}
      getPopupContainer={() => document.body}
      onPopupVisibleChange={visible => {
        setState({ visible, keywords: '' });
      }}
      popupAlign={{
        points: ['cl', 'cr'],
        overflow: { adjustX: true, adjustY: true },
      }}
    >
      <i className="icon icon-task_add-02 mTop12 Hand Font24 TxtBottom InlineBlock" style={{ color: '#DFDFDF' }}></i>
    </Trigger>
  );
}
