import React, { Component, Fragment } from 'react';
import ClipboardButton from 'react-clipboard.js';
import _ from 'lodash';
import { Dropdown, Icon, LoadDiv } from 'ming-ui';
import InviteController from 'src/api/invitation';
import projectSettingController from 'src/api/projectSetting';
import ShareUrl from 'worksheet/components/ShareUrl';
import DialogSettingInviteRules from 'src/pages/Admin/user/membersDepartments/structure/components/dialogSettingInviteRules';
import { DETAIL_MODE, FROM_TYPE } from './enum';

const DISPLAY_OPTIONS = [
  {
    text: _l('永久'),
    value: 0,
  },
  {
    text: _l('24小时'),
    value: 24,
  },
];

export default class PublicLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      expireHours: 0,
      showDialogSettingInviteRules: false,
    };
  }

  componentDidMount() {
    this.getInfo();
  }

  getLink = () => {
    const { projectId, fromType, setInfo, tokens = [] } = this.props;
    InviteController.getInviteLink({
      sourceId: projectId || md.global.Account.accountId,
      fromType,
      linkFromType: 3,
      hours: this.state.expireHours || 0,
    }).then(data => {
      setInfo({ url: data.linkUrl, tokens: tokens.concat(data.token) });
    });
  };

  getInfo = () => {
    if (_.includes([FROM_TYPE.PERSONAL, FROM_TYPE.GROUPS], this.props.fromType) || !this.props.projectId) {
      return;
    }

    if (this.props.code) return;

    this.setState({ loading: true });

    projectSettingController
      .getPrivacy({
        projectId: this.props.projectId,
      })
      .then(res => {
        this.props.setInfo({ code: res.regCode });
        this.setState({
          loading: false,
        });
      });
  };

  updateHours = value => {
    const { tokens } = this.props;
    this.setState(
      {
        expireHours: value,
      },
      () => {
        InviteController.updateAuthDeadtime({
          hours: this.state.expireHours || 0,
          tokens: tokens,
        });
      },
    );
  };

  handleCopyTextSuccess = () => {
    alert(_l('复制成功'));
  };

  render() {
    const { projectId, fromType, setDetailMode, code, url, showInviteRules } = this.props;
    const { loading, expireHours, showDialogSettingInviteRules } = this.state;
    const isProject = fromType === FROM_TYPE.NORMAL;
    const isFriend = fromType === FROM_TYPE.PERSONAL;

    if (loading) {
      return (
        <div className="addFriendsContent">
          <LoadDiv />
        </div>
      );
    }

    return (
      <div className="addFriendsContent">
        <div className="resultContent flex">
          <div className="Bold Font14 mBottom8">{_l('通过链接')}</div>
          <div className="Gray_9e">{_l('用户可通过点击链接申请加入')}</div>
          {url ? (
            <ShareUrl
              theme="light"
              copyShowText
              className="mTop13 shareUrl"
              url={url}
              inputBtns={[{ tip: _l('重新获取邀请链接'), icon: 'refresh', onClick: this.getLink }]}
            />
          ) : (
            <div className="getLinkBtn mTop13" onClick={this.getLink}>
              {_l('获取邀请链接')}
            </div>
          )}

          <div className="flexRow flexCenter mTop13">
            {url && (
              <Fragment>
                <span className="Gray_9e Font12">{_l('链接有效期：')}</span>
                <Dropdown
                  className="inviteDrop mRight16"
                  border
                  value={expireHours}
                  data={DISPLAY_OPTIONS}
                  onChange={this.updateHours}
                />
              </Fragment>
            )}
            {!isFriend && (
              <div className="addBox recordIcon">
                <span onClick={() => setDetailMode(DETAIL_MODE.LINK)}>
                  <Icon icon="access_time" />
                  {_l('查看使用中的链接')}
                </span>
              </div>
            )}
          </div>

          {isProject && (
            <Fragment>
              <div className="Bold Font14 mBottom8 mTop36">{_l('通过组织门牌号邀请')}</div>
              <div className="Gray_9e">
                {_l('成员可通过搜索组织门牌号申请加入')}
                {/* <Support type={3} text={_l('帮助')} herf={''} /> */}
              </div>
              <div className="numberBox">
                <ClipboardButton
                  className="Hand"
                  component="span"
                  data-clipboard-text={code}
                  onSuccess={this.handleCopyTextSuccess}
                >
                  <span className="Font24">{code}</span>
                  <Icon icon="content-copy" className="Font16 mLeft15" />
                </ClipboardButton>
              </div>
            </Fragment>
          )}
        </div>

        {isProject && showInviteRules && (
          <div className="footContainer mTop12">
            <div className="addBox recordIcon">
              <span onClick={() => this.setState({ showDialogSettingInviteRules: true })}>
                <Icon icon="manage_accounts" />
                {_l('用户加入规则')}
              </span>
            </div>
          </div>
        )}

        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
            setValue={({ showDialogSettingInviteRules }) => this.setState({ showDialogSettingInviteRules })}
            projectId={projectId}
          />
        )}
      </div>
    );
  }
}
