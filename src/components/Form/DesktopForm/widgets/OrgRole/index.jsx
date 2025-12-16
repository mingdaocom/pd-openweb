import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { SortableList } from 'ming-ui';
import { quickSelectRole } from 'ming-ui/functions';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import { dealUserRange } from '../../../core/utils';
import QuickOperate from '../UserSelect/QuickOperate';

const OrgRole = props => {
  const { disabled, enumDefault, onChange, value, projectId, formData, formItemId } = props;
  const [showId, setShowId] = useState('');
  const pickRef = useRef(null);
  const destoryRef = useRef(null);
  const currentValueRef = useRef(safeParse(value || '[]'));

  const currentValue = useMemo(() => {
    const result = safeParse(value || '[]');
    currentValueRef.current = result;
    return result;
  }, [value]);

  useWidgetEvent(
    formItemId,
    useCallback(data => {
      const { triggerType } = data;
      switch (triggerType) {
        case 'Enter':
          if (destoryRef.current) return;
          pickOrgRole();
          break;
        case 'trigger_tab_enter':
        case 'trigger_tab_leave':
          if (destoryRef.current) {
            destoryRef.current();
            destoryRef.current = null;
          }
          break;
        default:
          break;
      }
    }, []),
  );

  /**
   * 选择组织角色
   */
  const pickOrgRole = replaceItem => {
    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其组织角色列表，请联系组织管理员'), 3);
      return;
    }

    const orgRange = dealUserRange(props, formData);
    const unique = enumDefault === 0 || !!replaceItem;
    const { destory } = quickSelectRole(pickRef.current, {
      projectId,
      unique,
      offset: {
        top: 16,
        left: -16,
      },
      value: currentValueRef.current,
      onSave: (data, isCancel) => {
        onSave(data, isCancel, replaceItem);
        if (unique && destoryRef.current) {
          destoryRef.current();
          destoryRef.current = null;
        }
      },
      appointedOrganizeIds: _.get(orgRange, 'appointedOrganizeIds'),
    });

    destoryRef.current = destory;
  };

  const onSave = (data, isCancel = false, replaceItem) => {
    const valueArr = currentValueRef.current;
    const lastIds = _.sortedUniq(valueArr.map(l => l.organizeId));
    const newIds = _.sortedUniq(data.map(l => l.organizeId));

    if ((_.isEmpty(data) || _.isEqual(lastIds, newIds)) && !isCancel) return;

    const filterData = data.map(i => ({ organizeId: i.organizeId, organizeName: i.organizeName }));
    let newData = enumDefault === 0 ? filterData : valueArr;

    if (enumDefault !== 0 || isCancel) {
      newData = isCancel
        ? newData.filter(l => l.organizeId !== filterData[0].organizeId)
        : _.uniqBy(
            replaceItem
              ? newData.map(v => (v.organizeId === replaceItem.organizeId ? filterData[0] : v))
              : newData.concat(filterData),
            'organizeId',
          );
    }

    onChange(JSON.stringify(newData));
  };

  /**
   * 删除组织角色
   */
  const removeOrgRole = organizeId => {
    const newValue = JSON.parse(value).filter(item => item.organizeId !== organizeId);
    onChange(JSON.stringify(newValue));
  };

  const renderItem = ({ item, dragging, items = [], isLayer }) => {
    const disablePopover = disabled || dragging || isLayer;
    const showMenu = showId === item.organizeId && !disablePopover;

    return (
      <Popover
        title={null}
        placement="bottomLeft"
        overlayClassName="quickConfigPopover"
        trigger={['click', 'contextMenu']}
        visible={showMenu}
        onVisibleChange={visible => {
          if (disablePopover) return;
          setShowId(visible ? item.organizeId : '');
        }}
        content={
          disablePopover ? null : (
            <QuickOperate
              {...props}
              item={item}
              handleRemove={() => removeOrgRole(item.organizeId)}
              handlePick={() => pickOrgRole(item)}
              closePopover={() => setShowId('')}
            />
          )
        }
      >
        <div
          className={cx('customFormControlTags pLeft10', {
            clickActive: showMenu,
          })}
          key={item.organizeId}
        >
          <DisabledDepartmentAndRoleName
            className="ellipsis"
            style={{ maxWidth: 200 }}
            disabled={item.disabled}
            name={item.organizeName}
            isRole={true}
          />

          {((enumDefault === 0 && items.length === 1) || enumDefault !== 0) && !disabled && (
            <i className="icon-minus-square Font16 tagDel" onClick={() => removeOrgRole(item.organizeId)} />
          )}
        </div>
      </Popover>
    );
  };

  return (
    <div className="customFormControlBox customFormControlUser">
      <SortableList
        items={currentValue}
        canDrag={!disabled && enumDefault !== 0}
        itemKey="organizeId"
        itemClassName="inlineFlex grab"
        direction="vertical"
        renderBody
        renderItem={item => renderItem(item)}
        onSortEnd={items => {
          setShowId('');
          onChange(JSON.stringify(items));
        }}
      />

      {!disabled && (
        <div
          className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
          onClick={() => pickOrgRole()}
          ref={pickRef}
        >
          <i className={enumDefault === 0 && currentValue.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
        </div>
      )}
    </div>
  );
};

OrgRole.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.string,
  projectId: PropTypes.string,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
};

export default memo(OrgRole, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'disabled']), _.pick(nextProps, ['value', 'disabled']));
});
