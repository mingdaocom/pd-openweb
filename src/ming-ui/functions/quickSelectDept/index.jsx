import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useClickAway, useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { any, bool, func, number, object, string } from 'prop-types';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import { Popover } from 'ming-ui/antd-components';
import NoData from 'ming-ui/functions/dialogSelectUser/GeneralSelect/NoData';
import departmentController from 'src/api/department';
import {
  findDepartmentPathById,
  findDepartmentById as getDepartmentById,
  formatDepartmentTree as getDepartmentTree,
  formatSearchDepartmentTree as getSearchDepartmentTree,
} from 'src/utils/domain/project/department';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { createControllableOpenHandler, getMergedTriggerEventHandlers } from 'src/utils/platform/react/interaction';
import { checkPermission } from 'src/utils/services/security/permission';
import dialogSelectDept from '../dialogSelectDept';

const PAGE_SIZE = 100;
const DEFAULT_IDS = [];

const DeptSelectWrap = styled.div`
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
  .selectDepartmentContent {
    padding: 4px 8px;
    .quick-department {
      height: 36px;
      display: flex;
      align-items: center;
      padding: 0 4px;
      box-sizing: border-box;
      border-radius: 3px;
      &.active {
        .quick-department_content {
          background: rgba(33, 150, 243, 0.1) !important;
        }
      }
      .rotateDept {
        transform: rotate(-90deg);
      }
      .expendWrap {
        width: 20px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 2px;
        border-radius: 3px;
        &:hover {
          background: var(--color-background-hover);
        }
        &.transparent {
          opacity: 0;
        }
      }
      .quick-department_content {
        height: 100%;
        border-radius: 3px;
        &:hover {
          background: var(--color-background-hover);
        }
      }
    }
  }
`;

export function DeptSelect(props) {
  const selectedDepartmentValue = props.selectedDepartment || DEFAULT_IDS;
  const {
    projectId = '',
    unique = true,
    fromAdmin = false,
    isAnalysis,
    returnCount,
    checkIncludeChilren = false,
    minHeight = 358,
    allPath,
    departrangetype = '0',
    appointedDepartmentIds = DEFAULT_IDS,
    appointedUserIds = DEFAULT_IDS,
    immediate = true,
    onClose = () => {},
    selectFn = () => {},
  } = props;

  const inputRef = useRef();
  const conRef = useRef();
  const requestRef = useRef();
  const searchRequestRef = useRef();
  const [
    {
      loading,
      keywords,
      selectedDepartment: internalSelectedDepartment,
      departmentMoreIds,
      list,
      rootPageIndex,
      rootPageAll,
      rootLoading,
      allList,
    },
    setState,
  ] = useSetState({
    rootPageIndex: 1,
    rootPageAll: false,
    rootLoading: false,
    loading: true,
    keywords: '',
    selectedDepartment: selectedDepartmentValue,
    departmentMoreIds: [],
    showProjectAll: false,
    activeIds: [],
    activeIndex: 0,
  });
  const selectedDepartment =
    immediate && _.has(props, 'selectedDepartment') ? selectedDepartmentValue : internalSelectedDepartment;
  const dataRef = useRef({ keywords, list, rootPageIndex });
  const appointedDepartmentIdsKey = JSON.stringify(appointedDepartmentIds.filter(Boolean));
  const appointedUserIdsKey = JSON.stringify(appointedUserIds.filter(Boolean));
  const requestAppointedDepartmentIds = React.useMemo(
    () => safeParse(appointedDepartmentIdsKey, 'array'),
    [appointedDepartmentIdsKey],
  );
  const requestAppointedUserIds = React.useMemo(() => safeParse(appointedUserIdsKey, 'array'), [appointedUserIdsKey]);

  const projectInfo =
    ((md.global.Account.projects || []).filter(project => project.projectId === props.projectId).length &&
      md.global.Account.projects.filter(project => project.projectId === props.projectId)[0]) ||
    {};

  const getDepartmentPath = React.useCallback(
    dept => {
      const pathData = findDepartmentPathById(list || [], dept.departmentId) || [];

      return pathData
        .filter(item => item.departmentId !== dept.departmentId)
        .map((item, index) => ({
          departmentId: item.departmentId,
          departmentName: item.departmentName,
          depth: index + 1,
        }));
    },
    [list],
  );

  const onSelect = React.useCallback(
    value => {
      const selected = value || selectedDepartment;
      selectFn.call(
        null,
        _.map(
          selected.filter(o => !o.checkIncludeChilren || o.departmentId.indexOf('orgs_') > -1),
          dept => ({
            departmentId: dept.departmentId,
            departmentName: dept.departmentName,
            haveSubDepartment: dept.haveSubDepartment,
            userCount: dept.userCount,
            ...(allPath ? { departmentPath: getDepartmentPath(dept) } : {}),
          }),
        ),
        checkIncludeChilren
          ? _.map(
              selected.filter(o => o.checkIncludeChilren && o.departmentId.indexOf('orgs_') < 0),
              dept => ({
                departmentId: dept.departmentId,
                departmentName: dept.departmentName,
                haveSubDepartment: dept.haveSubDepartment,
                userCount: dept.userCount,
                ...(allPath ? { departmentPath: getDepartmentPath(dept) } : {}),
              }),
            )
          : null,
      );
    },
    [allPath, checkIncludeChilren, getDepartmentPath, selectFn, selectedDepartment],
  );

  useClickAway(conRef, () => {
    onSelect();
    onClose(true);
  });

  useEffect(() => {
    dataRef.current = { keywords, list, rootPageIndex };
  }, [keywords, list, rootPageIndex]);

  const fetchData = React.useCallback(() => {
    const currentData = dataRef.current;
    const currentKeywords = currentData.keywords;
    const currentList = currentData.list || [];
    const currentRootPageIndex = currentData.rootPageIndex;
    setState({ loading: true });
    const isAdmin = projectId && checkPermission(projectId, PERMISSION_ENUM.DEPARTMENT) && fromAdmin;

    if (requestRef.current) {
      requestRef.current.abort();
    }

    const getTree = currentKeywords ? getSearchDepartmentTree : getDepartmentTree;
    let param = {
      projectId,
      returnCount,
      [isAnalysis && departrangetype === '0' ? 'keyword' : 'keywords']: currentKeywords.trim(),
      includeDisabled: false,
    };
    const usePageDepartment = !currentKeywords;

    if (usePageDepartment) {
      param.pageIndex = currentRootPageIndex;
      param.pageSize = PAGE_SIZE;
    }

    if (departrangetype !== '0') {
      param.appointedDepartmentIds = requestAppointedDepartmentIds;
      param.appointedUserIds = requestAppointedUserIds;
      param.rangeTypeId = [10, 20, 30][departrangetype - 1];
    }

    const request =
      departmentController[
        departrangetype !== '0'
          ? 'appointedDepartment'
          : isAnalysis && isAdmin
            ? 'pagedProjectDepartmentTrees'
            : isAnalysis
              ? 'pagedDepartmentTrees'
              : isAdmin
                ? 'searchProjectDepartment2'
                : 'searchDepartment2'
      ](param);
    requestRef.current = request;
    request
      .then(res => {
        if (requestRef.current !== request) return;

        let showProjectAll = true;
        let data = res;

        if (isAnalysis || departrangetype !== '0') {
          data = res;
        } else if (!isAdmin) {
          showProjectAll = !res.item1;
          data = res.item2;
        }

        let nextList = !usePageDepartment
          ? getTree(data)
          : usePageDepartment && currentRootPageIndex <= 1
            ? getTree(data)
            : currentList.concat(getTree(data));

        if (departrangetype === '3') {
          nextList = nextList.map(l => ({
            ...l,
            disabled: requestAppointedDepartmentIds.includes(l.departmentId),
          }));
        }

        const states = !currentKeywords
          ? {
              allList: nextList,
            }
          : {
              rootPageIndex: 1,
              departmentMoreIds: [],
            };

        setState({
          list: nextList,
          activeIds: !_.isEmpty(nextList) ? [nextList[0].departmentId] : [],
          loading: false,
          rootLoading: false,
          rootPageAll: usePageDepartment && (nextList.length % PAGE_SIZE > 0 || data.length <= 0),
          showProjectAll,
          ...states,
        });
      })
      .catch(() => {
        if (requestRef.current !== request) return;

        setState({
          loading: false,
          rootLoading: false,
        });
      });
  }, [
    departrangetype,
    fromAdmin,
    isAnalysis,
    projectId,
    requestAppointedDepartmentIds,
    requestAppointedUserIds,
    returnCount,
    setState,
  ]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const searchRequest = _.debounce(fetchData, 500);
    searchRequestRef.current = searchRequest;

    return () => {
      searchRequest.cancel();
    };
  }, [fetchData]);

  useEffect(() => {
    searchRequestRef.current && searchRequestRef.current();
  }, [fetchData, keywords]);

  const fetchSubDepartment = id => {
    let departmentTree = [...list];
    let department = getDepartmentById(departmentTree, id);
    const { subDepartments = [] } = department;

    if (!department.haveSubDepartment) {
      return false;
    }

    let isForMore = !!localStorage.getItem('parentId');

    if (!department.open || isForMore) {
      if (subDepartments.length && !isForMore) {
        department.open = true;
      } else {
        let param = {
          projectId: projectId,
          includeDisabled: false,
        };
        let moreData = departmentMoreIds.find(o => o.departmentId === department.departmentId);
        let pageIndex = moreData ? moreData.pageIndex + 1 : 1;
        param =
          location.href.indexOf('admin') > -1
            ? {
                ...param,
                pageIndex,
                pageSize: PAGE_SIZE,
                parentId: department.departmentId,
              }
            : {
                ...param,
                pageIndex,
                pageSize: PAGE_SIZE,
                departmentId: department.departmentId,
                returnCount: returnCount,
              };

        departmentController[
          isAnalysis && location.href.indexOf('admin') > -1
            ? 'pagedProjectDepartmentTrees'
            : isAnalysis
              ? 'pagedDepartmentTrees'
              : location.href.indexOf('admin') > -1
                ? 'pagedSubDepartments'
                : 'getProjectSubDepartmentByDepartmentId'
        ](param).then(data => {
          localStorage.removeItem('parentId');
          department.subDepartments =
            pageIndex > 1
              ? department.subDepartments.concat(getDepartmentTree(data, department.departmentId))
              : getDepartmentTree(data, department.departmentId);
          department.open = true;
          setMoreList(department.departmentId, data.length < PAGE_SIZE);
          setState({
            list: departmentTree,
          });
        });
        return false;
      }
    } else {
      department.open = false;
    }

    setState({
      list: departmentTree,
    });
  };

  const setMoreList = (departmentId, isDelete) => {
    let moreData = departmentMoreIds.find(o => o.departmentId === departmentId);

    if (isDelete) {
      setState({
        departmentMoreIds: departmentMoreIds.filter(o => o.departmentId !== departmentId),
      });
    } else {
      if (moreData) {
        setState({
          departmentMoreIds: departmentMoreIds.map(o => {
            if (o.departmentId !== departmentId) {
              return o;
            } else {
              return { ...o, pageIndex: moreData.pageIndex + 1 };
            }
          }),
        });
      } else {
        setState({
          departmentMoreIds: departmentMoreIds.concat({ departmentId: departmentId, pageIndex: 1 }),
        });
      }
    }
  };

  const toggle = (department, notIncludeChilren) => {
    const departmentIndex = _.findIndex(list, { departmentId: department.departmentId });

    if (!_.isUndefined(departmentIndex)) {
      setState({
        activeIndex: departmentIndex,
        activeIds: [department.departmentId],
      });
    }

    department = checkIncludeChilren
      ? {
          ...department,
          checkIncludeChilren:
            notIncludeChilren === true
              ? false
              : department.checkIncludeChilren === undefined
                ? true
                : department.checkIncludeChilren,
        }
      : department;
    if (selectedDepartment.filter(dept => dept.departmentId === department.departmentId).length) {
      immediate && selectFn(unique ? [] : [department], true);
      setState({
        selectedDepartment: unique
          ? []
          : _.filter(selectedDepartment, dept => dept.departmentId !== department.departmentId),
      });
    } else {
      if (unique) {
        setState({
          selectedDepartment: [department],
        });
        onSelect([department]);
        onClose(true);
      } else {
        let selectedDepartments = _.cloneDeep(selectedDepartment);

        if (checkIncludeChilren) {
          if (department.departmentId === 'orgs_' + projectInfo.projectId) {
            //选中的是组织
            selectedDepartments = [];
          } else {
            selectedDepartment.map(o => {
              let l = findDepartmentPathById(allList, o.departmentId) || [];
              l = l.map(it => it.departmentId);
              if (l.includes(department.departmentId)) {
                selectedDepartments = selectedDepartments.filter(it => it.departmentId !== o.departmentId);
              }
            });
          }
        }

        immediate && onSelect([department]);
        setState({
          selectedDepartment: selectedDepartments.concat([department]),
        });
      }
    }
  };

  const handleSearch = evt => {
    setState({ keywords: evt.target.value });
  };

  const getIsIncludesByParent = department => {
    let _list = findDepartmentPathById(list, department.departmentId).map(o => o.departmentId);
    let isIncludesByParent = selectedDepartment.filter(
      o =>
        (_list.includes(o.departmentId) || o.departmentId.indexOf('orgs_') > -1) &&
        o.checkIncludeChilren &&
        o.departmentId !== department.departmentId,
    );
    return !!isIncludesByParent.length;
  };

  const getChecked = department => {
    let selectedDepartmentData = selectedDepartment.filter(item => item.departmentId === department.departmentId);
    return !!selectedDepartmentData.length || (checkIncludeChilren && getIsIncludesByParent(department));
  };

  const openDialog = () => {
    onClose();
    dialogSelectDept({
      ..._.pick(props, [
        'className',
        'title',
        'width',
        'unique',
        'projectId',
        'returnCount',
        'allPath',
        'selectFn',
        'showCreateBtn',
        'includeProject',
        'showCurrentUserDept',
        'allProject',
        'checkIncludeChilren',
        'isAnalysis',
        'fromAdmin',
        'departrangetype',
        'appointedDepartmentIds',
        'appointedUserIds',
        'onClose',
      ]),
    });
  };

  const onExpend = item => {
    if (!item.haveSubDepartment) return;
    fetchSubDepartment(item.departmentId);
  };

  const toogleDepargmentSelect = item => {
    if (item.disabled) return;
    toggle(item);
  };

  const renderList = data => {
    return (
      <div className="QSelect-departmentList">
        {data.map(item => {
          const checked = getChecked(item);
          return (
            <React.Fragment key={item.departmentId}>
              <div className={cx('quick-department', { active: checked, disabled: !!item.disabled })}>
                {departrangetype !== '1' && (
                  <div
                    className={cx('quick-arrow', {
                      'GSelect-arrow--transparent': !item.haveSubDepartment,
                      pointer: item.haveSubDepartment,
                    })}
                  >
                    <span
                      className={cx('expendWrap', { transparent: !item.haveSubDepartment })}
                      onClick={() => onExpend(item)}
                    >
                      <Icon
                        icon="task_custom_btn_unfold"
                        className={cx('textTertiary Hand Font12', { rotateDept: !item.open })}
                      />
                    </span>
                  </div>
                )}
                <div
                  className="flex valignWrapper Hand quick-department_content overflow_ellipsis"
                  onClick={() => toogleDepargmentSelect(item)}
                >
                  <div className={cx('quick-department__name mLeft4 overflow_ellipsis w100')}>
                    {item.departmentName}
                  </div>
                  {checked && <Icon icon="done" className="colorPrimary Font13 mRight13" />}
                </div>
              </div>
              {!item.haveSubDepartment || !item.open ? null : (
                <div className="mLeft12">{renderList(item.subDepartments)}</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    if (loading && rootPageIndex <= 1) {
      return <LoadDiv />;
    } else if (list && list.length) {
      return (
        <React.Fragment>
          {renderList(list)}
          {!keywords && !rootPageAll && (
            <span
              className="mLeft24 Hand moreBtn"
              onClick={() => {
                const nextRootPageIndex = rootPageIndex + 1;
                dataRef.current = { ...dataRef.current, rootPageIndex: nextRootPageIndex };
                setState({
                  rootPageIndex: nextRootPageIndex,
                  rootLoading: true,
                });
                fetchData();
              }}
            >
              {rootLoading && <LoadDiv size="small" />}
              {rootLoading ? _l('加载中') : _l('更多')}
            </span>
          )}
        </React.Fragment>
      );
    } else {
      return <NoData>{keywords ? _l('搜索无结果') : _l('无结果')}</NoData>;
    }
  };

  return (
    <DeptSelectWrap id="quickSelectDept" ref={conRef}>
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
        {keywords && (
          <Icon icon="cancel" className="Font16 mLeft4 textTertiary hand" onClick={() => setState({ keywords: '' })} />
        )}
        {departrangetype === '0' && (
          <Icon icon="department" className="Hand textSecondary hoverColorPrimary Font18" onClick={openDialog} />
        )}
      </div>
      <ScrollView className="quickDeptContent" style={{ height: minHeight }}>
        <div className="selectDepartmentContent">{renderContent()}</div>
      </ScrollView>
    </DeptSelectWrap>
  );
}

export const DeptSelectPopover = forwardRef(function DeptSelectPopover(props, ref) {
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
    ...deptSelectProps
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
      content={<DeptSelect {...deptSelectProps} onClose={handleClose} />}
    >
      {triggerNode}
    </Popover>
  );
});

DeptSelectPopover.propTypes = {
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
