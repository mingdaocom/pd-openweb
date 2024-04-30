import React from 'react';
import departmentController from 'src/api/department';
import { DepartmentList } from '../dialogSelectUser/GeneralSelect';
import NoData from 'ming-ui/functions/dialogSelectUser/GeneralSelect/NoData';
import { createEditDeptDialog } from 'src/pages/Admin/user/membersDepartments/structure/components/CreateEditDeptDialog';
import roleController from 'src/api/role';
import { Dialog, LoadDiv, Radio, Checkbox, FunctionWrap } from 'ming-ui';
import cx from 'classnames';
import './style.less';
import _ from 'lodash';

class DialogSelectDept extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      keywords: '',
      showCreateBtn: false,
      project:
        ((md.global.Account.projects || []).filter(project => project.projectId === props.projectId).length &&
          md.global.Account.projects.filter(project => project.projectId === props.projectId)[0]) ||
        {},
      selectedDepartment: props.selectedDepartment || [],
      pageSize: 100,
      departmentMoreIds: [],
      rootPageIndex: 1,
      rootPageAll: false,
      rootLoading: false,
      showProjectAll: false,
      activeIds: [],
      activeIndex: 0,
    };

    this.search = _.debounce(this.fetchData.bind(this), 500);
    this.handleKeydown = this.handleKeydown.bind(this);
  }
  promise = null;

  scroll = React.createRef();

  componentDidMount() {
    document.body.addEventListener('keydown', this.handleKeydown);
  }

  componentWillMount() {
    this.fetchData();
    // 判断权限显示创建部门弹层
    if (this.props.showCreateBtn) {
      roleController
        .isProjectAdmin({
          projectId: this.props.projectId,
        })
        .then(data => {
          if (data === true) {
            this.setState({
              showCreateBtn: true,
            });
          }
        });
    }
  }

  componentWillUnmount() {
    if (this.search && this.search.cancel) {
      this.search.cancel();
    }
    document.body.removeEventListener('keydown', this.handleKeydown);
  }

  handleKeydown(e) {
    if (!_.includes(['ArrowUp', 'ArrowDown', 'Enter'], e.key)) {
      return;
    }
    const { activeIds, activeIndex, list } = this.state;
    e.stopPropagation();
    e.preventDefault();
    if (e.key === 'Enter') {
      const department = list[activeIndex];
      if (department) {
        this.toggle(department);
      }
    } else {
      let newIndex;
      if (e.key === 'ArrowUp') {
        newIndex = activeIndex - 1;
      } else if (e.key === 'ArrowDown') {
        newIndex = activeIndex + 1;
      }
      const newActiveId = _.get(list, `${newIndex}.departmentId`);
      if (!_.isUndefined(newActiveId)) {
        this.setState({
          activeIds: [newActiveId],
          activeIndex: newIndex,
        });
        const itemHeight = 40.39;
        const $scroll = this.scroll.current;
        const itemTop = newIndex * itemHeight;
        if (newIndex > activeIndex) {
          if (itemTop + itemHeight > $scroll.scrollTop + $scroll.clientHeight) {
            $scroll.scrollTop = itemTop + 44 - $scroll.offsetHeight;
          }
        } else {
          if (itemTop < $scroll.scrollTop) {
            $scroll.scrollTop = itemTop;
          }
        }
      }
    }
  }

  getDepartmentPath(dept) {
    const pathData = this.getParentId(this.state.list, dept.departmentId);
    return pathData
      .filter(item => item.departmentId !== dept.departmentId)
      .map((item, index) => ({
        departmentId: item.departmentId,
        departmentName: item.departmentName,
        depth: index + 1,
      }));
  }

  selectFn() {
    const { selectedDepartment } = this.state;
    const { checkIncludeChilren, allPath } = this.props; //是否选择包含子集

    const selectFn = this.props.selectFn;
    selectFn.call(
      null,
      _.map(
        selectedDepartment.filter(o => !o.checkIncludeChilren || o.departmentId.indexOf('orgs_') > -1),
        dept => ({
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          haveSubDepartment: dept.haveSubDepartment,
          userCount: dept.userCount,
          ...(allPath ? { departmentPath: this.getDepartmentPath(dept) } : {}),
        }),
      ),
      checkIncludeChilren
        ? _.map(
            selectedDepartment.filter(o => o.checkIncludeChilren && o.departmentId.indexOf('orgs_') < 0),
            dept => ({
              departmentId: dept.departmentId,
              departmentName: dept.departmentName,
              haveSubDepartment: dept.haveSubDepartment,
              userCount: dept.userCount,
              ...(allPath ? { departmentPath: this.getDepartmentPath(dept) } : {}),
            }),
          )
        : null,
    );
  }

  getDepartmentTree(data, parentId) {
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
  }

  getSearchDepartmentTree(data) {
    return data.map(item => {
      let { departmentId, departmentName, userCount, haveSubDepartment, subDepartments = [] } = item;
      if (subDepartments.length) {
        subDepartments = this.getSearchDepartmentTree(subDepartments);
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
  }

  fetchData() {
    const { isAnalysis, fromAdmin = false, projectId } = this.props;
    this.setState({ loading: true });
    const isAdmin =
      projectId &&
      (_.find(md.global.Account.projects, project => project.projectId === projectId) || {}).isSuperAdmin &&
      fromAdmin;
    if (this.promise && _.isFunction(this.promise.abort)) {
      this.promise.abort();
    }
    let getTree;
    if (this.state.keywords) {
      getTree = this.getSearchDepartmentTree.bind(this);
    } else {
      getTree = this.getDepartmentTree.bind(this);
    }
    let searchParam = isAnalysis ? { keyword: this.state.keywords } : { keywords: this.state.keywords };
    let param = {
      projectId: this.props.projectId,
      returnCount: this.props.returnCount,
      ...searchParam,
    };
    let usePageDepartment = !this.state.keywords;
    param = usePageDepartment
      ? { ...param, pageIndex: this.state.rootPageIndex, pageSize: this.state.pageSize }
      : param;
    this.promise = departmentController[
      isAnalysis && isAdmin
        ? 'pagedProjectDepartmentTrees'
        : isAnalysis
        ? 'pagedDepartmentTrees'
        : isAdmin
        ? 'searchProjectDepartment2'
        : 'searchDepartment2'
    ](param)
      .then(data => {
        let showProjectAll = true;
        if (isAnalysis) {
          showProjectAll = true;
          data = data;
        } else if (!isAdmin) {
          showProjectAll = !data.item1;
          data = data.item2;
        }

        let list = !usePageDepartment
          ? getTree(data)
          : usePageDepartment && this.state.rootPageIndex <= 1
          ? getTree(data)
          : this.state.list.concat(getTree(data));
        let states = !this.state.keywords
          ? {
              allList: list,
            }
          : {
              rootPageIndex: 1,
              departmentMoreIds: [],
            };
        this.setState({
          list,
          activeIds: !_.isEmpty(list) ? [list[0].departmentId] : [],
          loading: false,
          rootLoading: false,
          rootPageAll: usePageDepartment && (list.length % this.state.pageSize > 0 || data.length <= 0),
          showProjectAll,
          ...states,
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          rootLoading: false,
        });
      });
  }

  getDepartmentById(departmentTree, id) {
    for (let i = 0; i < departmentTree.length; i++) {
      let department = departmentTree[i];
      if (department.departmentId === id) {
        return department;
      } else if (department.subDepartments.length) {
        let oDepartment = this.getDepartmentById(department.subDepartments, id);
        if (oDepartment) {
          return this.getDepartmentById(department.subDepartments, id);
        }
      }
    }
  }

  fetchSubDepartment(id) {
    let departmentTree = [...this.state.list];
    let department = this.getDepartmentById(departmentTree, id);
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
          projectId: this.props.projectId,
        };
        let moreData = this.state.departmentMoreIds.find(o => o.departmentId === department.departmentId);
        let pageIndex = moreData ? moreData.pageIndex + 1 : 1;
        param =
          location.href.indexOf('admin') > -1
            ? {
                ...param,
                pageIndex,
                pageSize: this.state.pageSize,
                parentId: department.departmentId,
              }
            : {
                ...param,
                pageIndex,
                pageSize: this.state.pageSize,
                departmentId: department.departmentId,
                returnCount: this.props.returnCount,
              };

        departmentController[
          this.props.isAnalysis && location.href.indexOf('admin') > -1
            ? 'pagedProjectDepartmentTrees'
            : this.props.isAnalysis
            ? 'pagedDepartmentTrees'
            : location.href.indexOf('admin') > -1
            ? 'pagedSubDepartments'
            : 'getProjectSubDepartmentByDepartmentId'
        ](param).then(data => {
          localStorage.removeItem('parentId');
          department.subDepartments =
            pageIndex > 1
              ? department.subDepartments.concat(this.getDepartmentTree(data, department.departmentId))
              : this.getDepartmentTree(data, department.departmentId);
          department.open = true;
          this.setMoreList(department.departmentId, data.length < this.state.pageSize);
          this.setState({
            list: departmentTree,
          });
        });
        return false;
      }
    } else {
      department.open = false;
    }
    this.setState({
      list: departmentTree,
    });
  }

  setMoreList = (departmentId, isDelete) => {
    const { departmentMoreIds = [] } = this.state;
    let moreData = departmentMoreIds.find(o => o.departmentId === departmentId);
    if (isDelete) {
      this.setState({
        departmentMoreIds: departmentMoreIds.filter(o => o.departmentId !== departmentId),
      });
    } else {
      if (moreData) {
        this.setState({
          departmentMoreIds: departmentMoreIds.map(o => {
            if (o.departmentId !== departmentId) {
              return o;
            } else {
              return { ...o, pageIndex: moreData.pageIndex + 1 };
            }
          }),
        });
      } else {
        this.setState({
          departmentMoreIds: departmentMoreIds.concat({ departmentId: departmentId, pageIndex: 1 }),
        });
      }
    }
  };

  getParentId = (list, id) => {
    for (let i in list) {
      if (list[i].departmentId == id) {
        return [list[i]];
      }
      if (list[i].subDepartments) {
        let node = this.getParentId(list[i].subDepartments, id);
        if (node !== undefined) {
          return node.concat(list[i]);
        }
      }
    }
  };

  toggle(department, notIncludeChilren) {
    const { selectedDepartment } = this.state;
    const { checkIncludeChilren } = this.props; //是否选择包含子集
    const departmentIndex = _.findIndex(this.state.list, { departmentId: department.departmentId });
    if (!_.isUndefined(departmentIndex)) {
      this.setState({
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
      if (this.props.unique) {
        this.setState({
          selectedDepartment: [],
        });
      } else {
        this.setState({
          selectedDepartment: _.filter(selectedDepartment, dept => dept.departmentId !== department.departmentId),
        });
      }
    } else {
      if (this.props.unique) {
        this.setState({
          selectedDepartment: [department],
        });
      } else {
        let selectedDepartments = _.cloneDeep(selectedDepartment);
        if (checkIncludeChilren) {
          if (department.departmentId === 'orgs_' + this.state.project.projectId) {
            //选中的是组织
            selectedDepartments = [];
          } else {
            selectedDepartment.map(o => {
              let l = this.getParentId(this.state.allList, o.departmentId) || [];
              l = l.map(it => it.departmentId);
              if (l.includes(department.departmentId)) {
                selectedDepartments = selectedDepartments.filter(it => it.departmentId !== o.departmentId);
              }
            });
          }
        }
        this.setState({
          selectedDepartment: selectedDepartments.concat([department]),
        });
      }
    }
  }

  onChangeSelectedOnly(department) {
    const { selectedDepartment } = this.state;
    if (selectedDepartment.filter(dept => dept.departmentId === department.departmentId).length) {
      this.setState({
        selectedDepartment: selectedDepartment.map(o => {
          if (department.departmentId === o.departmentId) {
            return {
              ...o,
              checkIncludeChilren: false,
            };
          } else {
            return o;
          }
        }),
      });
    } else {
      this.toggle(department, true);
    }
  }

  handleChange(evt) {
    const keywords = evt.target.value;
    this.setState({ keywords });
    this.search();
  }

  clearKeywords(evt) {
    this.setState({ keywords: '' });
  }

  renderContent() {
    const { activeIds } = this.state;
    if (this.state.loading && this.state.rootPageIndex <= 1) {
      return <LoadDiv />;
    } else if (this.state.list && this.state.list.length) {
      const { selectedDepartment, list, keywords, departmentMoreIds } = this.state;
      const props = {
        selectedDepartment,
        toogleDepargmentSelect: this.toggle.bind(this),
        toggleDepartmentList: this.fetchSubDepartment.bind(this),
        data: list,
        keywords: keywords,
        showUserCount: false,
        unique: this.props.unique,
        departmentMoreIds,
        checkIncludeChilren: this.props.checkIncludeChilren,
        treeData: list,
        onChangeSelectedOnly: this.onChangeSelectedOnly.bind(this),
      };
      let usePageDepartment = !this.state.keywords;

      return (
        <React.Fragment>
          <DepartmentList {...props} activeIds={activeIds} />
          {usePageDepartment && !this.state.rootPageAll && (
            <span
              className="mLeft24 Hand moreBtn"
              onClick={() => {
                this.setState(
                  {
                    rootPageIndex: this.state.rootPageIndex + 1,
                    rootLoading: true,
                  },
                  () => {
                    this.fetchData();
                  },
                );
              }}
            >
              {this.state.rootLoading && <LoadDiv size="small" />}
              {this.state.rootLoading ? _l('加载中') : _l('更多')}
            </span>
          )}
        </React.Fragment>
      );
    } else {
      const { keywords } = this.state;
      return <NoData>{keywords ? _l('搜索无结果') : _l('无结果')}</NoData>;
    }
  }

  renderResult() {
    return this.state.selectedDepartment.map(item => {
      let avatar = null;
      let id = null;
      let name = null;
      let deleteFn = () => {};
      avatar = (
        <div
          className={cx('GSelect-result-subItem__avatar', {
            'GSelect-result-subItem__avatar__onlySelf': this.props.checkIncludeChilren && !item.checkIncludeChilren,
          })}
        >
          <i className="icon-department1" />
        </div>
      );
      id = item.departmentId;
      name = item.departmentName;
      deleteFn = departmentId => {
        this.setState({
          selectedDepartment: _.filter(this.state.selectedDepartment, dept => dept.departmentId !== departmentId),
        });
      };
      return (
        <div className="GSelect-result-subItem" key={`subItem-${id}`}>
          {avatar}
          <div className="GSelect-result-subItem__name overflow_ellipsis">{name}</div>
          <div className="GSelect-result-subItem__remove " onClick={() => deleteFn(id)}>
            <span className="icon-close"></span>
          </div>
        </div>
      );
    });
  }

  getChecked() {
    return !!this.state.selectedDepartment.filter(item => item.departmentId === '').length;
  }

  getCurrentUserDeptChecked() {
    return !!this.state.selectedDepartment.filter(item => item.departmentId === 'user-departments').length;
  }

  getCurrentAllDeptChecked() {
    return !!this.state.selectedDepartment.filter(item => item.departmentId.indexOf('orgs_') > -1).length;
  }

  render() {
    const { title, width, onClose, className } = this.props;
    const { showProjectAll } = this.state;
    return (
      <Dialog
        visible
        type="scroll"
        title={title}
        width={width}
        className={cx('mobileDepartmentPickerDialog', className)}
        ref={dialog => {
          this.dialog = dialog;
        }}
        onCancel={onClose}
        onOk={() => {
          this.selectFn();
          onClose();
        }}
      >
        <div>
          <div className="selectDepartmentContainer">
            <div className="selectDepartmentContainer_search">
              <span className="searchIcon icon-search" />
              <input
                type="text"
                className="searchInput"
                placeholder={_l('搜索部门')}
                value={this.state.keywords}
                onChange={this.handleChange.bind(this)}
              />
              <span className="searchClose icon-closeelement-bg-circle" onClick={this.clearKeywords.bind(this)} />
            </div>
            {this.props.showCurrentUserDept && (
              <div
                className="mTop24 Font13 overflow_ellipsis Hand pBottom10"
                onClick={this.toggle.bind(this, {
                  departmentId: 'user-departments',
                  departmentName: _l('当前用户所在的部门'),
                })}
              >
                {this.props.unique ? (
                  <Radio
                    className="GSelect-department--checkbox mRight0"
                    checked={this.getCurrentUserDeptChecked()}
                    text={_l('当前用户所在的部门')}
                  />
                ) : (
                  <Checkbox
                    className="GSelect-department--checkbox"
                    checked={this.getCurrentUserDeptChecked()}
                    text={_l('当前用户所在的部门')}
                  />
                )}
              </div>
            )}
            {this.props.allProject && showProjectAll && (
              <div
                className="mTop24 Font13 overflow_ellipsis Hand pBottom10"
                onClick={this.toggle.bind(this, {
                  departmentId: 'orgs_' + this.state.project.projectId,
                  departmentName: _l('全组织'),
                })}
              >
                {this.props.unique ? (
                  <Radio
                    className="GSelect-department--checkbox mRight0"
                    checked={this.getCurrentAllDeptChecked()}
                    text={this.state.project.companyName || _l('全组织')}
                  />
                ) : (
                  <Checkbox
                    className="GSelect-department--checkbox"
                    checked={this.getCurrentAllDeptChecked()}
                    text={this.state.project.companyName || _l('全组织')}
                  />
                )}
              </div>
            )}
            {(() => {
              if (!this.state.project || (this.props.allProject && showProjectAll)) return null;
              if (!this.props.includeProject)
                return <div className="mTop12 Font13 overflow_ellipsis">{this.state.project.companyName}</div>;
              return (
                <div
                  className="mTop12 Font13 overflow_ellipsis Hand"
                  onClick={this.toggle.bind(this, { departmentId: '', departmentName: this.state.project.companyName })}
                >
                  {this.props.unique ? (
                    <Radio
                      className="GSelect-department--checkbox mRight0"
                      checked={this.getChecked()}
                      text={this.state.project.companyName}
                    />
                  ) : (
                    <Checkbox
                      className="GSelect-department--checkbox"
                      checked={this.getChecked()}
                      text={this.state.project.companyName}
                    />
                  )}
                </div>
              );
            })()}
            <div className="selectDepartmentContent" ref={this.scroll}>
              {this.renderContent()}
            </div>
            <div className="GSelect-result-box">{this.renderResult()}</div>
            {this.state.showCreateBtn && (
              <div
                className="selectDepartmentCreateBtn pointer ThemeColor3"
                onClick={() => {
                  createEditDeptDialog({
                    type: 'create',
                    projectId: this.props.projectId,
                    departmentId: '',
                    callback: dept => {
                      this.toggle(dept.response);
                      this.fetchData();
                    },
                  });
                  if (this.dialog && this.dialog.closeDialog) this.dialog.closeDialog();
                }}
              >
                {'+ ' + _l('创建部门')}
              </div>
            )}
          </div>
        </div>
      </Dialog>
    );
  }
}

export default function (opts) {
  const DEFAULTS = {
    title: _l('选择部门'),
    dialogBoxID: 'dialogSelectDept',
    projectId: '',
    selectedDepartment: [],
    unique: true,
    showCreateBtn: true,
    includeProject: false,
    checkIncludeChilren: false,
    allProject: false,
    selectFn: function (depts) {
      // console.log(depts);
    },
  };

  const options = _.extend({}, DEFAULTS, opts);

  const listProps = {
    className: options.className,
    title: options.title,
    width: options.displayType === 'mobile' ? '100%' : 480,
    unique: options.unique,
    projectId: options.projectId,
    returnCount: options.returnCount,
    allPath: options.allPath,
    selectedDepartment: options.selectedDepartment,
    selectFn: options.selectFn,
    showCreateBtn: options.showCreateBtn,
    includeProject: options.includeProject,
    showCurrentUserDept: options.showCurrentUserDept,
    allProject: options.allProject,
    checkIncludeChilren: options.checkIncludeChilren,
    isAnalysis: options.isAnalysis,
    fromAdmin: options.fromAdmin,
    onClose: options.onClose,
  };

  FunctionWrap(DialogSelectDept, { ...listProps });
}
