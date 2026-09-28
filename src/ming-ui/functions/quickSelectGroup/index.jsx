import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { any, bool, func, number, object, string } from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import groupAjax from 'src/api/group';
import { createControllableOpenHandler, getMergedTriggerEventHandlers } from 'src/utils/platform/react/interaction';

const SelectGroupWrap = styled.div(
  ({ $showType }) => `
    overflow: hidden;
    width: ${$showType === 1 ? '360px' : '100%'};
    padding-top: 16px;
    text-align: left;
    .item,
    .projectItem {
      padding: 0 18px;
      height: 36px;
      &:hover {
        background: var(--color-background-hover);
      }
      &.select {
        background: var(--color-primary-transparent) !important;
      }
      &.disabled {
        color: var(--color-text-secondary) !important;
        background: var(--color-background-primary) !important;
      }
    }
    .projectItem {
      justify-content: start;
    }
    .projectList {
      .item {
        padding-left: 30px;
      }
    }
    .split {
      margin: 5px 8px;
      height: 1px;
      background: var(--color-background-disabled);
    }
    .rotate90 {
      transform: rotate(-90deg);
    }
`,
);
const DefaultChildWrap = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
`;

function getInitialSelectedGroups(defaultValue) {
  if (!defaultValue) return [];

  const groupIds = _.get(defaultValue, 'shareGroupIds') || [];
  const projectIds = _.get(defaultValue, 'shareProjectIds') || [];
  const radioIds = _.get(defaultValue, 'radioProjectIds') || [];

  if (!groupIds.length && !projectIds.length && !radioIds.length) {
    return [{ id: md.global.Account.accountId, value: _l('仅自己可见'), extra: { isMe: true } }];
  }

  return groupIds
    .map(id => ({ id, value: '' }))
    .concat(projectIds.map(id => ({ id, value: _l('所有同事'), extra: { isProject: true } })));
}

function getSelectIds(value) {
  const currentValue = value || {};

  return {
    shareGroupIds: currentValue.shareGroupIds || [],
    shareProjectIds: currentValue.shareProjectIds || [],
    radioProjectIds: currentValue.radioProjectIds || [],
    isMe: currentValue.isMe !== undefined ? currentValue.isMe : false,
  };
}

function getControlledSelectedGroups(value, currentGroups) {
  if (_.isEmpty(value)) return [];

  const groups = getInitialSelectedGroups(value);
  if (value.isMe === false && groups.length === 1 && _.get(groups, '0.extra.isMe')) return [];

  return groups.map(group => currentGroups.find(item => item.id === group.id) || group);
}

function requestGroup(item) {
  return groupAjax.selectGroup({
    projectId: item.projectId === 'common' ? '' : item.projectId,
    withRadio: false,
  });
}

export function SelectGroup(props) {
  const {
    projectId,
    minHeight = 400,
    isAll = true,
    isMe = true,
    everyoneOnly = false,
    filterDisabledGroup = false,
    defaultValueAllowChange = true,
    defaultValue = {},
    lockedValue = defaultValue,
    value,
    showType = 1,
    onChange = () => {},
    onSave = () => {},
    onClose = () => {},
  } = props;
  const projects = (_.get(md, 'global.Account.projects') || []).filter(l => l.licenseType);
  const conRef = useRef();
  const requestedListKeyRef = useRef();
  const [loading, setLoading] = useState(true);
  const [loadedListKey, setLoadedListKey] = useState();
  const [commonList, setCommonList] = useState([]);
  const [groupData, setGroupData] = useState({});
  const [groupLoading, setGroupLoading] = useState(false);
  const [expandKeys, setExpandKeys] = useState([]);
  const [selectIds, setSelectIds] = useState(() => getSelectIds(defaultValue));

  useClickAway(conRef, () => {
    onSave();
    onClose(true);
  });

  const handleGroupResult = React.useCallback(
    (item, result) => {
      let data = result.filter(
        l => (_.get(l, 'extra.licenseType') !== 0 || !filterDisabledGroup) && (isMe || _.get(l, 'extra.isMe') !== true),
      );

      if (isAll && item.projectId !== 'common' && item.projectId) {
        data = [{ id: item.projectId, value: item.companyName, extra: { isProject: true } }].concat(data);
      }

      if (['common', ''].includes(item.projectId) && isMe) {
        data = [{ id: md.global.Account.accountId, value: _l('仅自己可见'), extra: { isMe: true } }].concat(data);
      }

      projectId !== undefined ? setLoading(false) : setGroupLoading(undefined);
      projectId !== undefined
        ? setCommonList(data)
        : setGroupData(currentGroupData => ({
            ...currentGroupData,
            [item.projectId]: data,
          }));
    },
    [filterDisabledGroup, isAll, isMe, projectId],
  );

  const getGroup = React.useCallback(
    item => {
      requestGroup(item).then(res => handleGroupResult(item, res));
    },
    [handleGroupResult],
  );

  const getInitialGroup = React.useCallback(
    (item, requestKey) => {
      requestGroup(item).then(res => {
        if (requestedListKeyRef.current !== requestKey) return;

        handleGroupResult(item, res);
        setLoadedListKey(requestKey);
      });
    },
    [handleGroupResult],
  );

  const getCommonList = React.useCallback(
    requestKey => {
      groupAjax.selectGroupMostFrequent().then(res => {
        if (requestKey && requestedListKeyRef.current !== requestKey) return;

        const groups = res.filter(l => !_.get(l, 'extra.isMe'));
        setCommonList(
          isMe
            ? groups.concat({ id: md.global.Account.accountId, value: _l('仅自己可见'), extra: { isMe: true } })
            : groups,
        );
        setLoading(false);
        requestKey && setLoadedListKey(requestKey);
      });
    },
    [isMe],
  );

  const listRequestKey = [projectId === undefined ? 'all' : projectId, filterDisabledGroup, isAll, isMe].join('|');
  const isListLoading = loading || loadedListKey !== listRequestKey;

  useEffect(() => {
    if (requestedListKeyRef.current === listRequestKey) return;

    requestedListKeyRef.current = listRequestKey;
    projectId !== undefined ? getInitialGroup({ projectId }, listRequestKey) : getCommonList(listRequestKey);
  }, [getCommonList, getInitialGroup, listRequestKey, projectId]);

  const currentSelectIds = value === undefined ? selectIds : getSelectIds(value);

  const handleSelect = (item, checked) => {
    let selectObj = _.cloneDeep(currentSelectIds);
    let list = [];

    if (md.global.Account.accountId === item.id) {
      selectObj = { shareProjectIds: [], shareGroupIds: [], radioProjectIds: [], isMe: checked };
    } else if (everyoneOnly && _.get(item, 'extra.isProject')) {
      selectObj = { shareProjectIds: checked ? [item.id] : [], shareGroupIds: [], radioProjectIds: [], isMe: false };
    } else {
      const type = _.get(item, 'extra.isProject') ? 'shareProjectIds' : 'shareGroupIds';
      selectObj[type] = checked ? selectObj[type].concat(item.id) : selectObj[type].filter(l => l !== item.id);

      if (everyoneOnly && type === 'shareGroupIds') {
        selectObj.shareProjectIds = [];
      }

      selectObj.isMe = false;
    }

    if (
      !defaultValueAllowChange &&
      !_.isEmpty(lockedValue) &&
      ((md.global.Account.accountId === item.id && !checked) || currentSelectIds.isMe)
    ) {
      selectObj = {
        shareGroupIds: _.concat(selectObj.shareGroupIds || [], lockedValue.shareGroupIds || []),
        shareProjectIds: _.concat(selectObj.shareProjectIds || [], lockedValue.shareProjectIds || []),
        radioProjectIds: _.concat(selectObj.radioProjectIds || [], lockedValue.radioProjectIds || []),
        isMe: selectObj.isMe,
      };
      list = _.concat(selectObj.shareGroupIds, selectObj.shareProjectIds, selectObj.radioProjectIds);
    }

    setSelectIds(selectObj);
    onChange(selectObj, list.length > 0 ? list : { ...item, checked: checked });
  };

  const handleExpand = (item, expand) => {
    setExpandKeys(currentKeys =>
      expand ? currentKeys.concat(item.projectId) : currentKeys.filter(l => l !== item.projectId),
    );

    if (groupData[item.projectId]) return;

    setGroupLoading(item.projectId);
    getGroup(item);
  };

  const renderList = (data, key) => {
    return (
      <ul>
        {data.map(l => {
          const checked = (
            currentSelectIds.isMe
              ? [md.global.Account.accountId]
              : currentSelectIds.shareProjectIds.concat(currentSelectIds.shareGroupIds)
          ).includes(l.id);
          const allProject = _.get(l, 'extra.isProject');
          const showProjectName = key === 'commonList' && allProject;
          const disabled =
            !defaultValueAllowChange &&
            (lockedValue.shareProjectIds || []).concat(lockedValue.shareGroupIds || []).includes(l.id);

          return (
            <li
              className={cx('item Font13 textPrimary valignWrapper Hand', {
                select: checked,
                disabled: disabled,
              })}
              key={`${key}-${l.id}`}
              onClick={() => {
                if (disabled) return;

                handleSelect(l, !checked);
              }}
              data-groupid={l.id}
              data-name={l.value}
            >
              <span className={showProjectName ? '' : 'flex overflow_ellipsis'}>
                {allProject ? _l('所有同事') : l.value}
              </span>
              {showProjectName && <span className="textSecondary mLeft5 flex overflow_ellipsis">{l.value}</span>}
              {checked && <Icon icon="done" className="mLeft8 colorPrimary Font12" />}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderGroupList = () => {
    const groupList = projects.concat({ projectId: 'common', companyName: projects.length ? _l('个人') : _l('群组') });

    return (
      <div className="projectList">
        {groupList.map(l => {
          const expand = expandKeys.includes(l.projectId);

          return (
            <Fragment key={`projectItem-${l.projectId}`}>
              <div
                className="projectItem Font13 textPrimary valignWrapper Hand"
                onClick={() => handleExpand(l, !expand)}
              >
                <Icon
                  icon="task_custom_btn_unfold"
                  className={cx('textTertiary Font12 mRight10', { rotate90: !expand })}
                />
                <span className="flex overflow_ellipsis">{l.companyName}</span>
              </div>
              {expand ? (
                groupLoading === l.projectId ? (
                  <LoadDiv />
                ) : (
                  renderList(groupData[l.projectId], `projectItem-${l.projectId}`)
                )
              ) : null}
            </Fragment>
          );
        })}
      </div>
    );
  };

  const renderCommonList = () => {
    if (!commonList.length) return;

    return (
      <Fragment>
        {projectId === undefined && <div className="pLeft16 Font12 textSecondary pBottom8">{_l('最常使用')}</div>}
        {renderList(commonList, 'commonList')}
        {projectId === undefined && projects.length && <div className="split"></div>}
      </Fragment>
    );
  };

  return (
    <SelectGroupWrap className="quickSelectGroup" ref={conRef} style={{ height: minHeight }} $showType={showType}>
      {isListLoading ? (
        <LoadDiv />
      ) : (
        <ScrollView className="flex h100">
          {!commonList.length && !projects.length && <p className="item textTertiary">{_l('暂无群组')}</p>}
          {renderCommonList()}
          {projectId === undefined && renderGroupList()}
        </ScrollView>
      )}
    </SelectGroupWrap>
  );
}

function SelectGroupPopoverContent(props) {
  const {
    align,
    arrow = false,
    children,
    className = '',
    defaultValue,
    destroyOnHidden,
    destroyPopupOnHide,
    getPopupContainer,
    hideIcon = false,
    everyoneOnly = false,
    isDynamic,
    onBlur,
    onClick,
    onClose = () => {},
    onContextMenu,
    onFocus,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    onOpenChange = () => {},
    onChange = () => {},
    offset,
    open,
    placement,
    projectId,
    styles = {},
    trigger = 'click',
    uncontrolledVisible,
    value: externalValue,
    zIndex,
    setUncontrolledVisible,
    ...selectGroupProps
  } = props;
  const [initialSelectionValue] = useState(() => (externalValue === undefined ? defaultValue : externalValue));
  const [selectionState, setSelectionState] = useState(() => ({
    selectedGroups:
      externalValue === undefined
        ? getInitialSelectedGroups(defaultValue)
        : getControlledSelectedGroups(externalValue, []),
    selectedValue: externalValue !== undefined && _.isEmpty(externalValue) ? undefined : initialSelectionValue,
  }));
  const isControlled = _.has(props, 'open');
  const mergedVisible = isControlled ? open : uncontrolledVisible;
  const mergedDestroyOnHidden = destroyPopupOnHide === undefined ? destroyOnHidden : destroyPopupOnHide;
  const mergedAlign = align || (offset ? { offset: [offset.left || 0, offset.top || 0] } : undefined);
  const mergedPlacement = placement ?? (children ? 'bottomLeft' : 'bottomRight');
  const selectedGroups =
    externalValue === undefined
      ? selectionState.selectedGroups
      : getControlledSelectedGroups(externalValue, selectionState.selectedGroups);
  const selectedValue = externalValue === undefined ? selectionState.selectedValue : externalValue;

  const unresolvedGroupId = selectedGroups.length === 1 && !selectedGroups[0].value ? selectedGroups[0].id : undefined;

  useEffect(() => {
    if (!unresolvedGroupId) return;

    let active = true;
    groupAjax.getGroupInfo({ groupId: unresolvedGroupId }).then(res => {
      if (!active) return;

      setSelectionState(currentState => ({
        ...currentState,
        selectedGroups: [{ id: unresolvedGroupId, value: res.name }],
      }));
    });

    return () => {
      active = false;
    };
  }, [unresolvedGroupId]);

  const handleChange = (selected, item) => {
    let nextSelectedGroups;

    if (_.isArray(item)) {
      nextSelectedGroups = item.map(id => ({ id, value: '' }));
    } else if (item.id === md.global.Account.accountId || (everyoneOnly && _.get(item, 'extra.isProject'))) {
      nextSelectedGroups = item.checked ? [item] : [];
    } else {
      nextSelectedGroups = item.checked
        ? selectedGroups
            .filter(l => l.id !== md.global.Account.accountId && (!everyoneOnly || !_.get(l, 'extra.isProject')))
            .concat(item)
        : selectedGroups.filter(l => ![item.id, md.global.Account.accountId].includes(l.id));
    }

    setSelectionState({ selectedGroups: nextSelectedGroups, selectedValue: selected });
    onChange(selected, nextSelectedGroups);
  };

  const handleOpenChange = createControllableOpenHandler({
    isControlled,
    onOpenChange,
    setOpen: setUncontrolledVisible,
  });

  const handleClose = force => {
    if (!force && isDynamic) return;

    handleOpenChange(false);
    onClose(force);
  };

  const childTriggerEvents = {
    onBlur,
    onClick,
    onContextMenu,
    onFocus,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
  };
  const childElement = children || (
    <DefaultChildWrap className={cx('Hand', className)}>
      {!hideIcon && <Icon icon="eye" className="Font16 textTertiary mRight5" />}
      <span className="colorPrimary">
        {selectedGroups.length
          ? selectedGroups.length === 1
            ? _.get(selectedGroups[0], 'extra.isProject')
              ? _l('所有同事')
              : selectedGroups[0].value
            : _l('已选择 %0 项', selectedGroups.length)
          : _l('选择分享范围')}
      </span>
      {!hideIcon && <Icon icon="arrow-down-border" className="textTertiary" />}
    </DefaultChildWrap>
  );
  const triggerNode = React.isValidElement(childElement)
    ? React.cloneElement(
        childElement,
        getMergedTriggerEventHandlers(
          childElement.props,
          childTriggerEvents,
          children ? { className: cx(childElement.props.className, className) } : {},
        ),
      )
    : childElement;

  return (
    <Popover
      align={mergedAlign}
      arrow={arrow}
      destroyOnHidden={mergedDestroyOnHidden}
      getPopupContainer={getPopupContainer}
      open={!!mergedVisible}
      onOpenChange={handleOpenChange}
      placement={mergedPlacement}
      noPadding
      styles={{
        ..._.omit(styles, 'body'),
        container: { ...styles.body, ...styles.container },
      }}
      trigger={trigger}
      zIndex={zIndex}
      content={
        <SelectGroup
          {...selectGroupProps}
          defaultValue={selectedValue}
          everyoneOnly={everyoneOnly}
          key={projectId || 'all'}
          lockedValue={initialSelectionValue}
          projectId={projectId}
          value={externalValue}
          onClose={handleClose}
          onChange={handleChange}
        />
      }
    >
      {triggerNode}
    </Popover>
  );
}

export function SelectGroupPopover(props) {
  const [visible, setVisible] = useState(false);

  return (
    <SelectGroupPopoverContent
      {...props}
      key={props.projectId === undefined ? 'all' : props.projectId}
      uncontrolledVisible={visible}
      setUncontrolledVisible={setVisible}
    />
  );
}

SelectGroupPopover.propTypes = {
  align: object,
  arrow: any,
  children: any,
  className: string,
  destroyOnHidden: bool,
  destroyPopupOnHide: bool,
  getPopupContainer: func,
  onBlur: func,
  onClick: func,
  onClose: func,
  onContextMenu: func,
  onFocus: func,
  onMouseDown: func,
  onMouseEnter: func,
  onMouseLeave: func,
  onMouseMove: func,
  onMouseUp: func,
  onOpenChange: func,
  offset: object,
  open: bool,
  placement: string,
  styles: object,
  trigger: any,
  zIndex: number,
};

SelectGroup.propTypes = {
  minHeight: number,
  projectId: string, // 单独渲染该网络
  isAll: bool, // 上是否显示所有同事
  isMe: bool, // 显示我自己
  filterDisabledGroup: bool, // 过滤掉到期网络或群组
  everyoneOnly: bool, // 选择所有同事是否与选择群组互斥
  onSave: func, //关闭保存
  onClose: func, //关闭
};
