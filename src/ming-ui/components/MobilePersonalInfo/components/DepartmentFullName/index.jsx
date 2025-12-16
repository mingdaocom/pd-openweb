import React, { memo, useEffect, useState } from 'react';
import departmentController from 'src/api/department';

const DepartmentFullName = props => {
  const { projectId, departmentInfos = [] } = props;
  const [fullDepartmentInfo, setFullDepartmentInfo] = useState([]);

  const getDepartmentFullName = () => {
    let departmentIds = departmentInfos.map(item => item.departmentId);

    departmentController.getDepartmentFullNameByIds({ projectId, departmentIds }).then(res => {
      if (res?.length) {
        setFullDepartmentInfo(res);
      }
    });
  };

  useEffect(() => {
    if (departmentInfos.length && !fullDepartmentInfo.length) {
      getDepartmentFullName();
    }
  }, [departmentInfos]);

  if (!fullDepartmentInfo.length) return null;

  return (
    <div className="infoItem appointmentField">
      <div className="label">{_l('部门')}</div>
      <div className="contentBox">
        <div className="content">
          {fullDepartmentInfo.map(item => (
            <div className="overflow_ellipsis" key={item.id}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(DepartmentFullName);
