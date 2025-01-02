import React, { Fragment, useRef, useEffect, useState, useCallback } from 'react';
import { useClickAway } from 'react-use';
import { arrayOf, bool, func, number, string } from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import styled from 'styled-components';
import { LoadDiv, ScrollView, Icon } from 'ming-ui';
import { dialogSelectOrgRole } from 'ming-ui/functions';
import organizeAjax from 'src/api/organize';
import { createRoot } from 'react-dom/client';

const RoleSelectWrap = styled.div`
  overflow: hidden;
  width: 360px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px 1px;
  .searchRoleWrap {
    padding: 0 16px;
    line-height: 40px;
    height: 40px;
    border-bottom: 1px solid #eaeaea;
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
      background: #f5f5f5;
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
    color: #151515;
    margin: 4px 0;
    padding: 0 17px;
    height: 44px;
    line-height: 44px;
    font-size: 13px;
    &:hover {
      background: #f5f5f5;
    }
    &.current {
      background: rgba(33, 150, 243, 0.1) !important;
    }
    .iconBox {
      width: 28px;
      height: 28px;
      display: inline-block;
      background: #67ac5c;
      text-align: center;
      vertical-align: middle;
      margin-right: 8px;
      line-height: 28px;
      color: #fff;
      border-radius: 50%;
    }
  }
  .splitLine {
    margin: 0 6px;
    width: 100%;
    height: 1px;
    background: #eaeaea;
    margin-bottom: 6px;
  }
`;

export function RoleSelect(props) {
  const {
    projectId = '',
    unique = false,
    minHeight = 358,
    appointedOrganizeIds = [],
    value = [],
    immediate = true,
    showCurrentOrgRole,
    onSave = () => {},
    onClose = () => {},
  } = props;
  const inputRef = useRef();
  const conRef = useRef();
  const [keywords, setKeywords] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(1);
  const [isMore, setIsMore] = useState(false);
  const [treeData, setTreeData] = useState([]);
  const [expendTreeNodeKey, setExpendTreeNodeKey] = useState([]);
  const [searchList, setSearchList] = useState([]);
  const [selectData, setSelectData] = useState(value);

  let promise = null;
  const isShowRole =
    !md.global.Account.isPortal && (md.global.Account.projects || []).some(it => it.projectId === projectId);

  useClickAway(conRef, e => {
    onSave(selectData);
    onClose(true);
  });

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
  }, []);

  useEffect(() => {
    if (!keywords) return;
    searchRequest();
  }, [keywords]);

  useEffect(() => {
    if (pageIndex < 2) return;
    fetchData();
  }, [pageIndex]);

  const fetchData = (groups, orgRoleGroupId, index) => {
    let treeList = _.cloneDeep(groups || treeData);
    const fetchPageIndex = index || pageIndex;

    let isShowRole =
      !md.global.Account.isPortal && (md.global.Account.projects || []).some(it => it.projectId === projectId);
    if (!isShowRole) {
      setLoading(false);
      return;
    }
    setIsMore(false);
    if (promise) {
      promise.abort();
    }
    promise = organizeAjax.getOrganizes({
      keywords,
      projectId,
      pageIndex: fetchPageIndex,
      pageSize: keywords ? 50 : 500,
      appointedOrganizeIds,
      orgRoleGroupId,
    });
    promise
      .then(result => {
        setLoading(false);
        if (keywords) {
          let list = fetchPageIndex === 1 ? result.list : searchList.concat(result.list);
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
      .catch(error => {
        setLoading(false);
      });
  };

  const searchRequest = _.debounce(fetchData, 200);

  const dialogSelectRole = () => {
    onClose();
    dialogSelectOrgRole({
      ..._.pick(props, [
        'projectId',
        'unique',
        'showCompanyName',
        'showCurrentOrgRole',
        'appointedOrganizeIds',
        'overlayClosable',
        'onSave',
        'onClose',
      ]),
    });
  };

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

    setPageIndex(pageIndex + 1);
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
          {checked && <Icon icon="done_2" className="ThemeColor" />}
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
          <div className="Gray_bd Font14">{_l('没有可选组织角色')}</div>
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
                className={cx('Gray_9e expendIcon Hand', {
                  expendIconRotate: !expendTreeNodeKey.includes(groupItem.orgRoleGroupId),
                })}
              />
              <span className="bold mLeft4 flex overflow_ellipsis">{groupItem.orgRoleGroupName}</span>
            </div>
          )}
          {renderChildren(groupItem)}
          {groupItem.hasMore && (
            <div
              className="roleItem Hand valignWrapper ThemeColor"
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
        <Icon icon="search" className="searchIcon Gray_9e mRight8 Font18" />
        <input
          type="text"
          className="flex"
          ref={inputRef}
          value={keywords}
          placeholder={_l('搜索')}
          onChange={handleSearch}
        />
        {keywords && (
          <Icon icon="closeelement-bg-circle" className="Font16 mLeft4 Gray_9e" onClick={() => setKeywords('')} />
        )}
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
            {checkedUserSelf() && <Icon icon="done_2" className="ThemeColor" />}
          </div>
          <div className="splitLine"></div>
        </Fragment>
      )}
      <ScrollView style={{ minHeight }} onScrollEnd={onScrollEnd}>
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

export default function quickSelectRole(target, props = {}) {
  const panelWidth = 360;
  const panelHeight = 41 + (props.minHeight || 358);
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

  const root = createRoot($con);

  function destory() {
    root.unmount();
    document.body.removeChild($con);
  }

  root.render(
    <RoleSelect
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
  );
}
