import React, { useState } from 'react';
import { Icon } from 'ming-ui';
import SelectOrgRole from 'mobile/components/SelectOrgRole';
import styled from 'styled-components';
import _ from 'lodash';

const OrgRoleCon = styled.div`
  position: relative;
  .addBtn {
    display: inline-block;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #f5f5f5;
    text-align: center;
    line-height: 26px;
    font-size: 16px;
    color: #9e9e9e;
  }
  .rightArrow {
    position: absolute;
    right: 0;
    line-height: 26px;
    font-size: 16px;
    color: #c7c7cc;
  }
`;
const OrgRoleItem = styled.span`
  display: inline-block;
  height: 28px;
  background: #f5f5f5;
  border-radius: 14px;
  margin: 0 8px 10px 0;
  padding-right: 12px;
  line-height: 28px;
  .userAvatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
  }
  .userName {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0 20px 0 8px;
    vertical-align: middle;
  }
`;

export default function OrgRole(props) {
  const { control, values = [], onChange = () => {}, projectId, appId, isMultiple } = props;
  const [showSelectOrgRole, setShowSelectOrgRole] = useState(false);

  const onSave = data => {
    onChange({ values: isMultiple ? _.uniqBy([...values, ...data], 'organizeId') : data });
  };
  const deleteCurrentRoles = item => {
    onChange({ values: values.filter(v => v.organizeId !== item.organizeId) });
  };
  
  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15 controlName">{control.controlName}</div>
      <OrgRoleCon>
        {values.map(item => (
          <OrgRoleItem>
            <span className="userName">{item.organizeName}</span>
            <Icon icon="close" onClick={() => deleteCurrentRoles(item)} />
          </OrgRoleItem>
        ))}
        {((!isMultiple && _.isEmpty(values)) || isMultiple) && (
          <span
            className="addBtn"
            onClick={() => {
              setShowSelectOrgRole(true);
            }}
          >
            <Icon icon="add" />
          </span>
        )}
        {!isMultiple && !_.isEmpty(values) && (
          <Icon
            onClick={() => {
              setShowSelectOrgRole(true);
            }}
            icon="arrow-right-border"
            className="rightArrow"
          />
        )}
      </OrgRoleCon>
      {showSelectOrgRole && (
        <SelectOrgRole
          projectId={projectId}
          visible={showSelectOrgRole}
          unique={!isMultiple}
          onSave={onSave}
          onClose={() => setShowSelectOrgRole(false)}
        />
      )}
    </div>
  );
}
