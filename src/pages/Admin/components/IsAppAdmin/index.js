import React from 'react';
import { Icon } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import { checkIsAppAdmin } from 'src/components/checkIsAppAdmin';
import styled from 'styled-components';
import cx from 'classnames';

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
  } = props;

  return (
    <Wrap className={`flexRow overflowHidden ${className}`}>
      <div className="iconWrap" style={{ backgroundColor: iconColor }}>
        {iconUrl ? <SvgIcon url={iconUrl} fill="#fff" size={16} /> : <Icon icon={defaultIcon} />}
      </div>
      <div
        className={cx('flex nameBox ellipsis Font14 Hand Hover_21')}
        onClick={() => {
          if (createType === 1) {
            window.open(transferExternalLinkUrl(urlTemplate, projectId, appId));
          } else {
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
        {appName}
        {desc && <div className="desc ellipsis Font12 Gray_bd">{desc}</div>}
      </div>
    </Wrap>
  );
}
