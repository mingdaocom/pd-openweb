import React, { Fragment, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Popover } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, SvgIcon, Tooltip } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import { getAppNavigateUrl, transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import { navigateTo } from 'src/router/navigateTo';
import { emitter } from 'src/utils/common';
import { addBehaviorLog, getCurrentProject } from 'src/utils/project';
import * as actions from '../../redux/actions';
import { PopoverWrap } from '../ChatList/Avatar/styled';

const Wrap = styled.div``;

const AppWrap = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 6px;
  position: relative;
  &.active::before {
    content: '';
    position: absolute;
    left: -10px;
    top: 50%;
    height: 12px;
    width: 4px;
    border-radius: 3px;
    -webkit-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    background: #1677ff;
  }
  > div {
    pointer-events: none;
  }
`;

const ArrowWrap = styled.div`
  width: 26px;
  border-radius: 3px;
  .icon {
    transition: 0.2s;
  }
  &:hover {
    background-color: #f5f5f5;
    .icon {
      transform: rotateZ(90deg);
    }
  }
`;

const getShowAppsCount = height => {
  const appHeight = 26;
  const marginBottom = 10;
  const moreHeight = 8;
  return parseInt((height - moreHeight) / (appHeight + marginBottom));
};

const onAddBehaviorLog = item => {
  switch (item.type) {
    case 0:
      addBehaviorLog('app', item.id);
      break;
    case 1:
      addBehaviorLog('customPage', item.itemId);
      break;
    case 2:
      addBehaviorLog('worksheet', item.itemId);
      break;
    default:
      addBehaviorLog('app', item.id);
      break;
  }
};

const Apps = props => {
  const { appId, toolbarConfig, setToolbarConfig } = props;
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState([]);
  const [appShowCount, setAppShowCount] = useState(0);
  const appsWrap = useRef(null);
  const { commonAppShowType = 1, commonAppOpenType } = toolbarConfig;

  const getProjectId = () => {
    const currentProject = getCurrentProject(localStorage.getItem('currentProjectId'));
    return currentProject.projectId || _.get(md.global.Account.projects[0], 'projectId');
  };

  const handleOpenApp = app => {
    onAddBehaviorLog(app);
    if (app.createType === 1) {
      window.open(transferExternalLinkUrl(app.urlTemplate, app.projectId, app.id));
    } else {
      const url = getAppNavigateUrl(app.id, app.pcNaviStyle, app.selectAppItmeType);
      commonAppOpenType === 1 ? navigateTo(url) : window.open(url);
    }
  };

  const getApps = () => {
    const api = commonAppShowType === 1 ? homeAppApi.recentApps : homeAppApi.marketApps;
    const projectId = getProjectId();
    if (projectId) {
      setLoading(true);
      api({
        noCache: false,
        projectId: getProjectId(),
      }).then(data => {
        setToolbarConfig({
          hideOpenCommonApp: data.length ? false : true,
        });
        setApps(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    getApps();
  }, [commonAppShowType]);

  useEffect(() => {
    emitter.addListener('CHANGE_CURRENT_PROJECT', getApps);
    return () => {
      emitter.removeListener('CHANGE_CURRENT_PROJECT', getApps);
    };
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (appsWrap.current) {
        setAppShowCount(getShowAppsCount(_.get(appsWrap.current, 'clientHeight') || 0));
      }
    });
    if (appsWrap.current) {
      resizeObserver.observe(appsWrap.current);
    }
    return () => {
      if (appsWrap.current) {
        resizeObserver.unobserve(appsWrap.current);
      }
    };
  }, []);

  const navApps = apps.slice(0, appShowCount);
  const popoverApps = apps.slice(appShowCount);

  return (
    <Fragment>
      <Wrap className="flexColumn alignItemsCentern flex minHeight0" ref={appsWrap}>
        {loading ? (
          <div className="flexColumn alignItemsCentern justifyContentCenter h100">
            <LoadDiv />
          </div>
        ) : (
          <Fragment>
            {navApps.map(app => (
              <Tooltip key={app.id} popupPlacement="left" offset={[-5, 0]} text={app.name} autoCloseDelay={1000}>
                <AppWrap
                  className={cx('flexRow alignItemsCenter justifyContentCenter pointer mBottom10', {
                    active: appId === app.id,
                  })}
                  style={{ backgroundColor: app.iconColor }}
                  onClick={() => handleOpenApp(app)}
                >
                  <SvgIcon url={app.iconUrl} fill="#fff" size={20} />
                </AppWrap>
              </Tooltip>
            ))}
            {!!popoverApps.length && (
              <Popover
                title={null}
                placement="leftBottom"
                overlayClassName="userConfigPopover"
                overlayStyle={{ padding: 0 }}
                content={
                  <PopoverWrap style={{ width: 260, maxHeight: document.body.clientHeight / 1.2, overflowY: 'auto' }}>
                    {popoverApps.map(app => (
                      <div
                        className={cx('itemWrap pointer flexRow alignItemsCenter', { active: appId === app.id })}
                        onClick={() => handleOpenApp(app)}
                      >
                        <AppWrap
                          className="flexRow alignItemsCenter justifyContentCenter"
                          style={{ backgroundColor: app.iconColor }}
                        >
                          <SvgIcon url={app.iconUrl} fill="#fff" size={18} />
                        </AppWrap>
                        <div className="flex mLeft8 ellipsis" title={app.name}>
                          {app.name}
                        </div>
                      </div>
                    ))}
                  </PopoverWrap>
                }
              >
                <ArrowWrap className="flexRow alignItemsCenter justifyContentCenter pointer">
                  <Icon className="Font18 Gray_75" icon="arrow-up-border1" />
                </ArrowWrap>
              </Popover>
            )}
          </Fragment>
        )}
      </Wrap>
    </Fragment>
  );
};

export default connect(
  state => ({
    appId: state.appPkg.id,
    toolbarConfig: state.chat.toolbarConfig,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['setToolbarConfig']), dispatch),
)(Apps);
