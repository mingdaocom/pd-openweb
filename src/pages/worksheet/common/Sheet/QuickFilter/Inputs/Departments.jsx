import React, { useState } from 'react';
import styled from 'styled-components';
import { arrayOf, func, string } from 'prop-types';
import DialogSelectGroups from 'src/components/dialogSelectDept';

const Con = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  line-height: 32px;
  border: 1px solid #dddddd;
  border-radius: 4px;
  border: 1px solid ${({ active }) => (active ? '#2196f3' : '#ddd')} !important;
  .clearIcon {
    display: none;
  }
  &:hover {
    .clearIcon {
      display: inline-block;
    }
  }
  ${({ isEmpty }) => (!isEmpty ? '&:hover { .downIcon { display: none;} }' : '')}
`;

const DepartmentsCon = styled.div`
  cursor: pointer;
  flex: 1;
  overflow: hidden;
  font-size: 13px;
  height: 32px;
  padding: 0 0 0 10px;
`;

const DepartmentsText = styled.div`
  font-size: 13px;
  color: #333;
`;

const Icon = styled.i`
  cursor: pointer;
  font-size: 13px;
  color: #9e9e9e;
  margin-right: 8px;
`;

const Empty = styled.span`
  color: #bdbdbd;
`;
export default function Departments(props) {
  const { values = [], projectId, isMultiple, onChange = () => {} } = props;
  const [active, setActive] = useState();
  return (
    <Con
      isEmpty={!values.length}
      active={active}
      onClick={() => {
        setActive(true);
        return new DialogSelectGroups({
          projectId,
          isIncludeRoot: false,
          showCurrentUserDept: true,
          onClose: () => setActive(false),
          selectFn: data => {
            if (!data.length) {
              return;
            }
            setActive(false);
            onChange({ values: isMultiple ? _.uniqBy([...values, ...data], 'departmentId') : data });
          },
        });
      }}
    >
      <DepartmentsCon>
        {!values.length && <Empty>{_l('请选择')}</Empty>}
        <DepartmentsText className="ellipsis" title={values.map(user => user.departmentName).join(', ')}>
          {values.map(user => user.departmentName).join(', ')}
        </DepartmentsText>
      </DepartmentsCon>
      <Icon className="icon icon-workflow downIcon" />
      {!!values.length && (
        <Icon
          className="icon icon-cancel clearIcon"
          onClick={e => {
            onChange({ values: [] });
            e.stopPropagation();
          }}
        />
      )}
    </Con>
  );
}

Departments.propTypes = {
  projectId: string,
  values: arrayOf(string),
  onChange: func,
};
