import React, { Component, Fragment } from 'react';
import { string, func } from 'prop-types';
import Icon from 'ming-ui/components/Icon';
import Menu from 'ming-ui/components/Menu';
import MenuItem from 'ming-ui/components/MenuItem';
import Dialog from 'ming-ui/components/Dialog';
import DialogImportExcelCreate from 'src/pages/worksheet/components/DialogImportExcelCreate';
import ImportApp from 'src/pages/Admin/appManagement/modules/ImportApp.jsx';
import { navigateTo } from 'src/router/navigateTo';
import { generate } from '@ant-design/colors';
import { getFeatureStatus, buriedUpgradeVersionDialog, getThemeColors } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import _ from 'lodash';
import ExternalLinkDialog from './ExternalLinkDialog';

const ADD_APP_MODE = [
  { id: 'createFromEmpty', icon: 'plus', text: _l('从空白创建%01003'), href: '/app/lib' },
  {
    id: 'installFromLib',
    icon: 'sidebar_application_library',
    text: _l('从应用库中安装%01004'),
    href: '/app/lib',
  },
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
  };

  static defaultProps = {
    createAppFromEmpty: _.noop,
  };

  state = { addTypeVisible: false, externalLinkDialogVisible: false };

  handleClick = ({ id, href }) => {
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
        this.setState({ addTypeVisible: false });
        const lightColor = generate(iconColor)[0];
        this.props.createAppFromEmpty({
          projectId,
          name: _l('未命名应用'),
          icon: '0_lego',
          iconColor,
          navColor: iconColor,
          lightColor,
          permissionType: 200,
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
    const { projectId, groupId, groupType } = this.props;
    const { importAppDialog } = this.state;
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
          closeDialog={() => {
            this.setState({ importAppDialog: false });
          }}
          projectId={projectId}
          groupId={groupId}
          groupType={groupType}
        />
      </Dialog>
    );
  };

  handleAddAppItemClick = e => {
    e.stopPropagation();
    this.setState({ addTypeVisible: true });
  };

  render() {
    const { groupId, projectId, groupType, children, className = '', createAppFromEmpty } = this.props;
    const { addTypeVisible, dialogImportExcel, externalLinkDialogVisible } = this.state;
    return (
      <div className={'addAppItemWrap ' + className}>
        {children ? (
          <div onClick={this.handleAddAppItemClick}>{children}</div>
        ) : (
          <Fragment>
            <div className="addAppItem" onClick={this.handleAddAppItemClick} />
            <div className="info">{_l('新建应用')}</div>
          </Fragment>
        )}
        {addTypeVisible && (
          <Menu
            className="addAppItemMenu"
            onClickAwayExceptions={['.addAppItem']}
            onClickAway={() => {
              this.setState({ addTypeVisible: false });
            }}
          >
            {ADD_APP_MODE.filter(o => !(o.id === 'installFromLib' && md.global.SysSettings.hideTemplateLibrary)).map(
              ({ id, icon, text, href, featureId }) => {
                const featureType = getFeatureStatus(projectId, VersionProductType.appImportExport);
                if (featureId && !featureType) return;
                return (
                  <MenuItem
                    key={id}
                    icon={<Icon icon={icon} className="addItemIcon Font18" />}
                    onClick={() => {
                      if (featureType === 2) {
                        buriedUpgradeVersionDialog(projectId, VersionProductType.appImportExport);
                        return;
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
              onClick={() => this.setState({ externalLinkDialogVisible: true })}
            >
              {_l('添加外部链接')}
            </MenuItem>
          </Menu>
        )}
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
        {externalLinkDialogVisible && (
          <ExternalLinkDialog
            projectId={projectId}
            createAppFromEmpty={createAppFromEmpty}
            onCancel={() => this.setState({ externalLinkDialogVisible: false })}
          />
        )}
      </div>
    );
  }
}
