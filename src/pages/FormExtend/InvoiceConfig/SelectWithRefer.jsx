import React, { useState } from 'react';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Dropdown, Icon, Menu, MenuItem } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  .inputCon {
    height: 36px;
    border-radius: 3px 0px 0px 3px;
    border: 1px solid #dddddd;
    &:hover {
      border-color: #1677ff;
    }

    .Dropdown--input {
      border: none !important;
    }
    .tagWrap {
      justify-content: space-between;
      height: 100%;
      padding: 0 10px;
      .tag {
        height: 24px;
        line-height: 22px;
        border-radius: 24px;
        background: #d8eeff;
        color: #174c76;
        border: 1px solid #bbd6ea;
        padding: 0px 12px;
        font-size: 12px;
        box-sizing: border-box;
      }
    }
  }
  .referBtn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 0px 3px 3px 0px;
    border: 1px solid #e0e0e0;
    border-left: none;
    cursor: pointer;
    color: #9e9e9e;
    &:hover {
      color: #1677ff;
    }
  }
`;

export default function SelectWithRefer(props) {
  const { data = {}, onChange, optionList = [], controlList = [] } = props;
  const [visible, setVisible] = useState(false);

  return (
    <Wrapper>
      <div className="inputCon flex">
        {data.isControl && !!data.value ? (
          <div className="valignWrapper tagWrap">
            <span className="tag">{data.controlName}</span>
            <Icon icon="delete" className="Hover_21 Hand Font16 Gray_75" onClick={() => onChange({ value: null })} />
          </div>
        ) : (
          <Dropdown
            isAppendToBody
            border
            cancelAble
            className="w100"
            data={optionList}
            value={data.value}
            onChange={value => onChange({ value })}
          />
        )}
      </div>

      <Trigger
        action={['click']}
        popupVisible={visible}
        onPopupVisibleChange={visible => setVisible(visible)}
        popupAlign={{ points: ['tr', 'br'], offset: [0, 5], overflow: { adjustX: true, adjustY: true } }}
        popup={
          <Menu style={{ position: 'unset' }}>
            {controlList.map(control => (
              <MenuItem
                key={control.controlId}
                onClick={() => {
                  onChange({ isControl: true, controlName: control.controlName, value: control.controlId });
                  setVisible(false);
                }}
              >
                <Icon icon={getIconByType(control.type)} className="Font16" />
                <span className="overflow_ellipsis flex mLeft12">{control.controlName}</span>
              </MenuItem>
            ))}
          </Menu>
        }
      >
        <div className="referBtn">
          <Icon icon="workflow_other" className="Font20" />
        </div>
      </Trigger>
    </Wrapper>
  );
}
