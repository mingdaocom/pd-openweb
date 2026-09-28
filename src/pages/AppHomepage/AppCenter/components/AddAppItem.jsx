import React, { Component, lazy, Suspense } from 'react';
import { generate } from '@ant-design/colors';
import _ from 'lodash';
import { array, bool, element, func, string } from 'prop-types';
import { Modal } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import { mapAttachmentForRequest } from 'src/components/Agent/agentService';
import { MINGO_TASK_TYPE } from 'src/components/Mingo/ChatBot/enum';
import { canBuildAppWithMingo } from 'src/components/Mingo/permission';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { emitter } from 'src/utils/platform/browser/dom';
import { getFeatureStatus, getThemeColors } from 'src/utils/services/project';
import { hasPermission } from 'src/utils/services/security/permission';
import SelectDBInstance from './SelectDBInstance';

const LoadableCreateAppEntryDialog = lazy(() => import('./CreateAppEntryDialog'));
const LoadableCreateAppEntryContent = lazy(() => import('./CreateAppEntryContent'));
const LoadableCreateAppDialog = lazy(() => import('./CreateAppDialog'));
const LoadableDialogImportExcelCreate = lazy(() => import('src/pages/worksheet/components/DialogImportExcelCreate'));
const LoadableExternalLinkDialog = lazy(() => import('./ExternalLinkDialog'));
const LoadableImportApp = lazy(() => import('src/pages/Admin/app/appManagement/modules/ImportApp.jsx'));

export default class AddAppItem extends Component {
  static propTypes = {
    createAppFromEmpty: func,
    projectId: string,
    type: string,
    DBInstances: array,
    children: element,
    // 内联模式：在引导页等场景直接平铺创建入口内容，不渲染「新建应用」触发块
    inline: bool,
  };

  static defaultProps = {
    createAppFromEmpty: _.noop,
    DBInstances: [],
  };

  state = { createEntryVisible: false, externalLinkDialogVisible: false, createAppDialogVisible: false };

  // AI 创建：把首条消息（与已上传附件）交给全局 Mingo 抽屉内的 Agent，唤起后自动提交进入 plan 流程
  handleAiSubmit = (text, attachments) => {
    const { groupId } = this.props;
    const trimmed = (text || '').trim();
    const uploaded = (attachments || []).filter(f => f.status === 'uploaded').map(mapAttachmentForRequest);

    if (!trimmed && !uploaded.length) return;
    window.mingoInitialMessage = trimmed;
    if (uploaded.length) {
      window.mingoInitialAttachments = uploaded;
    }

    // 分组内创建：把分组 id 交接给 Agent，拼进 stream context.groupId，让新建应用归入该分组
    if (groupId) {
      window.mingoInitialGroupId = groupId;
    }

    window.mingoPendingStartTask = { type: MINGO_TASK_TYPE.CREATE_APP_ASSIGNMENT };
    emitter.emit('SET_MINGO_VISIBLE');
    this.setState({ createEntryVisible: false });
  };

  // 「更多创建方式」入口，复用原有 handler 与子弹窗，保留原 feature 门禁
  buildCreateActions = () => {
    const { projectId, myPermissions = [] } = this.props;
    const hasAppResourceAuth = hasPermission(myPermissions, PERMISSION_ENUM.APP_RESOURCE_SERVICE);
    const importFeatureType = getFeatureStatus(projectId, VersionProductType.appImportExport);
    const hasDataBase =
      getFeatureStatus(projectId, VersionProductType.dataBase) === '1' &&
      (!window.platformENV.isPlatform || window.platformENV.isHap);

    return [
      {
        id: 'createFromEmpty',
        variant: 'card',
        icon: 'add_circle_outline',
        iconColor: 'var(--color-primary)',
        iconBg: '#E2F2FF',
        title: _l('从空白创建'),
        desc: _l('从0开始搭建你的应用'),
        onClick: () => {
          if (hasDataBase && hasAppResourceAuth) {
            this.getMyDbInstances('createFromEmpty');
          } else {
            this.setState({ createAppDialogVisible: true });
          }
        },
      },
      {
        id: 'installFromLib',
        variant: 'card',
        icon: 'custom_store',
        iconColor: '#FF2FB6',
        iconBg: 'rgba(255, 62, 187, 0.1)',
        title: _l('从市场安装'),
        desc: _l('安装开箱即用的应用'),
        hidden:
          (window.platformENV.isOverseas || window.platformENV.isLocal) && md.global.SysSettings.hideTemplateLibrary,
        // 未配置应用市场地址（私有部署等）时，退回站内应用库
        onClick: () =>
          md.global.Config.MarketUrl
            ? window.open(`${md.global.Config.MarketUrl}/apps`)
            : navigateTo(projectId && projectId !== 'external' ? `/app/lib?projectId=${projectId}` : '/app/lib'),
      },
      {
        id: 'importExcelCreateApp',
        variant: 'row',
        icon: 'new_excel',
        title: _l('从Excel创建'),
        onClick: () => this.setState({ dialogImportExcel: true }),
      },
      {
        id: 'installLoacal',
        variant: 'row',
        icon: 'worksheet_import',
        title: _l('导入MDY文件'),
        hidden: !importFeatureType,
        onClick: () => {
          if (importFeatureType === 2) {
            buriedUpgradeVersionDialog(projectId, VersionProductType.appImportExport);
            return;
          }

          this.setState({ importAppDialog: true });
        },
      },
      {
        id: 'externalLink',
        variant: 'row',
        icon: 'add_link',
        title: _l('添加外部链接'),
        onClick: () => this.setState({ externalLinkDialogVisible: true }),
      },
    ];
  };

  handleClick = ({ id, href, dbInstanceId }) => {
    const { projectId } = this.props;

    switch (id) {
      case 'createFromEmpty':
        const COLORS = getThemeColors(projectId);
        const iconColor = COLORS[_.random(0, COLORS.length - 1)];
        const lightColor = generate(iconColor)[0];
        this.props.createAppFromEmpty({
          projectId,
          name: _l('未命名应用'),
          icon: '0_lego',
          iconColor,
          navColor: iconColor,
          lightColor,
          permissionType: 200,
          dbInstanceId,
        });
        break;
      case 'buildService':
        window.open(href);
        break;
      case 'installLoacal':
        this.setState({ importAppDialog: true });
        break;
      default:
        break;
    }
  };

  handleAiCreateApp = data => {
    const { createAppDbInstanceId } = this.state;
    const { projectId } = this.props;
    const COLORS = getThemeColors(projectId);
    const iconColor = COLORS[_.random(0, COLORS.length - 1)];
    const lightColor = generate(iconColor)[0];
    this.props.createAppFromEmpty(
      {
        projectId,
        icon: '0_lego',
        iconColor,
        navColor: iconColor,
        lightColor,
        permissionType: 200,
        dbInstanceId: createAppDbInstanceId,
        ...data,
      },
      appId => {
        navigateTo('/app/' + appId);
      },
    );
  };

  renderImportApp = () => {
    const { projectId, groupId, groupType, myPermissions = [] } = this.props;
    const { importAppDialog } = this.state;
    const hasAppResourceAuth = hasPermission(myPermissions, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

    if (!importAppDialog) return null;

    return (
      <Modal
        title={_l('导入应用')}
        open={importAppDialog}
        footer={null}
        width={640}
        mask={{ closable: false }}
        keyboard
        onCancel={() => this.setState({ importAppDialog: false })}
      >
        <Suspense fallback={null}>
          <LoadableImportApp
            closeDialog={params => {
              this.setState({ importAppDialog: false, importAppParams: params });
              const hasDataBase =
                getFeatureStatus(projectId, VersionProductType.dataBase) === '1' &&
                (!window.platformENV.isPlatform || window.platformENV.isHap);

              if (hasDataBase && hasAppResourceAuth) {
                return this.getMyDbInstances('importApp');
              }
            }}
            projectId={projectId}
            groupId={groupId}
            groupType={groupType}
          />
        </Suspense>
      </Modal>
    );
  };

  handleSelectedDB = dbInstanceId => {
    const { openDBInstanceFrom, importAppParams } = this.state;
    this.setState({ DBInstancesDialog: false, openDBInstanceFrom: undefined });

    if (openDBInstanceFrom === 'createFromEmpty') {
      this.setState({
        createAppDialogVisible: true,
        createAppDbInstanceId: dbInstanceId,
      });
    } else if (openDBInstanceFrom === 'importApp') {
      window.mdyAPI(
        '',
        '',
        { ...importAppParams, dbInstanceId },
        {
          ajaxOptions: { url: `${md.global.Config.AppFileServer}AppFile/Import` },
        },
      );
    }
  };

  renderDBInstances = () => {
    const { DBInstancesDialog, DBInstances = [] } = this.state;

    const options = [{ value: '', label: _l('系统默认数据库') }].concat(
      DBInstances.map(l => {
        return {
          value: l.id,
          label: l.name,
        };
      }),
    );

    return (
      <SelectDBInstance
        visible={DBInstancesDialog}
        options={options}
        onOk={this.handleSelectedDB}
        onCancel={() => this.setState({ DBInstancesDialog: false, openDBInstanceFrom: undefined })}
      />
    );
  };

  handleAddAppItemClick = e => {
    e.stopPropagation();
    this.setState({ createEntryVisible: true });
  };

  getMyDbInstances = async from => {
    const res = await homeAppAjax.getMyDbInstances({
      projectId: this.props.projectId,
    });

    if (res && res.length) {
      this.setState({
        DBInstances: res,
        DBInstancesDialog: true,
        openDBInstanceFrom: from,
      });
      if (from === 'importApp') return true;
    } else {
      if (from === 'createFromEmpty') {
        this.setState({
          createAppDialogVisible: true,
        });
      }
    }
  };

  render() {
    const { inline, groupId, projectId, groupType, children, className = '', createAppFromEmpty } = this.props;
    const { createEntryVisible, dialogImportExcel, externalLinkDialogVisible, createAppDialogVisible } = this.state;

    return (
      <React.Fragment>
        {inline ? (
          // 内联模式：直接铺开创建入口内容（AI 创建 + 更多创建方式），不走「新建应用」触发块与弹窗。
          // 复用本组件已有的 actions / handleAiSubmit 与全部子弹窗，供新用户 /app/my 引导页使用。
          <Suspense fallback={null}>
            <LoadableCreateAppEntryContent
              projectId={projectId}
              showAi={canBuildAppWithMingo(projectId)}
              actions={this.buildCreateActions()}
              onAiSubmit={this.handleAiSubmit}
            />
          </Suspense>
        ) : children ? (
          React.cloneElement(children, { onClick: this.handleAddAppItemClick })
        ) : (
          <div className={'addAppItemWrap ' + className}>
            <div className="addAppItem" onClick={this.handleAddAppItemClick} />
            <div className="info">{_l('新建应用')}</div>
          </div>
        )}
        {createEntryVisible && (
          <Suspense fallback={null}>
            <LoadableCreateAppEntryDialog
              projectId={projectId}
              showAi={canBuildAppWithMingo(projectId)}
              actions={this.buildCreateActions()}
              onAiSubmit={this.handleAiSubmit}
              onClose={() => this.setState({ createEntryVisible: false })}
            />
          </Suspense>
        )}
        {createAppDialogVisible && (
          <Suspense fallback={null}>
            <LoadableCreateAppDialog
              projectId={projectId}
              onSave={this.handleAiCreateApp}
              onCancel={() => this.setState({ createAppDialogVisible: false, createAppDbInstanceId: undefined })}
            />
          </Suspense>
        )}
        {dialogImportExcel && (
          <Suspense fallback={null}>
            <LoadableDialogImportExcelCreate
              projectId={projectId}
              appGroupType={groupType}
              appGroupId={groupId}
              onCancel={() => this.setState({ dialogImportExcel: false })}
              createType="app"
            />
          </Suspense>
        )}
        {this.renderImportApp()}
        {this.renderDBInstances()}
        {externalLinkDialogVisible && (
          <Suspense fallback={null}>
            <LoadableExternalLinkDialog
              projectId={projectId}
              createAppFromEmpty={createAppFromEmpty}
              onCancel={() => this.setState({ externalLinkDialogVisible: false })}
            />
          </Suspense>
        )}
      </React.Fragment>
    );
  }
}
