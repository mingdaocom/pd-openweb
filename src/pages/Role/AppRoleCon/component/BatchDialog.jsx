import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Select } from 'antd';
import styled from 'styled-components';
import { Dialog, LoadDiv } from 'ming-ui';
import AjaxApi from 'src/api/appManagement.js';

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
    background: #1677ff;
    border-radius: 10px;
    display: inline-block;
    line-height: 18px;
    padding: 0 6px;
  }
  .ant-select:not(.ant-select-customize-input) .ant-select-selector {
    min-height: 36px;
    height: auto;
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
  const { show, roleInfos, okText, onOk, isMulti, onCancel, member, appId, showRole } = props;
  const [{ roles, defaultRoles, loading }, setState] = useSetState({
    roles: [],
    defaultRoles: [],
    loading: showRole,
  });
  useEffect(() => {
    showRole && getRole();
  }, []);
  const getRole = () => {
    AjaxApi.getRolesByMemberId({
      memberId: member.accountId || member.id,
      appId,
      memberType: member.memberType,
    }).then(res => {
      const { roles = [] } = res;
      setState({
        loading: false,
        defaultRoles:
          roles.length <= 0 ? [] : roles.map(o => o.id).filter(o => !!roleInfos.find(it => it.roleId === o)),
      });
    });
  };
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
        {loading ? (
          <LoadDiv />
        ) : (
          <Select
            mode={isMulti ? '' : 'multiple'}
            size={'middle'}
            placeholder={_l('选择角色')}
            onChange={value => {
              setState({
                roles: isMulti ? [value] : value,
              });
            }}
            style={{
              width: '100%',
            }}
            defaultValue={defaultRoles}
            notFoundContent={_l('无相关角色')}
            filterOption={(input, option) => option.label.includes(input)}
            options={roleInfos.map(o => {
              return { label: o.name, value: o.roleId };
            })}
          ></Select>
        )}
      </Wrap>
    </Dialog>
  );
}
