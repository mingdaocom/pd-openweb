import React, { Fragment, useEffect, useState } from 'react';
import { Divider } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Icon, Input, QiniuUpload, Switch } from 'ming-ui';
import { formatNumberFromInput } from 'src/util';
import { updateSysSettings } from '../common';
import logo from '../images/logo.png';

const Wrap = styled.div`
  max-width: 880px;
  .uploadingImageWrap,
  .uploadingIconWrap {
    border-radius: 4px;
    border: 2px dotted #ddd;
    &:hover {
      .uploadMask {
        display: flex;
      }
    }
  }
  .uploadingImageWrap {
    height: 63px;
    width: max-content;
    padding: 2px;
  }
  .uploadingIconWrap {
    width: 32px;
    height: 32px;
  }
  .uploadMask {
    display: none;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.4);
  }
  .noBorder {
    border: none;
    border-radius: 0;
    padding: 0;
  }
  .justifyContentCenter {
    justify-content: center;
  }
  .attachmentList {
    display: none !important;
  }
`;

const BrandNameDialog = props => {
  const { visible, onCancel, onSave } = props;
  const [brandName, setBrandName] = useState(props.brandName);
  return (
    <Dialog
      visible={visible}
      title={_l('品牌名称')}
      okText={_l('保存')}
      onOk={() => {
        if (_.isEmpty(brandName)) {
          alert('请输入品牌名称');
          return;
        }
        updateSysSettings(
          {
            brandName,
          },
          () => {
            md.global.SysSettings.brandName = brandName;
          },
        );
        onCancel();
        onSave(brandName);
      }}
      onCancel={onCancel}
    >
      <Input
        className="w100"
        placeholder={_l('输入品牌名称')}
        value={brandName}
        onChange={value => setBrandName(value.trim())}
      />
    </Dialog>
  );
};

const BrandName = () => {
  const { SysSettings } = md.global;
  const [brandName, setBrandName] = useState(SysSettings.brandName);
  const [hideBrandName, setHideBrandName] = useState(SysSettings.hideBrandName);
  const [brandNameDialogVisible, setBrandNameDialogVisible] = useState(false);
  return (
    <Fragment>
      <div className="Font14 bold mBottom8">{_l('品牌名称')}</div>
      <div className="Font13 Gray_9e mBottom18">{_l('平台登录 / 注册页品牌名称')}</div>
      <div className="flexRow valignWrapper Font13">
        <span className="mRight10">{brandName}</span>
        <a onClick={() => setBrandNameDialogVisible(true)}>{_l('修改')}</a>
      </div>
      <div className="flexRow valignWrapper mTop10">
        <Switch
          checked={!hideBrandName}
          onClick={() => {
            const value = !hideBrandName;
            setHideBrandName(value);
            updateSysSettings(
              {
                hideBrandName: value,
              },
              () => {
                md.global.SysSettings.hideBrandName = value;
              },
            );
          }}
        />
        <div className="mLeft8">{_l('在登录界面显示')}</div>
      </div>
      <BrandNameDialog
        visible={brandNameDialogVisible}
        brandName={brandName}
        onCancel={() => {
          setBrandNameDialogVisible(false);
        }}
        onSave={value => {
          setBrandName(value);
        }}
      />
    </Fragment>
  );
};

const BrandLogo = () => {
  const { SysSettings } = md.global;
  const [brandLogoUrl, setBrandLogoUrl] = useState(SysSettings.brandLogoUrl);
  const [hideBrandLogo, setHideBrandLogo] = useState(SysSettings.hideBrandLogo);
  const [brandLogoHeight, setBrandLogoHeight] = useState(SysSettings.brandLogoHeight);
  const [brandLogoRedirectUrl, setBrandLogoRedirectUrl] = useState(SysSettings.brandLogoRedirectUrl);

  const handleChangeLogoHeight = value => {
    let height = parseInt(formatNumberFromInput(value) || 0);
    setBrandLogoHeight(height);
  };

  const handleSaveLogoHeight = () => {
    let value = brandLogoHeight;
    if (value < 30) {
      value = 30;
    }
    if (value > 100) {
      value = 100;
    }
    setBrandLogoHeight(value);
    updateSysSettings(
      {
        brandLogoHeight: value,
      },
      () => {
        md.global.SysSettings.brandLogoHeight = value;
      },
    );
  };

  return (
    <Fragment>
      <div className="Font14 bold mBottom8">{_l('品牌LOGO')}</div>
      <div className="Font13 Gray_9e mBottom8">{_l('推荐尺寸 400*180 px，显示在登录、注册页面')}</div>
      <QiniuUpload
        className="h100"
        options={{
          multi_selection: false,
          filters: {
            mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
          },
          max_file_size: '4m',
          type: 4,
        }}
        bucket={4}
        onUploaded={(up, file) => {
          const fullFilePath = file.url;
          const logoName = file.fileName;
          updateSysSettings(
            {
              brandLogo: logoName,
            },
            () => {
              setBrandLogoUrl(fullFilePath);
              md.global.SysSettings.brandLogo = logoName;
              md.global.SysSettings.brandLogoUrl = fullFilePath;
            },
          );
        }}
        onError={() => { }}
      >
        <div
          id="uploadBrandLogo"
          className={cx('uploadingImageWrap flexRow valignWrapper pointer Relative', {
            noBorder: brandLogoUrl,
            justifyContentCenter: !brandLogoUrl,
          })}
        >
          {brandLogoUrl ? (
            <Fragment>
              <img className="h100" src={brandLogoUrl} />
              <div className="uploadMask flexRow valignWrapper justifyContentCenter">
                <Icon icon="upload_pictures" className="White Font17" />
              </div>
            </Fragment>
          ) : (
            <img className="h100" src={logo} />
          )}
        </div>
      </QiniuUpload>
      <div className="flexRow valignWrapper mTop10">
        <Switch
          checked={!hideBrandLogo}
          onClick={() => {
            const value = !hideBrandLogo;
            setHideBrandLogo(value);
            updateSysSettings(
              {
                hideBrandLogo: value,
              },
              () => {
                md.global.SysSettings.hideBrandLogo = value;
              },
            );
          }}
        />
        <div className="mLeft8">{_l('在登录界面显示')}</div>
      </div>
      {!hideBrandLogo && (
        <div className="flexRow valignWrapper mTop10">
          {_l('LOGO高度')}
          <Input
            className="mLeft10 mRight10"
            style={{ width: 50 }}
            value={brandLogoHeight}
            onBlur={handleSaveLogoHeight}
            onKeyDown={event => {
              event.which === 13 && handleSaveLogoHeight(event);
            }}
            onChange={handleChangeLogoHeight}
          />
          {'px'}
          <span className="Gray_9e mLeft15">{_l('长方形推荐40px，方形推荐56px')}</span>
        </div>
      )}

      <div className="mBottom8 mTop10">{_l('LOGO跳转链接')}</div>
      <Input
        className="LineHeight36"
        value={brandLogoRedirectUrl}
        onBlur={() => {
          if (brandLogoRedirectUrl === SysSettings.brandLogoRedirectUrl) return;
          updateSysSettings(
            {
              brandLogoRedirectUrl: brandLogoRedirectUrl,
            },
            () => {
              md.global.SysSettings.brandLogoRedirectUrl = brandLogoRedirectUrl;
            },
          );
        }}
        onChange={value => setBrandLogoRedirectUrl(value.trim())}
      />
    </Fragment>
  );
};

export const BrandHomeImage = () => {
  const { SysSettings } = md.global;
  const [brandHomeImageUrl, setBrandHomeImageUrl] = useState(SysSettings.brandHomeImageUrl);

  return (
    <Wrap>
      <div className="Font14 bold mBottom8">{_l('背景图')}</div>
      <div className="Font13 Gray_9e mBottom8">{_l('登录页背景图，推荐尺寸 1920*900，2 M以内')}</div>
      <div className="flexRow alignItemsCenter">
        <QiniuUpload
          className="h100"
          options={{
            multi_selection: false,
            filters: {
              mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
            },
            max_file_size: '2m',
            type: 4,
          }}
          bucket={4}
          onUploaded={(up, file) => {
            const fullFilePath = file.url;
            const name = file.fileName;
            updateSysSettings(
              {
                brandHomeImage: name,
              },
              () => {
                setBrandHomeImageUrl(fullFilePath);
                md.global.SysSettings.brandHomeImage = logoName;
                md.global.SysSettings.brandHomeImageUrl = fullFilePath;
              },
            );
          }}
          onError={() => { }}
        >
          <div
            id="uploadBrandHomeImage"
            className={cx('uploadingImageWrap flexRow valignWrapper pointer Relative', {
              noBorder: brandHomeImageUrl,
              justifyContentCenter: !brandHomeImageUrl,
            })}
          >
            {brandHomeImageUrl ? (
              <Fragment>
                <img className="h100" src={brandHomeImageUrl} />
                <div className="uploadMask flexRow valignWrapper justifyContentCenter">
                  <Icon icon="upload_pictures" className="White Font17" />
                </div>
              </Fragment>
            ) : (
              <div className="flexRow valignWrapper justifyContentCenter" style={{ width: 110 }}>
                <Icon icon="upload_pictures" className="Gray_9e Font20" />
              </div>
            )}
          </div>
        </QiniuUpload>
        {brandHomeImageUrl && (
          <span
            className="clearLogo Hand mLeft15 ThemeHoverColor3"
            onClick={() =>
              updateSysSettings(
                {
                  brandHomeImage: '',
                },
                () => {
                  setBrandHomeImageUrl('');
                  md.global.SysSettings.brandHomeImage = '';
                  md.global.SysSettings.brandHomeImageUrl = 'fullFilePath';
                },
              )
            }
          >
            {_l('清除')}
          </span>
        )}
      </div>
    </Wrap>
  );
};

const FaviconSet = () => {

  const defaultFaviconUrl = `${md.global.FileStoreConfig.pictureHost}ProjectLogo/favicon.png`;
  const getUrlWithTimestamp = (url) => `${url}?t=${Date.now()}`;
  const [faviconUrl, setfaviconUrl] = useState(getUrlWithTimestamp(defaultFaviconUrl));

  return (
    <Wrap>
      <div className="Font14 bold mBottom8">Favicon</div>
      <div className="Font13 Gray_9e mBottom8">
        {_l('请上传尺寸 128*128 px 的 PNG 格式文件，用于浏览器标签页和收藏栏显示')}
      </div>
      <div className="flexRow alignItemsCenter">
        <QiniuUpload
          className="h100"
          getTokenParam={{ isFavicon: true }}
          options={{
            multi_selection: false,
            filters: {
              mime_types: [{ extensions: 'png' }],
            },
            max_file_size: '2m',
            type: 4,
          }}
          bucket={4}
          onUploaded={(up, file) => {
            setfaviconUrl(getUrlWithTimestamp(defaultFaviconUrl));
          }}
          onError={() => {
            alert(_l('上传失败'), 3);
          }}
        >
          <div
            id="uploadBrandHomeImage"
            className={cx('uploadingImageWrap flexRow valignWrapper pointer Relative noBorder')}
          >
            <Fragment>
              <img className="h100" src={faviconUrl} />
              <div className="uploadMask flexRow valignWrapper justifyContentCenter">
                <Icon icon="upload_pictures" className="White Font17" />
              </div>
            </Fragment>
          </div>
        </QiniuUpload>
      </div>
    </Wrap>
  );
};

const Brand = props => {
  return (
    <Wrap className="privateCardWrap flexColumn big">
      <div className="Font17 bold mBottom25">{_l('品牌')}</div>
      <BrandName />
      <Divider className="mTop20 mBottom20" />
      <BrandLogo />
      <Divider className="mTop20 mBottom20" />
      <FaviconSet />
    </Wrap>
  );
};

export default Brand;
