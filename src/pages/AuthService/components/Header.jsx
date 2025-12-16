import React from 'react';
import _ from 'lodash';

function Header(props) {
  const { lineLoading, logo, hasGetLogo, isDefaultLogo, loading } = props;

  let brandLogo = '';
  if (!_.get(md, 'global.Config.IsLocal')) {
    if (hasGetLogo) {
      brandLogo = isDefaultLogo ? '' : logo;
    } else {
      brandLogo = logo || `${_.get(md, 'global.FileStoreConfig.pictureHost')}/ProjectLogo/default.png`;
    }
  } else {
    brandLogo = logo || _.get(md, 'global.SysSettings.brandLogoUrl');
  }

  const brandLogoRedirectUrl = _.get(md, 'global.Config.IsLocal') ? md.global.SysSettings.brandLogoRedirectUrl : '/';
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
            <a href={brandLogoRedirectUrl}>{renderLogo()}</a>
          )}
        </div>
      )}
    </React.Fragment>
  );
}

export default Header;
