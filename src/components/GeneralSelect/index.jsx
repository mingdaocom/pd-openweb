/**
 *  1. 方法：
 *                         |- userAction
 *  action: defaultAction -|- departmentAction
 *                         |- groupAction
 *          |- renderHead
 *          |- renderFilterBox
 *  render: |- renderContent
 *          |- renderResult
 *  2. state:
 *  存储数据：
 *  mainData: {
 *    renderType: RenderType (数据渲染的类型，共六种)
 *    data: object (请求到的数据)
 *  }
 *  请求到的数据要经过 getXXXTree处理
 */

/**
 *  1. 方法：
 *                         |- userAction
 *  action: defaultAction -|- departmentAction
 *                         |- groupAction
 *          |- renderHead
 *          |- renderFilterBox
 *  render: |- renderContent
 *          |- renderResult
 *  2. state:
 *  存储数据：
 *  mainData: {
 *    renderType: RenderType (数据渲染的类型，共六种)
 *    data: object (请求到的数据)
 *  }
 *  请求到的数据要经过 getXXXTree处理
 */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';
import './style.less';
import userController from 'src/api/user';
import departmentController from 'src/api/department';
import groupController from 'src/api/group';
import structureController from 'src/api/structure';
import GDropdown from './GDropdown';
import ScrollView from 'ming-ui/components/ScrollView';
import autobind from './autobind';
import DefaultUserList from './DefaultUserList';
import DepartmentGroupUserList from './DepartmentGroupUserList';
import DepartmentTree from './DepartmentTree';
import ExtraUserList from './ExtraUserList';
import DepartmentList from './DepartmentList';
import GroupList from './GroupList';
import Result from './Result';
import Button from 'ming-ui/components/Button';
import { DataRangeTypes, RenderTypes, ChooseType, UserTabsId } from './constant';
import NoData from './NoData';

const DefaultUserTabs = isNetwork => {
  return [
    {
      id: UserTabsId.CONACT_USER,
      name: _l('全部'), // 按姓氏拼音排序
      type: 1,
      page: true, // 是否分页
      showFilterBox: true, // 是否显示字母筛选
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
        getDepartments: isNetwork
          ? departmentController.getProjectContactDepartments
          : departmentController.getContactProjectDepartments,
        getDepartmentUsers: isNetwork
          ? departmentController.getProjectDepartmentUsers
          : departmentController.getDepartmentUsers,
      },
    },
    {
      id: UserTabsId.GROUP,
      name: _l('按群组'),
      type: 3,
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

export { default as DepartmentList } from './DepartmentList';

export default class GeneraSelect extends Component {
  static defaultProps = {
    chooseType: ChooseType.USER, // 默认选中的tab
    groupSettings: {
      groups: [],
    },
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
        ...props.groupSettings.groups.map(group => ({ type: ChooseType.GROUP, data: group })),
      ],
    });

    const href = location.href;
    this.isNetwork =
      !props.isChat &&
      href.indexOf('admin') > -1 &&
      href.indexOf('admin/structure') === -1 &&
      href.indexOf('admin/approve') === -1 &&
      href.indexOf('admin/home') === -1 &&
      href.indexOf('admin/analytics') === -1 &&
      href.indexOf('privateDeployment/admin') === -1 &&
      !!(props.commonSettings || {}).projectId;
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

  /** 已经选中的群组 */
  get selectedGroups() {
    let groups = this.state.selectedData.filter(item => item.type === ChooseType.GROUP).map(item => item.data);
    return groups;
  }

  promiseObj = null; // 请求promise
  _scrollView = null; // ScrollView 的 ref
  _searchInput = null; // 搜索input
  userSettings = null;
  departmentSettings = null;
  groupSettings = null;

  handlePromise(promise) {
    if (this.promiseObj && this.promiseObj.state && this.promiseObj.state() === 'pending') {
      this.promiseObj.abort();
    }
    this.promiseObj = promise;
    return this.promiseObj;
  }

  componentWillReceiveProps(nextProps) {
    let state = this.receiveProps(nextProps);
    this.setState(state, () => {
      this.defaultAction();
    });
  }

  componentWillMount() {
    this.defaultAction();
  }

  updateEvent(event, values) {
    const { position, maximum, direction } = values;
    if (direction === 'down' && maximum - position <= 50) {
      let page = false;
      if (this.state.chooseType === ChooseType.USER) {
        page = this.getTabItem().page;
      } else if (this.state.chooseType === ChooseType.GROUP) {
        page = true;
      }
      if (this.promiseObj && this.promiseObj.state && this.promiseObj.state() === 'pending') {
        return false;
      }
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
      callback: (users, departments, group) => {}, // 关闭时的回调
    };
    const defaultUserSettings = {
      _id: 0, // index for defaultTabs
      defaultTabs: DefaultUserTabs(this.isNetwork),
      defaultTabsFilter: function(tabs) {
        return tabs;
      },
      showTabs: ['conactUser', 'department', 'group', 'subordinateUser'],
      // 格式和defaultTabs一致,id和page可以为空
      // 方法请求的参数(pageIndex:int,pageSize:int,keywords string，filterAccountIds:[]，projectId string)
      // 返回结果listModel {list:[{accountId:'',avatar:'',fullname:'',department:''}],allCount:1}
      extraTabs: [],
      txtSearchTip: _l('搜索用户'), // 搜索input 默认值
      allowSelectNull: true, // 是否允许选择列表为空
      filterAccountIds: [],
      filterProjectId: '',
      filterFriend: false,
      firstLetter: '', // 首字母
      unique: false, // 是否只可以选一个
      pageIndex: 1,
      pageSize: 20,
      isMore: true, // 当点击要过滤的用户时
    };

    const defaultDepartmentSettings = {
      disabledDepartmentIds: [],
      departmentIds: [],
    };

    const defaultGroupSettings = {
      disabledGroupIds: [],
      groups: [],
    };

    this.commonSettings = $.extend(defaultCommonSettings, props.commonSettings || {});
    this.userSettings = $.extend(defaultUserSettings, props.userSettings || {});
    this.departmentSettings = $.extend(defaultDepartmentSettings, props.departmentSettings || {});
    this.groupSettings = $.extend(defaultGroupSettings, props.groupSettings || {});
    // 兼容老组件，只有选择联系人时，默认不可以不选
    if (this.commonSettings.selectModes.length === 1 && this.commonSettings.selectModes[0] === ChooseType.USER) {
      this.userSettings.allowSelectNull = false;
    }

    let userSettings = this.userSettings;

    if (userSettings.defaultTabsFilter) {
      userSettings.defaultTabs = [].concat(userSettings.defaultTabsFilter(DefaultUserTabs(this.isNetwork)));
    }
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
    userSettings.defaultTabs = tabs;

    let state = {
      /** 当期的选择类型 */
      chooseType: props.chooseType,
      /** 关键字 */
      keywords: '',
      /** 选择人员是否出现筛选 */
      isProject: this.checkIsProject(),
      /** 用户选择的首字母筛选 */
      firstLetter: '',
      /** 是否显示搜索条 */
      showSearchBar: !this.checkIsProject(),
      /** 选择的用户筛选范围 */
      selectedUserTabId: userSettings.defaultTabs[0].id,
      /** 滚动分页 */
      pageSize: 20,
      pageIndex: 1,
      /** 联系人数据 */
      mainData: null,
      loading: false,
      haveMore: true,
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
    } else if (this.state.chooseType === ChooseType.GROUP) {
      this.groupAction();
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
        keywords: this.state.keywords,
        firstLetter: this.state.firstLetter,
        projectId: commonSettings.projectId,
        dataRange: commonSettings.dataRange,
        filterAccountIds: userSettings.filterAccountIds,
        prefixAccountIds: userSettings.prefixAccountIds,
        filterFriend: userSettings.filterFriend,
        filterProjectId: userSettings.filterProjectId,
        includeUndefinedAndMySelf:
          tabItem.type === RenderTypes.CONTACK_USER ? userSettings.includeUndefinedAndMySelf : undefined,
        includeSystemField: tabItem.type === RenderTypes.CONTACK_USER ? userSettings.includeSystemField : undefined,
      };

      if (tabItem.page) {
        reqData.pageIndex = this.state.pageIndex;
        reqData.pageSize = this.state.pageSize;
        if (!this.state.haveMore) {
          return false;
        }
      }

      let doAction = null;
      let mainData = this.state.mainData;

      if (tabItem.type == RenderTypes.CONTACK_USER) {
        // 姓氏排名
        doAction = tabItem.actions.getContactUsers;
      } else if (tabItem.type == RenderTypes.DEPARTMENT_USER) {
        // 部门
        if (this.state.keywords) {
          doAction = tabItem.actions.getDepartments;
        } else {
          doAction = departmentController[this.isNetwork ? 'pagedProjectDepartmentTrees' : 'pagedDepartmentTrees'];
          reqData.pageIndex = 1;
          reqData.pageSize = 100;
          reqData.parentId = '';
          reqData.onlyMyJoin = localStorage.getItem('isCheckedOnlyMyJoin')
            ? JSON.parse(localStorage.getItem('isCheckedOnlyMyJoin'))
            : false;
        }
      } else if (tabItem.type == RenderTypes.GROUP_USER) {
        // 群组
        doAction = tabItem.actions.getGroups;
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
          data = this.getDepartmentUserTree(data);
          if (
            localStorage.getItem('isCheckedOnlyMyJoin') &&
            JSON.parse(localStorage.getItem('isCheckedOnlyMyJoin')) &&
            !this.state.keywords
          ) {
            this.setState({ defaultCheckedDepId: (!_.isEmpty(data) && data[0].departmentId) || null });
          }
        } else if (tabItem.type === RenderTypes.GROUP_USER) {
          data = this.getGroupUserTree(data);
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
        });
      });
    }
  };

  /** 请求部门 */
  departmentAction() {
    const userSettings = this.userSettings;
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

  getOriginDepartment(list) {
    return list.map(group => ({
      departmentId: group.departmentId,
      departmentName: group.departmentName,
      haveSubDepartment: group.haveSubDepartment,
      userCount: group.userCount,
    }));
  }

  getOriginGroup(list) {
    return list.map(group => ({
      avatar: group.avatar,
      createTime: group.createTime,
      groupId: group.groupId,
      groupUserCount: group.groupUserCount,
      matchedMemberCount: group.matchedMemberCount,
      name: group.name,
    }));
  }

  getDepartmentUserTree(data) {
    let { list = [] } = data;
    data.list = list.map(item => {
      const { departmentId, departmentName, userCount, users } = item;
      return {
        departmentId,
        departmentName,
        userCount,
        open: !!(users && users.length), // 是否展开
        users: users || [],
      };
    });
    return data;
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

  getGroupTree(data) {
    const handleGroups = groups =>
      groups.map(group => {
        const { avatar, createTime, groupId, groupUserCount, matchedMemberCount, name } = group;
        let disabled = false;
        if (this.groupSettings.disabledGroupIds.indexOf(groupId) >= 0) {
          disabled = true;
        }
        return {
          avatar,
          createTime,
          groupId,
          groupUserCount,
          matchedMemberCount,
          name,
          disabled,
        };
      });
    if (data.normalGroups && data.normalGroups.list) {
      data.normalGroups.list = handleGroups(data.normalGroups.list);
    }
    if (data.sharedGroups && data.sharedGroups) {
      data.sharedGroups = handleGroups(data.sharedGroups);
    }
    return data;
  }

  getGroupUserTree(data) {
    let { list = [] } = data;
    data.list = list.map(item => {
      const { groupId, name, groupMemberCount, createTime, matchedMemberCount, groupUsers } = item;
      return {
        groupId,
        name,
        groupMemberCount,
        createTime,
        matchedMemberCount,
        open: !!(groupUsers && groupUsers.length), // 是否展开
        users: groupUsers || [],
      };
    });
    return data;
  }

  /** 获取部门和群组的key值 */
  @autobind
  getKeys(tabId) {
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
  }

  /** tabId换成renderType */
  getRenderTypeByTabId(tabId) {
    let renderType;
    if (tabId === UserTabsId.CONACT_USER) {
      renderType = RenderTypes.CONTACK_USER;
    } else if (tabId === UserTabsId.DEPARTMENT) {
      renderType = RenderTypes.DEPARTMENT_USER;
    } else if (tabId === UserTabsId.GROUP) {
      renderType = RenderTypes.GROUP_USER;
    } else {
      renderType = RenderTypes.OTHER_USER;
    }
    return renderType;
  }

  getTxtSearchTip() {
    let tip = '';
    switch (this.state.chooseType) {
      case ChooseType.USER:
        tip = this.userSettings.txtSearchTip;
        break;
      case ChooseType.DEPARTMENT:
        tip = _l('搜索部门');
        break;
      case ChooseType.GROUP:
        tip = _l('搜索群组');
        break;
    }
    return tip;
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
  @autobind
  onChangeUserFilter(id) {
    this.setState(
      {
        selectedUserTabId: id,
        chooseType: ChooseType.USER,
        keywords: '',
        firstLetter: '',
        pageIndex: 1,
        haveMore: true,
      },
      () => {
        this.userAction();
      },
    );
  }

  changeSelect(chooseType, data, idKey) {
    let selectedArr;
    switch (chooseType) {
      case ChooseType.USER:
        selectedArr = this.selectedUsers;
        break;
      case ChooseType.DEPARTMENT:
        selectedArr = this.selectedDepartment;
        break;
      case ChooseType.GROUP:
        selectedArr = this.selectedGroups;
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
  @autobind
  toogleUserSelect(user) {
    this.changeSelect(ChooseType.USER, user, 'accountId');
  }

  /**
   * 改变部门的选择状态
   * @param {*部门实体} department
   */
  @autobind
  toogleDepargmentSelect(department) {
    this.changeSelect(ChooseType.DEPARTMENT, department, 'departmentId');
  }

  /**
   * 改变群组的选择状态
   * @param {*群组实体} group
   */
  @autobind
  toggleGroupSelect(group) {
    this.changeSelect(ChooseType.GROUP, group, 'groupId');
  }

  /**
   * 删除一条选中的数据
   * @param {*选择类型} chooseType
   * @param {*实体id} id
   * @param {*实体的id的key} idKey
   */
  @autobind
  deleteData(chooseType, id, idKey) {
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
  }

  /**
   * 添加一条选中的数据
   * @param {*选择类型} chooseType
   * @param {*实体} data
   */
  @autobind
  addData(chooseType, data) {
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
      $(ReactDOM.findDOMNode(this._resultScrollView)).nanoScroller({ scroll: 'bottom' });
    }, 0);
  }

  /**
   * 打开或关闭部门列表
   * @param {*部门id} id
   */
  @autobind
  toggleDepartmentList(id) {
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
  }

  /** 改变字母筛选 */
  @autobind
  changeFirstLetter(letter) {
    this.setState(
      {
        firstLetter: letter,
        pageIndex: 1,
        haveMore: true,
      },
      () => this.userAction(),
    );
  }

  /** 显示搜索 */
  @autobind
  showSearch() {
    this.setState(
      {
        showSearchBar: true,
      },
      () => {
        ReactDOM.findDOMNode(this._searchInput).focus();
      },
    );
  }

  /** 搜索 */
  @autobind
  search(keywords) {
    this.setState(
      {
        keywords,
        pageIndex: 1,
        haveMore: true,
      },
      () => this.defaultAction(),
    );
  }

  /** 关闭搜索 */
  @autobind
  closeSearch() {
    this.setState(
      {
        keywords: '',
        showSearchBar: false,
        pageIndex: 1,
        haveMore: true,
      },
      () => this.defaultAction(),
    );
  }

  /** 打开部门或群组联系人中的部门 */
  @autobind
  toggleUserItem(id) {
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
    } else if (group.users.length === group[COUNT]) {
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
      });
    }
  }

  /** 全选部门或群组联系人 */
  @autobind
  allSelectUserItem(id) {
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
            list.map(user => {
              return {
                type: ChooseType.USER,
                data: user,
              };
            }),
          );
          selectedData = _.uniqBy(_arr, function({ type, data: { accountId } }) {
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
    if (group.users.length < group[COUNT]) {
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
      });
    } else {
      let list = group.users;
      selectAll(list);
    }
  }

  @autobind
  changeChooseType(type) {
    this.setState(
      {
        chooseType: type,
        keywords: '',
        firstLetter: '',
        pageIndex: 1,
        haveMore: true,
      },
      () => {
        this.defaultAction();
      },
    );
  }

  @autobind
  dropdownOnClick() {
    if (this.state.chooseType !== ChooseType.USER) {
      this.changeChooseType(ChooseType.USER);
      return false;
    }
    return true;
  }

  /** 提交 */
  @autobind
  submit() {
    let selectedUsers = this.selectedUsers;
    let selectedDepartments = this.selectedDepartment;
    let selectedGroups = this.selectedGroups;
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
      if (mode === ChooseType.GROUP) {
        let groups = this.getOriginGroup(selectedGroups);
        data.groups = groups;
        return groups;
      }
      return null;
    });
    this.userSettings.callback(...params); // 兼容老的selectUsers回调
    this.commonSettings.callback(data);
  }
  /* ---------------------------------------------------------------------------------------------------
    --------------------------------------         渲染        ------------------------------------------
    ---------------------------------------------------------------------------------------------------- */
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
            includeUndefinedAndMySelf={this.userSettings.includeUndefinedAndMySelf}
            onChange={this.toogleUserSelect}
            selectedUsers={this.selectedUsers}
            keywords={this.state.keywords}
          />
        );
      /** 渲染部门选人列表 */
      case RenderTypes.DEPARTMENT_USER:
        if (this.state.keywords) {
          return (
            <DepartmentGroupUserList
              data={mainData.data}
              onChange={this.toogleUserSelect}
              toggleUserItem={this.toggleUserItem}
              allSelectUserItem={this.allSelectUserItem}
              selectedUsers={this.selectedUsers}
              getKeys={this.getKeys}
              tabType={UserTabsId.DEPARTMENT}
              unique={this.userSettings.unique}
              keywords={this.state.keywords}
            />
          );
        } else {
          return (
            <DepartmentTree
              isNetwork={this.isNetwork}
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
              projectId={this.commonSettings.projectId}
              removeSelectedData={data => {
                let selectedArr = [...this.state.selectedData];
                this.setState({
                  selectedData: selectedArr.filter(item => !data.includes(item.data.accountId)),
                });
              }}
              addSelectedData={data => {
                this.setState({
                  selectedData: this.state.selectedData.concat(data),
                });
              }}
              userAction={this.userAction}
              defaultCheckedDepId={this.state.defaultCheckedDepId}
            />
          );
        }
      /** 渲染群组选人列表 */
      case RenderTypes.GROUP_USER:
        return (
          <DepartmentGroupUserList
            data={mainData.data}
            onChange={this.toogleUserSelect}
            toggleUserItem={this.toggleUserItem}
            allSelectUserItem={this.allSelectUserItem}
            selectedUsers={this.selectedUsers}
            getKeys={this.getKeys}
            tabType={UserTabsId.GROUP}
            unique={this.userSettings.unique}
            keywords={this.state.keywords}
          />
        );
      /** 渲染其他类型选人列表 */
      case RenderTypes.OTHER_USER:
        return (
          <ExtraUserList
            data={mainData.data}
            onChange={this.toogleUserSelect}
            selectedUsers={this.selectedUsers}
            keywords={this.state.keywords}
          />
        );
      default:
        return null;
    }
  }

  /** 用户选择字母排名列表 */
  renderFilterBox() {
    const userSettings = this.userSettings;
    let tabItem = userSettings.defaultTabs.filter(tab => tab.id === this.state.selectedUserTabId)[0];
    if (
      (this.state.chooseType === ChooseType.USER && tabItem && tabItem.showFilterBox) ||
      this.state.chooseType === ChooseType.GROUP
    ) {
      return (
        <ul className="GSelect-filterBox">
          <li
            data-index=""
            className={cx('GSelect-filterBox__letter', { ThemeColor3: this.state.firstLetter === '' })}
            onClick={() => this.changeFirstLetter('')}
          >
            全部
          </li>
          <li
            data-index="1"
            className={cx('GSelect-filterBox__letter', { ThemeColor3: this.state.firstLetter === '1' })}
            onClick={() => this.changeFirstLetter('1')}
          >
            <span className="icon-star-hollow2" />
          </li>
          {new Array(26).fill(0).map((value, index) => {
            let letter = String.fromCharCode(97 + index);
            return (
              <li
                data-index={letter}
                key={'filter-' + letter}
                className={cx('GSelect-filterBox__letter', { ThemeColor3: letter === this.state.firstLetter })}
                onClick={() => this.changeFirstLetter(letter)}
              >
                {letter}
              </li>
            );
          })}
          <li
            data-index="2"
            className={cx('GSelect-filterBox__letter', { ThemeColor3: this.state.firstLetter === '2' })}
            onClick={() => this.changeFirstLetter('2')}
          >
            #
          </li>
        </ul>
      );
    }
    return null;
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
          avatar = <img src={item.data.avatar} alt="头像" className="GSelect-result-subItem__avatar" />;
          id = item.data.accountId;
          name = item.data.fullname;
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
          id = item.data.departmentId;
          name = item.data.departmentName;
          deleteFn = departmentId => {
            this.deleteData(item.type, departmentId, 'departmentId');
          };
          break;
        case ChooseType.GROUP:
          avatar = <img src={item.data.avatar} alt="头像" className="GSelect-result-subItem__avatar" />;
          id = item.data.groupId;
          name = item.data.name;
          deleteFn = groupId => {
            this.deleteData(item.type, groupId, 'groupId');
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
          <NoData>{this.state.keywords ? _l('搜索无结果') : _l('无结果')}</NoData>
        )}
      </div>
    );
  }

  /** 选群组 */
  renderGroupContent() {
    return (
      <div className="GSelect-groupContent">
        <GroupList
          data={this.state.mainData.data}
          selectedGroups={this.selectedGroups}
          toggleGroupSelect={this.toggleGroupSelect}
          keywords={this.state.keywords}
        />
      </div>
    );
  }

  renderHead() {
    if (this.state.showSearchBar) {
      return (
        <div className="GSelect-head-searchArea">
          <input
            type="text"
            onChange={event => this.search(event.target.value)}
            ref={searchInput => {
              this._searchInput = searchInput;
            }}
            placeholder={this.getTxtSearchTip()}
          />
          {this.checkIsProject() ? (
            <div className="icon-delete GSelect-head-searchArea--deleteIcon" onClick={this.closeSearch} />
          ) : null}
        </div>
      );
    }
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
          className={cx('GSelect-head-navbar__item ThemeBorderColor3', {
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
          className={cx('GSelect-head-navbar__item ThemeBorderColor3', {
            'GSelect-head-navbar__item--active': this.state.chooseType === ChooseType.USER,
          })}
          renderValue="选择成员（{{value}}）"
        />
      );
      let SelectDepartments = (
        <li
          key="SelectDepartemnts"
          onClick={() => this.changeChooseType(ChooseType.DEPARTMENT)}
          className={cx('GSelect-head-navbar__item ThemeBorderColor3', {
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
            className={cx('GSelect-head-navbar__item ThemeBorderColor3', {
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

  renderContent() {
    if (this.state.loading) {
      return <div dangerouslySetInnerHTML={{ __html: LoadDiv() }} />;
    }
    if (!this.state.mainData) {
      return null;
    }
    if (
      this.state.mainData.renderType === RenderTypes.CONTACK_USER ||
      this.state.mainData.renderType === RenderTypes.DEPARTMENT_USER ||
      this.state.mainData.renderType === RenderTypes.GROUP_USER ||
      this.state.mainData.renderType === RenderTypes.OTHER_USER
    ) {
      return this.renderUsersContent();
    } else if (this.state.mainData.renderType === RenderTypes.DEPARTMENT) {
      return this.renderDepartmentContent();
    } else if (this.state.mainData.renderType === RenderTypes.GROUP) {
      return this.renderGroupContent();
    }
  }

  render() {
    return (
      <div className="GSelect-box">
        <div className="GSelect-head">
          <div className="GSelect-head-searchIcon" onClick={this.showSearch}>
            <i className="icon-search" />
          </div>
          {this.renderHead()}
        </div>
        {this.renderFilterBox()}
        <ScrollView className="GSelect-container" updateEvent={this.updateEvent.bind(this)}>
          {this.renderContent()}
        </ScrollView>
        <ScrollView
          className="GSelect-result"
          ref={scrollView => {
            this._resultScrollView = scrollView;
          }}
        >
          <div className="GSelect-result-box">{this.renderResult()}</div>
        </ScrollView>
        <div className="GSelect-footer-buttonBox">
          <div>
            <Button
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
