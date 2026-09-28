import React, { useEffect, useRef } from 'react';
import _ from 'lodash';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { Select } from 'ming-ui/antd-components';
import { RoleSelectPopover } from 'ming-ui/functions/quickSelectRole';

export default function Departments(props) {
  const { values = [], projectId, isMultiple, onChange = () => {} } = props;
  const valueRef = useRef();
  const options = values.map(value => ({ label: value.organizeName, value: value.organizeId }));
  const selectedValue = isMultiple ? values.map(value => value.organizeId) : values[0]?.organizeId;

  useEffect(() => {
    valueRef.current = values;
  }, [values]);

  return (
    <RoleSelectPopover
      projectId={projectId}
      showCurrentOrgRole
      showCompanyName
      unique={!isMultiple}
      value={values}
      onOpenChange={visible => {
        if (
          visible &&
          md.global.Account.isPortal &&
          !_.find(md.global.Account.projects, item => item.projectId === projectId)
        ) {
          alert(_l('您不是该组织成员，无法获取其成员列表，请联系组织管理员'), 3);
          return false;
        }
      }}
      onSave={(data, isCancel = false) => {
        if (!data.length) {
          return;
        }

        onChange({
          values: isMultiple
            ? isCancel
              ? valueRef.current.filter(l => l.organizeId !== data[0].organizeId)
              : _.uniqBy([...valueRef.current, ...data], 'organizeId')
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
        onDeselect={organizeId => onChange({ values: values.filter(value => value.organizeId !== organizeId) })}
      />
    </RoleSelectPopover>
  );
}

Departments.propTypes = {
  isMultiple: bool,
  projectId: string,
  values: arrayOf(
    shape({
      organizeId: string,
      organizeName: string,
    }),
  ),
  onChange: func,
};
