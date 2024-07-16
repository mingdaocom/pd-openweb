import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import _ from 'lodash';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon } from 'ming-ui';

const OPTIONS = [
  {
    label: _l('直接更新'),
    value: 1,
  },
  {
    label: _l('执行按钮'),
    value: 3,
  },
  {
    label: _l('触发工作流'),
    value: 2,
  },
  {
    label: _l('审批时填写'),
    value: 7,
  },
  {
    label: _l('其他'),
    value: 8,
  },
];

const OperateWrap = styled.div``;

const OptionWrap = styled.div`
  width: 220px;
  padding: 16px 0;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 3px 6px 1px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  .optionItem {
    padding: 0 20px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    &:hover {
      background: #f5f5f5;
    }
  }
`;

function OperatePicker(props) {
  const { value = 0, onChange } = props;
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(OPTIONS.find(l => l.value === value));

  const onSelect = l => {
    setSelected(l);
    setVisible(false);
    onChange(l ? l.value : 0);
  };

  const onClear = e => {
    e.stopPropagation();
    onSelect(undefined);
  };

  return (
    <Trigger
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setVisible(visible);
      }}
      action={['click']}
      popupAlign={{ points: ['tl', 'bl'], offset: [0, 5] }}
      popup={
        <OptionWrap>
          {OPTIONS.map(l => {
            return (
              <div className="optionItem" onClick={() => onSelect(l)}>
                {/* <Checkbox text={l.label} checked={l.value === value} /> */}
                {l.label}
              </div>
            );
          })}
        </OptionWrap>
      }
    >
      <OperateWrap className={cx('selectOperate', { selectLight: !!selected })}>
        <Icon icon="ads_click" />
        <span className="selectConText">{selected ? selected.label : _l('操作')}</span>
        <Icon icon="arrow-down" style={selected ? {} : { display: 'inline-block' }} />
        {selected && <Icon icon="cancel1" onClick={onClear} />}
      </OperateWrap>
    </Trigger>
  );
}

export default OperatePicker;
