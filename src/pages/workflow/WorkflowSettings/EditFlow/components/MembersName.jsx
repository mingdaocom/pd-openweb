import React, { Fragment } from 'react';
import _ from 'lodash';
import nzh from 'nzh';
import { DEPARTMENT_ORGANIZE, USER_ORGANIZE, USER_TYPE } from '../../enum';

export default ({ accounts, multipleLevelAccounts, relationType, relationId }) => {
  const appId = relationType === 2 ? relationId : '';
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
        if (!obj.entityName) {
          return (
            <Fragment key={i}>
              <span className="red">{_l('已删除')}</span>
              {split}
            </Fragment>
          );
        }

        if (obj.count === 0) {
          return (
            <span className="yellow" key={i}>
              {obj.entityName + split}
            </span>
          );
        }

        return obj.entityName + split;
      }

      if (!obj.roleName && !obj.entityName) {
        return (
          <Fragment key={i}>
            <span className="red">{_l('已删除')}</span>
            {split}
          </Fragment>
        );
      }

      if (_.includes([USER_TYPE.ROLE, USER_TYPE.DEPARTMENT, USER_TYPE.JOB], obj.type)) {
        const department =
          obj.type === USER_TYPE.DEPARTMENT && obj.roleTypeId ? ` - ${DEPARTMENT_ORGANIZE[obj.roleTypeId]}` : '';
        const text =
          (obj.roleName ? obj.roleName + (appId !== obj.entityId ? `（${obj.entityName}）` : '') : obj.entityName) +
          (obj.includeSub ? `(${_l('包含下级部门')})` : '');

        if (!obj.entityName) {
          return (
            <Fragment key={i}>
              <span className="red">{_l('已删除')}</span>
              {split}
            </Fragment>
          );
        }

        if (obj.count === 0) {
          return (
            <Fragment key={i}>
              <span className="yellow">
                {text}
                {department}
              </span>
              {split}
            </Fragment>
          );
        }
        return text + department + split;
      }

      return (
        obj.roleName +
        (obj.roleTypeId
          ? ` - ${obj.controlType !== 27 ? USER_ORGANIZE[obj.roleTypeId] : DEPARTMENT_ORGANIZE[obj.roleTypeId]}`
          : '') +
        split
      );
    });
  };

  if ((multipleLevelAccounts || []).length) {
    return (
      <Fragment>
        <div>
          <span className="Gray_75">{_l('一级：')}</span>
          {getMemberNames(accounts)}
        </div>
        {multipleLevelAccounts.map((item, i) => {
          return (
            <div key={i}>
              <span className="Gray_75">{_l('%0级：', nzh.cn.encodeS(i + 2))}</span>
              {getMemberNames(item)}
            </div>
          );
        })}
      </Fragment>
    );
  }

  return getMemberNames(accounts);
};
