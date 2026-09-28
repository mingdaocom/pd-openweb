import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Icon, LoadDiv, QiniuUpload } from 'ming-ui';
import { Button, Input, Modal, Space } from 'ming-ui/antd-components';
import projectSettingController from 'src/api/projectSetting';
import Config from '../../../config';
import './index.less';

export default class SubDomain extends Component {
  constructor(props) {
    super(props);
    this.images = [];
    this.state = {
      subDomain: '', // 域名
      domainName: '',
      dialogName: '',
      homeImage: '', //背景图
      currentHomeImage: '',
      isCustomImage: false, //自定义或者系统默认
      visible: false,
      isUploading: false,
      isLoading: false,
    };
    this.requestPending = false;
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    Promise.all([this.getSubDomainInfo(), this.getSysColor()]).then(([res, { homeImage }]) => {
      const attUrl = `${md.global.FileStoreConfig.pictureHost}/ProjectLogo/`;
      this.images = new Array(5).fill(1).map(function (item, index) {
        return `${attUrl}HomeImage_1${index + 1}.jpg?imageView2/2/w/194/h/52/q/90`;
      });
      const splitHome = homeImage.split('/') || [];
      this.setState({
        subDomain: (res && res.subDomain) || '',
        homeImage: splitHome[splitHome.length - 1],
        domainName: (res && res.subDomain) || '',
        dialogName: (res && res.subDomain) || '',
        currentHomeImage: homeImage,
        isCustomImage: homeImage ? this.testHomeImage(homeImage) : false,
        isLoading: false,
      });
    });
  }

  // 获取图片信息
  getSysColor() {
    return projectSettingController.getSysColor({
      projectId: Config.projectId,
    });
  }

  // 二级域名
  getSubDomainInfo() {
    return projectSettingController.getSubDomain({
      projectId: Config.projectId,
    });
  }

  updateVisible(visible, updateDomainName) {
    this.setState({ visible }, () => {
      updateDomainName === 'update' && this.setState({ domainName: this.state.dialogName });
    });
  }

  //test homeImage是自定义
  testHomeImage(homeImage) {
    const homeImageList = [
      'HomeImage_11',
      'HomeImage_12',
      'HomeImage_13',
      'HomeImage_14',
      'HomeImage_15',
      'HomeImage_16',
    ];
    const idx = _.findIndex(homeImageList, item => {
      return homeImage.includes(item);
    });
    return idx < 0;
  }

  //系统默认更新图片
  updateHomeImage(currentHomeImage, index) {
    this.setState({
      homeImage: `HomeImage_1${index + 1}.jpg`,
      currentHomeImage,
      isCustomImage: this.testHomeImage(`HomeImage_1${index + 1}`),
    });
  }

  handleChange(e) {
    this.setState({
      dialogName: (e.target.value || '').trim(),
    });
  }

  handleSubmit() {
    if (this.requestPending) return;

    this.requestPending = true;
    if (this.state.subDomain) {
      return this.handleHomeImageSubmit()
        .then(images => {
          if (images) {
            alert(_l('设置成功'));
            this.props.setLevel(1);
          } else {
            alert(_l('设置失败'), 2);
          }
        })
        .finally(() => {
          this.requestPending = false;
        });
    }

    return Promise.all([this.handleHomeImageSubmit(), this.handleSubDomainSubmit()])
      .then(([images, name]) => {
        if (images && name === 1) {
          alert(_l('设置成功'));
          this.props.setLevel(1);
        } else if (name === 2) {
          alert(window.platformENV.isHap ? _l('您设置的域名已经被占用') : _l('您设置的别名已经被占用'), 3);
        } else if (!images || name === 3) {
          alert(_l('设置失败'), 2);
        }
      })
      .finally(() => {
        this.requestPending = false;
      });
  }

  handleHomeImageSubmit() {
    return projectSettingController.setCustomeHomeImage({
      imageName: this.state.homeImage,
      projectId: Config.projectId,
    });
  }

  handleSubDomainSubmit() {
    return projectSettingController.setSubDomin({
      subDomain: _.trim(this.state.domainName),
      projectId: Config.projectId,
    });
  }

  handleUploaded = (up, file) => {
    this.setState({
      isUploading: false,
      homeImage: file.fileName,
      currentHomeImage: file.url,
      isCustomImage: this.testHomeImage(file.fileName),
    });
    up.disableBrowse(false);
  };

  renderUploadBtn = () => {
    const { currentHomeImage, isCustomImage } = this.state;

    return (
      <QiniuUpload
        className=""
        ref={this.uploaderWrap}
        options={{
          multi_selection: false,
          filters: {
            mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
          },
          max_file_size: '2m',
          type: 4,
        }}
        bucket={4}
        onUploaded={this.handleUploaded}
        onAdd={up => {
          this.setState({ isUploading: true });
          up.disableBrowse();
        }}
        onError={up => {
          this.setState({ isUploading: false });
          up.disableBrowse(false);
        }}
      >
        <div className="avatar-uploader" id="upload_file">
          <Input type="hidden" />
          {isCustomImage ? (
            <img src={currentHomeImage} alt="avatar" />
          ) : (
            <span className="icon-upload_pictures Font16 TxtMiddle" />
          )}
        </div>
      </QiniuUpload>
    );
  };

  render() {
    const { subDomain, domainName, isLoading, currentHomeImage, visible } = this.state;
    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader justifyContentLeft">
          <Icon
            icon="backspace"
            className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
            onClick={() => this.props.setLevel(1)}
          ></Icon>
          <span className="Font17">{window.platformENV.isHap ? _l('二级域名设置') : _l('扩展信息设置')}</span>
        </div>
        <div className="orgManagementContent">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <div className="sub-domain">
              <Modal
                open={visible}
                title={window.platformENV.isHap ? _l('设置二级域名') : _l('设置组织别名')}
                cancelText={_l('取消')}
                okText={_l('确定')}
                width={480}
                mask={{ closable: false }}
                keyboard
                onCancel={this.updateVisible.bind(this, false)}
                onOk={() => {
                  this.updateVisible(false, 'update');
                }}
              >
                {window.platformENV.isHap ? (
                  <Fragment>
                    <div className="domain-describe">
                      {subDomain
                        ? _l('您已设置一次域名。若二次修改，请使用管理员的邮箱向')
                        : _l('只能设置一次域名。若二次修改，请使用管理员的邮箱向')}
                    </div>
                    <div className="domain-describe">{_l('feedback@mingdao.com 发送修改申请')}</div>
                    <Space.Compact block className={`mTop25 ${subDomain ? 'Hidden' : ''}`}>
                      <Input
                        defaultValue={domainName}
                        style={{ flex: 1 }}
                        ref={con => (this.inputValue = con)}
                        onChange={this.handleChange.bind(this)}
                      />
                      <Input
                        readOnly
                        tabIndex={-1}
                        value=".mingdao.com"
                        style={{ width: 120, color: 'var(--color-text-secondary)' }}
                      />
                    </Space.Compact>
                  </Fragment>
                ) : (
                  <Input
                    defaultValue={domainName}
                    className="w100 mTop25"
                    ref={con => (this.inputValue = con)}
                    onChange={this.handleChange.bind(this)}
                  />
                )}
              </Modal>

              <div className="common-info-row">
                <div className="common-info-row-label">
                  {window.platformENV.isHap ? _l('二级域名') : _l('组织别名')}
                </div>
                <div className="common-info-row-content">
                  <div>
                    {domainName ? (
                      <span className="color_b">
                        {window.platformENV.isHap ? `${domainName}.mingdao.com` : domainName}
                      </span>
                    ) : (
                      <span className="domain-describe">
                        {window.platformENV.isHap
                          ? _l('付费版下的网络支持直接通过二级域名访问网络。')
                          : _l('可通过设置组织别名来实现更多的使用场景（如：LDAP 登录时指定组织）。')}
                      </span>
                    )}
                    <Button color="primary" variant="link" onClick={this.updateVisible.bind(this, true)}>
                      {domainName ? _l('修改') : _l('设置')}
                    </Button>
                  </div>
                  {window.platformENV.isHap && (
                    <div className={`domain-describe ${domainName ? 'Hidden' : ''}`}>
                      {_l('如：company.mingdao.com')}
                    </div>
                  )}
                </div>
              </div>

              <div className="split-line" />

              <div className="common-info-row Font14 Bold">
                {window.platformENV.isHap ? _l('二级域名封面') : _l('登录背景图片')}
              </div>
              <div className="common-info-row mTop40">
                <div className="common-info-row-label">{_l('系统默认')}</div>
                <div className="common-images">
                  {this.images.map((img, index) => {
                    return (
                      <img
                        key={index}
                        src={img}
                        className={`Hand homeImage ${
                          currentHomeImage.indexOf(`HomeImage_1${index + 1}.jpg`) > -1 ? 'borderColorPrimary' : ''
                        }`}
                        onClick={this.updateHomeImage.bind(this, img, index)}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="common-info-row mTop40">
                <div className="common-info-row-label">{_l('自定义')}</div>
                <div>
                  {this.renderUploadBtn()}
                  <div className="domain-describe mTop16">
                    {_l('推荐尺寸 1920*900，2 M以内，显示在二级域名的登录背景')}
                  </div>
                </div>
              </div>
              <div className="common-info-row pTop54">
                <div className="common-info-row-label"></div>
                <Button type="primary" shape="round" onClick={() => this.handleSubmit()}>
                  {_l('保存')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
