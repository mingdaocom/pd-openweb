import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { Select } from 'ming-ui/antd-components';
import { DeptSelectPopover } from 'ming-ui/functions/quickSelectDept';

export default function Departments(props) {
  const { values = [], projectId, isMultiple, onChange = () => {} } = props;
  const valueRef = useRef();
  const options = values.map(value => ({ label: value.departmentName, value: value.departmentId }));
  const selectedValue = isMultiple ? values.map(value => value.departmentId) : values[0]?.departmentId;

  useEffect(() => {
    valueRef.current = values;
  }, [values]);

  return (
    <DeptSelectPopover
      unique={!isMultiple}
      projectId={projectId}
      isIncludeRoot={false}
      showCurrentUserDept
      selectedDepartment={values}
      onOpenChange={visible => {
        if (visible && !_.find(md.global.Account.projects, item => item.projectId === projectId)) {
          alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
          return false;
        }
      }}
      selectFn={(data, isCancel = false) => {
        if (!data.length) {
          return;
        }

        onChange({
          values: isMultiple
            ? isCancel
              ? valueRef.current.filter(l => l.departmentId !== data[0].departmentId)
              : _.uniqBy([...valueRef.current, ...data], 'departmentId')
            : data,
        });
      }}
    >
      <Select
        className="w100"
        mode={isMultiple ? 'multiple' : undefined}
        open={false}
        showSearch={false}
        allowClear
        options={options}
        value={selectedValue}
        onClear={() => onChange({ values: [] })}
        onDeselect={departmentId => onChange({ values: values.filter(value => value.departmentId !== departmentId) })}
      />
    </DeptSelectPopover>
  );
}

Departments.propTypes = {
  isMultiple: bool,
  projectId: string,
  values: arrayOf(
    shape({
      departmentId: string,
      departmentName: string,
    }),
  ),
  onChange: func,
};
