import React from 'react';
import store from 'redux/configureStore';
import _ from 'lodash';
import moment from 'moment';
import groupController from 'src/api/group';
import * as actions from 'src/pages/chat/redux/actions';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import './index.less';

export default class GroupValidate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      result: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    this.init(_.get(nextProps, 'location.search'));
  }

  componentDidMount() {
    this.init();
  }

  init(search) {
    const request = getRequest(search);
    const { gID } = request;

    if (gID) {
      this.validateUserJoinGroup(gID);
    } else {
      alert(_l('群组Id不能为空'), 3);
    }
  }

  validateUserJoinGroup(id) {
    groupController
      .valideUserJoinGroup({
        groupId: id,
      })
      .then(result => {
        this.setState({
          result,
        });
      });
  }

  handleOpenChat = () => {
    const { groupId } = this.state.result;
    groupController
      .valideUserJoinGroup({
        groupId,
      })
      .then(result => {
        const { isMember } = result;

        if (isMember) {
          store.dispatch(actions.addGroupSession(groupId));
        } else {
          alert(_l('已经被管理员从群中删除'), 2);
          this.setState({
            result,
          });
        }
      });
  };

  handleOpenFeed = () => {
    const { groupId } = this.state.result;

    navigateTo(`/feed?groupId=${groupId}`);
  };

  handleApply = () => {
    const { result } = this.state;
    const { groupId, isApply, isMember } = result;

    if (isApply) {
      alert(_l('已经申请加入该群组，请等待群组管理员的审批'), 1);
      return;
    }

    groupController
      .applyJoinGroup({
        groupId,
      })
      .then(res => {
        this.setState({ result: { ...result, isMember: res.isMember || isMember, isApply: res.isApply || isApply } });
        res.isApply && alert(_l('已经申请加入该群组，请等待群组管理员的审批'), 1);
      });
  };

  renderContent() {
    const { result } = this.state;
    const { project } = result;

    return (
      <div>
        <img src={result.avatar} className="group-avatar" />
        <div className="group-name">{result.name}</div>
        {project ? <div>{project.companyName}</div> : undefined}
        <div className="group-row">
          <div>
            {_l('创建人')}： <span className="black">{result.createAccount.fullname}</span>
          </div>
          <div className="mLeft6">
            {result.isPost ? _l('群组成员') : _l('聊天成员')}：<span className="black">{result.groupMemberCount}</span>
          </div>
        </div>
        <div className="group-create-tiem">
          {_l('建立时间')}： <span className="black">{moment(result.createTime).format('YYYY-MM-DD')}</span>
        </div>
        {result.isPost ? (
          <div className="group-about">
            <span>{_l('群公告')}</span>
            <div>{result.about ? result.about : _l('暂无群公告')}</div>
          </div>
        ) : undefined}
        {result.isMember ? (
          <div className="group-btns">
            <div className="group-btn group-send ThemeBGColor3" onClick={this.handleOpenChat}>
              <i className="icon-replyto"></i>
              {_l('发消息')}
            </div>
            {result.isPost ? (
              <div className="group-btn group-feed" onClick={this.handleOpenFeed}>
                <i className="icon-dynamic-empty"></i>
                {_l('群组动态')}
              </div>
            ) : undefined}
          </div>
        ) : (
          <div className="group-btns">
            {result.isPost ? (
              <div className="group-btn group-apply ThemeBGColor3" onClick={this.handleApply}>
                {result.isApply ? _l('已申请') : _l('申请加入')}
              </div>
            ) : undefined}
          </div>
        )}
      </div>
    );
  }
  render() {
    const { result } = this.state;

    return <div className="groupValidate-wrapper card">{result ? this.renderContent() : undefined}</div>;
  }
}
