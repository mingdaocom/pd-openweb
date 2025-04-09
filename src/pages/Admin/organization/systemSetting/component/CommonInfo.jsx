import React, { Component, createRef } from 'react';
import SetInfoDialog from '../modules/SetInfoDialog';
import Config from '../../../config';
import './index.less';
import { UpgradeIcon, LoadDiv, QiniuUpload } from 'ming-ui';
import projectController from 'src/api/project';
import projectSettingController from 'src/api/projectSetting';
import ClipboardButton from 'react-clipboard.js';
import AdminCommon from 'src/pages/Admin/common/common';
import DialogSettingInviteRules from 'src/pages/Admin/user/membersDepartments/structure/components/dialogSettingInviteRules/index.jsx';
import _ from 'lodash';
import { getCurrentProject } from 'src/util';
import CertificationButton from 'src/pages/certification/CertificationButton';

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
      industryId: '', //行业
      geographyId: '', //所在地
      visibleType: 0,
      isUploading: false,
      isLoading: false,
      uploadLoading: false,
      showDialogSettingInviteRules: false,
      authType: 0, //认证类型
    };
    this.uploaderWrap = createRef(null);
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
        { homeImage, logo, isDefaultLogo },
        res,
        { companyDisplayName, companyName, geographyId, industryId, authType },
      ]) => {
        this.setState(
          {
            homeImage: `${homeImage}?imageView2/2/w/194/h/52/q/90`,
            logo,
            subDomain: (res && res.subDomain) || '',
            companyDisplayName,
            companyName,
            geographyId,
            industryId,
            isLoading: false,
            isDefaultLogo,
            authType,
          },
          () => {
            if (Config.project.licenseType === 0) {
              return;
            }
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
      visibleType: 0,
      ...value,
    });
  }

  // 1: 名称, 2: 所在地，3: 行业
  updateVisible(visibleType) {
    this.setState({ visibleType });
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
            isDefaultLogo: false,
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

  clearLogo = async () => {
    const clearRes = await projectSettingController.clearLogo({ projectId: Config.projectId });
    if (clearRes) {
      const sysInfo = await this.getSysColor();
      const { logo, isDefaultLogo } = sysInfo;
      this.setState({ logo, isDefaultLogo });
    } else {
      alert(_l('操作失败', 2));
    }
  };

  handleUploaded = (up, file) => {
    this.setState({ uploadLoading: false });
    up.disableBrowse(false);
    this.setLogo(file.url, file.fileName);
  };

  renderUploadBtn = () => {
    const { logo } = this.state;

    return (
      <QiniuUpload
        className="h100"
        ref={this.uploaderWrap}
        options={{
          multi_selection: false,
          filters: {
            mime_types: [{ extensions: 'gif,png,jpg,jpeg,bmp' }],
          },
          max_file_size: '4m',
          type: 4,
        }}
        bucket={4}
        onUploaded={this.handleUploaded}
        onAdd={(up, files) => {
          this.setState({ uploadLoading: true });
          up.disableBrowse();
        }}
        onError={() => {}}
      >
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
            <span className="Font15 icon-upload_pictures"></span>
          </div>
        </div>
      </QiniuUpload>
    );
  };

  render() {
    const {
      isDefaultLogo,
      logo,
      companyDisplayName,
      companyName,
      geographyId,
      industryId,
      visibleType,
      subDomain,
      homeImage,
      code,
      isLoading,
      allowProjectCodeJoin,
      showDialogSettingInviteRules,
      authType,
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
            <div className="common-info mBottom80">
              {showInfo && (
                <SetInfoDialog
                  projectId={Config.projectId}
                  visibleType={visibleType}
                  companyDisplayName={companyDisplayName}
                  companyName={companyName}
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
                  <div className="flexRow alignItemsCenter">
                    <div className="Hand">{this.renderUploadBtn()}</div>
                    {logo && !isDefaultLogo && (
                      <span className="clearLogo Hand mLeft15" onClick={this.clearLogo}>
                        {_l('清除')}
                      </span>
                    )}
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
              {!md.global.Config.IsLocal && (
                <div className="common-info-row mTop24">
                  <div className="common-info-row-label">{_l('身份认证')}</div>
                  <div className="common-info-row-content">
                    <CertificationButton
                      authType={authType}
                      projectId={Config.projectId}
                      onUpdateCertStatus={authType => this.setState({ authType })}
                    />
                    <div className="set-describe mTop4">
                      {_l(
                        '试用、免费版需组织完成身份认证后可充值余额；自定义短信签名需组织完成企业身份认证（注意：非个人身份）',
                      )}
                    </div>
                  </div>
                </div>
              )}

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
