import React, { Component } from 'react';
import SetInfoDialog from '../modules/SetInfoDialog';
import Config from '../../../config';
import LoadDiv from 'ming-ui/components/LoadDiv';
import './index.less';
import { UpgradeIcon } from 'ming-ui';
import projectController from 'src/api/project';
import projectSettingController from 'src/api/projectSetting';
import ClipboardButton from 'react-clipboard.js';
import AdminCommon from 'src/pages/Admin/common/common';
import DialogSettingInviteRules from 'src/pages/Admin/user/membersDepartments/structure/components/dialogSettingInviteRules/index.jsx';

import 'src/components/uploadAttachment/uploadAttachment';
import _ from 'lodash';
import { getCurrentProject } from 'src/util';

export default class CommonInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logo: '', //logo图片
      code: '', // 组织门牌号
      homeImage: '',
      subDomain: '',
      companyDisplayName: '', //简称
      companyName: '', //全称
      companyNameEnglish: '', //英文名称
      industryId: '', //行业
      geographyId: '', //所在地
      visibleType: 0,
      isUploading: false,
      isLoading: false,
      uploadLoading: false,
      showDialogSettingInviteRules: false,
    };
  }

  componentDidMount() {
    this.getAllData();
    this.getPrivacy();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.level !== this.props.level) {
      this.getAllData();
      this.getPrivacy();
    }
  }

  getAllData() {
    this.setState({ isLoading: true });
    Promise.all([this.getSysColor(), this.getSubDomainInfo(), this.getCommonInfo()]).then(
      ([
        { homeImage, logo },
        res,
        { companyDisplayName, companyName, companyNameEnglish, geographyId, industryId },
      ]) => {
        this.setState(
          {
            homeImage: `${homeImage}?imageView2/2/w/194/h/52/q/90`,
            logo,
            subDomain: (res && res.subDomain) || '',
            companyDisplayName,
            companyName,
            companyNameEnglish,
            geographyId,
            industryId,
            isLoading: false,
          },
          () => {
            if (Config.project.licenseType === 0) {
              return;
            }
            this.postUploader();
          },
        );
      },
    );
  }

  //获取当前注销状态
  getLicenseType() {
    return projectController.getProjectLogOff({
      projectId: Config.projectId,
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

  //获取其他基本信息
  getCommonInfo() {
    return projectController.getProjectInfo({
      projectId: Config.projectId,
    });
  }

  // 获取加入人员规则
  getPrivacy() {
    projectSettingController
      .getPrivacy({
        projectId: Config.projectId,
      })
      .then(({ allowProjectCodeJoin, regCode }) => {
        this.setState({ allowProjectCodeJoin, code: regCode });
      });
  }

  //切换二级组件
  toggleComp(level) {
    this.props.setLevel(level);
  }

  //获取设置后的值并隐藏dialog
  updateValue(value) {
    this.setState({
      ...value,
      visibleType: 0,
    });
  }

  // 1: 名称, 2: 所在地，3: 行业
  updateVisible(visibleType) {
    this.setState({ visibleType });
  }

  postUploader() {
    if (this.state.uploadLoading) {
      return;
    }
    const _this = this;
    $('#hideUploadImage').uploadAttachment({
      filterExtensions: 'gif,png,jpg,jpeg,bmp',
      pluploadID: '#upload_image',
      multiSelection: false,
      maxTotalSize: 4,
      folder: 'ProjectLogo',
      onlyFolder: true,
      onlyOne: true,
      styleType: '0',
      tokenType: 4, //网络logo
      checkProjectLimitFileSizeUrl: '',
      filesAdded: function () {
        _this.setState({ uploadLoading: true });
      },
      callback: function (attachments) {
        if (attachments.length > 0) {
          const attachment = attachments[0];
          const fullFilePath = attachment.serverName + attachment.filePath + attachment.fileName + attachment.fileExt;
          const logoName = attachment.fileName + attachment.fileExt;
          _this.setLogo(fullFilePath, logoName);
        }
      },
    });
  }

  setLogo(fullFilePath, logoName) {
    projectSettingController
      .setLogo({
        logoName: logoName,
        projectId: Config.projectId,
      })
      .then(result => {
        if (result) {
          this.setState({
            logo: fullFilePath,
            uploadLoading: false,
          });
        } else {
          this.setState({
            uploadLoading: false,
          });
          alert(_l('保存失败'), 2);
        }
      });
  }

  handleCopyTextSuccess() {
    alert(_l('复制成功'));
  }

  // 打开人员加入规则设置modal设置，修改是否允许搜索组织门牌号
  openAllowProjectCodeJoin = ({ showDialogSettingInviteRules }) => {
    this.setState({ showDialogSettingInviteRules });
    if (!showDialogSettingInviteRules) {
      this.getPrivacy();
    }
  };

  render() {
    const {
      logo,
      companyDisplayName,
      companyName,
      companyNameEnglish,
      geographyId,
      industryId,
      visibleType,
      subDomain,
      homeImage,
      code,
      isLoading,
      allowProjectCodeJoin,
      showDialogSettingInviteRules,
    } = this.state;
    const showInfo = [1, 2, 3].indexOf(visibleType) > -1;
    const { isSuperAdmin } = getCurrentProject(Config.projectId);
    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <span className="Font17">{_l('基础信息')}</span>
        </div>
        <div className="orgManagementContent">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <div className="common-info">
              {showInfo && (
                <SetInfoDialog
                  projectId={Config.projectId}
                  visibleType={visibleType}
                  companyDisplayName={companyDisplayName}
                  companyName={companyName}
                  companyNameEnglish={companyNameEnglish}
                  geographyId={geographyId}
                  industryId={industryId}
                  updateValue={this.updateValue.bind(this)}
                />
              )}

              <div className="common-info-row">
                <div className="common-info-row-label">
                  {_l('组织LOGO')}
                  {Config.project.licenseType === 0 && <UpgradeIcon className="mTop2" />}
                </div>
                <div className="common-info-row-content">
                  <div className="Hand">
                    <input id="hideUploadImage" type="file" className="Hidden" />
                    <div className="logoBoxBorder">
                      <img src={logo} alt="avatar" />
                      <div
                        className="logoIconBox"
                        id="upload_image"
                        onClick={() => {
                          if (Config.project.licenseType === 0) {
                            AdminCommon.freeUpdateDialog();
                            return;
                          }
                        }}
                      >
                        <span className="Font15 icon-upload_pictures" />
                      </div>
                    </div>
                  </div>
                  <div className="set-describe mTop10">
                    {_l('推荐尺寸 400*180 px，显示在工作台、打印、分享和企业域名页面，大小建议在512KB以内')}
                  </div>
                </div>
                {/** 上传图片 */}
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('组织名称')}</div>
                {companyDisplayName && <span className="mRight16">{companyDisplayName}</span>}
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.updateVisible.bind(this, 1)}
                >
                  {_l('修改')}
                </button>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('组织门牌号')}</div>
                <div className="common-info-row-content">
                  <ClipboardButton
                    className="adminHoverColor Hand"
                    component="span"
                    data-clipboard-text={code}
                    onSuccess={this.handleCopyTextSuccess.bind(this)}
                  >
                    <span>{code}</span>
                    <span className="icon-content-copy Font12 mLeft5" />
                  </ClipboardButton>
                  {allowProjectCodeJoin ? (
                    <div className="set-describe mTop4">{_l('成员可输入组织门牌号加入组织')}</div>
                  ) : (
                    <div className="set-describe mTop4">
                      {_l('您已关闭搜索组织门牌号加入')}
                      <span
                        className="mLeft8 open-setting-rules-Txt"
                        onClick={() => this.openAllowProjectCodeJoin({ showDialogSettingInviteRules: true })}
                      >
                        {_l('去开启')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('组织编号(ID)')}</div>
                <div className="common-info-row-content">
                  <ClipboardButton
                    className="adminHoverColor Hand"
                    component="span"
                    data-clipboard-text={Config.projectId}
                    onSuccess={this.handleCopyTextSuccess.bind(this)}
                  >
                    <span>{Config.projectId}</span>
                    <span className="icon-content-copy Font12 mLeft5" />
                  </ClipboardButton>
                  <div className="set-describe mTop4">{_l('组织唯一身份编号，用于沟通反馈问题时使用')}</div>
                </div>
              </div>

              <div className="split-line" />

              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('扩展信息')}</div>
                <div className="common-info-row-content">
                  <div>
                    {subDomain ? (
                      <span className="Font13">{subDomain}</span>
                    ) : (
                      <span className="set-describe">{_l('可自定义组织别名和登录背景图片')}</span>
                    )}
                    <button
                      type="button"
                      className="ming Button Button--link mLeft12 ThemeColor3 adminHoverColor"
                      onClick={() => {
                        if (Config.project.licenseType === 0) {
                          AdminCommon.freeUpdateDialog();
                          return;
                        }
                        this.toggleComp(2);
                      }}
                    >
                      {_l('设置')}
                    </button>
                  </div>
                  {homeImage && <img src={homeImage} className="domain-review" />}
                </div>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('职位列表')}</div>
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.toggleComp.bind(this, 5)}
                >
                  {_l('设置')}
                </button>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('工作地点')}</div>
                <button
                  type="button"
                  className="ming Button Button--link ThemeColor3 adminHoverColor"
                  onClick={this.toggleComp.bind(this, 3)}
                >
                  {_l('设置')}
                </button>
              </div>

              {/* <div className="split-line" />

              {isSuperAdmin && (
                <div className="common-info-row">
                  <div className="common-info-row-label">{_l('注销组织')}</div>
                  <span className="Hand adminHoverDeleteColor" onClick={() => this.props.setLevel(4)}>
                    {_l('注销')}
                  </span>
                </div>
              )} */}
            </div>
          )}
        </div>
        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
            setValue={this.openAllowProjectCodeJoin}
            projectId={Config.projectId}
          />
        )}
      </div>
    );
  }
}
