import React from 'react';
import _ from 'lodash';
import { pathCompletion } from 'src/utils/common';

function Header(props) {
  const { lineLoading, logo, hasGetLogo, isDefaultLogo, loading } = props;

  let brandLogo = '';

  if (!window.platformENV.isOverseas && !window.platformENV.isLocal) {
    if (hasGetLogo) {
      brandLogo = isDefaultLogo ? '' : logo;
    } else {
      brandLogo = logo || `${_.get(md, 'global.FileStoreConfig.pictureHost')}/ProjectLogo/default.png`;
    }
  } else {
    const sysBrandLogoUrl = _.get(md, 'global.SysSettings.brandLogoUrl');
    brandLogo =
      logo || (typeof sysBrandLogoUrl === 'string' && sysBrandLogoUrl.includes('emptylogo') ? '' : sysBrandLogoUrl);
  }

  const brandLogoRedirectUrl =
    window.platformENV.isOverseas || window.platformENV.isLocal ? md.global.SysSettings.brandLogoRedirectUrl : '/';

  const renderLogo = () => {
    return <img src={brandLogo} height={_.get(md, 'global.SysSettings.brandLogoHeight') || 40} />;
  };

  return (
    <React.Fragment>
      {lineLoading && <div className="loadingLine"></div>}
      {!loading && !_.get(md, 'global.SysSettings.hideBrandLogo') && brandLogo && (
        <div className="titleHeader">
          {window.isMingDaoApp || !brandLogoRedirectUrl ? (
            renderLogo()
          ) : (
            <a href={pathCompletion(brandLogoRedirectUrl)}>{renderLogo()}</a>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default Header;
