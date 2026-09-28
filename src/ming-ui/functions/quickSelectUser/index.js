import React, { forwardRef, Fragment, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { useClickAway } from 'react-use';
import _ from 'lodash';
import { any, arrayOf, bool, func, number, object, shape, string } from 'prop-types';
import { LoadDiv } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import AntdConfigProvider from 'src/common/providers/theme/AntdConfigProvider';
import { createControllableOpenHandler, getMergedTriggerEventHandlers } from 'src/utils/platform/react/interaction';
import { Con, Content, Search, Tabs, UserList } from './Comps';
import { getAccounts, getUsers } from './util';

const DEFAULT_LIST = [];

export function UserSelector(props) {
  const {
    projectId,
    staticAccounts = DEFAULT_LIST, // 静态显示用户，传值时不在走接口取数据
    includeUndefinedAndMySelf = false,
    includeSystemField = false, // 是否显示系统字段
    prefixOnlySystemField = false,
    filterAccountIds = DEFAULT_LIST, // 过滤的账户
    selectedAccountIds = DEFAULT_LIST, // 已选择的用户
    prefixAccountIds = DEFAULT_LIST, // 指定置顶的用户id
    prefixAccounts = DEFAULT_LIST, // 指定置顶的用户对象
    isHidAddUser = false, // 隐藏选择通讯录入口
    selectRangeOptions = undefined, // 限制选择范围
    filterOtherProject = false, // 当对于 true,projectId不能为空，指定只加载某个网络的数据
    appId, // 外部门户需要
    minHeight = 328,
    tabType = 1, // 1: 常规 2: 外部门户 3: 常规和外部门户
    tabIndex, // 0: 常规 1: 外部用户
    count = 15,
    hidePortalCurrentUser = false, // 隐藏外部门户中当前用户
    // functions
    onClose = () => {}, // 关闭回调
    selectCb = () => {}, // 选中回调
    onSelect = () => {}, // 选中回调
  } = props;
  const conRef = useRef();
  const scrollRef = useRef();
  const loadedRequestRef = useRef();
  const loadListRef = useRef();
  const debounceLoadListRef = useRef();
  const requestIdRef = useRef(0);
  const selectedAccountIdsRef = useRef(selectedAccountIds);
  const [activeTab, setActiveTab] = useState(
    !_.isUndefined(tabIndex) ? tabIndex : tabType === 1 || tabType === 3 ? 0 : 1,
  );
  const [type, setType] = useState(selectRangeOptions ? 'range' : activeTab === 1 ? 'external' : 'normal');
  const [keywords, setKeywords] = useState();
  const [pageIndex, setPageIndex] = useState(1);
  const [loadOuted, setLoadOuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);
  const [hadShowMore, setHadShowMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const isStatic =
    !_.isEmpty(staticAccounts) && !(staticAccounts.length === 1 && _.get(staticAccounts, '0.accountId') === 'isEmpty');
  const resolvedProjectId = projectId || _.get(props, 'SelectUserSettings.projectId');
  const baseArgs = {
    filterAccountIds: filterAccountIds.concat(selectedAccountIds).filter(_.identity),
    prefixAccountIds,
    selectRangeOptions,
    projectId: resolvedProjectId,
    appId,
    includeUndefinedAndMySelf,
    includeSystemField,
    mentionedCount: count,
    hidePortalCurrentUser,
    filterOtherProject,
  };

  useEffect(() => {
    selectedAccountIdsRef.current = selectedAccountIds;
  }, [selectedAccountIds]);

  const loadList = React.useCallback(
    ({ keywords, pageIndex = 1, clear = true, type } = {}) => {
      if (isStatic) {
        setLoading(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (clear) {
        setList([]);
        setLoadOuted(false);
      }

      setLoading(true);
      getUsers({
        filterAccountIds: filterAccountIds.concat(selectedAccountIdsRef.current).filter(_.identity),
        prefixAccountIds,
        selectRangeOptions,
        projectId: resolvedProjectId,
        appId,
        includeUndefinedAndMySelf,
        includeSystemField,
        mentionedCount: count,
        hidePortalCurrentUser,
        filterOtherProject,
        type,
        keywords: (keywords || '').trim(),
        pageIndex,
      }).then(data => {
        if (requestIdRef.current !== requestId) return;

        setList(currentList => currentList.concat(data));
        setLoading(false);
        if (_.isEmpty(data)) {
          setLoadOuted(true);
        }
      });
    },
    [
      appId,
      count,
      filterAccountIds,
      filterOtherProject,
      hidePortalCurrentUser,
      includeSystemField,
      includeUndefinedAndMySelf,
      isStatic,
      prefixAccountIds,
      resolvedProjectId,
      selectRangeOptions,
    ],
  );

  useEffect(() => {
    loadListRef.current = loadList;
    const debounceLoadList = _.debounce(loadList, 200);
    debounceLoadListRef.current = debounceLoadList;

    return () => debounceLoadList.cancel();
  }, [loadList]);

  const debounceLoadList = React.useCallback(args => {
    debounceLoadListRef.current && debounceLoadListRef.current(args);
  }, []);
  let prefixUsers = prefixAccounts;
  let users = [];

  if (!isStatic && !keywords && !selectRangeOptions && activeTab !== 1) {
    const result = getAccounts({
      list: _.cloneDeep(list),
      includeUndefinedAndMySelf,
      includeSystemField,
      prefixOnlySystemField,
      filterAccountIds: filterAccountIds.concat(selectedAccountIds).filter(_.identity),
      prefixAccountIds,
      prefixAccounts,
    });
    prefixUsers = result.prefixUsers;
    users = result.users;
  } else {
    users = list;
  }

  if (type === 'external' || keywords) {
    prefixUsers = [];
  }

  if (!(type === 'external' && md.global.Account.isPortal)) {
    users = staticAccounts.concat(users);
  }

  const usersForUserList =
    isStatic && keywords ? users.filter(u => u.fullname.toLowerCase().indexOf(keywords.toLowerCase()) > -1) : users;

  function handleSelect(user) {
    const res = [_.pick(user, ['accountId', 'avatar', 'fullname', 'job'])];
    const isCancel = selectedAccountIds.includes(user.accountId);
    onSelect(res, isCancel);
    selectCb(res, isCancel);
    onClose();
  }

  useClickAway(conRef, e => {
    if (e.target instanceof Element && e.target.closest('.cellUsers, .userCardSite')) {
      return;
    }

    onClose(true);
  });
  useEffect(() => {
    const requestArgs = {
      appId,
      count,
      filterAccountIds,
      filterOtherProject,
      hidePortalCurrentUser,
      includeSystemField,
      includeUndefinedAndMySelf,
      isStatic,
      prefixAccountIds,
      projectId: resolvedProjectId,
      selectRangeOptions,
      type,
    };
    if (_.isEqual(loadedRequestRef.current, requestArgs)) return;

    loadedRequestRef.current = _.cloneDeep(requestArgs);
    loadListRef.current({ type });
  }, [
    appId,
    count,
    filterAccountIds,
    filterOtherProject,
    hidePortalCurrentUser,
    includeSystemField,
    includeUndefinedAndMySelf,
    isStatic,
    prefixAccountIds,
    resolvedProjectId,
    selectRangeOptions,
    type,
  ]);
  return (
    <Con
      ref={conRef}
      className="selectUserBox"
      onClick={() => {
        if (conRef.current && conRef.current.querySelector('input')) {
          conRef.current.querySelector('input').focus();
        }
      }}
    >
      {tabType === 3 && (
        <Tabs
          active={activeTab}
          onActive={value => {
            const newType = selectRangeOptions ? 'range' : value === 1 ? 'external' : 'normal';
            setType(newType);
            setActiveTab(value);
            setKeywords('');
          }}
        />
      )}
      <Search
        isHidAddUser={isHidAddUser || isStatic}
        type={type}
        keywords={keywords}
        parentProps={props}
        setKeywords={value => {
          setLoading(true);
          setPageIndex(1);
          setKeywords(value);
          debounceLoadList({ type, keywords: value });
        }}
        onKeyDown={e => {
          if (!_.includes(['Escape', 'Tab'], e.key)) {
            e.stopPropagation();
          }

          let newIndex;
          let selected;

          switch (e.key) {
            case 'ArrowUp':
              newIndex = activeIndex - 1;
              break;
            case 'ArrowDown':
              newIndex = activeIndex + 1;
              break;
            case 'Enter':
              selected = prefixUsers
                .slice(0, hadShowMore ? prefixUsers.length : prefixUsers.length < 2 ? prefixUsers.length : 2)
                .concat(usersForUserList)[activeIndex];
              if (selected) {
                handleSelect(selected);
              }

              break;
            case 'Escape':
              onClose(true);
              break;
            default:
              break;
          }

          if (newIndex < 0) {
            newIndex = 0;
          }

          if (!scrollRef.current) {
            return;
          }

          const listLength = scrollRef.current.querySelectorAll('.userItem').length;

          if (newIndex >= listLength) {
            newIndex = listLength - 1;
          }

          if (!_.isUndefined(newIndex)) {
            setActiveIndex(newIndex);
            const scrollContent = scrollRef.current;
            const item = scrollContent.querySelectorAll(`.userItem`)[newIndex];

            if (!item) return;

            if (newIndex > activeIndex) {
              if (item.offsetTop > scrollContent.offsetHeight + scrollContent.scrollTop) {
                scrollContent.scrollTop = scrollContent.scrollTop + 44;
              }
            } else if (item.offsetTop - 44 < scrollContent.scrollTop) {
              scrollContent.scrollTop = scrollContent.scrollTop - 44;
            }
          }
        }}
        onSelect={onSelect}
        onClose={onClose}
      />
      <Content
        ref={scrollRef}
        style={{ minHeight }}
        onWheel={e => {
          if (loading || type !== 'external' || loadOuted) {
            return;
          }

          const isDown = e.deltaY > 0;
          const $container = scrollRef.current;

          if (!$container) {
            return;
          }

          const containerHeight = $container.offsetHeight;
          const containerScrollHeight = $container.scrollHeight;
          const containerScrollTop = $container.scrollTop;
          const offsetBottom = containerScrollHeight - containerScrollTop - containerHeight;

          if (isDown && offsetBottom < 80) {
            setPageIndex(pageIndex + 1);
            setLoading(true);
            debounceLoadList({ type, clear: false, keywords, pageIndex: pageIndex + 1 });
          }
        }}
      >
        {!!prefixUsers.length && (
          <Fragment>
            <UserList
              showMore
              notShowCurrentUserName
              type={type}
              activeIndex={activeIndex}
              list={prefixUsers}
              onSelect={handleSelect}
              onShowMore={() => setHadShowMore(true)}
              projectId={baseArgs.projectId}
              selectedAccountIds={selectedAccountIds}
            />
            <hr />
          </Fragment>
        )}
        {!isStatic && type === 'normal' && !keywords && activeTab !== 1 && (
          <div className="moduleName">{_l('最常协作')}</div>
        )}
        {
          <UserList
            type={type}
            appId={appId}
            loading={loading}
            keywords={keywords}
            showManageBtn={!isStatic && type === 'normal' && activeTab !== 1}
            activeIndex={
              activeIndex - (hadShowMore ? prefixUsers.length : prefixUsers.length < 2 ? prefixUsers.length : 2)
            }
            list={usersForUserList}
            projectId={baseArgs.projectId}
            selectedAccountIds={selectedAccountIds}
            onClose={onClose}
            onSelect={handleSelect}
          />
        }
        {!isStatic && loading && <LoadDiv />}
      </Content>
    </Con>
  );
}

UserSelector.propTypes = {
  projectId: string,
  includeUndefinedAndMySelf: bool,
  includeSystemField: bool,
  prefixOnlySystemField: bool,
  isHidAddUser: bool, // 隐藏选择通讯录入口
  SelectUserSettings: shape({}), // 选择通讯录参数
  filterAccountIds: arrayOf(string), // 过滤的账户
  prefixAccountIds: arrayOf(string), // 指定置顶的用户
  prefixAccounts: arrayOf(string), // 指定置顶的用户
  selectedAccountIds: arrayOf(string), // 弹层已选择的用户
  selectRangeOptions: shape({
    appointedAccountIds: arrayOf(number),
    appointedDepartmentIds: arrayOf(number),
    appointedOrganizeIds: arrayOf(number),
  }), // 限制选择范围
  minHeight: number,
  tabType: number, // 1: 常规 2: 外部门户 3: 常规和外部门户
  tabIndex: number, // 0: 常规 1: 外部用户
  // functions
  onClose: func, // 关闭回调
  selectCb: func, // 选中回调(兼容老数据)
  onSelect: func, // 选中回调(用这个新的属性名)
};

export const UserSelectPopover = forwardRef(function UserSelectPopover(props, ref) {
  const {
    align,
    arrow = false,
    children,
    destroyOnHidden,
    getPopupContainer,
    isDynamic,
    offset,
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
    open,
    placement = 'bottomLeft',
    styles = {},
    trigger = 'click',
    zIndex,
    ...userSelectorProps
  } = props;
  const [visible, setVisible] = useState(false);
  const isControlled = _.has(props, 'open');
  const mergedVisible = isControlled ? open : visible;
  const mergedAlign = align || (offset ? { offset: [offset.left || 0, offset.top || 0] } : undefined);
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
  const triggerNode = React.isValidElement(children)
    ? React.cloneElement(children, getMergedTriggerEventHandlers(children.props, childTriggerEvents))
    : children;

  const handleOpenChange = createControllableOpenHandler({ isControlled, onOpenChange, setOpen: setVisible });

  const handleClose = force => {
    if (!force && isDynamic) return;

    handleOpenChange(false);
    onClose(force);
  };

  return (
    <Popover
      ref={ref}
      align={mergedAlign}
      arrow={arrow}
      destroyOnHidden={destroyOnHidden}
      getPopupContainer={getPopupContainer}
      open={!!mergedVisible}
      onOpenChange={handleOpenChange}
      placement={placement}
      noPadding
      styles={{
        ..._.omit(styles, 'body'),
        container: { ...styles.body, ...styles.container },
      }}
      trigger={trigger}
      zIndex={zIndex}
      content={<UserSelector {...userSelectorProps} onClose={handleClose} />}
    >
      {triggerNode}
    </Popover>
  );
});

UserSelectPopover.propTypes = {
  align: object,
  arrow: any,
  children: any,
  destroyOnHidden: bool,
  getPopupContainer: func,
  offset: object,
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
  open: bool,
  placement: string,
  styles: object,
  trigger: any,
  zIndex: number,
};

export default function quickSelectUser(target, props = {}) {
  const $con = document.createElement('div');
  let destroyed = false;

  function setPosition() {
    if (_.isFunction(_.get(target, 'getBoundingClientRect'))) {
      const rect = target.getBoundingClientRect();
      $con.style.left = `${rect.left}px`;
      $con.style.top = `${rect.bottom}px`;
    }
  }

  $con.style.position = 'fixed';
  $con.style.width = '0';
  $con.style.height = '0';
  $con.style.pointerEvents = 'none';
  setPosition();
  document.body.appendChild($con);
  window.addEventListener('resize', setPosition);
  window.addEventListener('scroll', setPosition, true);

  const root = createRoot($con);

  function destory() {
    if (destroyed) return;

    destroyed = true;
    window.removeEventListener('resize', setPosition);
    window.removeEventListener('scroll', setPosition, true);
    root.unmount();
    if ($con.parentNode) {
      $con.parentNode.removeChild($con);
    }
  }

  function close() {
    if (destroyed) return;

    if (_.isFunction(props.onClose)) {
      props.onClose();
    }

    destory();
  }

  root.render(
    <AntdConfigProvider>
      <BrowserRouter>
        <UserSelectPopover
          {...props}
          open
          trigger={[]}
          onOpenChange={visible => {
            if (!visible) close();
          }}
          onClose={close}
        >
          <span style={{ display: 'block', width: 0, height: 0 }} />
        </UserSelectPopover>
      </BrowserRouter>
    </AntdConfigProvider>,
  );

  return {
    destory,
  };
}
