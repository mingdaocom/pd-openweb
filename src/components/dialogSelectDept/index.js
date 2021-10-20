const React = require('react');
const ReactDOM = require('react-dom');
const departmentController = require('src/api/department');
const DialogLayer = require('mdDialog').default;
const DepartmentList = require('src/components/GeneralSelect').DepartmentList;
const NoData = require('src/components/GeneralSelect/NoData').default;
const CreateDialog = require('src/pages/Admin/structure/modules/dialogCreateEditDept');
const roleController = require('src/api/role');
import { LoadDiv, Radio, Checkbox } from 'ming-ui';
import cx from 'classnames';

import './style.less';

class DialogSelectDept extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      keywords: '',
      showCreateBtn: false,
      project: md.global.Account.projects.filter(project => project.projectId === props.projectId)[0],
      selectedDepartment: props.selectedDepartment || [],
      pageSize: 100,
      departmentMoreIds: [],
      rootPageIndex: 1,
      rootPageAll: false,
      rootLoading: false,
    };

    this.search = _.debounce(this.fetchData.bind(this));
  }
  promise = null;

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

  componentWillUnMount() {
    if (this.search && this.search.cancel) {
      this.search.cancel();
    }
  }

  selectFn() {
    const { selectedDepartment } = this.state;
    const selectFn = this.props.selectFn;
    selectFn.call(
      null,
      _.map(selectedDepartment, dept => ({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        haveSubDepartment: dept.haveSubDepartment,
        userCount: dept.userCount,
      })),
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
    this.setState({ loading: true });
    if (this.promise && this.promise.state() === 'pending') {
      this.promise.abort();
    }
    let getTree;
    if (this.state.keywords) {
      getTree = this.getSearchDepartmentTree.bind(this);
    } else {
      getTree = this.getDepartmentTree.bind(this);
    }
    let param = {
      keywords: this.state.keywords,
      projectId: this.props.projectId,
      returnCount: this.props.returnCount,
    };
    let usePageDepartment = !this.state.keywords;
    param = usePageDepartment
      ? { ...param, pageIndex: this.state.rootPageIndex, pageSize: this.state.pageSize }
      : param;
    this.promise = departmentController[
      location.href.indexOf('admin') > -1 ? 'searchProjectDepartment2' : 'searchDepartment2'
    ](param)
      .done(data => {
        let list = !usePageDepartment
          ? getTree(data)
          : usePageDepartment && this.state.rootPageIndex <= 1
          ? getTree(data)
          : this.state.list.concat(getTree(data));
        let states = !this.state.keywords
          ? {}
          : {
              rootPageIndex: 1,
              departmentMoreIds: [],
            };
        this.setState({
          list,
          loading: false,
          rootLoading: false,
          rootPageAll: usePageDepartment && (list.length % this.state.pageSize > 0 || data.length <= 0),
          ...states,
        });
      })
      .fail(error => {
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
          location.href.indexOf('admin') > -1 ? 'pagedSubDepartments' : 'getProjectSubDepartmentByDepartmentId'
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

  toggle(department) {
    const { selectedDepartment } = this.state;
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
        this.setState({
          selectedDepartment: selectedDepartment.concat([department]),
        });
      }
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
    if (this.state.loading && this.state.rootPageIndex <= 0) {
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
      };
      let usePageDepartment = !this.state.keywords;

      return (
        <React.Fragment>
          <DepartmentList {...props} />
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
        <div className="GSelect-result-subItem__avatar">
          <i className="icon-organizational_structure" />
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
          <div className="GSelect-result-subItem__remove icon-minus" onClick={() => deleteFn(id)} />
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
    const dialogProps = this.props.dialogProps;
    dialogProps.container.yesFn = this.selectFn.bind(this);
    return (
      <DialogLayer
        {...dialogProps}
        // className={cx({ mobileDepartmentPickerDialog: this.props.displayType === 'mobile' })}
        className={cx('mobileDepartmentPickerDialog')}
        ref={dialog => {
          this.dialog = dialog;
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
            {this.props.allProject && (
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
                    text={_l('全组织')}
                  />
                ) : (
                  <Checkbox
                    className="GSelect-department--checkbox"
                    checked={this.getCurrentAllDeptChecked()}
                    text={_l('全组织')}
                  />
                )}
              </div>
            )}
            {(() => {
              if (!this.state.project) return null;
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
            <div className="selectDepartmentContent">{this.renderContent()}</div>
            <div className="GSelect-result-box">{this.renderResult()}</div>
            {this.state.showCreateBtn && (
              <div
                className="selectDepartmentCreateBtn pointer ThemeColor3"
                onClick={() => {
                  CreateDialog({
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
      </DialogLayer>
    );
  }
}

module.exports = function (opts) {
  const DEFAULTS = {
    title: _l('选择部门'),
    dialogBoxID: 'dialogSelectDept',
    projectId: '',
    selectedDepartment: [],
    unique: true,
    showCreateBtn: true,
    includeProject: false,
    allProject: false,
    selectFn: function (depts) {
      // console.log(depts);
    },
  };

  const options = _.extend({}, DEFAULTS, opts);
  const dialogProps = {
    dialogBoxID: options.dialogBoxID,
    oneScreen: false,
    oneScreenGap: 240,
    width: options.displayType === 'mobile' ? '100%' : 480,
    container: {
      header: options.title,
    },
  };
  const listProps = {
    unique: options.unique,
    projectId: options.projectId,
    returnCount: options.returnCount,
    selectedDepartment: options.selectedDepartment,
    selectFn: options.selectFn,
    showCreateBtn: options.showCreateBtn,
    includeProject: options.includeProject,
    showCurrentUserDept: options.showCurrentUserDept,
    allProject: options.allProject,
  };

  ReactDOM.render(<DialogSelectDept {...listProps} {...{ dialogProps }} />, document.createElement('div'));
};
