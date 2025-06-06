import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { arrayOf, func, string } from 'prop-types';
import { quickSelectDept } from 'ming-ui/functions';
import { BaseSelectedItem } from './Styles';
import _ from 'lodash';

const Con = styled.div`
  display: flex;
  align-items: center;
  min-height: 32px;
  line-height: 32px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  border: 1px solid ${({ active }) => (active ? '#2196f3' : 'var(--border-color)')} !important;
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
  min-height: 32px;
  padding: 0 0 0 10px;
`;

const DepartmentsText = styled.div`
  font-size: 13px;
  color: #151515;
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
  const valueRef = useRef();

  useEffect(() => {
    valueRef.current = values;
  }, [values]);

  return (
    <Con
      isEmpty={!values.length}
      active={active}
      onClick={e => {
        setActive(true);
        quickSelectDept(e.target, {
          unique: !isMultiple,
          projectId,
          isIncludeRoot: false,
          showCurrentUserDept: true,
          selectedDepartment: values,
          onClose: () => setActive(false),
          selectFn: (data, isCancel = false) => {
            if (!data.length) {
              return;
            }
            setActive(false);
            onChange({
              values: isMultiple
                ? isCancel
                  ? valueRef.current.filter(l => l.departmentId !== data[0].departmentId)
                  : _.uniqBy([...valueRef.current, ...data], 'departmentId')
                : data,
            });
          },
        });
      }}
    >
      <DepartmentsCon>
        {!values.length && <Empty>{_l('请选择')}</Empty>}
        {!isMultiple && !!values.length && (
          <DepartmentsText className="departmentsText ellipsis" title={values[0].departmentName}>
            {values[0].departmentName}
          </DepartmentsText>
        )}
        {isMultiple &&
          values.map((v, i) => (
            <BaseSelectedItem key={i}>
              <span className="name ellipsis">{v.departmentName}</span>
              <i
                className="icon icon-delete Gray_9e Font10 Hand"
                onClick={e => {
                  e.stopPropagation();
                  onChange({ values: values.filter(d => d.departmentId !== v.departmentId) });
                }}
              />
            </BaseSelectedItem>
          ))}
      </DepartmentsCon>
      <Icon className="icon icon-arrow-down-border downIcon" />
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
