import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { useSetState } from 'react-use';
import departmentController from 'src/api/department';
import NoData from 'ming-ui/functions/dialogSelectUser/GeneralSelect/NoData';
import { LoadDiv, Icon, ScrollView } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { dialogSelectDept } from 'ming-ui/functions';
import { useClickAway } from 'react-use';
import { checkPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';

const PAGE_SIZE = 100;

const DeptSelectWrap = styled.div`
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
          background: #f5f5f5;
        }
        &.transparent {
          opacity: 0;
        }
      }
      .quick-department_content {
        height: 100%;
        border-radius: 3px;
        &:hover {
          background: #f5f5f5;
        }
      }
    }
  }
`;

export function DeptSelect(props) {
  const {
    projectId = '',
    title = _l('选择部门'),
    unique = true,
    fromAdmin = false,
    isAnalysis,
    returnCount,
    showCreateBtn = true,
    includeProject = false,
    checkIncludeChilren = false,
    allProject = false,
    minHeight = 358,
    allPath,
    departrangetype = '0',
    appointedDepartmentIds = [],
    appointedUserIds = [],
    data = [],
    immediate = true,
    onClose = () => {},
    selectFn = () => {},
  } = props;

  const inputRef = useRef();
  const conRef = useRef();
  const [
    {
      loading,
      keywords,
      selectedDepartment,
      departmentMoreIds,
      showProjectAll,
      activeIds,
      activeIndex,
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
    selectedDepartment: props.selectedDepartment || [],
    departmentMoreIds: [],
    showProjectAll: false,
    activeIds: [],
    activeIndex: 0,
  });

  const [project, setProject] = useState(
    ((md.global.Account.projects || []).filter(project => project.projectId === props.projectId).length &&
      md.global.Account.projects.filter(project => project.projectId === props.projectId)[0]) ||
      {},
  );
  let promiseFn = null;

  useClickAway(conRef, e => {
    onSelect();
    onClose(true);
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    search();
  }, [keywords]);

  useEffect(() => {
    if (!rootLoading) return;
    fetchData();
  }, [rootLoading]);

  const getDepartmentPath = dept => {
    const pathData = getParentId(list, dept.departmentId) || [];

    return pathData
      .filter(item => item.departmentId !== dept.departmentId)
      .map((item, index) => ({
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        depth: index + 1,
      }));
  };

  const onSelect = value => {
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
  };

  const getDepartmentTree = (data, parentId) => {
    return data.map(item => {
      let { departmentId, departmentName, userCount, haveSubDepartment, subDepartments = [] } = item;
      return {
        departmentId,
        departmentName,
        userCount,
        haveSubDepartment,
        open: subDepartments.length > 0,
        subDepartments,
        parentId,
      };
    });
  };

  const getSearchDepartmentTree = data => {
    return data.map(item => {
      let { departmentId, departmentName, userCount, haveSubDepartment, subDepartments = [] } = item;
      if (subDepartments.length) {
        subDepartments = getSearchDepartmentTree(subDepartments);
      }
      return {
        departmentId,
        departmentName,
        userCount,
        haveSubDepartment,
        open: subDepartments && subDepartments.length,
        subDepartments,
      };
    });
  };

  const fetchData = () => {
    setState({ loading: true });
    const isAdmin = projectId && checkPermission(projectId, PERMISSION_ENUM.MEMBER_MANAGE) && fromAdmin;
    if (promiseFn) {
      promiseFn.abort();
    }
    let getTree;
    if (keywords) {
      getTree = getSearchDepartmentTree;
    } else {
      getTree = getDepartmentTree;
    }

    let param = {
      projectId: projectId,
      returnCount: returnCount,
      [isAnalysis && departrangetype === '0' ? 'keyword' : 'keywords']: keywords.trim(),
    };
    let usePageDepartment = !keywords;

    if (usePageDepartment) {
      param.pageIndex = rootPageIndex;
      param.pageSize = PAGE_SIZE;
    }

    if (departrangetype !== '0') {
      param.appointedDepartmentIds = appointedDepartmentIds.filter(l => l);
      param.appointedUserIds = appointedUserIds.filter(l => l);
      param.rangeTypeId = [10, 20, 30][departrangetype - 1];
    }

    promiseFn = departmentController[
      departrangetype !== '0'
        ? 'appointedDepartment'
        : isAnalysis && isAdmin
        ? 'pagedProjectDepartmentTrees'
        : isAnalysis
        ? 'pagedDepartmentTrees'
        : isAdmin
        ? 'searchProjectDepartment2'
        : 'searchDepartment2'
    ](param)
      .then(data => {
        let showProjectAll = true;
        if (isAnalysis || departrangetype !== '0') {
          data = data;
        } else if (!isAdmin) {
          showProjectAll = !data.item1;
          data = data.item2;
        }

        let _list = !usePageDepartment
          ? getTree(data)
          : usePageDepartment && rootPageIndex <= 1
          ? getTree(data)
          : list.concat(getTree(data));

        if (departrangetype === '3') {
          _list = _list.map(l => ({ ...l, disabled: appointedDepartmentIds.includes(l.departmentId) }));
        }

        let states = !keywords
          ? {
              allList: _list,
            }
          : {
              rootPageIndex: 1,
              departmentMoreIds: [],
            };

        setState({
          list: _list,
          activeIds: !_.isEmpty(_list) ? [_list[0].departmentId] : [],
          loading: false,
          rootLoading: false,
          rootPageAll: usePageDepartment && (_list.length % PAGE_SIZE > 0 || data.length <= 0),
          showProjectAll,
          // selectedDepartment: selectedDepartment.concat()
          ...states,
        });
      })
      .catch(error => {
        setState({
          loading: false,
          rootLoading: false,
        });
      });
  };

  const search = _.debounce(fetchData, 500);

  const getDepartmentById = (departmentTree, id) => {
    for (let i = 0; i < departmentTree.length; i++) {
      let department = departmentTree[i];
      if (department.departmentId === id) {
        return department;
      } else if (department.subDepartments.length) {
        let oDepartment = getDepartmentById(department.subDepartments, id);
        if (oDepartment) {
          return getDepartmentById(department.subDepartments, id);
        }
      }
    }
  };

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

  const getParentId = (list, id) => {
    for (let i in list) {
      if (list[i].departmentId == id) {
        return [list[i]];
      }
      if (list[i].subDepartments) {
        let node = getParentId(list[i].subDepartments, id);
        if (node !== undefined) {
          return node.concat(list[i]);
        }
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
          if (department.departmentId === 'orgs_' + project.projectId) {
            //选中的是组织
            selectedDepartments = [];
          } else {
            selectedDepartment.map(o => {
              let l = getParentId(allList, o.departmentId) || [];
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
    let _list = getParentId(list, department.departmentId).map(o => o.departmentId);
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
            <React.Fragment>
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
                        className={cx('Gray_9e Hand Font12', { rotateDept: !item.open })}
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
                  {checked && <Icon icon="done_2" className="ThemeColor Font13 mRight13" />}
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
                setState({
                  rootPageIndex: rootPageIndex + 1,
                  rootLoading: true,
                });
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
        <Icon icon="search" className="searchIcon Gray_9e mRight8 Font18" />
        <input type="text" className="flex" ref={inputRef} value={keywords} placeholder={_l('搜索')} onChange={handleSearch} />
        {keywords && (
          <Icon
            icon="closeelement-bg-circle"
            className="Font16 mLeft4 Gray_9e hand"
            onClick={() => setState({ keywords: '' })}
          />
        )}
        {departrangetype === '0' && (
          <Icon icon="department" className="Hand Gray_75 Hover_21 Font18" onClick={openDialog} />
        )}
      </div>
      <ScrollView className="quickDeptContent" style={{ minHeight }}>
        <div className="selectDepartmentContent">{renderContent()}</div>
      </ScrollView>
    </DeptSelectWrap>
  );
}

export default function quickSelectDept(target, props = {}) {
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
    <DeptSelect
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
