import React, { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { SortableList } from 'ming-ui';
import { quickSelectDept } from 'ming-ui/functions';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import { dealRenderValue, dealUserRange } from '../../../core/utils';
import QuickOperate from '../UserSelect/QuickOperate';
import DepartmentTooltip from './DepartmentTooltip';

const DepartmentSelect = props => {
  const { disabled, value, projectId, enumDefault, onChange, advancedSetting = {}, formData, formItemId } = props;

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
          pickDepartment();
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
   * 选择部门
   */
  const pickDepartment = replaceItem => {
    if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
      alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
      return;
    }

    const deptRange = dealUserRange(props, formData);
    const unique = enumDefault === 0 || !!replaceItem;

    const { destory } = quickSelectDept(pickRef.current, {
      projectId,
      isIncludeRoot: false,
      unique,
      showCreateBtn: false,
      allPath: advancedSetting.allpath === '1',
      departrangetype: advancedSetting.departrangetype,
      appointedDepartmentIds: _.get(deptRange, 'appointedDepartmentIds') || [],
      appointedUserIds: _.get(deptRange, 'appointedAccountIds') || [],
      selectedDepartment: currentValueRef.current,
      selectFn: (departs, isCancel) => {
        onSave(departs, isCancel, replaceItem);
        if (unique && destoryRef.current) {
          destoryRef.current();
          destoryRef.current = null;
        }
      },
    });

    destoryRef.current = destory;
  };

  const onSave = (data, isCancel = false, replaceItem) => {
    const valueArr = currentValueRef.current;
    const lastIds = _.sortedUniq(valueArr.map(l => l.departmentId));
    const newIds = _.sortedUniq(data.map(l => l.departmentId));

    if ((data.length === 0 || _.isEqual(lastIds, newIds)) && !isCancel) return;

    const newData =
      enumDefault === 0
        ? data
        : isCancel
          ? valueArr.filter(l => l.departmentId !== data[0].departmentId)
          : _.uniqBy(
              replaceItem
                ? valueArr.map(v => (v.departmentId === replaceItem.departmentId ? data[0] : v))
                : valueArr.concat(data),
              'departmentId',
            );

    onChange(JSON.stringify(newData));
  };

  /**
   * 删除部门
   */
  const removeDepartment = departmentId => {
    const newValue = departmentId
      ? currentValue.filter(item => item.departmentId !== departmentId)
      : currentValue.filter(i => !i.isDelete);

    onChange(JSON.stringify(newValue));
  };

  const renderItem = ({ item, items = [], dragging, isLayer }) => {
    const { allpath } = advancedSetting;
    const disablePopover = disabled || dragging || isLayer || item.isDelete;
    const showMenu = showId === item.departmentId && !disablePopover;

    return (
      <Popover
        title={null}
        placement="bottomLeft"
        overlayClassName="quickConfigPopover"
        trigger={['click', 'contextMenu']}
        visible={showMenu}
        onVisibleChange={visible => {
          if (disablePopover) return;
          setShowId(visible ? item.departmentId : '');
        }}
        content={
          disablePopover ? null : (
            <QuickOperate
              {...props}
              item={item}
              handleRemove={() => removeDepartment(item.departmentId)}
              handlePick={() => pickDepartment(item)}
              closePopover={() => setShowId('')}
            />
          )
        }
      >
        <DepartmentTooltip item={item} projectId={projectId} advancedSetting={advancedSetting} dragging={dragging}>
          <div
            className={cx('customFormControlTags pLeft10', {
              isDelete: item.isDelete,
              clickActive: showMenu,
              disabledDepartmentOrRole: item.disabled,
            })}
            key={item.departmentId}
          >
            <span
              className="ellipsis"
              style={{
                ...(enumDefault === 1 ? { maxWidth: 200 } : {}),
                ...(allpath === '1' && !item.isDelete ? { direction: 'rtl', unicodeBidi: 'normal' } : {}),
              }}
            >
              {item.departmentName}
              {item.deleteCount > 1 && <span className="Gray mLeft5">{item.deleteCount}</span>}
            </span>

            {((enumDefault === 0 && items.length === 1) || enumDefault !== 0) && !disabled && (
              <i className="icon-minus-square Font16 tagDel" onClick={() => removeDepartment(item.departmentId)} />
            )}
          </div>
        </DepartmentTooltip>
      </Popover>
    );
  };

  const handleSort = items => {
    onChange(
      JSON.stringify(
        items.map(l => ({
          ...l,
          departmentName: !l.departmentId
            ? l.departmentName
            : _.get(
                safeParse(value || '[]').find(m => m.departmentId === l.departmentId),
                'departmentName',
              ),
        })),
      ),
    );
  };

  const handleSortEnd = items => {
    setShowId('');
    handleSort(items);
  };

  const renderValue = dealRenderValue(value, advancedSetting);

  return (
    <div className="customFormControlBox customFormControlUser">
      <SortableList
        items={renderValue.map(l => ({ ...l, canDrag: !!l.departmentId }))}
        canDrag={!disabled && enumDefault !== 0}
        itemKey="departmentId"
        itemClassName={cx('inlineFlex grab', { wMax100: enumDefault !== 1 })}
        direction="vertical"
        renderBody
        renderItem={renderItem}
        onSortEnd={handleSortEnd}
      />

      {!disabled && (
        <div
          className="TxtCenter Gray_75 ThemeHoverBorderColor3 ThemeHoverColor3 pointer addBtn"
          onClick={() => pickDepartment()}
          ref={pickRef}
        >
          <i className={enumDefault === 0 && renderValue.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
        </div>
      )}
    </div>
  );
};

DepartmentSelect.propTypes = {
  disabled: PropTypes.bool,
  value: PropTypes.string,
  projectId: PropTypes.string,
  enumDefault: PropTypes.number,
  onChange: PropTypes.func,
  advancedSetting: PropTypes.object,
  formData: PropTypes.object,
  flag: PropTypes.any,
};

export default memo(DepartmentSelect, (prevProps, nextProps) => {
  return _.isEqual(_.pick(prevProps, ['value', 'disabled', 'flag']), _.pick(nextProps, ['value', 'disabled', 'flag']));
});
