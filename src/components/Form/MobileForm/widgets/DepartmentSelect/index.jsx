import React, { Fragment, memo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import SelectUser from 'mobile/components/SelectUser';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import { dealRenderValue, dealUserRange } from '../../../core/utils';

function DepartmentSelect(props) {
  const {
    projectId,
    disabled,
    formDisabled,
    enumDefault,
    formData = [],
    appId,
    masterData = {},
    advancedSetting = {},
    value,
    onChange = () => {},
  } = props;
  const selectDepartments = dealRenderValue(value, advancedSetting);
  const [showSelectDepartment, setShowSelectDepartment] = useState(false);
  const deptRange = dealUserRange(props, formData, masterData);
  const isUnique = enumDefault === 0;

  const pickDepartment = () => {
    if (formDisabled || disabled) return;

    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      return;
    }

    setShowSelectDepartment(true);
  };

  const onSave = data => {
    const valueArr = JSON.parse(value || '[]');
    const lastIds = _.sortedUniq(valueArr.map(l => l.departmentId));
    const newIds = _.sortedUniq(data.map(l => l.departmentId));

    if (_.isEqual(lastIds, newIds)) return;

    const newData = isUnique ? data : _.uniqBy(data, 'departmentId');

    onChange(JSON.stringify(newData));
  };

  const removeDepartment = departmentId => {
    const newValue = departmentId
      ? JSON.parse(value || '[]').filter(item => item.departmentId !== departmentId)
      : JSON.parse(value || '[]').filter(i => !i.isDelete);

    onChange(JSON.stringify(newValue));
  };

  const renderItem = item => {
    return (
      <span key={item.departmentId} className="customFormCapsule">
        {item.disabled ? (
          <DisabledDepartmentAndRoleName className="ellipsis" disabled={item.disabled} name={item.departmentName} />
        ) : (
          item.departmentName
        )}
        {item.deleteCount > 1 && <span className="Gray mLeft5">{item.deleteCount}</span>}

        {!isUnique && !disabled && (
          <i className="icon-minus-square capsuleDel" onClick={() => removeDepartment(item.departmentId)} />
        )}
      </span>
    );
  };

  return (
    <div
      className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
        controlEditReadonly: !formDisabled && !_.isEmpty(selectDepartments) && disabled,
        controlDisabled: formDisabled,
        customFormControlNoBorder: !isUnique,
      })}
      onClick={isUnique ? pickDepartment : () => {}}
    >
      {isUnique ? (
        <div className="flexRow alignItemsCenter" style={{ width: '100%' }}>
          {!_.isEmpty(selectDepartments) ? (
            <div className="flex">{renderItem(selectDepartments[0])}</div>
          ) : (
            <div className="flex Gray_bd">{_l('请选择')}</div>
          )}
          {!formDisabled && <i className="icon icon-arrow-right-border Font16 Gray_bd" />}
        </div>
      ) : (
        <Fragment>
          {selectDepartments.map(item => renderItem(item))}
          {!disabled && (
            <div className="TxtCenter customFormAddBtn" onClick={pickDepartment}>
              <i className="icon-add icon" />
            </div>
          )}
        </Fragment>
      )}

      {showSelectDepartment && (
        <SelectUser
          projectId={projectId}
          visible={true}
          type="department"
          onlyOne={isUnique}
          hideClearBtn={false}
          onClose={() => setShowSelectDepartment(false)}
          onSave={onSave}
          appId={appId || ''}
          selectRangeOptions={!!advancedSetting.chooserange}
          departrangetype={advancedSetting.departrangetype}
          appointedDepartmentIds={_.get(deptRange, 'appointedDepartmentIds') || []}
          allPath={advancedSetting.allpath === '1'}
          appointedUserIds={_.get(deptRange, 'appointedAccountIds') || []}
          selectedUsers={selectDepartments}
        />
      )}
    </div>
  );
}

DepartmentSelect.propTypes = {
  projectId: PropTypes.string,
  disabled: PropTypes.bool,
  formDisabled: PropTypes.bool,
  enumDefault: PropTypes.number,
  formData: PropTypes.array,
  appId: PropTypes.string,
  masterData: PropTypes.object,
  advancedSetting: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  triggerCustomEvent: PropTypes.func,
};

export default memo(DepartmentSelect, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled']),
  );
});
