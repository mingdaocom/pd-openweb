import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { SortableList } from 'ming-ui';
import { Button, Popover } from 'ming-ui/antd-components';
import { RoleSelectPopover } from 'ming-ui/functions/quickSelectRole';
import DisabledDepartmentAndRoleName from 'src/components/DisabledDepartmentAndRoleName';
import { dealUserRange } from 'src/utils/domain/control/selectionRange';
import { useWidgetEvent } from '../../../core/useFormEventManager';
import QuickOperate from '../UserSelect/QuickOperate';

const ROLE_SELECT_ALIGN = { overflow: { adjustX: true, adjustY: true, shiftX: true, shiftY: true } };

const OrgRole = props => {
  const { disabled, enumDefault, onChange, value, projectId, formData, formItemId } = props;
  const [showId, setShowId] = useState('');
  const [roleSelectVisible, setRoleSelectVisible] = useState(false);
  const [replaceOrgRole, setReplaceOrgRole] = useState();
  const [appointedOrganizeIds, setAppointedOrganizeIds] = useState();
  const pickRef = useRef(null);
  const destoryRef = useRef(null);
  const currentValueRef = useRef(safeParse(value || '[]'));
  const roleSelectRef = useRef(null);
  const containerRef = useRef(null);

  const currentValue = useMemo(() => safeParse(value || '[]'), [value]);

  useEffect(() => {
    currentValueRef.current = currentValue;
  }, [currentValue]);

  useEffect(() => {
    if (!roleSelectVisible || disabled) return;

    const alignPopover = () => roleSelectRef.current?.forceAlign();
    // SortableList 异步同步内部列表，监听实际 DOM 更新，避免按旧按钮位置对齐。
    const observer = new MutationObserver(alignPopover);
    observer.observe(containerRef.current, { childList: true, subtree: true, characterData: true });
    alignPopover();

    return () => observer.disconnect();
  }, [disabled, roleSelectVisible]);

  /**
   * 选择组织角色
   */
  const pickOrgRole = useCallback(
    replaceItem => {
      if (!_.find(md.global.Account.projects, item => item.projectId === projectId)) {
        alert(_l('您不是该组织成员，无法获取其组织角色列表，请联系组织管理员'), 3);
        return;
      }

      const orgRange = dealUserRange(props, formData);
      setReplaceOrgRole(replaceItem);
      setAppointedOrganizeIds(_.get(orgRange, 'appointedOrganizeIds'));
      setRoleSelectVisible(true);
      destoryRef.current = () => {
        setRoleSelectVisible(false);
        destoryRef.current = null;
      };
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
      },
      [pickOrgRole],
    ),
  );

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
    const newValue = safeParse(value, 'array').filter(item => item.organizeId !== organizeId);
    onChange(JSON.stringify(newValue));
  };

  const renderItem = ({ item, dragging, items = [], isLayer }) => {
    const disablePopover = disabled || dragging || isLayer;
    const showMenu = showId === item.organizeId && !disablePopover;

    return (
      <Popover
        arrow={true}
        title={null}
        placement="bottomLeft"
        classNames={{ root: 'quickConfigPopover' }}
        trigger={['click', 'contextMenu']}
        noPadding
        open={showMenu}
        onOpenChange={visible => {
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
    <div ref={containerRef} className="customFormControlBox customFormControlUser">
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
        <RoleSelectPopover
          ref={roleSelectRef}
          placement="rightTop"
          align={ROLE_SELECT_ALIGN}
          projectId={projectId}
          unique={enumDefault === 0 || !!replaceOrgRole}
          value={currentValue}
          appointedOrganizeIds={appointedOrganizeIds}
          open={roleSelectVisible}
          onOpenChange={visible => {
            if (visible) return false;
            destoryRef.current = null;
            setRoleSelectVisible(false);
          }}
          onClose={() => {
            destoryRef.current = null;
            setRoleSelectVisible(false);
          }}
          onSave={(data, isCancel) => {
            onSave(data, isCancel, replaceOrgRole);
            if ((enumDefault === 0 || replaceOrgRole) && destoryRef.current) {
              destoryRef.current();
            }
          }}
        >
          <Button
            aria-label={_l('选择组织角色')}
            className="controlAddButton"
            shape="circle"
            size="small"
            icon={
              <i className={enumDefault === 0 && currentValue.length ? 'icon-swap_horiz Font16' : 'icon-plus Font14'} />
            }
            onClick={() => pickOrgRole()}
            ref={pickRef}
          />
        </RoleSelectPopover>
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
