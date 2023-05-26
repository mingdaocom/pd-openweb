import React, { Fragment, useRef, useEffect, useState, useCallback } from 'react';
import { useClickAway } from 'react-use';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import Trigger from 'rc-trigger';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { LoadDiv } from 'ming-ui';

import { Con, Content, UserList, Search, Tabs } from './Comps';

import { getUsers, getAccounts } from './util';

export function UserSelector(props) {
  const {
    projectId,
    staticAccounts = [], // 静态显示用户，传值时不在走接口取数据
    includeUndefinedAndMySelf = false,
    includeSystemField = false, // 是否显示系统字段
    prefixOnlySystemField = false,
    filterAccountIds = [], // 过滤的账户
    prefixAccountIds = [], // 指定置顶的用户id
    prefixAccounts = [], // 指定置顶的用户对象
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
  const isStatic = !_.isEmpty(staticAccounts);
  const baseArgs = {
    filterAccountIds: filterAccountIds.filter(_.identity),
    prefixAccountIds,
    selectRangeOptions,
    projectId: projectId || _.get(props, 'SelectUserSettings.projectId'),
    appId,
    includeUndefinedAndMySelf,
    includeSystemField,
    mentionedCount: count,
    hidePortalCurrentUser,
    filterOtherProject,
  };
  function loadList({ keywords, pageIndex = 1, clear = true, type } = {}) {
    if (isStatic) {
      return;
    }
    if (clear) {
      setList([]);
    }
    setLoading(true);
    getUsers({ ...baseArgs, type, keywords: (keywords || '').trim(), pageIndex }).then(data => {
      setList(l => l.concat(data));
      setLoading(false);
      if (_.isEmpty(data)) {
        setLoadOuted(true);
      }
    });
  }
  const debounceLoadList = useCallback(_.debounce(loadList, 200), []);
  let prefixUsers = prefixAccounts;
  let users = [];
  if (!isStatic && !keywords && !selectRangeOptions && activeTab !== 1) {
    const result = getAccounts({
      list: _.cloneDeep(list),
      includeUndefinedAndMySelf,
      includeSystemField,
      prefixOnlySystemField,
      filterAccountIds: filterAccountIds.filter(_.identity),
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
  } else {
    users = staticAccounts.concat(users);
  }
  function handleSelect(user) {
    const res = [_.pick(user, ['accountId', 'avatar', 'fullname', 'job'])];
    onSelect(res);
    selectCb(res);
    onClose();
  }
  useClickAway(conRef, e => {
    onClose(true);
  });
  useEffect(() => {
    loadList({ type });
  }, []);
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
            loadList({ type: newType, keywords: '' });
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
          if (e.key !== 'Escape') {
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
                .concat(users)[activeIndex];
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
              type={type}
              activeIndex={activeIndex}
              list={prefixUsers}
              onSelect={handleSelect}
              onShowMore={() => setHadShowMore(true)}
            />
            <hr />
          </Fragment>
        )}
        {!isStatic && type === 'normal' && !keywords && activeTab !== 1 && (
          <div className="moduleName">{_l('最常协作')}</div>
        )}
        {
          <UserList
            keywords={keywords}
            loading={loading}
            activeIndex={
              activeIndex - (hadShowMore ? prefixUsers.length : prefixUsers.length < 2 ? prefixUsers.length : 2)
            }
            type={type}
            list={
              isStatic && keywords
                ? users.filter(u => u.fullname.toLowerCase().indexOf(keywords.toLowerCase()) > -1)
                : users
            }
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

export function SelectWrapper(props) {
  const { offset = { top: 0, left: 0 }, zIndex = 1001 } = props;
  const [visible, setVisible] = useState(false);
  const popupOffset = [offset.left, offset.top];
  return (
    <Trigger
      zIndex={zIndex}
      popupVisible={visible}
      action={['click']}
      destroyPopupOnHide
      popupAlign={{
        offset: popupOffset,
        points: ['tl', 'bl'],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={
        <UserSelector
          {...props}
          onClose={force => {
            if (!force && props.isDynamic) {
              return;
            }
            if (_.isFunction(props.onClose)) {
              props.onClose();
            }
            setVisible(false);
          }}
        />
      }
      onPopupVisibleChange={setVisible}
    >
      {props.children}
    </Trigger>
  );
}

SelectWrapper.propTypes = {
  popupOffset: arrayOf(number),
};

export default function quickSelectUser(target, props = {}) {
  const panelWidth = 280;
  const panelHeight = 48 + (props.minHeight || 328);
  let targetLeft;
  let targetTop;
  let x = 0;
  let y = 0;
  let height = 0;
  const { offset = { top: 0, left: 0 }, zIndex = 1001 } = props;
  const $con = document.createElement('div');
  function setPosition() {
    if (_.isFunction(_.get(target, 'getBoundingClientRect'))) {
      const rect = target.getBoundingClientRect();
      height = rect.height;
      targetLeft = rect.x;
      targetTop = rect.y;
      x = targetLeft + (offset.left || 0);
      y = targetTop + height + (offset.top || 0);
      if (x + panelWidth > window.innerWidth) {
        x = targetLeft - 10 - panelWidth;
      }
      if (y + panelHeight > window.innerHeight) {
        y = targetTop - panelHeight - 4;
        if (y < 0) {
          y = 0;
        }
        if (targetTop < panelHeight) {
          x = targetLeft - 10 - panelWidth;
          if (x < panelWidth) {
            x = targetLeft + 10 + 36;
          }
        }
      }
      $con.style.position = 'absolute';
      $con.style.left = x + 'px';
      $con.style.top = y + 'px';
      $con.style.zIndex = zIndex;
    }
  }
  setPosition();
  document.body.appendChild($con);
  function destory() {
    ReactDOM.unmountComponentAtNode($con);
    if ($con.parentElement) {
      document.body.removeChild($con);
    }
  }
  ReactDOM.render(
    <UserSelector
      {...props}
      onClose={force => {
        if (!force && props.isDynamic) {
          setTimeout(setPosition, 100);
          return;
        }
        if (_.isFunction(props.onClose)) {
          props.onClose();
        }
        destory();
      }}
    />,
    $con,
  );
}
