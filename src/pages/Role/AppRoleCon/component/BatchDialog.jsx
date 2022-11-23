import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import 'src/components/uploadAttachment/uploadAttachment';
import cx from 'classnames';
import { Select } from 'antd';
const { Option } = Select;
const Wrap = styled.div`
  .iconBG {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
  span.memberName {
    display: block;
  }
  .memberTag {
    background: #f4f4f4;
    border-radius: 10px;
    color: #757575;
    display: inline-block;
    line-height: 18px;
    padding: 0 6px;
  }
  .ownerTag {
    color: #fff;
    background: #2196f3;
    border-radius: 10px;
    display: inline-block;
    line-height: 18px;
    padding: 0 6px;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    height: 36px;
    border-radius: 3px;
    border: 1px solid #dddddd;
  }
  .ant-select-focused:not(.ant-select-disabled) {
    .ant-select-selector {
      box-shadow: none !important;
    }
  }
  .ant-select-multiple .ant-select-selection-item {
    background: #e5e5e5 !important;
    border-radius: 11px !important;
  }
`;

export default function BatchDialog(props) {
  const { show, roleInfos, okText, onOk, isMulti, onCancel } = props;
  const [roles, setRoles] = useState([]);
  return (
    <Dialog
      className="BatchDialog"
      width="580"
      visible={show}
      title={<span className="Font17 Bold">{props.title}</span>}
      okText={okText}
      onCancel={onCancel}
      onOk={() => {
        onOk(roles);
      }}
    >
      <Wrap>
        {props.txt && <p>{props.txt}</p>}
        {props.renderCon && props.renderCon()}
        <h3 className="Bold mTop20">{_l('选择角色')}</h3>
        <Select
          mode={isMulti ? '' : 'multiple'}
          size={'middle'}
          placeholder={_l('选择角色')}
          onChange={value => {
            setRoles(isMulti ? [value] : value);
          }}
          style={{
            width: '100%',
          }}
          notFoundContent={_l('无相关角色')}
        >
          {roleInfos.map((o, i) => {
            return (
              <Option key={o.roleId} value={o.roleId}>
                {o.name}
              </Option>
            );
          })}
        </Select>
      </Wrap>
    </Dialog>
  );
}
