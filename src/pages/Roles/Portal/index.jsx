import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { navigateTo } from 'router/navigateTo';
import ShareUrl from 'src/pages/publicWorksheetConfig/components/ShareUrl';
import * as actions from './redux/actions';
import PortalTable from './list';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { getPortalSet } from 'src/api/externalPortal';
import RoleSetting from 'src/pages/Roles/RoleSetting';
import PortalSetting from 'src/pages/Roles/Portal/setting';
const WrapCon = styled.div`
  overflow: auto;
`;
const Wrap = styled.div`
  width: calc(100% - 64px);
  max-width: 1600px;
  margin: 10px auto;
`;
const WrapTop = styled.div`
  width: 100%;
  margin-bottom: 10px;
  .wrapCon {
    background: #ffffff;
    border-radius: 5px;
    box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.16);
    padding: 20px 24px;
  }
  &.tableCon {
    .wrapCon {
      padding: 24px 0;
    }
    flex: 1;
    display: flex;
    flex-flow: column;
    margin-bottom: 0;
    box-sizing: border-box;
  }
  &.isStatistics {
    .wrapCon {
    }
  }
  h6 {
    font-size: 17px;
    font-weight: 500;
    text-align: left;
    color: #333333;
    line-height: 30px;
  }
  .urlSet {
    display: flex;
    .mainShareUrl {
      flex: 1;
    }
    .setBtn {
      width: 96px;
      height: 36px;
      background: #ffffff;
      border: 1px solid #2196f3;
      border-radius: 3px;
      line-height: 36px;
      text-align: center;
      color: #2196f3;
      &:hover {
        color: #ffffff;
        background: #2196f3;
      }
    }
  }
  .conTab {
    border-bottom: 1px solid #eaeaea;
    padding-left: 20px;
    height: 36px;
    li {
      font-weight: 500;
      color:#757575;
      display: inline-block;
      margin-right: 32px;
      position: relative;
      padding-bottom: 16px;
      &:hover{
        color:#2196f3
      }
      &.current {
        color:#2196f3
        position: relative;
        &::after {
          content: ' ';
          width: 100%;
          height: 3px;
          background: #2196f3;
          border-radius: 2px;
          display: inline-block;
          position: absolute;
          left: 0%;
          bottom: 0;
        }
      }
    }
  }
`;
export const SwitchStyle = styled.div`
  .switchText {
    line-height: 4px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: #bdbdbd;
    }
  }
`;

const PORTALTYPE_CONFIG = [
  _l('任何人都可以注册与访问；'),
  _l('管理员审核后可以注册与访问；'),
  _l('仅向特定用户开放注册与访问；'),
];
const TABLETYPE = [_l('用户'), _l('待审核'), _l('角色权限'), _l('统计')];
const TABLETYPE_URL = ['user', 'pending', 'roleSet', 'statistics'];

function Portal(props) {
  const { portal = {}, changePageIndex, portalName = '', appDetail, appId, closePortal, getCount } = props;
  const [showPortalSetting, setShowPortalSetting] = useState(false);
  const [show, setShow] = useState(false);
  const [portalSet, setPortalSet] = useState({});
  const { roleList = [], list = [], commonCount = 0, unApproveCount = 0 } = portal;
  const [roleId, setRoleId] = useState('');
  const [baseSetResult, setBaseSetResult] = useState({});
  const [tableType, setTableType] = useState(0); //0:用户 1:待审核 2:角色权限 3:统计
  const [version, setControlVersion] = useState();

  useEffect(() => {
    fetchPorBaseInfo();
    //获取外部门户的角色信息
    reloadPortalRoleList();
    getCount(appId);
  }, []);
  useEffect(() => {
    const listType = _.get(props, ['match', 'params', 'listType']);
    if (listType) {
      setTableType(TABLETYPE_URL.indexOf(listType));
    }
  }, [_.get(props, ['match', 'params', 'listType'])]);
  const fetchPorBaseInfo = () => {
    const { setBaseInfo, portal } = props;
    getPortalSet({
      appId,
    }).then(portalSet => {
      const { baseInfo = {} } = portal;
      const { portalSetModel = {}, controlTemplate = {} } = portalSet;
      const { isEnable = false, isSendMsgs } = baseSetResult;
      setBaseInfo({ ...baseInfo, appId, isSendMsgs });
      setPortalSet(portalSet);
      setBaseSetResult(portalSetModel);
      setControlVersion(controlTemplate.version);
    });
  };
  const reloadPortalRoleList = () => {
    props.getPortalRoleList(appId);
  };

  return (
    <WrapCon>
      <Wrap>
        <WrapTop>
          <div className="wrapCon">
            <h6>{portalName}</h6>
            <div className="urlSet">
              <ShareUrl
                className="mainShareUrl"
                copyShowText
                theme="light"
                url={_.get(portalSet, ['portalSetModel', 'portalUrl'])}
                customBtns={[]}
                copyTip={_l('可以将链接放在微信公众号的自定义菜单与自动回复内，方便微信用户关注公众号后随时打开此链接')}
              />
              <span className="setBtn Hand mLeft24" onClick={() => setShowPortalSetting(true)}>
                {_l('门户设置')}
              </span>
            </div>
            <SwitchStyle className="mTop12 Hand InlineBlock" onClick={closePortal}>
              <Icon icon={true ? 'ic_toggle_on' : 'ic_toggle_off'} className="Font24 " />
              <div className="switchText mLeft8 InlineBlock Gray">{_l('启用')}</div>
            </SwitchStyle>
            <span className="InlineBlock mLeft24">
              {PORTALTYPE_CONFIG[(baseSetResult.allowUserType || 3) / 3 - 1]}
              {(baseSetResult.loginMode || {}).weChat ? _l('登录方式为手机号、微信扫码') : _l('登录方式为手机号')}
            </span>
          </div>
        </WrapTop>
        <WrapTop className={cx('tableCon', { isStatistics: tableType === 3 })}>
          <div className="wrapCon">
            <div className="conTab">
              <ul>
                {TABLETYPE.map((o, i) => {
                  const count = i !== 0 ? unApproveCount : commonCount;
                  return (
                    <li
                      className={cx('Hand', { current: i === tableType })}
                      onClick={() => {
                        if (i === tableType) {
                          return;
                        }
                        navigateTo(`/app/${appId}/role/external/${TABLETYPE_URL[i]}`);
                        setTableType(i);
                        changePageIndex(1);
                      }}
                    >
                      {o}
                      {[0, 1].includes(i) && count > 0 ? `(${count})` : ''}
                    </li>
                  );
                })}
              </ul>
            </div>
            <PortalTable
              {...props}
              version={version}
              projectId={appDetail.projectId}
              baseSetResult={baseSetResult}
              openPortalRoleSet={roleId => {
                setRoleId(roleId);
                setShow(true);
              }}
              type={tableType}
              roleList={roleList}
              onOk={() => {}}
              onChangePortalVersion={version => {
                setPortalSet({ ...portalSet, controlTemplate: { ...portalSet.controlTemplate, version } });
                setControlVersion(version);
              }}
            />
          </div>
        </WrapTop>
        {showPortalSetting && (
          <PortalSetting
            portalSet={portalSet}
            projectId={appDetail.projectId}
            show={showPortalSetting}
            appId={appId}
            closeSet={() => setShowPortalSetting(false)}
            callback={() => {
              fetchPorBaseInfo();
            }}
            onChangePortal={data => {
              setPortalSet(data);
              setBaseSetResult(data.portalSetModel);
              setControlVersion(data.controlTemplate.version);
            }}
          />
        )}
        {appDetail && (
          <RoleSetting
            show={show}
            roleId={roleId}
            projectId={appDetail.projectId}
            appId={appId}
            isForPortal={true}
            editCallback={reloadPortalRoleList}
            closePanel={() => setShow(false)}
          />
        )}
      </Wrap>
    </WrapCon>
  );
}

const mapStateToProps = state => ({
  portal: state.portal,
});
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Portal);
