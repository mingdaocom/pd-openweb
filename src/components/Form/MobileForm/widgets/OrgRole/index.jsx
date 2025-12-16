import React, { Fragment, memo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import SelectOrgRole from 'mobile/components/SelectOrgRole';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import { dealUserRange } from '../../../core/utils';

function OrgRole(props) {
  const {
    projectId,
    disabled,
    formDisabled,
    enumDefault,
    formData = [],
    masterData = {},
    value,
    onChange = () => {},
  } = props;
  const selectOrgRoles = JSON.parse(value || '[]');
  const orgRange = dealUserRange(props, formData, masterData);
  const [showMobileOrgRole, setShowMobileOrgRole] = useState(false);
  const isUnique = enumDefault === 0;

  const pickOrgRole = () => {
    if (formDisabled || disabled) return;

    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其组织角色列表，请联系组织管理员'), 3);
      return;
    }

    setShowMobileOrgRole(true);
  };

  const onSave = data => {
    const filterData = data.map(i => ({ organizeId: i.organizeId, organizeName: i.organizeName }));
    const newData = isUnique ? filterData : _.uniqBy(filterData, 'organizeId');

    onChange(JSON.stringify(newData));
  };

  const removeOrgRole = organizeId => {
    const newValue = selectOrgRoles.filter(item => item.organizeId !== organizeId);

    onChange(JSON.stringify(newValue));
  };

  const renderItem = item => {
    return (
      <span key={item.organizeId} className="customFormCapsule">
        {item.disabled ? (
          <DisabledDepartmentAndRoleName
            className="ellipsis"
            disabled={item.disabled}
            name={item.organizeName}
            isRole={true}
          />
        ) : (
          item.organizeName
        )}
        {!isUnique && !disabled && (
          <i className="icon-minus-square capsuleDel" onClick={() => removeOrgRole(item.organizeId)} />
        )}
      </span>
    );
  };

  return (
    <div
      className={cx('customFormControlBox controlMinHeight customFormControlCapsuleBox', {
        controlEditReadonly: !formDisabled && !_.isEmpty(selectOrgRoles) && disabled,
        controlDisabled: formDisabled,
        customFormControlNoBorder: !isUnique,
      })}
      onClick={isUnique ? pickOrgRole : () => {}}
    >
      {isUnique ? (
        <div className="flexRow alignItemsCenter" style={{ width: '100%' }}>
          {!_.isEmpty(selectOrgRoles) ? (
            <div className="flex">{renderItem(selectOrgRoles[0])}</div>
          ) : (
            <div className="flex Gray_bd">{_l('请选择')}</div>
          )}
          {!formDisabled && <i className="icon icon-arrow-right-border Font16 Gray_bd" />}
        </div>
      ) : (
        <Fragment>
          {selectOrgRoles.map(item => renderItem(item))}
          {!disabled && (
            <div className="TxtCenter customFormAddBtn" onClick={pickOrgRole}>
              <i className="icon-add icon" />
            </div>
          )}
        </Fragment>
      )}

      {showMobileOrgRole && (
        <SelectOrgRole
          projectId={projectId}
          visible={true}
          unique={isUnique}
          hideClearBtn={false}
          selectOrgRoles={selectOrgRoles}
          onClose={() => setShowMobileOrgRole(false)}
          onSave={onSave}
          appointedOrganizeIds={_.get(orgRange, 'appointedOrganizeIds')}
        />
      )}
    </div>
  );
}

OrgRole.propTypes = {
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

export default memo(OrgRole, (prevProps, nextProps) => {
  return _.isEqual(
    _.pick(prevProps, ['value', 'disabled', 'formDisabled']),
    _.pick(nextProps, ['value', 'disabled', 'formDisabled']),
  );
});
