import React, { useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon, Input } from 'ming-ui';
import { ANDROID_APPS } from '../../common';

const Wrap = styled.div`
  width: 160px;
  height: 200px;
  background: #ffffff;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  .searchBox {
    width: 100%;
    border-bottom: 1px solid #eaeaea;
    input {
      width: 100%;
      height: 40px;
      border: none !important;
      &::-webkit-input-placeholder,
      &::-moz-placeholder,
      &:-ms-input-placeholder {
        color: #9e9e9e;
      }
    }
  }
  .item {
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    &:hover {
      background: #f5f5f5;
    }
  }
`;

function AddPushSetting(props) {
  const { selectList = [], className = '', onAdd } = props;
  const [visible, setVisible] = useState(false);
  const [keywords, setKeywords] = useState(undefined);

  const onClick = item => {
    if (selectList.includes(item.key)) return;

    setVisible(false);
    onAdd(item.key);
  };

  return (
    <Trigger
      popupVisible={visible}
      onPopupVisibleChange={value => setVisible(value)}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 10],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={() => (
        <Wrap>
          <div className="searchBox valignWrapper">
            <Icon icon="search1" className="Font18 mLeft17 Gray_9e" />
            <Input placeholder={_l('搜索品牌')} value={keywords} onChange={value => setKeywords(value)} />
          </div>
          {ANDROID_APPS.filter(l => l.name.toLowerCase().includes((keywords || '').toLowerCase())).map(l => {
            const selected = selectList.includes(l.key);

            return (
              <div className="item" key={`addPushSettingItem-${l.key}`} onClick={() => onClick(l)}>
                <span className={cx('flex overflow_ellipsis', selected ? 'Gray_9e' : 'Gray')}>{l.name}</span>
                {selected && <Icon icon="done" className="ThemeColor" />}
              </div>
            );
          })}
        </Wrap>
      )}
    >
      <span className="Font13 ThemeColor Hand" style={{ width: 'fit-content' }}>
        {_l('+ 添加品牌')}
      </span>
    </Trigger>
  );
}

export default AddPushSetting;
