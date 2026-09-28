import React, { forwardRef, Fragment, useEffect, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { any, arrayOf, bool, func, number, object, string } from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import organizeAjax from 'src/api/organize';
import { createControllableOpenHandler, getMergedTriggerEventHandlers } from 'src/utils/platform/react/interaction';

const RoleSelectWrap = styled.div`
  overflow: hidden;
  width: 360px;
  .searchRoleWrap {
    padding: 0 16px;
    line-height: 40px;
    height: 40px;
    border-bottom: 1px solid var(--color-border-secondary);
    overflow: hidden;
    input {
      outline: none;
      border: none;
      margin-right: 12px;
    }
  }
  .groupItem,
  .roleItem {
    height: 36px;
    padding: 0 15px;
    line-height: 36px;
    .expendIcon.expendIconRotate {
      transform: rotate(-90deg);
      transform-origin: center center;
      transition: none;
      -webkit-transform: rotate(-90deg);
      -webkit-transform-origin: center center;
      -webkit-transition: none;
    }
    &:hover {
      background: var(--color-background-hover);
    }
    &.current {
      background: rgba(33, 150, 243, 0.1) !important;
    }
  }
  .emptyWrap {
    margin-top: 170px;
    text-align: center;
  }
  .selectCurrent {
    color: var(--color-text-title);
    margin: 4px 0;
    padding: 0 17px;
    height: 44px;
    line-height: 44px;
    font-size: 13px;
    &:hover {
      background: var(--color-background-hover);
    }
    &.current {
      background: rgba(33, 150, 243, 0.1) !important;
    }
    .iconBox {
      width: 28px;
      height: 28px;
      display: inline-block;
      background: var(--color-success);
      text-align: center;
      vertical-align: middle;
      margin-right: 8px;
      line-height: 28px;
      color: var(--color-white);
      border-radius: 50%;
    }
  }
  .splitLine {
    margin: 0 6px;
    width: 100%;
    height: 1px;
    background: var(--color-border-secondary);
    margin-bottom: 6px;
  }
`;

const DEFAULT_APPOINTED_ORGANIZE_IDS = [];

export function RoleSelect(props) {
  const {
    projectId = '',
    unique = false,
    minHeight = 358,
    appointedOrganizeIds = DEFAULT_APPOINTED_ORGANIZE_IDS,
    value = [],
    immediate = true,
    showCurrentOrgRole,
    onSave = () => {},
    onClose = () => {},
  } = props;
  const inputRef = useRef();
  const conRef = useRef();
  const requestRef = useRef();
  const searchRequestRef = useRef();
  const [keywords, setKeywords] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [isMore, setIsMore] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [expendTreeNodeKey, setExpendTreeNodeKey] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [internalSelectData, setSelectData] = useState(value);
  const selectData = immediate && _.has(props, 'value') ? value : internalSelectData;
  const dataRef = useRef({
    keywords,
    pageIndex,
    searchList,
    treeData,
  });
  const isShowRole =
    !md.global.Account.isPortal && (md.global.Account.projects || []).some(it => it.projectId === projectId);

  useClickAway(conRef, () => {
    onSave(selectData);
    onClose(true);
  });

  useEffect(() => {
    dataRef.current = {
      keywords,
      pageIndex,
      searchList,
      treeData,
    };
  }, [keywords, pageIndex, searchList, treeData]);

  const fetchData = React.useCallback(
    (groups, orgRoleGroupId, index) => {
      const currentData = dataRef.current;
      let treeList = _.cloneDeep(groups || currentData.treeData);
      const fetchPageIndex = index || currentData.pageIndex;
      const currentKeywords = currentData.keywords;

      let isShowRole =
        !md.global.Account.isPortal && (md.global.Account.projects || []).some(it => it.projectId === projectId);

      if (!isShowRole) {
        setLoading(false);
        return;
      }

      setIsMore(false);
      if (requestRef.current) {
        requestRef.current.abort();
      }

      requestRef.current = organizeAjax.getOrganizes({
        keywords: _.trim(currentKeywords),
        projectId,
        pageIndex: fetchPageIndex,
        pageSize: currentKeywords ? 50 : 500,
        appointedOrganizeIds,
        orgRoleGroupId,
      });
      requestRef.current
        .then(result => {
          setLoading(false);
          if (currentKeywords) {
            let list = fetchPageIndex === 1 ? result.list : currentData.searchList.concat(result.list);
            setSearchList(list);
            setIsMore(result.allCount > list.length);
            return;
          }

          if (appointedOrganizeIds.length) {
            result.list.forEach(l => {
              let index = _.findIndex(treeList, o => o.orgRoleGroupId === l.orgRoleGroupId);
              treeList[index].children.push(l);
              !treeList[index].fetched && (treeList[index].fetched = true);
            });
            treeList = treeList.filter(l => l.fetched);
            treeList[0] && setExpendTreeNodeKey([treeList[0].orgRoleGroupId]);
          } else {
            let index = _.findIndex(treeList, l => l.orgRoleGroupId === orgRoleGroupId);
            let list =
              fetchPageIndex === 1 ? result.list : _.unionBy(treeList[index].children, result.list, 'organizeId');
            treeList[index].children = list;
            treeList[index].fetched = true;
            treeList[index].hasMore = result.allCount > list.length;
            treeList[index].pageIndex = fetchPageIndex;
          }

          setTreeData(treeList);
        })
        .catch(() => {
          setLoading(false);
        });
    },
    [appointedOrganizeIds, projectId],
  );

  useEffect(() => {
    const searchRequest = _.debounce(fetchData, 200);
    searchRequestRef.current = searchRequest;

    return () => {
      searchRequest.cancel();
    };
  }, [fetchData]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    organizeAjax
      .getOrgRoleGroupsByProjectId({
        projectId,
      })
      .then(res => {
        let groups = [
          {
            orgRoleGroupName: _l('默认'),
            orgRoleGroupId: '',
          },
        ]
          .concat(res)
          .map(l => {
            return {
              ...l,
              children: [],
              fetched: false,
            };
          });
        !appointedOrganizeIds.length && setExpendTreeNodeKey([groups[0].orgRoleGroupId]);
        fetchData(groups, groups[0].orgRoleGroupId);
      });
  }, [appointedOrganizeIds.length, fetchData, projectId]);

  useEffect(() => {
    if (!keywords) return;
    searchRequestRef.current && searchRequestRef.current();
  }, [keywords]);

  const toggle = (item, checked) => {
    let selected = _.cloneDeep(selectData);

    if (!checked) {
      _.remove(selected, o => o.organizeId === item.organizeId);
    } else {
      selected = unique ? [item] : selected.concat(item);
    }

    const uniqueClose = unique && selected.length === 1;

    setSelectData(selected);
    (immediate || uniqueClose) && onSave(unique && !checked ? [] : [item], !checked);
    uniqueClose && onClose(true);
  };

  const handleExpend = groupItem => {
    const { orgRoleGroupId, fetched } = groupItem;

    if (expendTreeNodeKey.includes(orgRoleGroupId)) {
      setExpendTreeNodeKey(expendTreeNodeKey.filter(l => l !== orgRoleGroupId));
      return;
    }

    if (!fetched) {
      fetchData(undefined, orgRoleGroupId);
    }

    setExpendTreeNodeKey(expendTreeNodeKey.concat([orgRoleGroupId]));
  };

  const handleSearch = evt => {
    setKeywords(evt.target.value || '');
    setSearchList([]);
    setPageIndex(1);
  };

  const onScrollEnd = () => {
    if (!keywords || loading || !isMore) return;

    const nextPageIndex = pageIndex + 1;
    setPageIndex(nextPageIndex);
    fetchData(undefined, undefined, nextPageIndex);
  };

  const checkedUserSelf = () => !!_.find(selectData, o => o.organizeId === 'user-role');

  const renderChildren = groupItem => {
    if (groupItem && !expendTreeNodeKey.includes(groupItem.orgRoleGroupId)) return;

    const list = treeData.filter(l => l.orgRoleGroupId !== '' || l.children.length);
    const onlyOneGroup = list.length === 1 && (list[0].orgRoleGroupId === '' || appointedOrganizeIds.length);

    return (groupItem ? groupItem.children : searchList).map(roleItem => {
      const checked = !!_.find(selectData, o => o.organizeId === roleItem.organizeId);
      return (
        <div
          key={`roleItem-${roleItem.organizeId}-${roleItem.orgRoleGroupId}`}
          className={cx('roleItem Hand valignWrapper', {
            current: checked,
          })}
          onClick={() => toggle(roleItem, !checked)}
        >
          <span className={cx('flex overflow_ellipsis', { mLeft16: !keywords && !onlyOneGroup })}>
            {roleItem.organizeName}
          </span>
          {checked && <Icon icon="done" className="colorPrimary" />}
        </div>
      );
    });
  };

  const renderContent = () => {
    if (
      !treeData.length ||
      (treeData.length === 1 && treeData[0].orgRoleGroupId === '' && !treeData[0].children.length)
    ) {
      return (
        <div className="emptyWrap">
          <div className="textDisabled Font14">{_l('没有可选组织角色')}</div>
        </div>
      );
    }

    if (keywords && !searchList.length) {
      return (
        <div className="GSelect-NoData">
          <i className="icon-search GSelect-iconNoData" />
          <p className="GSelect-noDataText">{keywords ? _l('搜索无结果') : _l('无结果')}</p>
        </div>
      );
    }

    if (keywords) return renderChildren();

    const list = treeData.filter(l => l.orgRoleGroupId !== '' || l.children.length);

    return list.map(groupItem => {
      return (
        <Fragment key={`fragment-${groupItem.orgRoleGroupId}`}>
          {list.length === 1 && (groupItem.orgRoleGroupId === '' || appointedOrganizeIds.length) ? null : (
            <div
              className="groupItem Hand valignWrapper"
              key={`groupItem-${groupItem.orgRoleGroupId}`}
              onClick={() => handleExpend(groupItem)}
            >
              <Icon
                icon="task_custom_btn_unfold"
                className={cx('textTertiary expendIcon Hand', {
                  expendIconRotate: !expendTreeNodeKey.includes(groupItem.orgRoleGroupId),
                })}
              />
              <span className="bold mLeft4 flex overflow_ellipsis">{groupItem.orgRoleGroupName}</span>
            </div>
          )}
          {renderChildren(groupItem)}
          {groupItem.hasMore && (
            <div
              className="roleItem Hand valignWrapper colorPrimary"
              onClick={() => fetchData(undefined, groupItem.orgRoleGroupId, groupItem.pageIndex + 1)}
            >
              <span className={cx({ mLeft16: list.length > 1 })}>{_l('加载更多')}</span>
            </div>
          )}
        </Fragment>
      );
    });
  };

  return (
    <RoleSelectWrap ref={conRef} className="selectRoleDialog">
      <div className="searchRoleWrap valignWrapper">
        <Icon icon="search" className="searchIcon textTertiary mRight8 Font18" />
        <input
          type="text"
          className="flex"
          ref={inputRef}
          value={keywords}
          placeholder={_l('搜索')}
          onChange={handleSearch}
        />
        {keywords && <Icon icon="cancel" className="Font16 mLeft4 textTertiary" onClick={() => setKeywords('')} />}
      </div>
      {isShowRole && showCurrentOrgRole && (
        <Fragment>
          <div
            className={cx('selectCurrent Hand valignWrapper', { current: checkedUserSelf() })}
            onClick={() =>
              toggle(
                {
                  organizeId: 'user-role',
                  organizeName: _l('当前用户所在的组织角色'),
                },
                !checkedUserSelf(),
              )
            }
          >
            <span className="iconBox">
              <Icon icon="person" className="Font18 TxtMiddle" />
            </span>
            <span className="flex">{_l('当前用户所在的组织角色')}</span>
            {checkedUserSelf() && <Icon icon="done" className="colorPrimary" />}
          </div>
          <div className="splitLine"></div>
        </Fragment>
      )}
      <ScrollView style={{ height: minHeight }} onScrollEnd={onScrollEnd}>
        {loading ? <LoadDiv /> : renderContent()}
      </ScrollView>
    </RoleSelectWrap>
  );
}

RoleSelect.propTypes = {
  projectId: string,
  appointedOrganizeIds: arrayOf(string), // 指定角色
  showCompanyName: bool,
  showCurrentOrgRole: bool,
  minHeight: number,
  unique: bool,
  onSave: func, //关闭保存
  onClose: func, //关闭
};

export const RoleSelectPopover = forwardRef(function RoleSelectPopover(props, ref) {
  const {
    align,
    arrow = false,
    children,
    destroyOnHidden,
    getPopupContainer,
    onClose = () => {},
    onOpenChange = () => {},
    open,
    placement = 'bottomLeft',
    styles = {},
    trigger = 'click',
    zIndex,
    onBlur,
    onClick,
    onContextMenu,
    onFocus,
    onMouseDown,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    onMouseUp,
    ...roleSelectProps
  } = props;
  const [visible, setVisible] = useState(false);
  const isControlled = _.has(props, 'open');
  const mergedVisible = isControlled ? open : visible;
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
    handleOpenChange(false);
    onClose(force);
  };

  return (
    <Popover
      ref={ref}
      align={align}
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
      content={<RoleSelect {...roleSelectProps} onClose={handleClose} />}
    >
      {triggerNode}
    </Popover>
  );
});

RoleSelectPopover.propTypes = {
  align: object,
  arrow: any,
  children: any,
  destroyOnHidden: bool,
  getPopupContainer: func,
  onBlur: func,
  onClick: func,
  onContextMenu: func,
  onFocus: func,
  onMouseDown: func,
  onMouseEnter: func,
  onMouseLeave: func,
  onMouseMove: func,
  onMouseUp: func,
  onClose: func,
  onOpenChange: func,
  open: bool,
  placement: string,
  styles: object,
  trigger: any,
  zIndex: number,
};
