import React from 'react';
import groupController from 'src/api/group';
import './groupValidate.less';
import store from 'redux/configureStore';
import * as actions from 'src/pages/chat/redux/actions';
import qs from 'query-string';
import { getRequest } from 'src/util';
import moment from 'moment';

export default class GroupValidate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      result: false,
    };
  }
  componentWillReceiveProps(nextProps) {
    const { location } = nextProps;
    const { search } = location;
    const { gID } = qs.parse(search.slice(1));
    // const { groupId } = this.state.result;
    if (gID) {
      this.valideUserJoinGroup(gID);
    }
  }
  componentDidMount() {
    const request = getRequest();
    const { gID } = request;
    if (gID) {
      this.valideUserJoinGroup(gID);
    } else {
      alert(_l('群组Id不能为空'), 3);
    }
  }
  valideUserJoinGroup(id) {
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
  handleOpenChat() {
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
  }
  handleOpenFeed() {
    const { groupId } = this.state.result;
    location.href = '/feed?groupId=' + groupId;
  }
  handleApply() {
    const { groupId, isApply } = this.state.result;

    if (isApply) {
      alert(_l('已经申请加入该群组，请等待群组管理员的审批'), 2);
      return;
    }

    groupController
      .applyJoinGroup({
        groupId,
      })
      .then(result => {
        if (result.isMember) {
          this.setState({
            result: Object.assign(this.state.result, { isMember: true }),
          });
        } else if (result.isApply) {
          alert(_l('已经申请加入该群组，请等待群组管理员的审批'), 4);
        }
        if (result.isApply) {
          this.setState({
            result: Object.assign(this.state.result, { isApply: true }),
          });
          alert(_l('已经申请加入该群组，请等待群组管理员的审批'), 2);
        }
      });
  }
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
            {_l('创建人')}： <span className="black">{result.createAccount.fullname}</span>{' '}
          </div>
          <div>
            {_l('%0成员', result.isPost ? _l('群组') : _l('聊天'))}：
            <span className="black">{result.groupMemberCount}</span>{' '}
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
            <div className="group-btn group-send ThemeBGColor3" onClick={this.handleOpenChat.bind(this)}>
              <i className="icon-replyto"></i>
              {_l('发消息')}
            </div>
            {result.isPost ? (
              <div className="group-btn group-feed" onClick={this.handleOpenFeed.bind(this)}>
                <i className="icon-dynamic-empty"></i>
                {_l('群组动态')}
              </div>
            ) : undefined}
          </div>
        ) : (
          <div className="group-btns">
            {result.isPost ? (
              <div className="group-btn group-apply ThemeBGColor3" onClick={this.handleApply.bind(this)}>
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
