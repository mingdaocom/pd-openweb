import React, { Component } from 'react';
import { Input } from 'antd';
import _ from 'lodash';
import { Dialog, Icon, LoadDiv, QiniuUpload } from 'ming-ui';
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
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    Promise.all([this.getSubDomainInfo(), this.getSysColor()]).then(([res, { homeImage }]) => {
      const attUrl = `${md.global.FileStoreConfig.pictureHost}ProjectLogo/`;
      this.images = new Array(5).fill(1).map(function(item, index) {
        return `${attUrl}HomeImage_1${index + 1}.jpg?imageView2/2/w/194/h/52/q/90`;
      });
      const splitHome = homeImage.split('/') || [];
      this.setState(
        {
          subDomain: (res && res.subDomain) || '',
          homeImage: splitHome[splitHome.length - 1],
          domainName: (res && res.subDomain) || '',
          dialogName: (res && res.subDomain) || '',
          currentHomeImage: homeImage,
          isCustomImage: homeImage ? this.testHomeImage(homeImage) : false,
          isLoading: false,
        },
      );
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
      dialogName: $.trim(e.target.value),
    });
  }

  handleSubmit() {
    Promise.all([this.handleHomeImageSubmit(), this.handleSubDomainSubmit()]).then(([images, name]) => {
      if (images && name === 1) {
        alert(_l('设置成功'));
        this.props.setLevel(1);
      } else if (name === 2) {
        alert(_l('您设置的别名已经被占用'), 3);
      } else if (!images || name === 3) {
        alert(_l('设置失败'), 2);
      }
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
        onAdd={(up, files) => {
          this.setState({ isUploading: true });
          up.disableBrowse();
        }}
        onError={() => {}}
      >
        <div className="avatar-uploader" id="upload_file">
          <input ref={con => (this.upload = con)} type="hidden" />
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
    const { subDomain, domainName, isLoading, currentHomeImage, visible, isCustomImage } = this.state;
    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader justifyContentLeft">
          <Icon
            icon="backspace"
            className="Hand mRight18 TxtMiddle Font24 adminHeaderIconColor"
            onClick={() => this.props.setLevel(1)}
          />
          <span className="Font17">{_l('扩展信息设置')}</span>
        </div>
        <div className="orgManagementContent">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <div className="sub-domain">
              <Dialog
                visible={visible}
                title={_l('设置组织别名')}
                cancelText={_l('取消')}
                okText={_l('确定')}
                width="480"
                overlayClosable={false}
                onCancel={this.updateVisible.bind(this, false)}
                onOk={() => {
                  this.updateVisible(false, 'update');
                }}
              >
                <Input
                  defaultValue={domainName}
                  className={`w100 mTop25`}
                  ref={con => (this.inputValue = con)}
                  onChange={this.handleChange.bind(this)}
                />
              </Dialog>

              <div className="common-info-row">
                <div className="common-info-row-label">{_l('组织别名')}</div>
                <div className="common-info-row-content">
                  <div>
                    {domainName ? (
                      <span className="color_b">{domainName}</span>
                    ) : (
                      <span className="domain-describe">{_l('可通过设置组织别名来实现更多的使用场景（如：LDAP 登录时指定组织）。')}</span>
                    )}
                    <button
                      type="button"
                      className="ming Button Button--link ThemeColor3 adminHoverColor"
                      onClick={this.updateVisible.bind(this, true)}
                    >
                      {domainName ? _l('修改') : _l('设置')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="split-line" />

              <div className="common-info-row Font14 Bold">{_l('登录背景图片')}</div>
              <div className="common-info-row mTop40">
                <div className="common-info-row-label">{_l('系统默认')}</div>
                <div className="common-images">
                  {this.images.map((img, index) => {
                    return (
                      <img
                        key={index}
                        src={img}
                        className={`Hand homeImage ${
                          currentHomeImage.indexOf(`HomeImage_1${index + 1}.jpg`) > -1 ? 'ThemeBorderColor3' : ''
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
                <div className="common-info-row-label" />
                <button
                  className="ming Button Button--primary Button--small"
                  type="button"
                  onClick={() => this.handleSubmit()}
                >
                  {_l('保存')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
