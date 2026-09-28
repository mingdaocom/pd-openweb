import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { SortableList } from 'ming-ui';
import { Button, Popover } from 'ming-ui/antd-components';
import { DeptSelectPopover } from 'ming-ui/functions/quickSelectDept';
import { formatDepartmentDisplayValue } from 'src/utils/domain/control/department';
import { dealUserRange } from 'src/utils/domain/control/selectionRange';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import QuickOperate from '../UserSelect/QuickOperate';
import DepartmentTooltip from './DepartmentTooltip';

const DEPT_SELECT_ALIGN = { overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } };

const DepartmentSelect = props => {
  const { disabled, value, projectId, enumDefault, onChange, advancedSetting = {}, formData, formItemId } = props;

  const [showId, setShowId] = useState('');
  const [deptSelectVisible, setDeptSelectVisible] = useState(false);
  const [replaceItem, setReplaceItem] = useState();
  const [deptRange, setDeptRange] = useState({});
  const currentValueRef = useRef(safeParse(value || '[]'));
  const deptSelectRef = useRef(null);
  const containerRef = useRef(null);

  const currentValue = useMemo(() => safeParse(value || '[]'), [value]);

  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    if (!deptSelectVisible || disabled) return;

    const alignPopover = () => deptSelectRef.current?.forceAlign();
    // SortableList 异步同步内部列表，监听实际 DOM 更新，避免按旧按钮位置对齐。
    const observer = new MutationObserver(alignPopover);
    observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
    alignPopover();

    return () => observer.disconnect();
  }, [deptSelectVisible, disabled]);

  const onSave = useCallback(
    (data, isCancel = false, currentReplaceItem) => {
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
                currentReplaceItem
                  ? valueArr.map(v => (v.departmentId === currentReplaceItem.departmentId ? data[0] : v))
                  : valueArr.concat(data),
                'departmentId',
              );

      onChange(JSON.stringify(newData));
    },
    [enumDefault, onChange],
  );

  const pickDepartment = useCallback(
    currentReplaceItem => {
      if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
        alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
        return;
      }

      setReplaceItem(currentReplaceItem);
      setDeptRange(dealUserRange(props, formData));
      setDeptSelectVisible(true);
    },
    [formData, projectId, props],
  );

  const handleDeptOpenChange = useCallback(
    visible => {
      if (visible && !_.find(md.global.Account.projects, item => item.projectId === projectId)) {
        alert(_l('您不是该组织成员，无法获取其部门列表，请联系组织管理员'), 3);
        return false;
      }

      if (visible) {
        setDeptRange(dealUserRange(props, formData));
      }

      setDeptSelectVisible(visible);
    },
    [formData, projectId, props],
  );

  useWidgetEvent(
    formItemId,
    useCallback(
      data => {
        const { triggerType } = data;

        switch (triggerType) {
          case 'Enter':
            if (deptSelectVisible) return;
            pickDepartment();
            break;
          case 'trigger_tab_enter':
          case 'trigger_tab_leave':
            setDeptSelectVisible(false);

            break;
          default:
            break;
        }
      },
      [deptSelectVisible, pickDepartment],
    ),
  );

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
    const needRTL = allpath === '1' && !item.isDelete;
    const renderName = needRTL ? <bdi dir="ltr">{item.departmentName}</bdi> : item.departmentName;

    return (
      <Popover
        arrow={true}
        title={null}
        placement="bottomLeft"
        classNames={{ root: 'quickConfigPopover' }}
        trigger={['click', 'contextMenu']}
        open={showMenu}
        onOpenChange={visible => {
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
                ...(needRTL ? { direction: 'rtl' } : {}),
              }}
            >
              {renderName}
              {item.deleteCount > 1 && <span className="textPrimary mLeft5">{item.deleteCount}</span>}
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

  const renderValue = formatDepartmentDisplayValue(value, advancedSetting);

  return (
    <div ref={containerRef} className="customFormControlBox customFormControlUser">
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
        <DeptSelectPopover
          ref={deptSelectRef}
          placement="rightTop"
          align={DEPT_SELECT_ALIGN}
          open={deptSelectVisible}
          onOpenChange={handleDeptOpenChange}
          projectId={projectId}
          isIncludeRoot={false}
          unique={enumDefault === 0 || !!replaceItem}
          showCreateBtn={false}
          allPath={advancedSetting.allpath === '1'}
          departrangetype={advancedSetting.departrangetype}
          appointedDepartmentIds={_.get(deptRange, 'appointedDepartmentIds') || []}
          appointedUserIds={_.get(deptRange, 'appointedAccountIds') || []}
          selectedDepartment={currentValue}
          selectFn={(departs, isCancel) => onSave(departs, isCancel, replaceItem)}
        >
          <Button
            aria-label={_l('选择部门')}
            className="controlAddButton"
            shape="circle"
            size="small"
            icon={
              <i className={enumDefault === 0 && renderValue.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
            }
            onClick={() => setReplaceItem(undefined)}
          />
        </DeptSelectPopover>
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
