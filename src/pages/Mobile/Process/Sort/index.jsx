import React, { useEffect, useState } from 'react';
import { Popup } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { SORT_LIST } from 'src/pages/workflow/MyProcess/config';

const Wrap = styled.div`
  background-color: var(--color-background-card);
  .header {
    padding: 10px 15px;
    justify-content: flex-end;
  }
  .body {
    padding: 0 15px;
    overflow: auto;
  }
  .close {
    font-weight: bold;
    padding: 5px;
    border-radius: 50%;
    background-color: var(--color-border-secondary);
  }
  .footer {
    border-top: 1px solid var(--color-border-secondary);
    z-index: 0;
    background-color: var(--color-background-primary);
    .flex {
      padding: 10px;
    }
    .reset {
      background-color: var(--color-background-card);
    }
    .query {
      color: var(--color-white);
      background-color: var(--color-primary);
    }
  }
`;

const width = document.documentElement.clientWidth - 60;

export default props => {
  const { visible, onClose } = props;
  const { sort, onSort } = props;
  const isAsc = _.get(sort, 'isAsc');
  const [isAscValue, setIsAscValue] = useState(isAsc);

  useEffect(() => {
    if (_.isUndefined(sort.isAsc)) {
      setIsAscValue(undefined);
    }
  }, [sort]);

  return (
    <Popup
      bodyStyle={{
        borderRadius: '14px 0 0 14px',
        overflow: 'hidden',
      }}
      position="right"
      visible={visible}
      onMaskClick={onClose}
      onClose={onClose}
    >
      <Wrap className="flexColumn h100" style={{ width }}>
        <div className="header flexRow valignWrapper">
          <div className="flex">{_l('排序')}</div>
          <Icon className="textTertiary close" icon="close" onClick={onClose} />
        </div>
        <div className="body flex">
          {SORT_LIST.map(item => (
            <div className="flexRow valignWrapper pTop10 pBottom10" onClick={() => setIsAscValue(item.value)}>
              <div className="flex">{item.name}</div>
              {isAscValue === item.value && <Icon icon="done" className="Font18 colorPrimary" />}
            </div>
          ))}
        </div>
        <div className="footer flexRow valignWrapper">
          <div
            className="flex Font16 centerAlign reset"
            onClick={() => {
              onClose();
              setIsAscValue(_.get(sort, 'isAsc'));
            }}
          >
            {_l('取消')}
          </div>
          <div
            className="flex Font16 centerAlign query"
            onClick={() => {
              onClose();
              onSort({ isAsc: isAscValue });
            }}
          >
            {_l('确认')}
          </div>
        </div>
      </Wrap>
    </Popup>
  );
};
