import React, { Component, createRef } from 'react';
import ClipboardButton from 'react-clipboard.js';
import _ from 'lodash';
import { Button, Dialog, LoadDiv, QiniuUpload, UpgradeIcon, VerifyPasswordConfirm } from 'ming-ui';
import fixedDataAjax from 'src/api/fixedData';
import projectController from 'src/api/project';
import projectSettingController from 'src/api/projectSetting';
import AdminCommon from 'src/pages/Admin/common/common';
import DialogSettingInviteRules from 'src/pages/Admin/user/membersDepartments/structure/components/dialogSettingInviteRules/index.jsx';
import CertificationButton from 'src/pages/certification/CertificationButton';
import { getCurrentProject } from 'src/utils/project';
import Config from '../../../config';
import SetInfoDialog from '../modules/SetInfoDialog';
import './index.less';

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
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.level !== this.props.level) {
      this.getAllData();
    }
  }

  getAllData() {
    this.setState({ isLoading: true });
    Promise.all([this.getSysColor(), this.getSubDomainInfo(), this.getCommonInfo()]).then(
      ([
        { homeImage, logo, isDefaultLogo },
        res,
        {
          companyDisplayName,
          companyName,
          geographyId,
          industryId,
          authType,
          geoCountryRegionCode,
          timeZone,
          timeZoneName,
          privacyModel = {},
          geoCountryRegionName,
        },
      ]) => {
        const { allowProjectCodeJoin, regCode } = privacyModel;
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
            timeZone,
            timeZoneName,
            geoCountryRegionCode,
            geoCountryRegionName,
            allowProjectCodeJoin,
            code: regCode,
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

  onCloseProject = () => {
    const currentProject = getCurrentProject(Config.projectId);
    const isFree = currentProject.licenseType === 0 || currentProject.licenseType === 2;

    if (isFree) {
      VerifyPasswordConfirm.confirm({
        isRequired: true,
        onOk: () => this.toggleComp(4),
      });
    } else {
      Dialog.confirm({
        title: _l('当前已付费组织还未到期，使用到期后才能关闭'),
        removeCancelBtn: true,
        okText: _l('我知道了'),
      });
    }
  };

  renderUploadBtn = () => {
    const { logo } = this.state;

    if (Config.project.licenseType === 0) {
      return (
        <div className="logoBoxBorder">
          <img src={logo} alt="avatar" />
          <div
            className="logoIconBox"
            id="upload_image"
            onClick={() => {
              AdminCommon.freeUpdateDialog();
            }}
          >
            <span className="Font15 icon-upload_pictures"></span>
          </div>
        </div>
      );
    }

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
          <div className="logoIconBox" id="upload_image">
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
      timeZone,
      timeZoneName,
      authType,
      isLoading,
      allowProjectCodeJoin,
      showDialogSettingInviteRules,
      geoCountryRegionCode,
      geoCountryRegionName,
    } = this.state;
    const showInfo = [1, 2, 3].indexOf(visibleType) > -1;
    const { isSuperAdmin } = getCurrentProject(Config.projectId);

    return (
      <div className="orgManagementWrap">
        <div className="orgManagementHeader">
          <span className="Font17">{_l('组织信息')}</span>
        </div>
        <div className="orgManagementContent">
          {isLoading ? (
            <LoadDiv />
          ) : (
            <div className="common-info mBottom80">
              {showInfo && (
                <SetInfoDialog
                  timeZone={timeZone}
                  industryId={industryId}
                  visibleType={visibleType}
                  companyName={companyName}
                  geographyId={geographyId}
                  projectId={Config.projectId}
                  companyDisplayName={companyDisplayName}
                  geoCountryRegionCode={geoCountryRegionCode}
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
                {companyName && <span className="mRight16">{companyName}</span>}
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('简称')}</div>
                {companyDisplayName && <span className="mRight16">{companyDisplayName}</span>}
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('国家和地区')}</div>
                <span className="mRight16">{geoCountryRegionName || _l('未设置')}</span>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label">{_l('时区')}</div>
                <span className="mRight16">
                  {((timeZoneName || '').match(/.*? /) || [''])[0].trim() || _l('未设置')}
                </span>
              </div>
              <div className="common-info-row mTop24">
                <div className="common-info-row-label"></div>
                <Button
                  type="link"
                  className="ThemeColor3 adminHoverColor editBtn"
                  onClick={() => this.updateVisible(1)}
                >
                  {_l('修改组织信息')}
                </Button>
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
                        '试用、免费版需组织完成身份认证后可充值余额；自定义短信签名等功能需完成组织身份认证（注意：非个人身份）',
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
                  <div className="mTop4 Gray_75">
                    {_l(
                      '通过二级域名可建立组织专属的登录页，会展示组织LOGO与配置的背景图，若配置了LDAP、企业微信、钉钉或飞书集成，也会展示在登录页可快捷登录',
                    )}
                  </div>
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

              <div className="split-line"></div>

              {isSuperAdmin && (
                <div className="common-info-row">
                  <div className="common-info-row-label">{_l('关闭组织')}</div>
                  <div>
                    <div className="Hand adminHoverDeleteColor Bold mBottom8" onClick={this.onCloseProject}>
                      {_l('关闭')}
                    </div>
                    <div className="Font13 Gray_9e">
                      {_l(
                        '组织关闭后，所有人将无法访问组织和应用。90天后组织内所有应用将自动进入回收站，进入回收站60天后将被彻底物理删除，请谨慎操作！',
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {showDialogSettingInviteRules && (
          <DialogSettingInviteRules
            showDialogSettingInviteRules={showDialogSettingInviteRules}
            setValue={this.openAllowProjectCodeJoin}
            projectId={Config.projectId}
            updateAllowProjectCodeJoin={value => this.setState({ allowProjectCodeJoin: value })}
          />
        )}
      </div>
    );
  }
}
