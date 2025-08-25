import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import SelectUser from 'mobile/components/SelectUser';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';

const DepartmentsCon = styled.div`
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
const DepartmentsItem = styled.span`
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

export default function Departments(props) {
  const { control, values = [], onChange = () => {}, projectId, appId, isMultiple } = props;

  const [showSelectDepartment, setShowSelectDepartment] = useState(false);

  const onSave = data => {
    onChange({ values: isMultiple ? _.uniqBy([...values, ...data], 'departmentId') : data });
  };

  const deleteCurrentDepartment = item => {
    onChange({ values: values.filter(v => v.departmentId !== item.departmentId) });
  };

  return (
    <div className="controlWrapper">
      <div className="Font14 bold mBottom15 controlName">{control.controlName}</div>
      <DepartmentsCon>
        {values.map(item => (
          <DepartmentsItem>
            <span className="userName">{item.departmentName}</span>
            <Icon icon="close" onClick={() => deleteCurrentDepartment(item)} />
          </DepartmentsItem>
        ))}
        {((!isMultiple && _.isEmpty(values)) || isMultiple) && (
          <span
            className="addBtn"
            onClick={() => {
              setShowSelectDepartment(true);
            }}
          >
            <Icon icon="add" />
          </span>
        )}
        {!isMultiple && !_.isEmpty(values) && (
          <Icon
            onClick={() => {
              setShowSelectDepartment(true);
            }}
            icon="arrow-right-border"
            className="rightArrow"
          />
        )}
      </DepartmentsCon>

      {showSelectDepartment && (
        <SelectUser
          projectId={projectId || 'f67ec501-a8f8-4c8f-ab49-556d96ce26aa'}
          visible={true}
          type="department"
          onlyOne={!isMultiple}
          onClose={() => setShowSelectDepartment(false)}
          onSave={onSave}
          appId={appId}
          userType={getTabTypeBySelectUser(control)}
        />
      )}
    </div>
  );
}
