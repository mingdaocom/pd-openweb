import React, { Component } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/taskCenter';
import createTask from 'src/components/createTask/load';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import { htmlEncodeReg } from 'src/utils/core/string';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import CopyFolder from '../../components/copyFolder/copyFolder';
import ExportFolder from '../../components/exportFolder/exportFolder';
import quickCreateTask from '../../components/quickCreateTask/quickCreateTask';
import SetFolder from '../../components/setFolder/setFolder';
import ShareFolderOrTask from '../../components/shareFolderOrTask/shareFolderOrTask';
import config from '../../config/config';
import {
  getFolderSettings,
  updateFolderArchivedState,
  updateFolderName,
  updateFolderNotice,
  updateFolderTopState,
  updateStateConfig,
} from '../../redux/actions';
import { createFolder, deleteFolder, exitFolder, updateFolderArchived, updateFolderTop } from '../../utils/taskComm';
import { errorMessage, setStateToStorage } from '../../utils/utils';
import Filter from './filter';
import './taskToolbar.less';

const FOLDER_OPERATOR_DROPDOWN_STYLES = { root: { minWidth: 180 } };

class TaskToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      folderName: '',
      showEdit: false,
      showSetFolder: false,
      showCopyFolder: false,
      showExportFolder: false,
      showFilter: false,
      showShareDialog: false,
    };
  }

  componentDidMount() {
    const { folderId } = this.props.taskConfig;

    if (folderId === 1) {
      this.setState({ folderName: _l('未关联项目') });
    } else if (folderId) {
      this.props.dispatch(getFolderSettings(folderId));
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (
        this.props.taskConfig.folderId !== prevProps.taskConfig.folderId ||
        (this.state.showFilter && this.props.taskConfig.taskFilter === 8 && prevProps.taskConfig.taskFilter !== 8) ||
        (prevProps.taskConfig.taskFilter === 8 && this.props.taskConfig.taskFilter !== 8)
      ) {
        this.taskFilterLeave();
      }

      if (
        this.props.taskConfig.folderId &&
        this.props.taskConfig.folderId !== 1 &&
        this.props.taskConfig.folderId !== prevProps.taskConfig.folderId
      ) {
        prevProps.dispatch(getFolderSettings(this.props.taskConfig.folderId));
      }

      if (this.props.folderSettings.folderName !== this.state.folderName) {
        this.setState({
          folderName: this.props.folderSettings.folderName,
        });
      }
    }

    if (this.state.showEdit && !$('.txtName').is(':focus')) {
      $('.txtName').select();
    }
  }

  /**
   * 创建任务
   */
  createTask = () => {
    const { folderId, viewType, projectId } = this.props.taskConfig;

    if (folderId === 1 || (folderId && viewType === config.folderViewType.treeView)) {
      // 延迟解决 第一次初始化的时候就进入了document事件
      setTimeout(() => {
        quickCreateTask.init({
          folderId: folderId === 1 ? '' : folderId,
          projectId,
        });
      }, 10);
    } else {
      createTask();
    }
  };

  handleFolderOperatorClick = ({ key }) => {
    const { folderId } = this.props.taskConfig;
    const { projectID } = this.props.folderSettings;

    switch (key) {
      case 'rename':
        this.setState({ showEdit: true });
        break;
      case 'settings':
        this.setState({ showSetFolder: true });
        break;
      case 'copy':
        expireDialogAsync(projectID).then(() => this.setState({ showCopyFolder: true }));
        break;
      case 'share':
        this.setState({ showShareDialog: true });
        break;
      case 'open':
        this.openNewPage();
        break;
      case 'template':
        this.saveTemplate();
        break;
      case 'export':
        this.setState({ showExportFolder: true });
        break;
      case 'archive':
        this.updateFolderArchived();
        break;
      case 'delete':
        deleteFolder(folderId, this.props.hideNavigation);
        break;
      case 'exit':
        exitFolder(folderId, this.props.hideNavigation);
        break;
    }
  };

  /**
   * render 右侧操作项按钮
   */
  renderRightOperatorBtn() {
    const { showSetFolder, showCopyFolder, showExportFolder, showFilter, showShareDialog } = this.state;
    const {
      folderId,
      viewType,
      lastMyProjectId,
      listStatus,
      listSort,
      searchKeyWords,
      filterSettings,
      taskFilter,
      filterUserId,
    } = this.props.taskConfig;
    const { auth, isMember, projectID, folderName, chargeUser, isArchived } = this.props.folderSettings;

    const isCharge = auth === config.auth.FolderCharger;
    const isAdmin = auth === config.auth.FolderAdmin;
    const folderOperatorItems = [];

    if (isCharge || isAdmin) {
      folderOperatorItems.push(
        { key: 'rename', icon: <i className="icon-hr_edit" />, label: _l('重命名') },
        { key: 'settings', icon: <i className="icon-settings" />, label: _l('项目配置') },
        { type: 'divider' },
        { key: 'copy', icon: <i className="icon-task-new-copy" />, label: _l('复制项目') },
      );
    }

    folderOperatorItems.push(
      { key: 'share', icon: <i className="icon-link2" />, label: _l('获取链接与二维码') },
      { key: 'open', icon: <i className="icon-task-new-detail Font12" />, label: _l('新页面打开') },
      {
        key: 'template',
        icon: <i className="icon-task_set_administrator" />,
        label: (
          <span>
            {_l('保存到我的模板')}
            <Tooltip title={_l('项目及看板名称、自定义任务内容被保存为模板的信息')} placement="bottomLeft">
              <i className="icon-info mLeft5" />
            </Tooltip>
          </span>
        ),
      },
    );

    if (isCharge || isAdmin) {
      folderOperatorItems.push({
        key: 'export',
        icon: <i className="icon-new_excel" />,
        label: _l('导出任务列表到Excel'),
      });
    }

    if (isCharge || isAdmin || isMember) {
      folderOperatorItems.push({ type: 'divider' });
    }

    if (isCharge) {
      folderOperatorItems.push(
        {
          key: 'archive',
          icon: <i className="icon-task-pigeonhole" />,
          label: isArchived ? _l('取消归档项目') : _l('归档项目'),
        },
        { key: 'delete', danger: true, icon: <i className="icon-trash" />, label: _l('删除项目') },
      );
    } else if (isMember) {
      folderOperatorItems.push({ key: 'exit', icon: <i className="icon-groupExit" />, label: _l('退出项目') });
    }

    let filterCount = 0;

    const compareFilter = () => {
      if (searchKeyWords !== '') filterCount++;
      if (filterSettings.tags.length) filterCount++;
      if (!_.isEmpty(filterSettings.customFilter)) filterCount++;
      if (filterSettings.selectChargeIds.length) filterCount++;
      if (filterSettings.folderSearchRange !== 6) filterCount++;
    };

    // 项目
    if (folderId) {
      if (listStatus !== 0) filterCount++;
      if (listSort !== 10) filterCount++;
      compareFilter();
    } else if (taskFilter === 8) {
      // 星标
      if (listStatus !== 0) filterCount++;
      if (lastMyProjectId !== 'all') filterCount++;
    } else if (filterUserId) {
      // 查看他人
      if (listStatus !== 0) filterCount++;
      if (listSort !== 10) filterCount++;
      compareFilter();
    } else {
      // 我的任务
      if (lastMyProjectId !== 'all') filterCount++;
      if (listStatus !== 0) filterCount++;
      if (listSort !== 10) filterCount++;
      if (taskFilter !== 6) filterCount++;
      compareFilter();
    }

    return (
      <div className="flex">
        <Button
          style={{ '--hap-control-height': '32px' }}
          className="createNewTaskBtn Right"
          color="primary"
          variant="solid"
          shape="round"
          icon={<i className="icon-plus" />}
          onClick={this.createTask}
        >
          {_l('新任务')}
        </Button>
        {!folderId ||
        (folderId && (viewType === config.folderViewType.treeView || viewType === config.folderViewType.stageView)) ? (
          <div className="Right">
            <Tooltip title={_l('筛选与排序')}>
              <span
                className={cx('taskFilterBtn pointerEventAll', { colorPrimary: filterCount > 0 || showFilter })}
                onClick={this.openFilter}
              >
                {filterCount === 0 ? (
                  showFilter ? (
                    <i className="icon-screen_active" />
                  ) : (
                    <i className="icon-screen_normal" />
                  )
                ) : (
                  <i className={'icon-screen_' + filterCount} />
                )}
              </span>
            </Tooltip>
          </div>
        ) : undefined}
        {folderId && folderId !== 1 ? (
          <Tooltip title={_l('设置')}>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              styles={FOLDER_OPERATOR_DROPDOWN_STYLES}
              menu={{ items: folderOperatorItems, onClick: this.handleFolderOperatorClick }}
            >
              <div className="Right mRight20">
                <i className="icon-settings folderSettingsBtn" />
              </div>
            </Dropdown>
          </Tooltip>
        ) : undefined}

        {showFilter && <Filter taskFilterLeave={this.taskFilterLeave} showReset={filterCount > 0} />}

        {showSetFolder && <SetFolder folderId={folderId} onClose={() => this.setState({ showSetFolder: false })} />}
        {showCopyFolder && (
          <CopyFolder
            isAdmin={isCharge || isAdmin}
            projectId={projectID}
            chargeUser={chargeUser.accountID}
            folderName={folderName}
            folderId={folderId}
            onClose={() => this.setState({ showCopyFolder: false })}
            callback={settings => {
              this.setState({ showCopyFolder: false });
              !this.props.hideNavigation && createFolder(settings);
            }}
          />
        )}
        {showShareDialog && (
          <ShareFolderOrTask
            shareUrl={pathCompletion('/apps/task/folder_' + folderId)}
            shareMessage={_l('用App扫一扫，可在手机上快速显示查看项目详情')}
            linkText={_l('复制项目链接1')}
            onClose={() => this.setState({ showShareDialog: false })}
          />
        )}
        {showExportFolder && (
          <ExportFolder folderId={folderId} onClose={() => this.setState({ showExportFolder: false })} />
        )}
      </div>
    );
  }

  /**
   * show filter
   */
  openFilter = () => {
    const { showFilter } = this.state;

    if (showFilter) {
      this.taskFilterLeave();
    } else {
      this.setState({ showFilter: !showFilter });
    }

    $('#tasks').toggleClass('showTaskFilter', !showFilter);
  };

  /**
   * filter 离开
   */
  taskFilterLeave = () => {
    $('.taskFilterBox').addClass('reverse');
    $('#tasks').removeClass('showTaskFilter');
    setTimeout(() => this.setState({ showFilter: false }), 250);
  };

  /**
   * 新页面打开
   */
  openNewPage = () => {
    const { folderID } = this.props.folderSettings;

    window.open(pathCompletion(`/apps/task/folder_${folderID}`));
  };

  /**
   * 保存模板
   */
  saveTemplate = () => {
    const { folderId } = this.props.taskConfig;

    ajaxRequest.saveAsMyFolderTemplate({ folderId }).then(source => {
      if (source.status) {
        alert(_l('保存成功'));
      } else {
        errorMessage(source.error);
      }
    });
  };

  /**
   * 项目归档
   */
  updateFolderArchived = () => {
    const { projectID, folderID, isArchived } = this.props.folderSettings;

    updateFolderArchived(projectID, folderID, !isArchived);

    this.props.dispatch(updateFolderArchivedState(!isArchived));
  };

  /**
   * 任务 或 未关联项目
   */
  renderTaskToolbar() {
    const { searchTaskCount } = this.props;
    const { folderId, taskFilter, keyWords, searchKeyWords, filterUserId } = this.props.taskConfig;

    const getTypeName = () => {
      let typeName;

      switch (taskFilter) {
        case 8:
          typeName = _l('星标任务');
          break;
        case 2:
          typeName = filterUserId ? _l('他负责的任务') : _l('我的任务');
          break;
        case 3:
          typeName = filterUserId ? _l('他托付的任务') : _l('我的任务');
          break;
        case 1:
          typeName = filterUserId ? _l('他参与的任务') : _l('我的任务');
          break;
        case 7:
          typeName = _l('与他协作的任务');
          break;
        case 10:
          typeName = _l('他负责的任务');
          break;
        default:
          typeName = _l('我的任务');
      }

      if (searchKeyWords) {
        typeName = _l('所有和“%0”有关的任务', searchKeyWords) + ` ${searchTaskCount || ''}`;
      } else if (keyWords) {
        typeName = _l('所有和标签“%0”有关的任务', keyWords) + ` ${searchTaskCount || ''}`;
      }

      return typeName;
    };

    return (
      <div className="flexRow">
        <div className="taskTypeName">{folderId === 1 ? _l('未关联项目的任务') : getTypeName()}</div>
        {this.renderRightOperatorBtn()}
      </div>
    );
  }

  /**
   * 项目
   */
  renderFolderToolbar() {
    const folderSettings = this.props.folderSettings;
    const { projectId, folderId, viewType } = this.props.taskConfig;
    let folderName = '';
    let auth = false;
    let isTop = false;
    let folderNotice = false;
    let isNotice = false;
    let companyName = _l('个人');

    _.map(md.global.Account.projects, item => {
      if (item.projectId === projectId) {
        companyName = item.companyName;
      }
    });

    if (folderSettings.folderID === folderId) {
      folderName = folderSettings.folderName;
      auth = folderSettings.auth === config.auth.FolderCharger || folderSettings.auth === config.auth.FolderAdmin;
      isTop = folderSettings.isTop;
      folderNotice = folderSettings.folderNotice;
      isNotice = folderSettings.isNotice;
    }

    return (
      <div className="flexRow">
        <div className="flex relative">
          <div className="flexRow folderBarBox">
            {this.props.hideNavigation ? null : (
              <Tooltip title={isTop ? _l('取消置顶') : _l('置顶')} placement="bottomRight">
                <span className={cx('folderTop', { active: isTop })} onClick={this.updateFolderTop}>
                  <i className="icon-set_top" />
                </span>
              </Tooltip>
            )}
            <Tooltip title={companyName} placement="bottomRight">
              <span className="networkLabel">
                <i className={projectId ? 'icon-business' : 'icon-charger'} />
              </span>
            </Tooltip>
            {!this.state.showEdit ? (
              <span className={cx('folderName', { 'colorPrimary pointer': auth })} onClick={this.editFolderName}>
                {folderName}
              </span>
            ) : (
              <input
                type="text"
                value={this.state.folderName}
                className="txtName boderRadAll_3 flex"
                maxLength="100"
                onChange={this.updateFolderName}
                onKeyDown={this.folderKeyDown}
                onBlur={this.saveFolderName}
              />
            )}
            {auth ? (
              <Tooltip title={folderNotice ? _l('已关闭提醒') : _l('已开启提醒')} placement="bottomRight">
                <span className="mLeft5 folderNoticeBtn" onClick={this.updateFolderNotice}>
                  <i className={folderNotice ? 'icon-chat-bell-nopush' : 'icon-inbox'} />
                </span>
              </Tooltip>
            ) : undefined}
            {!this.state.showEdit && <div className="flex" />}
          </div>
        </div>
        <ul className="folderTabList">
          <li
            className={cx('borderColorPrimary colorPrimary', { active: viewType === config.folderViewType.treeView })}
            title={_l('列表视图')}
            onClick={this.switchTabs.bind(this, config.folderViewType.treeView)}
          >
            {_l('列表')}
          </li>
          <li
            className={cx('borderColorPrimary colorPrimary', { active: viewType === config.folderViewType.stageView })}
            title={_l('看板视图')}
            onClick={this.switchTabs.bind(this, config.folderViewType.stageView)}
          >
            {_l('看板')}
          </li>
          <li
            className={cx('borderColorPrimary colorPrimary', { active: viewType === config.folderViewType.taskGantt })}
            title={_l('时间')}
            onClick={this.switchTabs.bind(this, config.folderViewType.taskGantt)}
          >
            {_l('时间')}
          </li>
          <li
            className={cx(
              'folderDetailMode borderColorPrimary colorPrimary',
              { active: viewType === config.folderViewType.folderDetail },
              { hasNewTipRight: isNotice },
            )}
            title={_l('详情')}
            onClick={this.switchTabs.bind(this, config.folderViewType.folderDetail)}
          >
            {_l('详情')}
            <i className={cx('folderNewTip circle', { Hidden: !isNotice })} />
          </li>
          <li
            className={cx('borderColorPrimary colorPrimary', { active: viewType === config.folderViewType.attachment })}
            title={_l('文件')}
            onClick={this.switchTabs.bind(this, config.folderViewType.attachment)}
          >
            {_l('文件')}
          </li>
          <li
            className={cx('borderColorPrimary colorPrimary', {
              active: viewType === config.folderViewType.folderChart,
            })}
            title={_l('统计')}
            onClick={this.switchTabs.bind(this, config.folderViewType.folderChart)}
          >
            {_l('统计')}
          </li>
        </ul>
        {this.renderRightOperatorBtn()}
      </div>
    );
  }

  /**
   * 修改项目置顶
   */
  updateFolderTop = () => {
    const { folderID, isTop } = this.props.folderSettings;

    updateFolderTop(folderID, !isTop, () => {
      this.props.dispatch(updateFolderTopState(!isTop));
    });
  };

  /**
   * 编辑名称
   */
  editFolderName = () => {
    const { auth } = this.props.folderSettings;

    if (auth === config.auth.FolderCharger || auth === config.auth.FolderAdmin) {
      this.setState({ showEdit: true });
    }
  };

  /**
   * 更新项目名称
   */
  updateFolderName = evt => {
    this.setState({ folderName: evt.currentTarget.value });
  };

  /**
   * 文本框回车
   */
  folderKeyDown = evt => {
    if (evt.keyCode === 13) {
      this.saveFolderName();
    }
  };

  /**
   * 保存项目名称
   */
  saveFolderName = () => {
    this.setState({ showEdit: false });
    const folderName = this.state.folderName.trim();
    const { folderId } = this.props.taskConfig;

    if (folderName && folderName !== this.props.folderSettings.folderName) {
      this.props.dispatch(
        updateFolderName(folderId, folderName, () => {
          $('.folderList li[data-id=' + folderId + '] .folderName')
            .text(folderName)
            .attr('title', htmlEncodeReg(folderName));
        }),
      );
    } else {
      this.setState({
        folderName: this.props.folderSettings.folderName,
      });
    }
  };

  /**
   * 项目提醒
   */
  updateFolderNotice = () => {
    const { folderID, folderNotice } = this.props.folderSettings;
    this.props.dispatch(updateFolderNotice(folderID, !folderNotice));
  };

  /**
   * 切换tabs
   */
  switchTabs = viewType => {
    const taskConfig = Object.assign({}, this.props.taskConfig, { viewType });

    if (viewType !== config.folderViewType.treeView && viewType !== config.folderViewType.stageView) {
      this.taskFilterLeave();
    }

    setStateToStorage('', taskConfig);
    this.props.dispatch(updateStateConfig(taskConfig));
  };

  render() {
    const { folderId, viewType } = this.props.taskConfig;

    // 错误页面
    if (folderId && this.props.folderSettings.code) {
      return null;
    }

    return (
      <div
        className={cx('taskToolbar', {
          taskToolbarBottomClear:
            folderId && (viewType === config.folderViewType.taskGantt || viewType === config.folderViewType.attachment),
        })}
      >
        {folderId && folderId !== 1 ? this.renderFolderToolbar() : this.renderTaskToolbar()}
      </div>
    );
  }
}

export default connect(state => state.task)(TaskToolbar);
