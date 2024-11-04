import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actions from './redux/actions';
import ShareUrl from 'worksheet/components/ShareUrl';
import { WrapCon, WrapHeader, WrapContext } from '../style';
import PortalSetting from 'src/pages/Role/PortalCon/setting';
import EditPortalUrlDialog from './components/EditPortalUrlDialog';
import externalPortalAjax from 'src/api/externalPortal';
import Statistics from './tabCon/Statistics';
import UserCon from './tabCon/UserCon';
import RoleCon from './tabCon/RoleCon';
import { navigateTo } from 'router/navigateTo';
import _ from 'lodash';
import CustomUrlDrawer from './customUrl';

const Wrap = styled.div`
  width: 60%;
  padding-right: 32px;
  display: flex;
  .urlSet {
    width: 100%;
  }
  .mainShareUrl {
    flex: 1;
    .shareInput,
    .copy,
    .qrCode,
    .openIcon {
      height: 32px;
      line-height: 32px;
    }
    .icon-new_mail {
      line-height: 32px !important;
    }
    .copy {
      line-height: 30px !important;
    }
    .qrCode,
    .openIcon {
      width: 32px;
    }
    .icon-qr_code {
      line-height: 32px !important;
    }
  }
  .setBtn {
    margin-left: 6px;
    line-height: 32px;
    padding: 0 20px;
    background: #2196f3;
    border-radius: 3px;
    text-align: center;
    color: #fff;
    font-weight: 700;
    overflow: hidden;
    &:hover {
      background: #1e88e5;
    }
  }
`;

const conList = [
  {
    url: '/user',
    key: 'user',
    txt: _l('用户'),
  },
  { url: '/roleSet', key: 'roleSet', txt: _l('角色') },
  {
    url: '/statistics',
    key: 'statistics',
    txt: _l('统计'),
  },
];
class PortalCon extends React.Component {
  constructor(props) {
    super(props);
    const { canEditApp, canEditUser } = props;
    const tab = canEditUser ? 'user' : canEditApp ? 'roleSet' : '';
    this.state = {
      tab: tab,
      showEditUrl: false,
      portalSet: {},
      baseSetResult: {},
      version: 0,
      showPortalSetting: false,
      showCustomUrlSet: false,
    };
    const { setQuickTag, setDefaultFastFilters } = props;
    setQuickTag();
    setDefaultFastFilters();
  }
  componentDidMount() {
    const { getControls, appId, projectId } = this.props;
    this.props.getControls(appId, projectId);
    this.props.getPortalRoleList(appId);
    this.fetchPorBaseInfo();
  }

  componentWillReceiveProps(nextProps, nextState) {
    const { canEditApp, canEditUser } = nextProps;
    const tab = canEditUser ? 'user' : canEditApp ? 'roleSet' : '';
    if (!_.isEqual(this.props.portal.quickTag, nextProps.portal.quickTag) && !!nextProps.portal.quickTag.tab) {
      this.setState({
        tab: nextProps.portal.quickTag.tab || tab,
      });
    }
    const listType = _.get(nextProps, ['match', 'params', 'listType']);
    if (listType === 'pending' && !_.isEqual(listType, _.get(this.props, ['match', 'params', 'listType']))) {
      this.setState({
        tab: tab,
      });
    }
  }

  fetchPorBaseInfo = () => {
    const { portal = {}, appId, setBaseInfo } = this.props;
    externalPortalAjax
      .getPortalSet({
        appId,
      })
      .then(portalSet => {
        const { baseInfo = {} } = portal;
        const { portalSetModel = {}, controlTemplate = {} } = portalSet;
        const { baseSetResult = {} } = this.state;
        const { isSendMsgs } = baseSetResult;
        this.setState({
          portalSet,
          baseSetResult: portalSetModel,
          version: controlTemplate.version,
        });
        setBaseInfo({ ...baseInfo, appId, isSendMsgs });
      });
  };
  renderCon = () => {
    const { tab, baseSetResult, version } = this.state;
    switch (tab) {
      case 'roleSet':
        return <RoleCon {...this.props} />;
      case 'statistics':
        return <Statistics {...this.props} />;
      default:
        return (
          <UserCon
            {...this.props}
            version={version}
            portalSetModel={baseSetResult}
            onChangePortalVersion={version => {
              this.setState({
                version: version,
              });
            }}
          />
        );
    }
  };
  render() {
    const { appDetail, appId, closePortal, isAdmin, canEditApp, canEditUser, portal, setQuickTag } = this.props;
    const { baseSetResult = {}, showEditUrl, portalSet, showPortalSetting, tab, showCustomUrlSet } = this.state;
    let tablist = conList;
    if (!canEditApp) {
      tablist = tablist.filter(o => !['roleSet'].includes(o.key));
    }
    if (!canEditUser) {
      tablist = tablist.filter(o => !['user', 'statistics'].includes(o.key));
    }
    const divStyle = {
      marginLeft: 6,
      height: '32px',
      padding: '0 10px',
      lineHeight: '32px',
      width: 'auto',
    };
    const iconStyle = { marginRight: 3 };
    return (
      <WrapCon className="flexColumn overflowHidden">
        <WrapHeader className="">
          <div className="tabCon flex InlineBlock pLeft26">
            {tablist.map(o => {
              return (
                <span
                  className={cx('tab Hand Font14 Bold', { cur: this.state.tab === o.key })}
                  id={`tab_${o.key}`}
                  onClick={() => {
                    const listType = _.get(this.props, ['match', 'params', 'listType']);
                    listType === 'pending' && navigateTo(`/app/${appId}/role/external`);
                    this.props.handleChangePage(() => {
                      setQuickTag({ ...portal.quickTag, tab: o.key });
                      this.setState({
                        tab: o.key,
                      });
                    });
                  }}
                >
                  {o.txt}
                </span>
              );
            })}
          </div>
          <Wrap className="urlWrap">
            <div className="urlSet flexRow alignItemsCenter">
              <ShareUrl
                className="mainShareUrl"
                theme="light"
                url={_.get(portalSet, ['portalSetModel', 'portalUrl'])}
                editUrl={
                  canEditApp
                    ? () => {
                        this.setState({
                          showEditUrl: true,
                        });
                      }
                    : null
                }
                editTip={_l('自定义域名')}
                customBtns={[
                  {
                    showCompletely: true,
                    tip: _l('链接设置'),
                    icon: 'add_link',
                    className: 'openIcon mRight10',
                    text: _l('链接设置'),
                    onClick: () => {
                      this.setState({
                        showCustomUrlSet: true,
                      });
                    },
                    iconStyle,
                    style: divStyle,
                  },
                ]}
                copyTip={
                  md.global.SysSettings.hideWeixin
                    ? undefined
                    : _l('可以将链接放在微信公众号的自定义菜单与自动回复内，方便微信用户关注公众号后随时打开此链接')
                }
                qrVisible
                showCompletely={{
                  qr: true,
                  copy: true,
                  iconStyle,
                  style: divStyle,
                }}
              />
              
              {canEditApp && (
                <span
                  className="setBtn Hand flexRow alignItemsCenter"
                  onClick={() =>
                    this.setState({
                      showPortalSetting: true,
                    })
                  }
                >
                  <i className="icon icon-settings Font18 mRight5" />
                  {_l('门户设置')}
                </span>
              )}
            </div>
          </Wrap>
        </WrapHeader>
        <WrapContext className={cx('flex', { overflowAuto: tab === 'statistics' })}>{this.renderCon()}</WrapContext>
        {showEditUrl && (
          <EditPortalUrlDialog
            show={showEditUrl}
            appId={appId}
            urlPre={baseSetResult.domainName}
            urlSuffix={baseSetResult.customeAddressSuffix}
            onOk={(customeAddressSuffix, url) => {
              if (customeAddressSuffix !== baseSetResult.customeAddressSuffix) {
                this.setState({
                  portalSet: { ...portalSet, portalSetModel: { ...portalSet.portalSetModel, portalUrl: url } },
                  showEditUrl: false,
                  baseSetResult: { ...baseSetResult, portalUrl: url, customeAddressSuffix: customeAddressSuffix },
                });
              }
            }}
            onCancel={() => {
              this.setState({
                showEditUrl: false,
              });
            }}
          />
        )}
        {showPortalSetting && (
          <PortalSetting
            portalSet={portalSet}
            projectId={appDetail.projectId}
            show={showPortalSetting}
            appId={appId}
            closeSet={() =>
              this.setState({
                showPortalSetting: false,
              })
            }
            callback={() => {
              this.fetchPorBaseInfo();
            }}
            closePortal={closePortal}
            onChangePortal={data => {
              this.setState({
                portalSet: data,
                baseSetResult: data.portalSetModel,
                version: data.controlTemplate.version,
              });
            }}
          />
        )}
        {showCustomUrlSet && (
          <CustomUrlDrawer
            show={showCustomUrlSet}
            appId={appId}
            baseSetResult={baseSetResult}
            closeSet={() =>
              this.setState({
                showCustomUrlSet: false,
              })
            }
            roleList={_.get(this.props, 'portal.roleList')}
            onChange={addressExt => {
              this.setState({
                baseSetResult: { ...baseSetResult, addressExt },
                portalSet: { ...portalSet, portalSetModel: { ..._.get(portalSet, 'portalSetModel'), addressExt } },
              });
            }}
          />
        )}
      </WrapCon>
    );
  }
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PortalCon);