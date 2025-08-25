import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon, SvgIcon } from 'ming-ui';
import { checkIsAppAdmin } from 'ming-ui/functions';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';

const Wrap = styled.div`
  .iconWrap {
    width: 22px;
    height: 22px;
    border-radius: 5px;
    margin-right: 10px;
    text-align: center;
    padding-top: 3px;
  }
`;

export default function IsAppAdmin(props) {
  const {
    appId,
    appName,
    iconUrl,
    iconColor,
    createType,
    urlTemplate,
    projectId,
    defaultIcon,
    className,
    desc = undefined,
    ckeckSuccessCb,
    passCheckManager,
  } = props;

  return (
    <Wrap className={`flexRow overflowHidden ${className}`}>
      <div className="iconWrap" style={{ backgroundColor: iconColor }}>
        {iconUrl ? <SvgIcon url={iconUrl} fill="#fff" size={16} /> : <Icon icon={defaultIcon} />}
      </div>
      <div
        className={cx('flex nameBox ellipsis Font14', { 'Hand Hover_21': appName && appName !== _l('已删除') })}
        onClick={() => {
          if (!appName || appName === _l('已删除')) return;
          if (createType === 1) {
            window.open(transferExternalLinkUrl(urlTemplate, projectId, appId));
          } else {
            if (passCheckManager) {
              window.open(`/app/${appId}`);
              return;
            }

            checkIsAppAdmin({
              appId,
              appName: appName,
              callback: () => {
                ckeckSuccessCb ? ckeckSuccessCb() : window.open(`/app/${appId}`);
              },
            });
          }
        }}
      >
        <div className="w100 ellipsis" title={appName}>
          {appName}
        </div>
        {desc && <div className="desc ellipsis Font12 Gray_bd">{desc}</div>}
      </div>
    </Wrap>
  );
}
