import React, { Component, Fragment } from 'react';
import account from 'src/api/account';
import postAjax from 'src/api/post';
import cx from 'classnames';
import Empty from 'src/pages/Admin/common/TableEmpty';
import { LoadDiv } from 'ming-ui';
import './index.less';
import 'selectGroup';
import 'emotion';

const toolBar = [
  { label: _l('全部徽章'), value: 4 },
  { label: _l('技能类徽章'), value: 0 },
  { label: _l('管理类徽章'), value: 1 },
];

export default class SendEmblem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      activeBar: 4,
      loading: false,
      count: 0,
      userList: [],
      step: 1,
      detail: {},
      weekCount: 0,
      remark: '',
    };
  }

  componentDidMount() {
    this.getList();
    this.getWeekCount();
  }

  getWeekCount() {
    account.getWeekMedalCount({}).then(res => {
      this.setState({
        weekCount: res.count,
      });
    });
  }

  getList() {
    this.setState({ loading: true });
    account
      .getSystemMedals({
        pageIndex: 1,
        pageSize: 100,
        medalType: this.state.activeBar,
      })
      .then(data => {
        this.setState({
          list: data.list,
          count: data.allCount,
          loading: false,
        });
      });
  }

  handleChange(item) {
    this.setState(
      {
        activeBar: item.value,
      },
      () => {
        this.getList();
      },
    );
  }

  renderSendContent() {
    const { weekCount, detail, remark } = this.state;
    return (
      <div className="sendContent mTop16">
        <div className="clearfix">
          <span className="Bold Gray Left">{_l('已选择')}</span>
          <span className="Right Gray_9e">{_l('每枚需支付 30 积分，本周还可赠送 %0 枚', weekCount)}</span>
        </div>
        <div className="sendContentBox clearfix">
          <div className="sendHeader clearfix">
            <div className="Left headerLeft">
              <img src={detail.middlePath} />
              <div className="flexColumn">
                <span className="Gray">{detail.medalName}</span>
                <span className="Gray_75 LineHeight22">{detail.description}</span>
              </div>
            </div>
            <span className="Right ThemeColor3 Hover_49 Hand" onClick={() => this.handleEdit()}>
              {_l('重新选择')}
            </span>
          </div>
          <textarea
            id="badgeRemark"
            value={remark}
            onChange={e => {
              this.setState({ remark: e.target.value });
            }}
            className="Block sendText"
            placeholder="再加上点感谢与鼓励吧"
          ></textarea>
          <span
            className="Font18 Gray_c TxtMiddle icon-smile Hover_49 smileBox Hand Right"
            ref={emotion => {
              this.emotion = emotion;
            }}
          ></span>
        </div>
        <div className="sendOption">
          <div className="shareOption Hand LineHeight28 selectG">
            <input type="hidden" id="hidden_GroupID_Badge" value="everyone" />
          </div>
          <button type="button" className="ming Button Button--primary sendBtn" onClick={() => this.handleSend()}>
            {_l('赠送徽章')}
          </button>
        </div>
      </div>
    );
  }

  renderEmblems() {
    const { count, list } = this.state;
    if (!count) {
      const detail = {
        icon: 'military_tech',
        desc: _l('您暂时没有该类徽章'),
      };
      return <Empty detail={detail} />;
    }
    return (
      <Fragment>
        {list.map(item => {
          return (
            <div className="emeblemItemBox Relative" onClick={() => this.handleEdit(item)}>
              <div className="badgeItem">
                <img src={item.middlePath} />
              </div>
              <div className="Font15 Gray_9e">{item.medalName}</div>
            </div>
          );
        })}
      </Fragment>
    );
  }

  //选择徽章
  handleEdit(item) {
    this.setState(
      {
        step: item ? 2 : 1,
        detail: item || {},
      },
      () => {
        if (this.state.step === 2) {
          //挂载表情和分享操作
          this.handleEmotion();
          $('#hidden_GroupID_Badge').SelectGroup({ maxHeight: 150 });
        }
      },
    );
  }

  //选择对象
  handleSelect() {
    const _this = this;
    require(['dialogSelectUser'], function() {
      $({}).dialogSelectUser({
        sourceId: md.global.Account.accountId,
        fromType: 0,
        SelectUserSettings: {
          filterAccountIds: [md.global.Account.accountId],
          callback: function(userArr) {
            _this.setState({
              userList: userArr,
            });
          },
        },
      });
    });
  }

  //删除选中用户
  handleChangeUser(item) {
    this.setState({
      userList: this.state.userList.filter(x => x.accountId !== item.accountId),
    });
  }

  //表情
  handleEmotion() {
    $(this.emotion).emotion({
      input: '#badgeRemark',
      placement: 'right bottom',
      mdBear: false,
      relatedLeftSpace: 22,
    });
  }

  //赠送徽章
  handleSend() {
    const { userList, detail, remark } = this.state;
    let toGroups = null;
    const toAccountIdArr = userList.map(x => x.accountId.toString()) || [];
    if (!toAccountIdArr.length) {
      alert(_l('请选择被赠送人'), 3);
      return;
    }
    if (!remark) {
      $('#badgeRemark').focus();
      alert(_l('请输入附言'), 3);
      return false;
    }
    if (!$('#hidden_GroupID_Badge').SelectGroup('getScope')) {
      alert(_l('请选择分享范围'), 3);
      return false;
    } else {
      toGroups = $('#hidden_GroupID_Badge').SelectGroup('getScope');
    }

    account
      .addAccountMedalGrantLog({
        toAccountIds: toAccountIdArr.join(','),
        medalId: detail.medalId,
        remark: $.trim(remark),
      })
      .then(data => {
        if (data === 1) {
          this.dynamicUpdate(toAccountIdArr, toGroups);
        } else {
          let msg = '';
          if (data === 2) {
            msg = _l('您已经超过了每周最大允许发放勋章数');
          } else if (data === 3) {
            msg = _l('可用积分不足，徽章赠送失败');
          } else {
            msg = _l('徽章赠送失败');
          }
          alert(msg, 2);
        }
      })
      .fail();
  }

  // 动态更新 medalName 徽章名称 BadgeID 徽章ID ToUsersID 用户ID
  dynamicUpdate(toAccountIds, toGroups) {
    const { detail, remark } = this.state;
    let toUsers = '';
    for (let i = 0; i < toAccountIds.length; i++) {
      toUsers += 'user:' + toAccountIds[i] + ' ';
    }
    var postMsg = '我赠送给 ' + toUsers + ' ' + detail.medalName + ' \n 附言：' + remark;
    var content =
      '[EnitityType]1[EnitityType][[[' +
      detail.medalName +
      '[[[' +
      detail.description +
      '[[[' +
      detail.middlePath +
      '[[[' +
      detail.medalId +
      '';
    var postType = 0;
    var rData = { postType: postType, postMsg: postMsg, remark: content, scope: toGroups };
    postAjax.addPost(rData).then(result => {
      if (result.success) {
        alert(_l('徽章赠送成功'), 2);
        this.props.closeDialog();
      }
    });
  }

  render() {
    const { loading, activeBar, userList, step } = this.state;
    return (
      <div className="viewEmblemContainer">
        <div className="Gray_75">{_l('赠送对象')}</div>
        <div className="viewItemBox">
          {userList.length ? (
            <Fragment>
              {userList.map(item => {
                return (
                  <div className="userItemBox" key={item.accountId}>
                    <img src={item.avatar} className="personImg" />
                    <div className="personLabel">{item.fullname}</div>
                    <span className="deselectPerson" onClick={() => this.handleChangeUser(item)}>
                      -
                    </span>
                  </div>
                );
              })}
            </Fragment>
          ) : (
            <span className="icon-task_add-02 Hand Gray_9 Font28 Hover_49" onClick={() => this.handleSelect()}></span>
          )}
        </div>
        <div className={cx('toolChangeBox', { hidden: step === 2 })}>
          {toolBar.map(item => {
            return (
              <div
                className={cx('toolBarItem', { active: activeBar === item.value })}
                onClick={() => this.handleChange(item)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
        <div className="emblemsContent">
          {loading ? <LoadDiv /> : step === 1 ? this.renderEmblems() : this.renderSendContent()}
        </div>
      </div>
    );
  }
}
