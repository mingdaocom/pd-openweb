import React, { Fragment } from 'react';
import { USER_TYPE, USER_ORGANIZE, DEPARTMENT_ORGANIZE } from '../../enum';
import _ from 'lodash';
import nzh from 'nzh';

export default ({ accounts, multipleLevelAccounts }) => {
  const getMemberNames = data => {
    return data.map((obj, i) => {
      const split = i !== data.length - 1 ? '、' : '';

      if (obj.type === USER_TYPE.TEXT) {
        return obj.entityId + split;
      }

      if (obj.type === USER_TYPE.USER) {
        return obj.roleName + split;
      }

      if (obj.type === USER_TYPE.ORGANIZE_ROLE) {
        return obj.entityName + split;
      }

      if (_.includes([USER_TYPE.ROLE, USER_TYPE.DEPARTMENT, USER_TYPE.JOB], obj.type)) {
        const department =
          obj.type === USER_TYPE.DEPARTMENT && obj.roleTypeId ? ` - ${DEPARTMENT_ORGANIZE[obj.roleTypeId]}` : '';

        if (obj.count === 0) {
          return (
            <Fragment key={i}>
              <span className="yellow">
                {obj.roleName ? obj.roleName + `（${obj.entityName}）` : obj.entityName}
                {department}
              </span>
              {split}
            </Fragment>
          );
        }
        return (obj.roleName ? obj.roleName + `（${obj.entityName}）` : obj.entityName) + department + split;
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
          obj.roleName +
          (obj.roleTypeId
            ? ` - ${obj.controlType !== 27 ? USER_ORGANIZE[obj.roleTypeId] : DEPARTMENT_ORGANIZE[obj.roleTypeId]}`
            : '') +
          split
        );
      }
    });
  };

  if ((multipleLevelAccounts || []).length) {
    return (
      <Fragment>
        <div>
          <span className="Gray_9e">{_l('一级：')}</span>
          {getMemberNames(accounts)}
        </div>
        {multipleLevelAccounts.map((item, i) => {
          return (
            <div key={i}>
              <span className="Gray_9e">{_l('%0级：', nzh.cn.encodeS(i + 2))}</span>
              {getMemberNames(item)}
            </div>
          );
        })}
      </Fragment>
    );
  }

  return getMemberNames(accounts);
};
