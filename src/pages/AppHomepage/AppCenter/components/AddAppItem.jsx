import React, { Component, Fragment } from 'react';
import { string, func, array } from 'prop-types';
import { Icon, Menu, MenuItem, Dialog } from 'ming-ui';
import DialogImportExcelCreate from 'src/pages/worksheet/components/DialogImportExcelCreate';
import ImportApp from 'src/pages/Admin/app/appManagement/modules/ImportApp.jsx';
import { navigateTo } from 'src/router/navigateTo';
import { generate } from '@ant-design/colors';
import { getFeatureStatus, buriedUpgradeVersionDialog, getThemeColors, getCurrentProject } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import _ from 'lodash';
import ExternalLinkDialog from './ExternalLinkDialog';
import homeAppAjax from 'src/api/homeApp';
import SelectDBInstance from './SelectDBInstance';
import { hasPermission } from 'src/components/checkPermission';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import Trigger from 'rc-trigger';

const ADD_APP_MODE = [
  { id: 'createFromEmpty', icon: 'plus', text: _l('从空白创建%01003'), href: '/app/lib' },
  {
    id: 'importExcelCreateApp',
    icon: 'new_excel',
    text: _l('从Excel创建%01005'),
    href: '#',
  },
  {
    id: 'installLoacal',
    icon: 'file_upload',
    text: _l('导入%01006'),
    featureId: VersionProductType.appImportExport,
    href: '#',
  },
];

export default class AddAppItem extends Component {
  static propTypes = {
    createAppFromEmpty: func,
    projectId: string,
    type: string,
    DBInstances: array,
  };

  static defaultProps = {
    createAppFromEmpty: _.noop,
    DBInstances: [],
  };

  state = { addTypeVisible: false, externalLinkDialogVisible: false };

  handleClick = ({ id, href, dbInstanceId }) => {
    const { projectId, type } = this.props;
    const { groupId } = this.props;

    switch (id) {
      case 'installFromLib':
        if (!groupId) {
          navigateTo(`${href}?projectId=${projectId}`);
        } else {
          navigateTo(`${href}?projectId=${projectId}&groupId=${groupId}`);
        }
        break;
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
      default:
        break;
    }
  };

  renderImportApp = () => {
    const { projectId, groupId, groupType, myPermissions = [] } = this.props;
    const { importAppDialog } = this.state;
    const hasAppResourceAuth = hasPermission(myPermissions, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

    return (
      <Dialog
        title={_l('导入应用')}
        visible={importAppDialog}
        footer={null}
        width={640}
        overlayClosable={false}
        onCancel={() => this.setState({ importAppDialog: false })}
      >
        <ImportApp
          closeDialog={params => {
            this.setState({ importAppDialog: false, importAppParams: params });
            const currentProject = getCurrentProject(projectId);
            const hasDataBase =
              getFeatureStatus(projectId, VersionProductType.dataBase) === '1' && !md.global.Config.IsPlatformLocal;
            if (hasDataBase && hasAppResourceAuth) {
              return this.getMyDbInstances({}, 'importApp');
            }
          }}
          projectId={projectId}
          groupId={groupId}
          groupType={groupType}
        />
      </Dialog>
    );
  };

  handleSelectedDB = dbInstanceId => {
    const { openDBInstanceFrom, importAppParams } = this.state;
    const { id, href } = ADD_APP_MODE[0];
    this.setState({ DBInstancesDialog: false, openDBInstanceFrom: undefined });

    if (openDBInstanceFrom === 'createFromEmpty') {
      this.handleClick({ id, href, dbInstanceId });
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
    this.setState({ addTypeVisible: true });
  };

  getMyDbInstances = async ({ id, href }, from) => {
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
      from === 'createFromEmpty' && this.handleClick({ id, href });
    }
  };

  render() {
    const {
      groupId,
      projectId,
      groupType,
      children,
      className = '',
      createAppFromEmpty,
      myPermissions = [],
    } = this.props;
    const { addTypeVisible, dialogImportExcel, externalLinkDialogVisible } = this.state;
    const hasAppResourceAuth = hasPermission(myPermissions, PERMISSION_ENUM.APP_RESOURCE_SERVICE);

    return (
      <React.Fragment>
        <Trigger
          action={['click']}
          popupVisible={addTypeVisible}
          popupAlign={{
            points: children ? ['tr', 'br'] : ['tl', 'bl'],
            offset: children ? [0, 5] : [-16, -50],
            overflow: { adjustX: true, adjustY: true },
          }}
          popup={
            <Menu className="addAppItemMenu">
              {ADD_APP_MODE.filter(o => !(o.id === 'installFromLib' && md.global.SysSettings.hideTemplateLibrary)).map(
                ({ id, icon, text, href, featureId }) => {
                  const featureType = getFeatureStatus(projectId, VersionProductType.appImportExport);
                  if (featureId && !featureType) return;
                  return (
                    <MenuItem
                      key={id}
                      icon={<Icon icon={icon} className="addItemIcon Font18" />}
                      onClick={() => {
                        this.setState({ addTypeVisible: false });
                        if (featureType === 2) {
                          buriedUpgradeVersionDialog(projectId, VersionProductType.appImportExport);
                          return;
                        }
                        if (id === 'createFromEmpty') {
                          const currentProject = getCurrentProject(projectId);
                          const hasDataBase =
                            getFeatureStatus(projectId, VersionProductType.dataBase) === '1' &&
                            !md.global.Config.IsPlatformLocal;
                          if (hasDataBase && hasAppResourceAuth) {
                            this.getMyDbInstances({ id, href }, 'createFromEmpty');
                            return;
                          }
                        }
                        if (id === 'importExcelCreateApp') {
                          this.setState({ dialogImportExcel: true });
                        }
                        this.handleClick({ id, href });
                      }}
                    >
                      {text}
                    </MenuItem>
                  );
                },
              )}
              <hr className="divider" />
              <MenuItem
                key="externalLink"
                icon={<Icon icon="add_link" className="addItemIcon Font18" />}
                onClick={() => this.setState({ externalLinkDialogVisible: true, addTypeVisible: false })}
              >
                {_l('添加外部链接')}
              </MenuItem>
            </Menu>
          }
          onPopupVisibleChange={visible => this.setState({ addTypeVisible: visible })}
        >
          <div className={'addAppItemWrap ' + className}>
            {children ? (
              <div onClick={this.handleAddAppItemClick}>{children}</div>
            ) : (
              <Fragment>
                <div className="addAppItem" onClick={this.handleAddAppItemClick} />
                <div className="info">{_l('新建应用')}</div>
              </Fragment>
            )}
          </div>
        </Trigger>

        {dialogImportExcel && (
          <DialogImportExcelCreate
            projectId={projectId}
            appGroupType={groupType}
            appGroupId={groupId}
            onCancel={() => this.setState({ dialogImportExcel: false })}
            createType="app"
          />
        )}
        {this.renderImportApp()}
        {this.renderDBInstances()}
        {externalLinkDialogVisible && (
          <ExternalLinkDialog
            projectId={projectId}
            createAppFromEmpty={createAppFromEmpty}
            onCancel={() => this.setState({ externalLinkDialogVisible: false })}
          />
        )}
      </React.Fragment>
    );
  }
}
