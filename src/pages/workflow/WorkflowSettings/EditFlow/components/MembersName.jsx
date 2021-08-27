import React, { Fragment } from 'react';
import { USER_TYPE, USER_ORGANIZE, DEPARTMENT_ORGANIZE } from '../../enum';

export default ({ accounts }) => {
  return accounts.map((obj, i) => {
    const split = i !== accounts.length - 1 ? '、' : '';

    if (obj.type === USER_TYPE.TEXT) {
      return obj.entityId + split;
    }
    if (obj.type === USER_TYPE.USER) {
      return obj.roleName + split;
    }
    if (_.includes([USER_TYPE.ROLE, USER_TYPE.DEPARTMENT, USER_TYPE.JOB], obj.type)) {
      if (obj.count === 0) {
        return (
          <Fragment key={i}>
            <span className="yellow">{obj.roleName + `（${obj.entityName}）`}</span>
            {split}
          </Fragment>
        );
      }
      return obj.roleName + `（${obj.entityName}）` + split;
    } else {
      if (!obj.roleName || !obj.entityName) {
        return (
          <Fragment key={i}>
            <span className="red">{_l('人员字段不存在')}</span>
            {split}
          </Fragment>
        );
      }
      return (
        obj.roleName + (obj.roleTypeId ? ` - ${obj.controlType !== 27 ? USER_ORGANIZE[obj.roleTypeId] : DEPARTMENT_ORGANIZE[obj.roleTypeId]}` : '') + split
      );
    }
  });
};
