﻿import React, { Component, createRef, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Button, LoadDiv, ScrollView } from 'ming-ui';
import departmentController from 'src/api/department';
import groupController from 'src/api/group';
import structureController from 'src/api/structure';
import userController from 'src/api/user';
import { ChooseType, RenderTypes, UserTabsId } from './constant';
import DefaultUserList from './DefaultUserList';
import DepartmentGroupUserList from './DepartmentGroupUserList';
import DepartmentList from './DepartmentList';
import DepartmentTree from './DepartmentTree';
import ExtraUserList from './ExtraUserList';
import GDropdown from './GDropdown';
import NoData from './NoData';
import Result from './Result';
import './style.less';

const DefaultUserTabs = isNetwork => {
  return [
    {
      id: UserTabsId.CONACT_USER,
      name: _l('全部'), // 按姓氏拼音排序
      type: 1,
      page: true, // 是否分页
      actions: {
        getContactUsers: isNetwork ? userController.getProjectContactUserList : userController.getContactUserList,
      },
    },
    {
      id: UserTabsId.DEPARTMENT,
      name: _l('按部门'),
      type: 2,
      page: false,
      actions: {
        // 常规部门请求
        getDepartments: isNetwork
          ? departmentController.getProjectContactDepartments
          : departmentController.getContactProjectDepartments,
        // 只看与我有关的部门
        getDepartmentUsers: isNetwork
          ? departmentController.getProjectDepartmentUsers
          : departmentController.getDepartmentUsers,
      },
    },
    {
      id: UserTabsId.GROUP,
      name: _l('按群组'),
      type: 6,
      page: true,
      actions: {
        getGroups: groupController.getContactGroups,
        getGroupUsers: groupController.getGroupEffectUsers,
      },
    },
    {
      id: UserTabsId.SUBORDINATE_USER,
      name: _l('按下属'),
      type: 4,
      page: true,
      actions: {
        getUsers: structureController.getSubordinateUsers,
      },
    },
  ];
};

const SearchUserTabs = [
  {
    id: UserTabsId.RESIGNED,
    name: _l('已离职'),
    type: 7,
    page: true, // 是否分页
    actions: {
      getResigned: userController.getProjectResignedUserList,
    },
  },
];

const ResignedTab = {
  id: UserTabsId.RESIGNED,
  name: _l('已离职'),
  type: 7,
  page: true,
  actions: {
    getUsers: userController.getProjectResignedUserList,
  },
};

export default class GeneraSelect extends Component {
  static defaultProps = {
    chooseType: ChooseType.USER, // 默认选中的tab
    departmentSettings: {
      departments: [],
    },
  };

  constructor(props) {
    super(props);
    this.state = Object.assign(this.receiveProps(props), {
      /**
       * 选中的人
       * type selectedData = Array({
       *   type:  ChooseType
       *   data:  any;
       * })
       */
      selectedData: [
        ...props.departmentSettings.departments.map(department => ({ type: ChooseType.DEPARTMENT, data: department })),
      ],
    });

    this.boxRef = createRef(null);
  }

  /** 已经选中的联系人 */
  get selectedUsers() {
    let users = this.state.selectedData.filter(item => item.type === ChooseType.USER).map(item => item.data);
    return users;
  }

  /** 已经选中的部门 */
  get selectedDepartment() {
    let departments = this.state.selectedData
      .filter(item => item.type === ChooseType.DEPARTMENT)
      .map(item => item.data);
    return departments;
  }

  promiseObj = null; // 请求promise
  _scrollView = null; // ScrollView 的 ref
  _searchInput = null; // 搜索input
  userSettings = null;
  departmentSettings = null;

  handlePromise(promise) {
    if (this.promiseObj) {
      this.promiseObj.abort();
      this.promiseObj = '';
    }
    this.promiseObj = promise;
    return this.promiseObj;
  }

  componentWillReceiveProps(nextProps) {
    const needUpdate =
      nextProps.commonSettings.projectId !== this.commonSettings.projectId ||
      nextProps.commonSettings.dataRange !== this.commonSettings.dataRange;

    if (needUpdate) {
      let state = this.receiveProps(nextProps);

      this.setState(state, () => {
        this.defaultAction();
      });
    }
  }

  componentWillMount() {
    this.defaultAction();
  }

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown, false);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  updateEvent() {
    let page = false;
    if (this.state.chooseType === ChooseType.USER) {
      page = this.getTabItem().page;
    } else if (this.state.chooseType === ChooseType.RESIGNED) {
      page = this.state.haveMore;
    }

    if (this.promiseObj) return;

    if (page) {
      this.setState(
        {
          pageIndex: this.state.pageIndex + 1,
        },
        () => {
          this.defaultAction();
        },
      );
    }
  }

  getResultData() {
    const { mainData } = this.state;
    if (!mainData) {
      return [];
    }
    switch (mainData.renderType) {
      case RenderTypes.CONTACK_USER:
        const data = mainData.data || {};
        return ((data.oftenUsers || {}).list || []).concat((data.users || {}).list || []);
      case RenderTypes.RESIGNED:
      case RenderTypes.OTHER_USER:
        return (mainData.data || {}).list || [];
      default:
        return [];
    }
  }

  /**人员搜索结果上下键切换 */
  handleKeyDown = event => {
    if (this.promiseObj) {
      return false;
    }
    const { currentIndex, chooseType } = this.state;
    const flattenResult = this.getResultData();
    if (chooseType === ChooseType.USER && $('#dialogBoxSelectUser') && this.scrollView && flattenResult.length) {
      const { which, ctrlKey, metaKey } = event;
      if (which === 38) {
        this.setState(
          {
            currentIndex: currentIndex === -1 || currentIndex === 0 ? flattenResult.length - 1 : currentIndex - 1,
          },
          () => {
            this.adjustViewport('up', flattenResult);
          },
        );
      } else if (which === 40) {
        this.setState(
          {
            currentIndex: currentIndex === flattenResult.length - 1 ? 0 : currentIndex + 1,
          },
          () => {
            this.adjustViewport('down', flattenResult);
          },
        );
        // 单选 ctrl+回车自动提交
      } else if (ctrlKey && which == 13 && this.userSettings.unique) {
        this.submit();
      } else if (which == 13 && (metaKey || ctrlKey)) {
        // ⌘、Ctrl + 回车自动提交
        this.submit();
      } else if (which === 13 && this.state.currentIndex >= 0) {
        this.toogleUserSelect(flattenResult[this.state.currentIndex]);
      }
    }
  };

  adjustViewport(direction, flattenResult) {
    const { currentIndex } = this.state;
    const scrollViewEl = this.boxRef.current.querySelector('.GSelect-container');
    const $scrollViewEl = $(scrollViewEl);
    const current = flattenResult[currentIndex] || {};
    const $currentEl = $(`#GSelect-User-${current.accountId}`);

    if (!scrollViewEl && currentIndex === -1) {
      return;
    }
    if (direction === 'up') {
      if ($currentEl.position().top < 0 || $currentEl.position().top + $currentEl.height() >= $scrollViewEl.height()) {
        this.scrollView.scrollToElement($currentEl[0]);
      }
    } else if (direction === 'down') {
      if ($currentEl.position().top + $currentEl.height() >= $scrollViewEl.height()) {
        const { scrollTop, scrollHeight, maxScrollTop } = this.scrollView.getScrollInfo() || {};
        const bottom = scrollHeight - scrollTop - $currentEl.position().top - $currentEl.height();
        this.scrollView.scrollTo({ top: maxScrollTop - bottom });
      } else if ($currentEl.position().top < 0) {
        this.scrollView.scrollToElement($currentEl[0]);
      }
    }
  }

  getTabItem() {
    return this.userSettings.defaultTabs.filter(tab => tab.id === this.state.selectedUserTabId)[0];
  }

  /** 处理props */
  receiveProps(props) {
    const defaultCommonSettings = {
      projectId: '', // 网络ID  默认选中某个网络
      dataRange: 0, // 0 全部  1 好友 2 网络
      btnName: _l('确认'), // 按钮文字
      selectModes: props.commonSettings.selectModes || [ChooseType.USER],
      callback: () => {}, // 关闭时的回调
    };
    const defaultUserSettings = {
      _id: 0, // index for defaultTabs
      defaultTabs: DefaultUserTabs(props.commonSettings.isSuperWork),
      showTabs: ['conactUser', 'department', 'group', 'subordinateUser'],
      // 格式和defaultTabs一致,id和page可以为空
      // 方法请求的参数(pageIndex:int,pageSize:int,keywords string，filterAccountIds:[]，projectId string)
      // 返回结果listModel {list:[{accountId:'',avatar:'',fullname:'',department:''}],allCount:1}
      extraTabs: [],
      allowSelectNull: false, // 是否允许选择列表为空
      filterAccountIds: [],
      filterProjectId: '',
      filterFriend: false,
      filterResigned: true,
      unique: false, // 是否只可以选一个
      pageIndex: 1,
      pageSize: 50,
      isMore: true, // 当点击要过滤的用户时
    };

    const defaultDepartmentSettings = {
      disabledDepartmentIds: [],
      departmentIds: [],
    };

    this.commonSettings = $.extend(defaultCommonSettings, props.commonSettings || {});
    this.userSettings = $.extend(defaultUserSettings, props.userSettings || {});
    this.departmentSettings = $.extend(defaultDepartmentSettings, props.departmentSettings || {});
    // 兼容老组件，只有选择联系人时，默认不可以不选
    if (this.commonSettings.selectModes.length === 1 && this.commonSettings.selectModes[0] === ChooseType.USER) {
      this.userSettings.allowSelectNull = false;
    }

    let userSettings = this.userSettings;

    // 新添加的tab
    if (userSettings.extraTabs && userSettings.extraTabs.length) {
      userSettings.extraTabs.forEach(item => {
        userSettings.defaultTabs.push(item);
      });
    }
    let tabs = [];
    let { showTabs = [] } = userSettings;
    showTabs.forEach(id => {
      tabs = tabs.concat(userSettings.defaultTabs.filter(item => item.id === id));
    });
    userSettings.defaultTabs =
      !userSettings.filterResigned && !userSettings.hideResignedTab ? tabs.concat(ResignedTab) : tabs;

    let state = {
      /** 当期的选择类型 */
      chooseType: props.chooseType,
      /** 关键字 */
      keywords: '',
      /** 选择人员是否出现筛选 */
      isProject: this.checkIsProject(),
      /** 选择的用户筛选范围 */
      selectedUserTabId: userSettings.defaultTabs[0].id,
      /** 滚动分页 */
      pageSize: 50,
      pageIndex: 1,
      /** 联系人数据 */
      mainData: null,
      loading: false,
      haveMore: true,
      isSearch: false,
      currentIndex: -1,
    };
    return state;
  }

  /* ---------------------------------------------------------------------------------------------------
    -----------------------------------         内部方法        -----------------------------------------
    ---------------------------------------------------------------------------------------------------- */

  /** 检测选择人员中是否有按部门、群组下属的筛选 */
  checkIsProject() {
    return this.commonSettings.projectId !== '';
  }

  defaultAction() {
    if (this.state.chooseType === ChooseType.USER) {
      this.userAction();
    } else if (this.state.chooseType === ChooseType.DEPARTMENT) {
      this.departmentAction();
    } else if (this.state.chooseType === ChooseType.RESIGNED) {
      this.resignedAction();
    }
  }

  /** 请求联系人 */
  userAction = () => {
    const userSettings = this.userSettings;
    const commonSettings = this.commonSettings;
    let tabItem = userSettings.defaultTabs.filter(tab => tab.id === this.state.selectedUserTabId)[0];
    // 组建请求数据
    if (tabItem) {
      const reqData = {
        keywords: _.trim(this.state.keywords),
        projectId: commonSettings.projectId,
        dataRange: commonSettings.dataRange,
        filterAccountIds: userSettings.filterAccountIds,
        prefixAccountIds: userSettings.prefixAccountIds,
        filterFriend: userSettings.filterFriend,
        filterProjectId: userSettings.filterProjectId,
        includeUndefinedAndMySelf:
          tabItem.type === RenderTypes.CONTACK_USER ? userSettings.includeUndefinedAndMySelf : undefined,
        includeSystemField: tabItem.type === RenderTypes.CONTACK_USER ? userSettings.includeSystemField : undefined,
        includeMySelf: userSettings.includeMySelf,
      };

      if (tabItem.page) {
        reqData.pageIndex = this.state.pageIndex;
        reqData.pageSize = this.state.pageSize;
        if (!this.state.haveMore) {
          return false;
        }
      }

      let doAction = null;

      if (tabItem.type == RenderTypes.CONTACK_USER) {
        // 姓氏排名
        doAction = tabItem.actions.getContactUsers;
      } else if (tabItem.type == RenderTypes.DEPARTMENT_USER) {
        // 部门
        if (this.state.keywords) {
          doAction = tabItem.actions.getDepartments;
        } else {
          doAction =
            departmentController[commonSettings.isSuperWork ? 'pagedProjectDepartmentTrees' : 'pagedDepartmentTrees'];
          reqData.pageIndex = 1;
          reqData.pageSize = 100;
          reqData.parentId = '';
          reqData.onlyMyJoin = localStorage.getItem('isCheckedOnlyMyJoin')
            ? JSON.parse(localStorage.getItem('isCheckedOnlyMyJoin'))
            : false;
        }
      } else if (tabItem.type == RenderTypes.GROUP) {
        // 群组
        doAction = tabItem.actions.getGroups;
        reqData.searchGroupType = localStorage.getItem('isCheckedGroupOnlyMyJoin')
          ? safeParse(localStorage.getItem('isCheckedGroupOnlyMyJoin'))
            ? 1
            : 0
          : 1;
      } else {
        // 其他 全部属于 user类型
        doAction = tabItem.actions.getUsers;
      }

      if (!tabItem.page || reqData.pageIndex === 1) {
        // 初次加载显示loading
        this.setState({
          loading: true,
        });
      }
      this.handlePromise(doAction(reqData)).then(data => {
        if (tabItem.type === RenderTypes.DEPARTMENT_USER) {
          if (
            localStorage.getItem('isCheckedOnlyMyJoin') &&
            JSON.parse(localStorage.getItem('isCheckedOnlyMyJoin')) &&
            !this.state.keywords
          ) {
            this.setState({ defaultCheckedDepId: (!_.isEmpty(data) && data[0].departmentId) || null });
          }
        }
        let haveMore = true;
        if (reqData.pageIndex > 1) {
          let nowUserData = this.state.mainData;
          if (tabItem.type === RenderTypes.CONTACK_USER) {
            // 姓氏排名
            if (data.users.list.length < this.state.pageSize) {
              haveMore = false;
            }
            nowUserData.data.users.list = [...nowUserData.data.users.list, ...data.users.list];
            data = nowUserData.data;
          } else if (tabItem.type !== RenderTypes.DEPARTMENT_USER) {
            // 其他
            if (data.list.length < this.state.pageSize) {
              haveMore = false;
            }
            data.list = [...nowUserData.data.list, ...data.list];
          }
        }

        userSettings.filterSystemAccountId.forEach(id => {
          if (data.oftenUsers) {
            _.remove(data.oftenUsers.list, item => item.accountId === id);
          }
        });

        this.setState({
          mainData: {
            renderType: tabItem.type,
            data,
          },
          haveMore,
          loading: false,
          isSearch: false,
        });
        this.promiseObj = '';
      });
    }
  };

  /** 请求部门 */
  departmentAction() {
    const commonSettings = this.commonSettings;
    this.setState({
      loading: true,
    });
    let getTree;
    if (this.state.keywords) {
      getTree = this.getSearchDepartmentTree.bind(this);
    } else {
      getTree = this.getDepartmentTree.bind(this);
    }
    departmentController
      .searchDepartment({
        projectId: commonSettings.projectId,
        keywords: this.state.keywords,
      })
      .then(data => {
        this.setState({
          loading: false,
          mainData: {
            renderType: RenderTypes.DEPARTMENT,
            data: getTree(data),
          },
        });
      });
  }

  /** 请求群组 */
  groupAction() {
    let { pageSize, pageIndex, firstLetter, keywords } = this.state;
    if (!this.state.haveMore) {
      return false;
    }
    if (pageIndex === 1) {
      this.setState({
        loading: true,
      });
    }
    groupController
      .getGroupsSearch({
        projectId: this.commonSettings.projectId,
        pageSize: pageSize,
        pageIndex: pageIndex,
        firstLetter: firstLetter,
        keyword: keywords,
      })
      .then(data => {
        if (pageIndex > 1) {
          let normalGroupsList = [
            ...this.state.mainData.data.normalGroups.list,
            ...this.getGroupTree(data).normalGroups.list,
          ];
          let allCount = this.state.mainData.data.normalGroups.allCount;
          let haveMore = true;
          if (normalGroupsList.length === allCount) {
            haveMore = false;
          }
          this.setState({
            loading: false,
            mainData: {
              renderType: RenderTypes.GROUP,
              data: {
                normalGroups: {
                  allCount,
                  list: normalGroupsList,
                },
                sharedGroups: this.state.mainData.data.sharedGroups,
                haveMore,
              },
            },
          });
        } else {
          this.setState({
            loading: false,
            mainData: {
              renderType: RenderTypes.GROUP,
              data: this.getGroupTree(data),
            },
          });
        }
      });
  }

  /** 请求已离职 */
  resignedAction() {
    let { pageSize, pageIndex, keywords, mainData = {} } = this.state;
    if (!this.state.haveMore) {
      return false;
    }

    if (pageIndex === 1) {
      this.setState({
        loading: true,
      });
    }
    const resignedApi = userController.getProjectResignedUserList({
      projectId: this.commonSettings.projectId,
      pageSize: pageSize,
      pageIndex: pageIndex,
      keywords: keywords,
    });

    this.handlePromise(resignedApi).then(data => {
      let newData = {
        list: (mainData.renderType === RenderTypes.RESIGNED && pageIndex > 1
          ? (mainData.data || {}).list || []
          : []
        ).concat(data.list || []),
        allCount: data.allCount,
      };
      this.setState({
        haveMore: !data.list.length < this.state.pageSize,
        mainData: {
          renderType: RenderTypes.RESIGNED,
          data: newData,
        },
        loading: false,
        isSearch: false,
      });
      this.promiseObj = '';
    });
  }

  getOriginDepartment(list) {
    return list.map(group => ({
      departmentId: group.departmentId,
      departmentName: group.departmentName,
      haveSubDepartment: group.haveSubDepartment,
      userCount: group.userCount,
    }));
  }

  getDepartmentTree(data) {
    return data.map(item => {
      const { departmentId, departmentName, userCount, haveSubDepartment } = item;
      let disabled = false;
      if (this.departmentSettings.disabledDepartmentIds.indexOf(departmentId) >= 0) {
        disabled = true;
      }
      return {
        departmentId,
        departmentName,
        userCount,
        haveSubDepartment,
        open: false,
        disabled, // 是否禁用
        subDepartments: [],
      };
    });
  }

  getSearchDepartmentTree(data) {
    return data.map(item => {
      let { departmentId, departmentName, userCount, haveSubDepartment, subDepartments = [] } = item;
      if (subDepartments.length) {
        subDepartments = this.getSearchDepartmentTree(subDepartments);
      }
      let disabled = false;
      if (this.departmentSettings.disabledDepartmentIds.indexOf(departmentId) >= 0) {
        disabled = true;
      }
      return {
        departmentId,
        departmentName,
        userCount,
        haveSubDepartment,
        open: true,
        disabled,
        subDepartments,
      };
    });
  }

  /** 获取部门和群组的key值 */
  getKeys = tabId => {
    let ID = null;
    let NAME = null;
    let COUNT = null;
    switch (tabId) {
      case UserTabsId.DEPARTMENT:
        ID = 'departmentId';
        NAME = 'departmentName';
        COUNT = 'userCount';
        break;
      case UserTabsId.GROUP:
        ID = 'groupId';
        NAME = 'name';
        COUNT = 'groupMemberCount';
        break;
    }
    return {
      ID,
      NAME,
      COUNT,
    };
  };

  /** tabId换成renderType */
  getRenderTypeByTabId(tabId) {
    let renderType;
    if (tabId === UserTabsId.CONACT_USER) {
      renderType = RenderTypes.CONTACK_USER;
    } else if (tabId === UserTabsId.DEPARTMENT) {
      renderType = RenderTypes.DEPARTMENT_USER;
    } else if (tabId === UserTabsId.GROUP) {
      renderType = RenderTypes.GROUP;
    } else if (tabId === UserTabsId.RESIGNED) {
      renderType = RenderTypes.RESIGNED;
    } else {
      renderType = RenderTypes.OTHER_USER;
    }
    return renderType;
  }

  /**
   * 遍历部门树得到部门
   * @param {*部门树} departmentTree
   * @param {*部门id} id
   * @return {*部门} department
   */
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
  /* ---------------------------------------------------------------------------------------------------
    -----------------------------------         绑定方法        -----------------------------------------
    ---------------------------------------------------------------------------------------------------- */

  /** 成员修改筛选 */
  onChangeUserFilter = id => {
    this.setState(
      {
        selectedUserTabId: id,
        chooseType: ChooseType.USER,
        keywords: '',
        pageIndex: 1,
        currentIndex: -1,
        haveMore: true,
      },
      () => {
        this.userAction();
      },
    );
  };

  changeSelect(chooseType, data, idKey) {
    let selectedArr;
    switch (chooseType) {
      case ChooseType.USER:
        selectedArr = this.selectedUsers;
        break;
      case ChooseType.DEPARTMENT:
        selectedArr = this.selectedDepartment;
        break;
    }
    if (selectedArr.filter(item => item[idKey] === data[idKey]).length) {
      // 如果user里面有就反选
      this.deleteData(chooseType, data[idKey], idKey);
    } else {
      // 如果没有就选中
      this.addData(chooseType, data, idKey);
    }
  }

  /**
   * 改变联系人的选择状态
   * @param {*联系人实体} group
   */
  toogleUserSelect = user => {
    this.changeSelect(ChooseType.USER, user, 'accountId');
  };

  /**
   * 改变部门的选择状态
   * @param {*部门实体} department
   */
  toogleDepargmentSelect = department => {
    this.changeSelect(ChooseType.DEPARTMENT, department, 'departmentId');
  };

  /**
   * 删除一条选中的数据
   * @param {*选择类型} chooseType
   * @param {*实体id} id
   * @param {*实体的id的key} idKey
   */
  deleteData = (chooseType, id, idKey) => {
    let selectedArr = [...this.state.selectedData];
    selectedArr = selectedArr.filter(item => {
      if (item.type === chooseType) {
        return item.data[idKey] !== id;
      }
      return true;
    });
    this.setState({
      selectedData: selectedArr,
    });
  };

  /**
   * 添加一条选中的数据
   * @param {*选择类型} chooseType
   * @param {*实体} data
   */
  addData = (chooseType, data) => {
    let selectedArr = [...this.state.selectedData];
    if (chooseType === ChooseType.USER && this.userSettings.unique) {
      selectedArr = selectedArr.filter(item => {
        if (item.type === ChooseType.USER) {
          return false;
        }
        return true;
      });
    }
    selectedArr.push({
      type: chooseType,
      data,
    });
    this.setState({
      selectedData: selectedArr,
    });
    setTimeout(() => {
      if (this._resultScrollView) {
        this._resultScrollView.scrollTop = this._resultScrollView.scrollHeight;
      }
    }, 0);
  };

  /**
   * 打开或关闭部门列表
   * @param {*部门id} id
   */
  toggleDepartmentList = id => {
    let departmentTree = [...this.state.mainData.data];
    let department = this.getDepartmentById(departmentTree, id);
    if (!department.haveSubDepartment) {
      return false;
    }
    if (!department.open) {
      if (department.subDepartments.length) {
        department.open = true;
      } else {
        departmentController
          .getProjectSubDepartmentByDepartmentId({
            projectId: this.commonSettings.projectId,
            departmentId: department.departmentId,
          })
          .then(data => {
            department.subDepartments = this.getDepartmentTree(data);
            department.open = true;
            this.setState({
              mainData: {
                renderType: RenderTypes.DEPARTMENT,
                data: departmentTree,
              },
            });
          });
        return false;
      }
    } else {
      department.open = false;
    }
    this.setState({
      mainData: {
        renderType: RenderTypes.DEPARTMENT,
        data: departmentTree,
      },
    });
  };

  /** 改变字母筛选 */
  changeFirstLetter = () => {
    this.setState(
      {
        pageIndex: 1,
        haveMore: true,
      },
      () => this.userAction(),
    );
  };

  /** 搜索 */
  search = keywords => {
    const { showTabs = [] } = this.userSettings;
    if (!keywords) {
      this.closeSearch();
      return;
    }
    let selectedTabId =
      keywords &&
      _.includes([UserTabsId.CONACT_USER, UserTabsId.DEPARTMENT, UserTabsId.GROUP], this.state.selectedUserTabId)
        ? this.state.selectedUserTabId
        : UserTabsId.CONACT_USER;
    if (_.includes(showTabs, 'structureUsers')) {
      selectedTabId = 'structureUsers';
    } else if (_.includes(showTabs, 'ruleMember')) {
      selectedTabId = 'ruleMember';
    }
    this.setState(
      {
        keywords,
        pageIndex: 1,
        haveMore: true,
        currentIndex: -1,
        selectedUserTabId: selectedTabId,
        isSearch: true,
      },
      () => {
        this.searchDefault();
      },
    );
  };

  searchDefault = _.debounce(() => this.defaultAction(), 500);

  /** 关闭搜索 */
  closeSearch = () => {
    const { showTabs = [] } = this.userSettings;
    let selectedTabId = UserTabsId.CONACT_USER;
    if (_.includes(showTabs, 'structureUsers')) {
      selectedTabId = 'structureUsers';
    } else if (_.includes(showTabs, 'ruleMember')) {
      selectedTabId = 'ruleMember';
    }

    this.setState(
      {
        keywords: '',
        pageIndex: 1,
        currentIndex: -1,
        haveMore: true,
        chooseType: ChooseType.USER,
        selectedUserTabId: selectedTabId,
      },
      () => this.defaultAction(),
    );
  };

  /** 打开部门或群组联系人中的部门 */
  toggleUserItem = id => {
    let tabItem = this.userSettings.defaultTabs.filter(tab => tab.id === this.state.selectedUserTabId)[0];
    let { ID, COUNT } = this.getKeys(this.state.selectedUserTabId);
    let data = this.state.mainData.data;
    let group = null;
    data.list.forEach(item => {
      if (item[ID] === id) {
        group = item;
      }
    });
    if (group.open) {
      group.open = false;
      this.setState({
        mainData: {
          renderType: this.getRenderTypeByTabId(this.state.selectedUserTabId),
          data,
        },
      });
    } else if ((group.users || []).length === group[COUNT]) {
      group.open = true;
      this.setState({
        mainData: {
          renderType: this.getRenderTypeByTabId(this.state.selectedUserTabId),
          data,
        },
      });
    } else {
      let promiseObj = null;
      if (this.state.selectedUserTabId === UserTabsId.DEPARTMENT) {
        promiseObj = this.handlePromise(
          tabItem.actions.getDepartmentUsers({
            departmentId: id,
            keywords: '',
            filterAccountIds: this.userSettings.filterAccountIds,
            projectId: this.commonSettings.projectId,
          }),
        );
      } else {
        promiseObj = this.handlePromise(
          tabItem.actions.getGroupUsers({
            groupId: id,
            keywords: '',
            filterAccountIds: this.userSettings.filterAccountIds,
          }),
        );
      }
      promiseObj.then(req => {
        let list = null;
        if (this.state.selectedUserTabId === UserTabsId.DEPARTMENT) {
          list = req.list;
        } else {
          list = req;
        }
        data.list = data.list.map(item => {
          if (item[ID] === id) {
            item.users = list;
            item.open = true;
          }
          return item;
        });
        this.setState({
          mainData: {
            renderType: this.getRenderTypeByTabId(this.state.selectedUserTabId),
            data,
          },
        });
        this.promiseObj = '';
      });
    }
  };

  /** 全选部门或群组联系人 */
  allSelectUserItem = (id, checked) => {
    let tabItem = this.userSettings.defaultTabs.filter(tab => tab.id === this.state.selectedUserTabId)[0];
    let { ID, COUNT } = this.getKeys(this.state.selectedUserTabId);
    let data = this.state.mainData.data;
    let selectedData = this.state.selectedData;
    let group = null;
    data.list.forEach(item => {
      if (item[ID] === id) {
        group = item;
      }
    });
    const selectAll = list => {
      data.list = data.list.map(item => {
        if (item[ID] === id) {
          item.users = list;
          const _arr = selectedData.concat(
            (list || [])
              .filter(user => !_.includes(this.userSettings.selectedAccountIds, user.accountId))
              .map(user => {
                return {
                  type: ChooseType.USER,
                  data: user,
                };
              }),
          );
          selectedData = _.uniqBy(_arr, function ({ type, data: { accountId } }) {
            return type === ChooseType.USER && accountId;
          });
        }
        return item;
      });
      this.setState({
        mainData: {
          renderType: this.getRenderTypeByTabId(this.state.selectedUserTabId),
          data,
        },
        selectedData,
      });
    };

    if ((group.users || []).length < group[COUNT]) {
      let promiseObj = null;

      if (this.state.selectedUserTabId === UserTabsId.DEPARTMENT) {
        promiseObj = this.handlePromise(
          tabItem.actions.getDepartmentUsers({
            departmentId: id,
            keywords: '',
            filterAccountIds: this.userSettings.filterAccountIds,
            projectId: this.commonSettings.projectId,
          }),
        );
      } else {
        promiseObj = this.handlePromise(
          tabItem.actions.getGroupUsers({
            groupId: id,
            keywords: '',
            filterAccountIds: this.userSettings.filterAccountIds,
          }),
        );
      }

      promiseObj.then(req => {
        if (this.state.selectedUserTabId === UserTabsId.DEPARTMENT) {
          let { list = [] } = req;
          selectAll(list);
        } else {
          let list = req;
          selectAll(list);
        }

        this.promiseObj = '';
      });
    } else {
      let list = group.users;
      if (checked) {
        this.setState({
          selectedData: selectedData.filter(i => !_.find(list, l => l.accountId === _.get(i, 'data.accountId'))),
        });
      } else {
        selectAll(list);
      }
    }
  };

  changeChooseType = type => {
    this.setState(
      {
        chooseType: type,
        keywords: '',
        pageIndex: 1,
        currentIndex: -1,
        haveMore: true,
      },
      () => {
        this.defaultAction();
      },
    );
  };

  dropdownOnClick = () => {
    if (this.state.chooseType !== ChooseType.USER) {
      this.changeChooseType(ChooseType.USER);
      return false;
    }
    return true;
  };

  /** 提交 */
  submit = () => {
    let selectedUsers = this.selectedUsers;
    let selectedDepartments = this.selectedDepartment;
    let selectedResigned = this.selectedResigned;
    if (
      this.commonSettings.selectModes.indexOf('user') >= 0 &&
      !this.userSettings.allowSelectNull &&
      !selectedUsers.length
    ) {
      alert(_l('请选择用户'), 3);
      return;
    }
    let data = {
      users: [],
      departments: [],
      groups: [],
    };
    let params = this.commonSettings.selectModes.map(mode => {
      if (mode === ChooseType.USER) {
        let users = selectedUsers;
        data.users = users;
        return users;
      }
      if (mode === ChooseType.DEPARTMENT) {
        let departments = this.getOriginDepartment(selectedDepartments);
        data.departments = departments;
        return departments;
      }
      if (mode === ChooseType.RESIGNED) {
        let resigned = selectedResigned;
        data.resigned = selectedResigned;
        return resigned;
      }
      return null;
    });
    this.userSettings.callback(...params); // 兼容老的selectUsers回调
    this.commonSettings.callback(data);
  };
  /* ---------------------------------------------------------------------------------------------------
    --------------------------------------         渲染        ------------------------------------------
    ---------------------------------------------------------------------------------------------------- */

  refreshOftenUser = () => {
    const { commonSettings } = this.props;
    const { mainData } = this.state;

    userController
      .getOftenMetionedUser({
        count: 50,
        filterAccountIds: [_.get(md, 'global.Account.accountId')],
        includeUndefinedAndMySelf: this.userSettings.includeUndefinedAndMySelf,
        includeSystemField: this.userSettings.includeSystemField,
        prefixAccountIds: this.userSettings.prefixAccountIds,
        projectId: commonSettings.projectId,
      })
      .then(res => {
        const oftenUsersList = _.get(mainData, 'data.oftenUsers.list') || [];
        const newList = oftenUsersList
          .filter(l => ['user-undefined', _.get(md, 'global.Account.accountId')].includes(l.accountId))
          .concat(res);

        this.setState({
          mainData: {
            ...mainData,
            data: {
              ...mainData.data,
              oftenUsers: {
                list: _.unionBy(newList, 'accountId'),
              },
            },
          },
        });
      });
  };

  renderUsersList() {
    const { commonSettings } = this.props;
    let mainData = this.state.mainData;

    if (!mainData) {
      return null;
    }

    switch (mainData.renderType) {
      /** 渲染所有人列表 */
      case RenderTypes.CONTACK_USER:
        return (
          <DefaultUserList
            projectId={commonSettings.projectId}
            data={mainData.data}
            includeMySelf={this.userSettings.includeMySelf}
            includeUndefinedAndMySelf={this.userSettings.includeUndefinedAndMySelf}
            onChange={this.toogleUserSelect}
            selectedUsers={this.selectedUsers}
            keywords={this.state.keywords}
            currentIndex={this.state.currentIndex}
            selectedAccountIds={this.userSettings.selectedAccountIds}
            hideOftenUsers={this.userSettings.hideOftenUsers}
            hideManageOftenUsers={this.userSettings.hideManageOftenUsers}
            refreshOftenUser={this.refreshOftenUser}
            dialogSelectUser={this.props.dialogSelectUser}
          />
        );
      /** 渲染部门选人列表 */
      case RenderTypes.DEPARTMENT_USER:
        if (this.state.keywords) {
          return (
            <DepartmentGroupUserList
              projectId={commonSettings.projectId}
              data={mainData.data}
              onChange={this.toogleUserSelect}
              toggleUserItem={this.toggleUserItem}
              allSelectUserItem={this.allSelectUserItem}
              selectedUsers={this.selectedUsers}
              getKeys={this.getKeys}
              tabType={UserTabsId.DEPARTMENT}
              unique={this.userSettings.unique}
              keywords={this.state.keywords}
              selectedAccountIds={this.userSettings.selectedAccountIds}
            />
          );
        } else {
          return (
            <DepartmentTree
              isNetwork={commonSettings.isSuperWork}
              data={
                (_.isArray(mainData.data) &&
                  mainData.data.map(item => ({
                    ...item,
                    name: item.departmentName,
                    id: item.departmentId,
                    subs: [],
                  }))) ||
                []
              }
              onChange={this.toogleUserSelect}
              selectedUsers={this.selectedUsers}
              userSettings={this.userSettings}
              projectId={commonSettings.projectId}
              removeSelectedData={data => {
                let selectedArr = [...this.state.selectedData];
                this.setState({
                  selectedData: selectedArr.filter(item => !data.includes(item.data.accountId)),
                });
              }}
              unique={this.userSettings.unique}
              addSelectedData={data => {
                this.setState({
                  selectedData: this.state.selectedData.concat(data),
                });
              }}
              userAction={this.userAction}
              defaultCheckedDepId={this.state.defaultCheckedDepId}
              selectedAccountIds={this.userSettings.selectedAccountIds}
            />
          );
        }
      /** 渲染群组列表 */
      case RenderTypes.GROUP:
        return (
          <DepartmentGroupUserList
            projectId={commonSettings.projectId}
            data={mainData.data}
            onChange={this.toogleUserSelect}
            toggleUserItem={this.toggleUserItem}
            allSelectUserItem={this.allSelectUserItem}
            selectedUsers={this.selectedUsers}
            getKeys={this.getKeys}
            tabType={UserTabsId.GROUP}
            unique={this.userSettings.unique}
            keywords={this.state.keywords}
            userAction={this.userAction}
            selectedAccountIds={this.userSettings.selectedAccountIds}
          />
        );
      /** 渲染其他类型选人列表 */
      case RenderTypes.RESIGNED:
      case RenderTypes.OTHER_USER:
        return (
          <ExtraUserList
            projectId={commonSettings.projectId}
            data={mainData.data}
            onChange={this.toogleUserSelect}
            selectedUsers={this.selectedUsers}
            keywords={this.state.keywords}
            currentIndex={this.state.currentIndex}
            selectedAccountIds={this.userSettings.selectedAccountIds}
          />
        );
      default:
        return null;
    }
  }

  /** 用户已选择列表 */
  renderResult() {
    return this.state.selectedData.map(item => {
      let avatar = null;
      let id = null;
      let name = null;
      let deleteFn = () => {};
      switch (item.type) {
        case ChooseType.USER:
        case ChooseType.RESIGNED:
          avatar = <img src={(item.data || {}).avatar} alt="头像" className="GSelect-result-subItem__avatar" />;
          id = (item.data || {}).accountId;
          name = (item.data || {}).fullname;
          deleteFn = accountId => {
            this.deleteData(item.type, accountId, 'accountId');
          };
          break;
        case ChooseType.DEPARTMENT:
          avatar = (
            <div className="GSelect-result-subItem__avatar">
              <i className="icon-department" />
            </div>
          );
          id = (item.data || {}).departmentId;
          name = (item.data || {}).departmentName;
          deleteFn = departmentId => {
            this.deleteData(item.type, departmentId, 'departmentId');
          };
          break;
      }
      const props = {
        avatar,
        id,
        name,
        deleteFn,
      };
      return <Result {...props} key={id} />;
    });
  }

  /** 选择用户 */
  renderUsersContent() {
    return <div className="GSelect-usersContent h100">{this.renderUsersList()}</div>;
  }

  /** 选择部门 */
  renderDepartmentContent() {
    return (
      <div className="GSelect-departmentContent">
        {this.state.mainData.data && this.state.mainData.data.length ? (
          <DepartmentList
            data={this.state.mainData.data}
            toogleDepargmentSelect={this.toogleDepargmentSelect}
            toggleDepartmentList={this.toggleDepartmentList}
            selectedDepartment={this.selectedDepartment}
            keywords={this.state.keywords}
            DepartmentList={false}
          />
        ) : (
          <NoData>{this.state.keywords ? _l('无搜索结果') : _l('暂无成员')}</NoData>
        )}
      </div>
    );
  }

  getCount = tabId => {
    const { mainData: { data = {}, renderType } = {} } = this.state;
    const type = this.getRenderTypeByTabId(tabId);
    if (type === renderType) {
      if (tabId === UserTabsId.CONACT_USER) {
        const totalUsers = ((data.users || {}).list || []).concat((data.oftenUsers || {}).list || []);
        return _.uniqBy(totalUsers, 'accountId').length;
      } else if (tabId === UserTabsId.RESIGNED) {
        return data.allCount;
      } else if (tabId === UserTabsId.GROUP) {
        return (data.list || []).length;
      } else {
        return (data.list || []).length;
      }
    }
  };

  getDefaultSearchTabs = () => {
    return (this.userSettings.defaultTabs || []).filter(i =>
      _.includes([UserTabsId.CONACT_USER, UserTabsId.DEPARTMENT, UserTabsId.GROUP], i.id),
    );
  };

  renderTabs() {
    const { keywords } = this.state;

    if (keywords) {
      let searchTabs = this.getDefaultSearchTabs();
      if (!this.userSettings.filterResigned) {
        searchTabs = searchTabs.concat(SearchUserTabs);
      }
      return (
        <ul className="GSelect-head-search-navbar">
          {searchTabs.map(tab => (
            <li
              key={tab.id}
              onClick={() => {
                this.setState(
                  {
                    selectedUserTabId: tab.id,
                    chooseType: tab.id === UserTabsId.RESIGNED ? ChooseType.RESIGNED : ChooseType.USER,
                    pageIndex: 1,
                    currentIndex: -1,
                    haveMore: true,
                  },
                  () => {
                    this.defaultAction();
                  },
                );
              }}
              className={cx('GSelect-head-search-navbar__item', {
                'GSelect-head-search-navbar__item--active': this.state.selectedUserTabId === tab.id,
              })}
            >
              {tab.id === UserTabsId.CONACT_USER ? _l('成员') : tab.name}
              {!this.state.isSearch && !!this.getCount(tab.id) && (
                <span className="mLeft3">{this.getCount(tab.id)}</span>
              )}
            </li>
          ))}
        </ul>
      );
    } else {
      const userFilterData = this.userSettings.defaultTabs.map(tab => {
        return {
          text: tab.name,
          value: tab.id,
        };
      });
      let Tabs;

      if (this.commonSettings.selectModes.length === 1 && this.commonSettings.selectModes[0] === 'user') {
        // 选择成员模式
        Tabs = this.userSettings.defaultTabs.map(tab => (
          <li
            key={tab.id}
            onClick={() => this.onChangeUserFilter(tab.id)}
            className={cx('GSelect-head-navbar__item', {
              'GSelect-head-navbar__item--active': this.state.selectedUserTabId === tab.id,
            })}
          >
            {tab.name}
          </li>
        ));
      } else {
        // 其他模式
        let SelectUsers = (
          <GDropdown
            key="selectUsers"
            data={userFilterData}
            onChange={this.onChangeUserFilter}
            onClick={this.dropdownOnClick}
            value={this.state.selectedUserTabId}
            className={cx('GSelect-head-navbar__item', {
              'GSelect-head-navbar__item--active': this.state.chooseType === ChooseType.USER,
            })}
            renderValue="选择成员（{{value}}）"
          />
        );
        let SelectDepartments = (
          <li
            key="SelectDepartemnts"
            onClick={() => this.changeChooseType(ChooseType.DEPARTMENT)}
            className={cx('GSelect-head-navbar__item', {
              'GSelect-head-navbar__item--active': this.state.chooseType === ChooseType.DEPARTMENT,
            })}
          >
            {_l('选择部门')}
          </li>
        );
        let SelectGroups = (
          <li
            key="SelectGroups"
            onClick={() => this.changeChooseType(ChooseType.GROUP)}
            className={cx('GSelect-head-navbar__item ThemeBorderColor3', {
              'GSelect-head-navbar__item--active': this.state.chooseType === ChooseType.GROUP,
            })}
          >
            {_l('选择群组')}
          </li>
        );
        if (!this.state.isProject) {
          // 不显示联系人的筛选
          SelectUsers = (
            <li
              key="SelectUsers"
              onClick={() => this.changeChooseType(ChooseType.USER)}
              className={cx('GSelect-head-navbar__item', {
                'GSelect-head-navbar__item--active': this.state.chooseType === ChooseType.USER,
              })}
            >
              {_l('选择成员')}
            </li>
          );
          SelectGroups = SelectDepartments = null;
        }
        Tabs = this.commonSettings.selectModes.map(mode => {
          if (mode === ChooseType.USER) {
            return SelectUsers;
          } else if (mode === ChooseType.DEPARTMENT) {
            return SelectDepartments;
          } else if (mode === ChooseType.GROUP) {
            return SelectGroups;
          }
          return null;
        });
      }
      return <ul className="GSelect-head-navbar">{Tabs}</ul>;
    }
  }

  renderHead() {
    const { keywords } = this.state;
    return (
      <Fragment>
        <div className="GSelect-head-searchArea">
          <span className="icon-search searchIcon" />
          <input
            type="text"
            value={keywords}
            autoFocus
            onChange={event => this.search(event.target.value)}
            ref={searchInput => {
              this._searchInput = searchInput;
            }}
            placeholder={this.checkIsProject() ? _l('搜索用户 / 部门 / 群组') : _l('搜索用户')}
          />
          {keywords && (
            <div className="GSelect-head-searchArea--deleteIcon">
              <span className="icon-cancel " onClick={this.closeSearch} />
            </div>
          )}
        </div>
        {this.checkIsProject() && this.renderTabs()}
      </Fragment>
    );
  }

  renderContent() {
    if (this.state.loading) {
      return <LoadDiv />;
    }
    if (!this.state.mainData && !this.state.loading) {
      return null;
    }
    if (
      this.state.mainData.renderType === RenderTypes.CONTACK_USER ||
      this.state.mainData.renderType === RenderTypes.DEPARTMENT_USER ||
      this.state.mainData.renderType === RenderTypes.GROUP ||
      this.state.mainData.renderType === RenderTypes.RESIGNED ||
      this.state.mainData.renderType === RenderTypes.OTHER_USER
    ) {
      return this.renderUsersContent();
    } else if (this.state.mainData.renderType === RenderTypes.DEPARTMENT) {
      return this.renderDepartmentContent();
    }
  }

  render() {
    return (
      <div className="GSelect-box" ref={this.boxRef}>
        <div className="GSelect-head">{this.renderHead()}</div>
        <ScrollView
          className="GSelect-container"
          onScrollEnd={this.updateEvent.bind(this)}
          ref={scrollView => (this.scrollView = scrollView)}
        >
          {this.renderContent()}
        </ScrollView>
        <div
          className="GSelect-result"
          ref={scrollView => {
            this._resultScrollView = scrollView;
          }}
        >
          <div className="GSelect-result-box">{this.renderResult()}</div>
        </div>
        <div className="GSelect-footer-buttonBox">
          <div className="mRight24">
            <div
              className="closeBtn"
              onClick={evt => {
                evt.nativeEvent.stopImmediatePropagation();
                this.props.handleCancel();
              }}
              fullWidth
            >
              {_l('取消')}
            </div>
          </div>
          <div>
            <Button
              className="tip-top"
              data-tip={window.isMacOs ? '⌘ + Enter' : 'Ctrl + Enter'}
              onClick={evt => {
                evt.nativeEvent.stopImmediatePropagation();
                this.submit();
              }}
              fullWidth
            >
              {this.commonSettings.btnName +
                (this.state.selectedData.length ? ` (${this.state.selectedData.length})` : '')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
