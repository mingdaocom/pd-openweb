import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from '../redux/actions';
import { Container, RegisterName, CreateOrAdd, CreateComp, Add, EditInfo, InviteLinkExpirate } from './container';
import createPermissionCheckWrapper from './container/createPermissionCheckWrapper';
import RegisterApi from 'src/api/register';
import { LoadDiv } from 'ming-ui';
import { InviteFromType, ActionResult, AccountNextActions } from '../config';
import { getRequest, htmlEncodeReg } from 'src/util';
import _ from 'lodash';
import { isTel, getDialCode } from 'src/pages/accountLogin/util.js';
import DocumentTitle from 'react-document-title';
import { Wrap } from './style';
import { getTitle, getDes } from './util';
import { navigateTo } from 'src/router/navigateTo';

let request = getRequest();
const Create = createPermissionCheckWrapper(CreateComp);
const mapStateToProps = ({ accountInfo, warnningData, company, stateList, nextAction, step, userCard }) => ({
  registerData: accountInfo,
  step,
  loading: stateList.loading,
  stateList,
  warnningData,
  company,
  nextAction,
  userCard,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions }, dispatch);
@connect(mapStateToProps, mapDispatchToProps)
export default class RegisterContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: getTitle(),
    };
  }

  componentDidMount() {
    const { registerData = {}, initRegisterData = () => {}, enterpriseRegister = () => {} } = this.props;
    // 注册来源
    const s = request.s || '';
    if (s) {
      safeLocalStorageSetItem('RegFrom', s);
    }
    //私有部署关闭注册入口，跳转到/login
    if (
      _.get(md, 'global.Config.IsLocal') &&
      _.get(md, 'global.SysSettings.hideRegister') &&
      (location.href.indexOf('/register') >= 0 ||
        ((location.href.indexOf('/enterpriseRegister') >= 0 || location.href.indexOf('/enterpriseRegister') >= 0) &&
          !request.type))
    ) {
      navigateTo('/login');
      return;
    }
    if (location.href.match(/enterpriseRegister(\.htm)?/i)) {
      //(加入 ｜ 创建)组织
      enterpriseRegister();
    } else if (registerData.isLink) {
      // 公共链接邀请|手机号邮箱邀请
      if (registerData.confirmation) {
        this.checkInviteLink();
      } else {
        this.checkInviteJoin();
      }
    } else {
      initRegisterData();
    }
  }

  checkInviteJoin = () => {
    const {
      registerData = {},
      updateUseCard = () => {},
      updateCompany = () => {},
      setNext = () => {},
      setStep = () => {},
      setData = () => {},
      setLoading = () => {},
    } = this.props;
    RegisterApi.checkJoinLink({
      projectId: registerData.projectId,
    }).then(data => {
      setLoading(false);
      let actionResult = ActionResult;
      if (data && data.actionResult == actionResult.success) {
        let inviteInfo = data.inviteInfo;
        setData({
          logo: data.logo,
          isDefaultLogo: data.isDefaultLogo,
          hasGetLogo: true,
          inviteInfo,
          isApplyJoin: true,
        });
        updateCompany({
          companyName: inviteInfo.sourceName,
        });
        updateUseCard(data.userCard);
        setNext(AccountNextActions.userCardInfo);
        this.setState({
          titleStr: inviteInfo.sourceName,
          title: _l('您正在加入') + inviteInfo.sourceName,
        });
      } else {
        setStep('inviteLinkExpirate');
      }
    });
  };

  checkInviteLink = () => {
    const {
      registerData = {},
      updateUseCard = () => {},
      updateCompany = () => {},
      setNext = () => {},
      setStep = () => {},
      setData = () => {},
      setLoading = () => {},
    } = this.props;
    RegisterApi.checkInviteLink({
      confirmation: registerData.confirmation,
      isLink: location.href.indexOf('linkInvite') >= 0,
    }).then(data => {
      setLoading(false);
      if (data && data.actionResult == ActionResult.success) {
        const { inviteInfo = {}, userCard = {}, logo = '', token } = data;
        let { user = {} } = userCard;
        let { fullname } = user;
        let param = {
          inviteInfo,
          projectId: inviteInfo.sourceId,
          fullName: fullname,
          onlyReadName: !!fullname,
          logo,
          tokenProjectCode: token,
        };
        if (inviteInfo.account) {
          param.emailOrTel = inviteInfo.account;
          param.onlyRead = true;
          param.loginForAdd = !!inviteInfo.isNormal;
          if (isTel(inviteInfo.account)) {
            param.dialCode = getDialCode();
          }
        }
        updateUseCard(userCard);
        updateCompany({
          companyName: inviteInfo.sourceName,
        });
        setData(param);
        setNext(
          inviteInfo.fromType === InviteFromType.project ? AccountNextActions.userCardInfo : AccountNextActions.login,
        );
        const titleDesc = getDes(inviteInfo);
        this.setState({
          titleStr: htmlEncodeReg(inviteInfo.sourceName) + titleDesc,
          title: inviteInfo.createUserName + _l('邀请您加入') + inviteInfo.sourceName + titleDesc,
        });
      } else {
        setStep('inviteLinkExpirate');
      }
    });
  };

  componentWillUnmount() {
    this.props.reset();
  }

  renderCon = () => {
    let pram = {
      ...this.props,
      projectId: _.get(this.props, 'registerData.projectId'),
    };
    switch (this.props.step) {
      case 'register':
        return <Container {...pram} titleStr={this.state.titleStr} />;
      case 'registerName':
        return <RegisterName {...pram} />;
      case 'createOrAdd':
        return <CreateOrAdd {...pram} />;
      case 'create':
        return <Create {...pram} />;
      case 'add':
        return <Add {...pram} />;
      case 'editInfo':
        return <EditInfo {...pram} />;
      case 'inviteLinkExpirate':
        return <InviteLinkExpirate />;
    }
  };

  render() {
    return (
      <Wrap>
        <DocumentTitle title={this.state.title} />
        {this.props.loading ? <LoadDiv className="" style={{ margin: '50px auto' }} /> : this.renderCon()}
      </Wrap>
    );
  }
}
