import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { getCustomIconUrl } from 'src/utils/domain/shared/applicationIcons';
import VersionActionButton, { VERSION_ACTION_BUTTON_VARIANT } from '../../components/VersionActionButton';
import {
  getVersionActionLabel,
  getVersionActions,
  SANDBOX_VERSION_DETAIL_MODE,
  VERSION_ACTION,
  VERSION_DETAIL_FROM,
  VERSION_STATUS,
} from '../../constants';

const HeaderWrap = styled.header`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border-secondary);
  background-color: var(--color-background-primary);
  flex-shrink: 0;

  .left {
    display: flex;
    align-items: center;

    .backButton {
      font-size: 20px;
      color: var(--color-text-primary);
      cursor: pointer;

      &:hover {
        color: var(--color-primary);
      }
    }

    .title {
      margin-left: 16px;
      color: var(--color-text-primary);
      font-size: 16px;
      font-weight: 600;
    }
  }
`;

const AppIdentity = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  max-width: 40%;
  align-items: center;
  transform: translate(-50%, -50%);

  .appIcon {
    display: flex;
    width: 30px;
    height: 30px;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: var(--color-white);
    flex-shrink: 0;

    .Icon {
      font-size: 20px;
    }
  }

  .appName {
    margin-left: 8px;
    overflow: hidden;
    color: var(--color-text-primary);
    font-size: 15px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const getTitle = mode => {
  return mode === SANDBOX_VERSION_DETAIL_MODE.RELEASE ? _l('发布新版本') : _l('返回');
};

const noop = () => {};

const normalizeIconUrl = iconUrl =>
  !iconUrl || /^(?:https?:|data:|\/)/.test(iconUrl) ? iconUrl : getCustomIconUrl(iconUrl);

export default function Header({
  mode = SANDBOX_VERSION_DETAIL_MODE.VIEW,
  from = VERSION_DETAIL_FROM.APP_MANAGEMENT,
  status,
  app,
  onClose = noop,
  onWithdraw = noop,
  onRestore = noop,
  onReject = noop,
  onApprove = noop,
}) {
  const actions = mode === SANDBOX_VERSION_DETAIL_MODE.RELEASE ? [] : getVersionActions({ from, status });
  const actionHandlers = {
    [VERSION_ACTION.WITHDRAW]: onWithdraw,
    [VERSION_ACTION.RESTORE]: onRestore,
    [VERSION_ACTION.APPROVE]: onApprove,
    [VERSION_ACTION.REJECT]: onReject,
  };
  const appName = app?.appName || app?.name || '';
  const appIconUrl = app?.iconUrl || app?.avatar || '';
  const appIconColor = app?.iconColor || app?.color || 'var(--color-primary)';

  return (
    <HeaderWrap>
      <div className="left">
        <Icon className="backButton backIcon" icon="arrow_back" onClick={onClose} />
        <span className="title">{getTitle(mode)}</span>
      </div>
      {appName && (
        <AppIdentity title={appName}>
          <span className="appIcon" style={{ backgroundColor: appIconColor }}>
            {appIconUrl ? (
              <SvgIcon url={normalizeIconUrl(appIconUrl)} fill="var(--color-white)" size={20} />
            ) : (
              <Icon icon={app?.icon || 'application'} />
            )}
          </span>
          <span className="appName">{appName}</span>
        </AppIdentity>
      )}
      <ActionButtons>
        {actions.map(action => (
          <VersionActionButton
            key={action}
            action={action}
            variant={VERSION_ACTION_BUTTON_VARIANT.RECT}
            onClick={actionHandlers[action]}
          >
            {getVersionActionLabel(action)}
          </VersionActionButton>
        ))}
      </ActionButtons>
    </HeaderWrap>
  );
}

Header.propTypes = {
  mode: PropTypes.oneOf(Object.values(SANDBOX_VERSION_DETAIL_MODE)),
  from: PropTypes.oneOf(Object.values(VERSION_DETAIL_FROM)),
  status: PropTypes.oneOf(Object.values(VERSION_STATUS)),
  app: PropTypes.shape({
    appName: PropTypes.string,
    name: PropTypes.string,
    iconUrl: PropTypes.string,
    avatar: PropTypes.string,
    iconColor: PropTypes.string,
    color: PropTypes.string,
    icon: PropTypes.string,
  }),
  onClose: PropTypes.func,
  onWithdraw: PropTypes.func,
  onRestore: PropTypes.func,
  onReject: PropTypes.func,
  onApprove: PropTypes.func,
};
