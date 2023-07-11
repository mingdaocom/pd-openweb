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

const Wrap = styled.div`
  width: 60%;
  padding-right: 32px;
  display: flex;
  .urlSet {
    width: 100%;
  }
  .mainShareUrl {
    flex: 1;
    & > div {
      height: 32px;
      line-height: 32px;
      .icon-new_mail {
        line-height: 32px !important;
      }
      &:nth-child(3) {
        line-height: 30px !important;
      }
      &:nth-child(4),
      &:nth-child(2) {
        width: 32px;
      }
    }
    .icon-qr_code {
      line-height: 32px !important;
    }
  }
  .setBtn {
    margin-left: 14px;
    height: 32px;
    line-height: 30px;
    padding: 0 20px;
    background: #ffffff;
    border: 1px solid #2196f3;
    border-radius: 3px;
    text-align: center;
    color: #2196f3;
    overflow: hidden;
    &:hover {
      color: #ffffff;
      background: #2196f3;
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
    };
    const { setQuickTag, setDefaultFastFilters } = props;
    setQuickTag();
    setDefaultFastFilters();
  }
  componentDidMount() {
    const { getControls, appId } = this.props;
    this.props.getControls(appId);
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
    const { baseSetResult = {}, showEditUrl, portalSet, showPortalSetting, tab } = this.state;
    let tablist = conList;
    if (!canEditApp) {
      tablist = tablist.filter(o => !['roleSet'].includes(o.key));
    }
    if (!canEditUser) {
      tablist = tablist.filter(o => !['user', 'statistics'].includes(o.key));
    }
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
                copyShowText
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
                copyTip={_l('可以将链接放在微信公众号的自定义菜单与自动回复内，方便微信用户关注公众号后随时打开此链接')}
              />
              {canEditApp && (
                <span
                  className="setBtn Hand"
                  onClick={() =>
                    this.setState({
                      showPortalSetting: true,
                    })
                  }
                >
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
                  baseSetResult: { ...baseSetResult, customeAddressSuffix: customeAddressSuffix },
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
      </WrapCon>
    );
  }
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PortalCon);
