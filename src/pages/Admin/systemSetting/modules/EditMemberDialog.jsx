import React, { Component } from 'react';
import { Dialog } from 'ming-ui';
import workSiteController from 'src/api/workSite';

export default class EditMemberDialog extends Component {
  constructor() {
    super();
    this.state = {
      userList: [],
      isSearch: false,
      memberKeywords: '',
      members: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.workSiteId !== this.props.workSiteId) {
      this.getUserList(nextProps.workSiteId)
    }
  }

  getUserList(workSiteId) {
    workSiteController.getWorkSiteUsers({
      workSiteId: workSiteId || this.props.workSiteId,
      projectId: this.props.projectId,
      keywords: this.state.memberKeywords,
    }).then((data) => {
      this.setState({
        userList: data.list,
        members: _.map(data.list, user => user.accountId)
      })
    })
  }

  renderUserList = () => {
    const { userList, isSearch } = this.state;
    return (
      <div className="content pBottom10 Font13">
        {userList.length ? (
          userList.map(user => {
            return (
              <div className="contentUser" key={user.accountId}>
                <img
                  className="mLeft10 headIcon"
                  src={user.avatar}
                  alt=""
                  onError={() => '/images/default.gif'}
                />
                <div className="contentName overflow_ellipsis">
                  <span className="mLeft5">{user.fullname}</span>
                </div>
                <div className="contentJob overflow_ellipsis">
                  <span>{user.job}</span>
                </div>
                <div className="contentOperate" onClick={this.deleteUser.bind(this, user.accountId)}>
                  <span className="ThemeHoverColor3 icon-delete2 deleteMember Gray_9 Hand Font18"></span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="Gray_6 mTop20 TxtCenter">{_l('该工作地点还没有成员')}</div>
        )}
        {isSearch && (
          <div className="nullContent">
            <div>
              <span className="TxtCenter icon-search icon"></span>
            </div>
            <div className="Gray_6 mTop20 TxtCenter">{_l('搜索无结果')}</div>
          </div>
        )}
      </div>
    );
  };

  handleAdd() {
    const _this = this
    require(['dialogSelectUser'], function () {
      $({}).dialogSelectUser({
        showMoreInvite: false,
        SelectUserSettings: {
          showTabs: ['conactUser', 'department', 'group', 'subordinateUser'], // 用户列表子tab 联系人 部门 群组 下属
          projectId: _this.props.projectId, // 默认取哪个网络的用户 为空则表示默认加载全部
          inProject: true,
          filterAll: true, // 过滤全部
          filterFriend: true, // 是否过滤好友
          filterOthers: true, // 是否过滤其他协作关系
          filterAccountIds: _this.state.members, // 过滤指定的用户
          filterOtherProject: true, // 当对于 true,projectId不能为空，指定只加载某个网络的数据
          dataRange: 0, // reference to dataRangeTypes 和 projectId 配合使用
          callback: (data) => {
            workSiteController.addWorkSiteUser({
              workSiteId: _this.props.workSiteId,
              accountIds: _.map(data, user => user.accountId),
              projectId: _this.props.projectId
            }).then((data) => {
              if (data) {
                _this.getUserList()
                _this.props.getData()
              } else
                alert(_l('添加失败'), 2);
            });
          },
        },
      })
    });
  };

  deleteUser(id) {
    var reqData = {
      accountId: id,
      projectId: this.props.projectId,
    }
    workSiteController.deleteWorkSiteUser(reqData).then((data) => {
      if (data) {
        this.getUserList()
        this.props.getData()
      } else
        alert(_l('删除失败'), 2);
    });
  };

  handleSearch(e) {
    this.setState({
      memberKeywords: $.trim(e.target.value)
    }, () => {
      this.getUserList()
    })
  }

  render() {
    const { userList } = this.state
    return (
      <Dialog
        visible={this.props.visible}
        title={_l(`添加成员(${userList.length})`)}
        width="480"
        overlayClosable={false}
        footer={null}
        onCancel={() => this.props.closeMenberDialog()}>
        <div className="editMemberDialog" id="editMemberDialog">
          <div className="Relative">
            <input type="text" className="ming Input w100 pLeft30" placeholder={_l('搜索')} onKeyUp={(e) => this.handleSearch(e)} />
            <span className="btnSearch icon-search Gray_9"></span>
          </div>
          <div id="memberList" className="mTop10">
            {this.renderUserList()}
          </div>
          <div className="pTop20 pBottom15">
            <span className="Hand addMember ThemeColor3 ThemeHoverColor2 Font14" onClick={this.handleAdd.bind(this)}>
              <span className="icon-addapplication Font30 mRight20 TxtMiddle"></span>
              <span className="TxtMiddle">{_l('添加成员')}</span>
            </span>
          </div>
        </div>
      </Dialog>
    );
  }
}
