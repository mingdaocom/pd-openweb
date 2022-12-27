import React, { Fragment, useState, useEffect } from 'react';
import { Input, Dialog, Icon } from 'ming-ui';
import { Button, Divider } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { updateSysSettings } from '../common';
import 'src/components/uploadAttachment/uploadAttachment';
import logo from '../images/logo.png';
import _ from 'lodash';

const Wrap = styled.div`
  .uploadingImageWrap, .uploadingIconWrap {
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
        updateSysSettings({
          brandName
        }, () => {
          md.global.SysSettings.brandName = brandName;
        });
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
}

const BrandName = () => {
  const { SysSettings } = md.global;
  const [brandName, setBrandName] = useState(SysSettings.brandName);
  const [brandNameDialogVisible, setBrandNameDialogVisible] = useState(false);
  return (
    <Fragment>
      <div className="Font14 bold mBottom8">{_l('品牌名称')}</div>
      <div className="Font13 Gray_9e mBottom18">{_l('平台登录 / 注册页品牌名称')}</div>
      <div className="flexRow valignWrapper Font13 Gray_9e">
        <span className="mRight10">{brandName}</span>
        <a onClick={() => setBrandNameDialogVisible(true)}>{_l('修改')}</a>
      </div>
      <BrandNameDialog
        visible={brandNameDialogVisible}
        brandName={brandName}
        onCancel={() => {
          setBrandNameDialogVisible(false);
        }}
        onSave={(value) => {
          setBrandName(value);
        }}
      />
    </Fragment>
  );
}

const BrandLogo = () => {
  const { SysSettings } = md.global;
  const [brandLogoUrl, setBrandLogoUrl] = useState(SysSettings.brandLogoUrl);

  useEffect(() => {
    $('#hideUploadBrandLogo').uploadAttachment({
      filterExtensions: 'gif,png,jpg,jpeg,bmp',
      pluploadID: '#uploadBrandLogo',
      multiSelection: false,
      maxTotalSize: 4,
      folder: 'ProjectLogo',
      onlyFolder: true,
      onlyOne: true,
      styleType: '0',
      tokenType: 4,
      checkProjectLimitFileSizeUrl: '',
      callback: function(attachments) {
        if (attachments.length > 0) {
          const attachment = attachments[0];
          const fullFilePath = attachment.serverName + attachment.filePath + attachment.fileName + attachment.fileExt;
          const logoName = attachment.fileName + attachment.fileExt;
          updateSysSettings({
            brandLogo: logoName,
          }, () => {
            setBrandLogoUrl(fullFilePath);
            md.global.SysSettings.brandLogo = logoName;
            md.global.SysSettings.brandLogoUrl = fullFilePath;
          });
        }
      },
    });
  }, []);

  return (
    <Fragment>
      <div className="Font14 bold mBottom8">{_l('品牌LOGO')}</div>
      <div className="Font13 Gray_9e mBottom8">{_l('推荐尺寸 400*180 px，显示在登录、注册页面')}</div>
      <div
        id="uploadBrandLogo"
        className={cx('uploadingImageWrap flexRow valignWrapper pointer', { noBorder: brandLogoUrl, justifyContentCenter: !brandLogoUrl })}
      >
        <input id="hideUploadBrandLogo" type="file" className="Hidden" />
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
    </Fragment>
  );
}

const BrandHomeImage = () => {
  const { SysSettings } = md.global;
  const [brandHomeImageUrl, setBrandHomeImageUrl] = useState(SysSettings.brandHomeImageUrl);

  useEffect(() => {
    $('#hideUploadBrandHomeImage').uploadAttachment({
      filterExtensions: 'gif,png,jpg,jpeg,bmp',
      pluploadID: '#uploadBrandHomeImage',
      multiSelection: false,
      maxTotalSize: 2,
      folder: 'ProjectLogo',
      onlyFolder: true,
      onlyOne: true,
      styleType: '0',
      tokenType: 4,
      checkProjectLimitFileSizeUrl: '',
      callback: function(attachments) {
        if (attachments.length > 0) {
          const attachment = attachments[0];
          const fullFilePath = attachment.serverName + attachment.filePath + attachment.fileName + attachment.fileExt;
          const name = attachment.fileName + attachment.fileExt;
          updateSysSettings({
            brandHomeImage: name,
          }, () => {
            setBrandHomeImageUrl(fullFilePath);
            md.global.SysSettings.brandHomeImage = name;
            md.global.SysSettings.brandHomeImageUrl = fullFilePath;
          });
        }
      },
    });
  }, []);

  return (
    <Fragment>
      <div className="Font14 bold mBottom8">{_l('登录/注册背景图')}</div>
      <div className="Font13 Gray_9e mBottom8">{_l('推荐尺寸 1920*900，2 M以内')}</div>
      <div id="uploadBrandHomeImage" className={cx('uploadingImageWrap flexRow valignWrapper pointer', { noBorder: brandHomeImageUrl, justifyContentCenter: !brandHomeImageUrl })}>
        <input id="hideUploadBrandHomeImage" type="file" className="Hidden" />
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
    </Fragment>
  );
}

const BrandFavicon = () => {
  const { SysSettings } = md.global;
  const [brandFaviconUrl, setBrandFaviconUrl] = useState(SysSettings.brandFaviconUrl);

  useEffect(() => {
    $('#hideUploadBrandFavicon').uploadAttachment({
      filterExtensions: 'ico',
      pluploadID: '#uploadBrandFavicon',
      multiSelection: false,
      maxTotalSize: 2,
      folder: 'ProjectLogo',
      onlyFolder: true,
      onlyOne: true,
      styleType: '0',
      tokenType: 4,
      checkProjectLimitFileSizeUrl: '',
      callback: function(attachments) {
        if (attachments.length > 0) {
          const attachment = attachments[0];
          const fullFilePath = attachment.serverName + attachment.filePath + attachment.fileName + attachment.fileExt;
          const name = attachment.fileName + attachment.fileExt;
          updateSysSettings({
            brandFavicon: name,
          }, () => {
            setBrandFaviconUrl(fullFilePath);
            md.global.SysSettings.brandFavicon = name;
            md.global.SysSettings.brandFaviconUrl = fullFilePath;
          });
        }
      },
    });
  }, []);

  return (
    <Fragment>
      <div className="Font14 bold mBottom8">{_l('Favicon')}</div>
      <div className="Font13 Gray_9e mBottom8">{_l('推荐尺寸 32*32 px，文件格式ico，显示在浏览器页签、浏览器收藏夹')}</div>
      <div id="uploadBrandFavicon" className={cx('uploadingIconWrap flexRow valignWrapper pointer', { noBorder: brandFaviconUrl, justifyContentCenter: !brandFaviconUrl })}>
        <input id="hideUploadBrandFavicon" type="file" className="Hidden" />
        {brandFaviconUrl ? (
          <Fragment>
            <img className="h100" src={brandFaviconUrl} />
            <div className="uploadMask flexRow valignWrapper justifyContentCenter">
              <Icon icon="upload_pictures" className="White Font17" />
            </div>
          </Fragment>
        ) : (
          <Icon icon="upload_pictures" className="Gray_9e" />
        )}
      </div>
    </Fragment>
  );
}

const Brand = props => {
  return (
    <Wrap className="privateCardWrap flexColumn big">
      <div className="Font17 bold mBottom25">{_l('品牌')}</div>
      <BrandName />
      <Divider className="mTop20 mBottom20" />
      <BrandLogo />
      <Divider className="mTop20 mBottom20" />
      <BrandHomeImage />
      {/*<Divider className="mTop20 mBottom20" />
      <BrandFavicon />*/}
    </Wrap>
  );
}

export default Brand;
