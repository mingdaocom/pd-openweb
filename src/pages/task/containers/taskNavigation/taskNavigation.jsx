import React, { Component } from 'react';
import './taskNavigation.less';
import ajaxRequest from 'src/api/taskCenter';
import {
  errorMessage,
  getTaskStorage,
  setTaskStorage,
  checkIsProject,
  getTaskState,
  getFolderState,
  setStateToStorage,
} from '../../utils/utils';
import { connect } from 'react-redux';
import doT from 'dot';
import singleFolderComm from './tpl/singleFolderComm.html';
import singleFolder from './tpl/singleFolder.html';
import topFolder from './tpl/topFolder.html';
import networkList from './tpl/networkList.html';
import projectFolder from './tpl/projectFolder.html';
import FolderTemplate from '../../components/folderTemplate/folderTemplate';
import {
  updateStateConfig,
  updateFolderTopState,
  updateFolderArchivedState,
  updateTopFolderList,
} from '../../redux/actions';
import 'mdBusinessCard';
import config from '../../config/config';
import mdFunction from 'mdFunction';
import CopyFolder from '../../components/copyFolder/copyFolder';
import cx from 'classnames';
import 'mdAutocomplete';
import searchData from './tpl/searchData.html';
import {
  createFolder,
  updateFolderTop,
  deleteFolder,
  exitFolder,
  updateFolderArchived,
  getLeftMenuCount,
} from '../../utils/taskComm';
import { navigateTo } from 'src/router/navigateTo';

const taskNavigationSettings = {
  globalEvent: null,
  timer: null,
  chargeImgTimer: null,
  updatingFolderArchive: false,
  pointGapX: 0,
  pointGapY: 0,
};

class TaskNavigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showFolderTemplate: false,
      showCopyFolder: false,
      folderId: '',
      projectId: '',
      folderName: '',
      chargeUser: '',
      isAdmin: false,
    };
  }

  componentDidMount() {
    // 有缓存数据先呈现
    if (!_.isEmpty(this.props.topFolderDataSource)) {
      this.renderSlideTopFolder(this.props.topFolderDataSource);
    }

    this.getTaskNavAll();
    this.bindTaskNavAllEvents();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.taskConfig.filterUserId !== this.props.taskConfig.filterUserId) {
      setTimeout(() => {
        this.getTaskNavAll();
      }, 0);
    }
  }

  /**
   * 左侧数据
   */
  getTaskNavAll() {
    const $taskNavigator = $('#taskNavigator');
    // 移除已存在的网络和置顶项目
    $taskNavigator.find('.networkFolderList,.topFolderList,.topFolderTitle').remove();

    if (!$taskNavigator.find('#folderLoading').length) {
      const $navContent = $taskNavigator.find('.navContent');
      $navContent.before('<div id="folderLoading"> ' + LoadDiv() + '</div>');
    }

    // 左侧任务计数
    this.getLeftMenu();

    // 置顶项目
    this.getTopFolderList();

    // 多网络项目列表填充
    const projects = md.global.Account.projects.concat();
    projects.push({ companyName: _l('个人'), projectId: '' });
    $('.navContent').append(doT.template(networkList)(projects));

    // 移除loading
    $('#folderLoading').remove();

    // 获取项目计数小红点
    this.getProjectsFolderNotice();

    // 获取展开的网络和展开的文件夹
    let networks = getTaskStorage('networkState') || [];
    const folders = getTaskStorage('folderState') || [];

    // 无网络默认 个人展开
    if (projects.length === 1) {
      networks = [''];
    }

    // 多个网络获取项目数据
    $.map(networks, (projectId, i) => {
      $('.networkFolderList[data-projectid=' + projectId + ']')
        .find('.clipLoader')
        .removeClass('Hidden');
      this.getNetworkData(projectId, folders);
    });
  }

  /**
   * 操作绑定
   */
  bindTaskNavAllEvents() {
    const that = this;
    const $taskNavigator = $('#taskNavigator');

    // 搜索
    const $search = $('#leftSearchTaskOrFolder');
    $search.on({
      focus() {
        $(this).closest('.folderSearch').addClass('ThemeBorderColor3').removeClass('ThemeBorderColor8');
      },
      blur() {
        $(this).closest('.folderSearch').removeClass('ThemeBorderColor3').addClass('ThemeBorderColor8');
      },
    });

    // 搜索组件
    $search.mdAutocomplete({
      appendTo: '#taskNavigator .folderSearch',
      source: ajaxRequest,
      op: 'searchFolderList',
      minLength: 1,
      data: {
        keywords: '',
        otherAccountID: that.props.taskConfig.filterUserId,
      },
      autoUlStyle: {
        x: 0,
        y: 20,
        width: 360,
        height: 400,
      },
      clearStyle: {
        color: 'rgba(255,255,255,.3)',
        x: 40,
        y: 9,
      },
      beforeSearch(data) {
        data.keywords = $.trim($search.val());
      },
      select($this) {
        that.searchSelect($this);
      },
      vdsIgnore: true,
      render(data, callback) {
        data.keywords = $.trim($search.val());
        callback(doT.template(searchData)(data));
      },
    });

    // 我负责的任务 我托付 我参与
    $taskNavigator.on('click', '.taskType li', function () {
      const dataType = $(this).attr('data-type');
      let taskFilter;

      if (dataType == 'myTask') {
        taskFilter = getTaskState(6).taskFilter || 6;
      } else if (dataType == 'star') {
        // 星标任务
        taskFilter = 8;
      } else if (dataType == 'subordinate') {
        // 我的下属
        taskFilter = 9;
      } else if (dataType == 'responsible') {
        // 他负责的任务
        taskFilter = 2;
      } else if (dataType == 'trust') {
        // 他托付的任务
        taskFilter = 3;
      } else if (dataType == 'participate') {
        // 他参与的任务
        taskFilter = 1;
      } else if (dataType == 'otherAndMe') {
        // 协作的任务
        taskFilter = 7;
      } else if (dataType == 'otherResponsible') {
        // 我可见他负责的任务
        taskFilter = 10;
      }

      $taskNavigator.find('.folderList li').removeClass('ThemeBGColor8');

      const taskConfig = Object.assign(
        {},
        that.props.taskConfig,
        that.props.taskConfig.filterUserId ? {} : getTaskState(taskFilter),
        { taskFilter, folderId: '', projectId: '' },
        config.clearFilterSettings,
      );

      // 星标任务排序按最近更新
      if (taskFilter === 8) {
        taskConfig.listSort = 10;
      }

      if (dataType == 'myTask' || dataType == 'star' || dataType == 'subordinate') {
        setStateToStorage(taskFilter, taskConfig);
      }

      // 相同的点击也重新拉取数据
      if (_.isEqual(taskConfig, that.props.taskConfig)) {
        config.isGetData = true;
      }

      that.props.dispatch(updateStateConfig(taskConfig));
      navigateTo('/apps/task/' + (taskFilter === 8 ? 'star' : taskFilter === 9 ? 'subordinate' : 'center'));
    });

    // 置顶项目展开隐藏
    $taskNavigator.on('click', '.popTops', function () {
      const $this = $(this);
      const $folderList = $this.siblings('.folderList');
      const visible = $folderList.is(':visible');

      visible ? $folderList.slideUp() : $folderList.slideDown();
      $this.find('.topFolderState').text(visible ? _l('展开') : _l('隐藏'));
    });

    // 创建项目
    $taskNavigator.on('click', '.createNew', () => {
      that.setState({ showFolderTemplate: true });
    });

    // hover出用户层
    $taskNavigator.on(
      {
        mouseover() {
          const $this = $(this);
          const accountId = $this.data('id');

          if (!$this.data('hasbusinesscard')) {
            $this.mdBusinessCard({
              accountId,
              secretType: 1,
            });
            $this.data('hasbusinesscard', true).mouseenter();
          }
        },
      },
      '.folderCharge',
    );

    // 网络名称点击隐藏和显示项目列表
    $taskNavigator.on('click', '.networkFolderList .allFolders', function () {
      const $folderList = $(this).siblings('.folderList');
      let isVisible = $folderList.is(':visible');
      const noFolderList = $folderList.hasClass('notFolderList');

      // 无数据的时候一直打开
      if (noFolderList) {
        isVisible = false;
      } else {
        $folderList
          .siblings('.allFolders')
          .find('.networkFolderListLabel')
          .html(isVisible ? _l('展开') : _l('隐藏'));
      }

      if (isVisible) {
        $folderList.slideUp(() => {
          that.setNetworkState();
          $folderList.find('li').not('.slideFolders,.pigeonholeFolder,.nullFolderTask').remove();
        });
      } else {
        const projectId = $(this).closest('.networkFolderList').attr('data-projectid');
        const folders = getTaskStorage('folderState') || [];

        $('.networkFolderList[data-projectid=' + projectId + ']')
          .find('.clipLoader')
          .removeClass('Hidden');

        that.getNetworkData(projectId, folders, () => {
          $folderList.slideDown(() => {
            that.setNetworkState();
          });
        });
      }

      $folderList
        .siblings('.allFolders')
        .find('.networkFolderListArrow')
        .toggleClass('filp')
        .siblings('.overflow_ellipsis')
        .toggleClass('bold');
    });

    // 点击项目
    $taskNavigator.on(
      {
        click(event) {
          // 项目设置选项和设置齿轮隐藏
          $('.folderList .sinSettings').addClass('Hidden');
          $('.folderSettingsList').hide();
          $('#taskNavigator .folderUnfinished.folderIcon').removeClass('Hidden');
          // 任务详情点击项目 打开项目时tooltip
          $('.md_tooltip').remove();

          const _this = $(this);
          let isNovice = false;
          const projectId =
            _this.attr('data-projectid') || _this.closest('.networkFolderList').attr('data-projectid') || '';
          const folderId = _this.data('id');

          // 点击内置项目
          if (_this.hasClass('novice')) {
            isNovice = true;
            _this.removeClass();
            $('#noviceMain').remove();
            $('#noviceShadow,#folderNoviceShadow')
              .addClass('noviceLeaver')
              .on('webkitAnimationEnd animationend', () => {
                $('#noviceShadow,#folderNoviceShadow').remove();
              });
            _this
              .find('.folderContent')
              .append(
                '<span class="folderIcon icon-settings sinSettings Relative ThemeColor8 ThemeHoverColor9 Hidden"></span>',
              );
          }

          // 2 归档 3 文件夹 4 隐藏项目
          if (folderId == 2 || folderId == 3 || folderId == 4) {
            const $childList = _this.find('.commFolderUl');
            const isOpen = $childList.is(':visible');
            if ($childList.is(':animated') || _this.find('.txtProjectNameEdit').is(':visible')) {
              return;
            }
            if (folderId == 3) {
              _this.find('.downShow').toggleClass('filp', !isOpen);
              _this.find('.moreOp').toggleClass('InlineBlock', !isOpen);
              _this
                .find('.folderHeadIcon')
                .toggleClass('icon-folder-open', !isOpen)
                .toggleClass('icon-task-folder-solid', isOpen);
              // 获取文件夹数据
              if (_this.find('.projectFolderUl li').length === 0) {
                that.getMainFolderListInFile(projectId, _this.data('fileid'));
              }
            } else {
              _this.find('.Right').toggleClass('filp', !isOpen);
            }
            if (isOpen) {
              $childList.slideUp(() => {
                that.setFolderState();
              });
            } else {
              // 隐藏项目
              if (folderId == 4) {
                that.getHiddenFolderList(projectId);
              } else if (folderId == 2) {
                // 归档
                that.getArchiveFolderList(projectId);
              }
              if (_this.find('li').length === 0) {
                $childList.show();
                that.setFolderState();
              } else {
                $childList.slideDown(() => {
                  that.setFolderState();
                });
              }
            }

            return;
          }

          // 1 未关联项目
          const taskConfig = Object.assign(
            {},
            that.props.taskConfig,
            getFolderState(),
            { taskFilter: '', folderId, projectId },
            config.clearFilterSettings,
          );
          if (folderId === 1) {
            taskConfig.viewType = config.folderViewType.treeView;
          } else if (folderId && $('.folderTabList .subMissionMode').hasClass('itemActive')) {
            taskConfig.viewType = config.folderViewType.stageView;
          }

          if (taskConfig.listSort === 0 || taskConfig.listSort === 4) {
            taskConfig.listSort = 10;
          }

          $taskNavigator.find('.folderList li').removeClass('ThemeBGColor8');
          _this.addClass('ThemeBGColor8');

          if (!that.props.taskConfig.filterUserId) {
            setStateToStorage('', taskConfig);
          }

          // 相同的点击也重新拉取数据
          if (_.isEqual(taskConfig, that.props.taskConfig)) {
            config.isGetData = true;
          }

          that.props.dispatch(updateStateConfig(taskConfig));

          if (folderId !== 1) {
            navigateTo('/apps/task/folder_' + folderId);
          }

          event.stopPropagation();
        },
      },
      '.folderList li',
    );

    // 点击项目设置按钮
    $taskNavigator.on(
      {
        click(event) {
          const $folderList = $('#taskNavigator .folderList');
          const $folderSettingBox = $('.folderSettingsList');

          event.stopPropagation();

          // 隐藏所有的设置按钮
          $('.folderList li .sinSettings').not($(this)).addClass('Hidden');
          $('#taskNavigator .folderUnfinished.folderIcon').removeClass('Hidden');

          // 已经显示了二次点击隐藏
          if (!$(this).hasClass('Hidden')) {
            $(this).addClass('Hidden');
            $('.folderSettingsList').hide();
            return;
          }

          // 显示当前的设置按钮
          $(this).removeClass('Hidden');
          $(this).parent().find('.folderUnfinished').addClass('Hidden');

          // 设为未生成文件夹列表
          $folderSettingBox.find('.addFileBox').data('build', false);

          const $li = $(this).closest('li');
          const projectId = $li.data('projectid');
          const $projectFolder = $li.closest('.projectFolder');
          const folderId = $li.data('id');
          const auth = $li.data('auth') !== config.auth.FolderCharger && $li.data('auth') !== config.auth.FolderAdmin;

          if ($projectFolder.length > 0) {
            $folderSettingBox.data('fileid', $projectFolder.data('fileid'));
          } else {
            $folderSettingBox.removeData('fileid');
          }

          // 新建文件夹时候
          $folderSettingBox.data('folderid', folderId).data('projectid', projectId).data('auth', $li.data('auth'));

          if (md.global.Account.accountId === $li.data('charge')) {
            const text = $li.data('ispigeonhole') ? _l('取消归档项目') : _l('归档项目');
            $folderSettingBox.find('.pigeonhole').show().find('span').text(text);
          } else {
            $folderSettingBox.find('.pigeonhole').hide();
          }

          const $importantProject = $folderSettingBox.find('.importantProject').show();
          // 置顶
          if ($li.data('istop')) {
            $importantProject.data('istop', 1).find('span').text(_l('取消置顶'));
          } else {
            $importantProject.data('istop', 0).find('span').text(_l('置顶'));
          }

          if (
            $li.closest('.topFolderList').length ||
            $li.closest('.pigeonholeFolder').length ||
            $li.closest('.slideFolders').length
          ) {
            $folderSettingBox.find('.addFileBox').hide();
          } else {
            $folderSettingBox.find('.addFileBox').show();
          }

          // 项目权限
          if ($li.data('auth') === config.auth.FolderCharger || $li.data('auth') === config.auth.FolderAdmin) {
            $folderSettingBox.find('.copyFolder').show();
          } else {
            $folderSettingBox.find('.copyFolder').hide();
          }

          // 删除权限
          if ($li.data('auth') === config.auth.FolderCharger) {
            $folderSettingBox.find('.chargeAuth').show();
          } else {
            $folderSettingBox.find('.chargeAuth').hide();
          }

          // 退出项目
          if ($li.data('auth') !== config.auth.FolderCharger && $li.data('ismember')) {
            $folderSettingBox.find('.exitFolder').show();
          } else {
            $folderSettingBox.find('.exitFolder').hide();
          }

          // 退出文件夹
          if ($li.parent().is('.projectFolderUl') && !$li.parent().is('.pigeonholeFolderList')) {
            $folderSettingBox.find('.exitFile').removeClass('Hidden');
          } else {
            $folderSettingBox.find('.exitFile').addClass('Hidden');
          }
          // 归档不可以分文件��折叠
          if ($li.parent().is('.pigeonholeFolderList')) {
            $folderSettingBox.find('.addFileBox').addClass('Hidden');
            $folderSettingBox.find('.slideFolders').addClass('Hidden');
          } else {
            $folderSettingBox.find('.addFileBox').removeClass('Hidden');
            $folderSettingBox.find('.slideFolders').removeClass('Hidden');
          }

          // 隐藏/取消隐藏 项目
          $folderSettingBox.find('.slideFolders span').text($li.data('ishidden') ? _l('取消隐藏项目') : _l('隐藏项目'));

          const winHeight = $(window).height();
          const folderSettingBoxHeight = $folderSettingBox.show().height();
          $folderSettingBox.hide();
          // 单个项目设置
          const offset = $(this).offset();
          let top = offset.top;
          const left = offset.left - 16;

          if (top + folderSettingBoxHeight + 24 > winHeight) {
            top = top - folderSettingBoxHeight - 24;
          } else {
            top += 24;
          }
          $folderSettingBox
            .css({
              top: top - 50,
              left,
            })
            .show();

          // 分割线
          const $dividerLine = $folderSettingBox.find('.dividerLine');
          if (
            $.makeArray($dividerLine.nextAll())
              .map(el => {
                return $(el).is(':visible');
              })
              .reduce((pre, cur) => {
                return pre + cur;
              })
          ) {
            $folderSettingBox.find('.dividerLine').show();
          } else {
            $folderSettingBox.find('.dividerLine').hide();
          }
        },
        mousedown(event) {
          $('.projectFolderOp').addClass('Hidden');
        },
      },
      '.folderList li .sinSettings',
    );

    // 放到body中了  项目设置
    $('body').on(
      {
        'click.task': function () {
          const projectId = $('.folderSettingsList').data('projectid');
          const folderId = $('.folderSettingsList').data('folderid');
          const auth = $('.folderSettingsList').data('auth');
          const isAdmin = auth === config.auth.FolderCharger || auth === config.auth.FolderAdmin;
          const $li = $(".folderList li[data-id='" + folderId + "']:last");
          const istop = $li.data('istop');
          const ispigeonhole = $li.data('ispigeonhole');
          const ishidden = $li.data('ishidden');
          const folderName = $li.find('.folderName').text();
          const chargeUser = $li.data('charge');
          const callback = () => {
            if (that.props.taskConfig.folderId === folderId) {
              that.props.dispatch(updateFolderTopState(!istop));
            }
          };
          const archivedCallback = () => {
            if (that.props.taskConfig.folderId === folderId) {
              that.props.dispatch(updateFolderArchivedState(!ispigeonhole));
            }
          };

          switch ($(this).data('type')) {
            // 置顶项目
            case 'popTop':
              updateFolderTop(folderId, !istop, callback);
              break;
            // 删除项目
            case 'del':
              deleteFolder(folderId);
              break;
            // 归档项目
            case 'pigeonhole':
              updateFolderArchived(projectId, folderId, !ispigeonhole, archivedCallback);
              break;
            // 退出项目
            case 'exit':
              exitFolder(folderId);
              break;
            // 隐藏项目
            case 'slide':
              that.updateFolderDisplay(projectId, folderId, !ishidden);
              break;
            // 复制项目
            case 'copyFolder':
              // 监测网络是否过期
              mdFunction.expireDialogAsync(projectId).then(() => {
                that.setState({
                  showCopyFolder: true,
                  projectId,
                  folderId,
                  isAdmin,
                  folderName,
                  chargeUser,
                });
              });
              break;
          }
        },
        'mouseover.task': function (event) {
          const $this = $(this);
          const $ul = $this.find('.fileFolders');
          let projectId = $('.folderSettingsList').data('projectid');
          if (!checkIsProject(projectId)) {
            projectId = '';
          }

          // 生成 添加到的文件�如果生成过不在生成
          if ($this.hasClass('addFileBox') && !$this.data('build')) {
            $ul.find('.moveToFileBox').remove();
            $this.data('build', true);

            const $projectFolder = $('.networkFolderList[data-projectid=' + projectId + ']').find('.projectFolder');
            const fileId = $('.folderSettingsList ').data('fileid');
            let sb = '';
            let $item;
            let fileName;
            $.each($projectFolder, (i, item) => {
              $item = $(item);
              if ((fileId && $item.data('fileid') == fileId) || !$item.find('.txtProjectNameEdit').val().trim()) {
                return true;
              }
              fileName = $('<span/>').text($item.find('.txtProjectNameEdit').val()).html();
              sb =
                sb +
                `
              <li data-id="${$item.data('fileid')}" class="ThemeBGColor3 overflow_ellipsis">
              ${fileName}
              </li>
              `;
            });

            if (sb.length > 0) {
              $ul
                .find('.exitFile')
                .after(' <ul class="moveToFileBox"> <li class="moveToFile">' + _l('移动到') + '</li></ul> ');
              $ul.find('.moveToFileBox .moveToFile').after(sb);
            }

            $ul.removeClass('Hidden');

            // 项目文件夹移�
            const $fileFoldersBox = $('.fileFoldersBox');
            $fileFoldersBox.css('top', '-6px'); // 重置top 重新计算
            const $boxOffset = $fileFoldersBox.offset();
            const boxHeight = $fileFoldersBox.height();
            const pageHeight = $(window).height();

            if ($boxOffset.top + boxHeight > pageHeight) {
              const newHeight = pageHeight * 0.8 < 300 ? 300 : pageHeight * 0.8;
              let newTop = 0;
              if (newHeight > boxHeight) {
                newTop = pageHeight - boxHeight - $boxOffset.top;
              } else {
                newTop = pageHeight - newHeight - $boxOffset.top - 10;
              }
              $fileFoldersBox.css({
                top: newTop - 16 + 'px',
              });
              $ul.find('.moveToFileBox').css({
                'max-height': newHeight - $ul.find('>li').length * 32 + 'px',
              });
            } else {
              $fileFoldersBox.css('top', '-6px');
            }
          } else {
            $ul.removeClass('Hidden');
          }
        },
        'mouseout.task': function () {
          $(this).find('.fileFolders').addClass('Hidden');
        },
      },
      '.folderSettingsList > li',
    );

    // mousedown
    $taskNavigator.on(
      {
        mousedown(event) {
          const $this = $(this);
          // 项目文件夹 置顶 全部项目 归档 未关联系 已归档的不能拖动
          if (
            $this.hasClass('projectFolder') ||
            $this.closest('.pigeonholeFolder').length > 0 ||
            $this.closest('.topFolderList').length > 0 ||
            $this.hasClass('pigeonholeFolder') ||
            $this.hasClass('nullFolderTask') ||
            $this.hasClass('slideFolders') ||
            $this.closest('.slideFolderList').length > 0
          ) {
            return;
          }

          taskNavigationSettings.timer = setTimeout(() => {
            clearTimeout(taskNavigationSettings.timer);
            // 间隙
            taskNavigationSettings.pointGapY = event.clientY - $this.offset().top;
            taskNavigationSettings.pointGapX = event.clientX - $this.offset().left;

            // 鼠标按下
            that.folderDown($this);
          }, 150);

          event.stopPropagation();
        },
        mouseup() {
          clearTimeout(taskNavigationSettings.timer);
        },
      },
      '.folderList li',
    );

    // 项目文件夹操作
    $('body').on('click.task', '.fileFoldersBox li', function (event) {
      // 移动 或者新增文件夹
      let projectId = $('.folderSettingsList').data('projectid');
      const folderId = $('.folderSettingsList').data('folderid');
      const fileId = $(this).data('id');
      if (!checkIsProject(projectId)) {
        projectId = '';
      }

      // 新增文件夹
      if (fileId == 'new') {
        const $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');
        const $selLi = $networkFolderList.find('li[data-id=' + folderId + ']');
        const $parent = $selLi.parent();

        // 创建新文件夹
        that.createNewFile('', $selLi);

        // 如果项目文件夹没有项目了
        if ($parent.find('li').length <= 0 && $parent.is('.projectFolderUl')) {
          // 解散项目文件夹
          that.abortProjectFolder(projectId, $parent.parent().data('fileid'));
        }
      } else {
        // 直接移出
        if ($(this).data('type') == 'exitfile') {
          that.updateFolderIntoFile(projectId, folderId, '');
          return;
        }
        // 点击移动title
        if (!fileId) {
          return false;
        }
        // 移动文件夹
        that.updateFolderIntoFile(projectId, folderId, fileId);
      }
    });

    // 项目文件夹弹出层
    $taskNavigator.on(
      {
        mousedown(event) {
          const top = event.clientY + 10 - $('#topBarContent').height();
          const left = event.clientX - 50;
          const fileId = $(this).closest('.projectFolder').data('fileid');
          const projectId = $(this).closest('.networkFolderList').data('projectid');
          const $projectFolderOp = $('.projectFolderOp');

          event.stopPropagation();

          if ($projectFolderOp.data('fileid') === fileId && !$projectFolderOp.hasClass('Hidden')) {
            $projectFolderOp.addClass('Hidden');
            return;
          }

          // 新建文件夹更名未完成时，取不到fileId,若打开弹出层点击解散无�
          if (!fileId) return;
          $projectFolderOp
            .css({
              top,
              left,
            })
            .data('fileid', fileId)
            .data('projectid', projectId)
            .removeClass('Hidden');
        },
        click(event) {
          $('.folderSettingsList').hide();
          event.stopPropagation();
        },
      },
      '.folderList li .moreOp',
    );

    // 放到body中了  项目文件夹操作
    $('body').on('click.task', '.projectFolderOp li', function () {
      const $this = $(this);
      const fileId = $this.parent().data('fileid');
      const projectId = $this.parent().data('projectid');
      const dataType = $(this).data('type');

      if (dataType == 'rename') {
        // 重命名文件夹
        const $txtProjectNameEdit = $('.networkFolderList[data-projectid=' + projectId + ']').find(
          "li[data-fileid='" + fileId + "'] .txtProjectNameEdit",
        );
        $('.projectFolderOp').addClass('Hidden');
        // 获取焦点即可 失去焦点自动保存
        $txtProjectNameEdit.removeClass('Hidden').focus().select().siblings('.txtProjectName').addClass('Hidden');
      } else if (dataType == 'abort') {
        // 解散
        that.abortProjectFolder(projectId, fileId);
      }
    });

    // 归档文件夹修改名称
    $taskNavigator.on(
      {
        blur() {
          const $this = $(this);
          $this.removeClass('ThemeBGColor8 ThemeColor10');

          const text = $.trim($this.val());
          if (text.length <= 0) {
            alert(_l('请输入文件夹名称'), 3);
            $(this).focus();
            return false;
          }

          if (taskNavigationSettings.isBlur) {
            return;
          }
          taskNavigationSettings.isBlur = true;

          const fileId = $this.closest('.projectFolder').data('fileid');
          if (fileId != 0) {
            that.updateUserFolderFileName(fileId, $this);
          } else {
            that.addUserFolderFile($this);
          }
        },
        focus() {
          $(this).addClass('ThemeBGColor8 ThemeColor10');
          taskNavigationSettings.isBlur = false;
        },
        keydown(event) {
          if (event.keyCode === 13) {
            $(this).blur();
          }
        },
      },
      '.txtProjectNameEdit',
    );

    $('#taskNavigator .navContent').on('scroll', event => {
      $('.folderSettingsList').hide();
      $('.folderList li .sinSettings').addClass('Hidden');
      $('.projectFolderOp').addClass('Hidden');
    });

    $(document).on('click', event => {
      const $target = $(event.target);
      // 项目设置
      if (!$target.is('.folderList li .sinSettings') && !$target.closest('.folderList li .sinSettings').length) {
        $('.folderSettingsList').hide();
        $('#taskNavigator .folderUnfinished.folderIcon').removeClass('Hidden');
        $('.folderList li .sinSettings').addClass('Hidden');
      }

      // 项目文件夹操做
      if (!$target.is('.folderList li .moreOp') && !$target.closest('.projectFolderOp').length) {
        $('.projectFolderOp').addClass('Hidden');
      }
    });
  }

  /**
   * 获取左侧任务计数
   */
  getLeftMenu() {
    const { filterUserId, lastMyProjectId } = this.props.taskConfig;
    getLeftMenuCount(filterUserId, filterUserId ? lastMyProjectId : 'all');
  }

  /**
   * 获取置顶项目
   */
  getTopFolderList() {
    const { filterUserId } = this.props.taskConfig;

    ajaxRequest
      .getTopFolderList({
        accountID: filterUserId,
      })
      .then(source => {
        if (source.status) {
          if (source.data) {
            this.props.dispatch(updateTopFolderList(source.data));
            this.renderSlideTopFolder(source.data);
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 渲染置顶项目
   */
  renderSlideTopFolder(data) {
    const { folderId } = this.props.taskConfig;
    const topFolderHtml = topFolder
      .replace('#include.singleFolder', singleFolder)
      .replace('#include.singleFolderComm', singleFolderComm);
    $('.navContent .topFolderList').remove();
    $('.navContent').prepend(doT.template(topFolderHtml)(data));
    $('#folderLoading').remove();
    // 选中
    const $el = $('.topFolderList .folderList li[data-id=' + folderId + ']')
      .removeClass('ThemeBGColor8')
      .eq(0)
      .addClass('ThemeBGColor8');
    if ($el.length) {
      $('.navContent').scrollTop($el.offset().top - 300);
    }
  }

  /**
   * 获取项目计数小红点
   */
  getProjectsFolderNotice() {
    ajaxRequest.getProjectsFolderNotice().then(source => {
      if (source.status) {
        $.map(source.data, (network, i) => {
          const { projectID, noticeCount } = network;
          if (noticeCount) {
            $('.networkFolderList[data-projectid=' + projectID + ']')
              .attr('data-count', noticeCount)
              .find('.allFolders .folderNewTip')
              .removeClass('Hidden');
          }
        });
      } else {
        errorMessage(source.error);
      }
    });
  }

  /**
   * 获取各个网络数据
   */
  getNetworkData(projectId, folders, callback) {
    const { filterUserId } = this.props.taskConfig;

    ajaxRequest
      .getMainFolderList({
        projectId,
        accountID: filterUserId,
        fileIDs: folders.join(','),
      })
      .then(source => {
        if (source.status) {
          if (
            !md.global.Account.projects.length &&
            !source.data.folderList &&
            !source.data.folderFileList &&
            !source.data.hasHiddenFile &&
            !source.data.hasArchivedFile &&
            !source.data.hasNoFIDFile
          ) {
            $('.networkOnly').append('<div class="noFolderList ThemeColor9">' + _l('创建项目管理任务') + '</div>');
          } else {
            this.renderSlideFolder(source.data, projectId, callback);
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 渲染项目数据
   */
  renderSlideFolder(data, projectId, callback) {
    const singleFolderTpl = singleFolder.replace('#include.singleFolderComm', singleFolderComm);
    const projectFolderTpl = projectFolder.replace('#include.singleFolderComm', singleFolderComm);
    const $folderList = $('.networkFolderList[data-projectid=' + projectId + ']').find('.folderList');
    // 移除已存在的
    $folderList.find('li').not('.slideFolders,.pigeonholeFolder,.nullFolderTask').remove();
    // 项目文件夹
    this.builFileFolder(data, projectFolderTpl, projectId);
    // 项目
    this.buildFolders(data, singleFolderTpl, projectId);
    // 处理小红点
    let count = 0;
    $.map(data.folderFileList || [], (folder, i) => {
      if (folder.isNotice) {
        count++;
      }
    });
    $.map(data.folderList || [], (list, i) => {
      if (list.isNotice) {
        count++;
      }
    });

    $('.networkFolderList[data-projectid=' + projectId + ']')
      .attr('data-count', count)
      .find('.allFolders .folderNewTip')
      .toggleClass('Hidden', !count);

    // 处理箭头
    $folderList
      .siblings('.allFolders')
      .find('.networkFolderListArrow')
      .addClass('filp')
      .siblings('.overflow_ellipsis')
      .addClass('bold');

    // 已隐藏的项目
    if (data.hasHiddenFile) {
      $folderList.find('.slideFolders').removeClass('Hidden');
    }

    // 已归档的项目
    if (data.hasArchivedFile) {
      $folderList.find('.pigeonholeFolder').removeClass('Hidden');
    }

    // 未关联的项目
    if (data.hasNoFIDFile) {
      $folderList
        .find('.nullFolderTask')
        .toggleClass(
          'ThemeBGColor8',
          this.props.taskConfig.projectId === projectId && this.props.taskConfig.folderId === 1,
        )
        .removeClass('Hidden');
    }

    // 判断当前网络下是否有可点项
    let isExistList = false;
    // 存在项目
    if (data.folderList || data.folderFileList || data.hasHiddenFile || data.hasArchivedFile || data.hasNoFIDFile) {
      isExistList = true;
    }

    $folderList
      .toggleClass('notFolderList', !isExistList)
      .siblings('.allFolders')
      .find('.networkFolderListLabel')
      .html(isExistList ? _l('隐藏') : _l('无'));

    // 隐藏loading
    $('.networkFolderList[data-projectid=' + projectId + ']')
      .find('.clipLoader')
      .addClass('Hidden');

    if ($.isFunction(callback) && isExistList) {
      callback();
    } else {
      $folderList.show();
      const { folderId } = this.props.taskConfig;
      const $el = $(
        '.networkFolderList[data-projectid=' + projectId + '] .folderList li.ThemeBGColor8[data-id=' + folderId + ']',
      );
      if ($el.length) {
        $('.navContent').scrollTop($el.offset().top - 300);
      }
    }
  }

  /**
   * 生成项目文件夹
   */
  builFileFolder(data, projectFolderTpl, projectId) {
    const { folderId } = this.props.taskConfig;
    // 存在
    if (data.folderFileList && data.folderFileList.length > 0) {
      data.folderFileList.folderId = folderId;
      // 数据
      const allFolders = doT.template(projectFolderTpl)(data.folderFileList);
      $('.networkFolderList[data-projectid=' + projectId + ']')
        .find('.folderList')
        .prepend(allFolders);
    }
  }

  /**
   * 生成项目
   */
  buildFolders(data, singleFolderTpl, projectId) {
    if (data.folderList && data.folderList.length > 0) {
      const { folderId } = this.props.taskConfig;
      const allFolders = doT.template(singleFolderTpl)(data.folderList); // 数据
      const $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');

      $networkFolderList.find('.slideFolders').before(allFolders);
      $networkFolderList
        .find('.folderList li[data-id=' + folderId + ']')
        .removeClass('ThemeBGColor8')
        .eq(0)
        .addClass('ThemeBGColor8'); // 选中
    }
  }

  /**
   * 生成项目列表数据模板
   */
  buildFolderListModule(data, $el) {
    const { folderId } = this.props.taskConfig;
    const singleFolderTpl = singleFolder.replace('#include.singleFolderComm', singleFolderComm);
    const source = { folderList: data };
    source.folderList.folderId = folderId;
    // 数据
    const allFolders = doT.template(singleFolderTpl)(source.folderList);
    $el.html(allFolders);
  }

  /**
   * 创建项目
   */
  createFolderCallback = settings => {
    this.setState({ showFolderTemplate: false, showCopyFolder: false });
    createFolder(settings);
  };

  /**
   * 网络展开状态存入localStorage
   */
  setNetworkState() {
    const $networks = $('#taskNavigator .networkFolderList');
    const networkArr = [];
    $.each($networks, (i, e) => {
      if ($(e).find('.folderList').is(':visible')) {
        networkArr.push($(e).data('projectid'));
      }
    });
    setTaskStorage('networkState', networkArr);
  }

  /**
   * 项目文件夹展开状态存入localStorage
   */
  setFolderState = function () {
    const $folders = $('#taskNavigator .folderList .projectFolder');
    const folderArr = [];
    $.each($folders, (i, e) => {
      if ($(e).find('.projectFolderUl').is(':visible')) {
        folderArr.push($(e).data('fileid'));
      }
    });
    setTaskStorage('folderState', folderArr);
  };

  /**
   * 拖拽项目
   */
  folderDown($this) {
    const that = this;
    const $folderJoin = $('<div/>').attr('id', 'folderJoin');
    const pointGapY = taskNavigationSettings.pointGapY;
    const pointGapX = taskNavigationSettings.pointGapX;
    const $folderList = $this.closest('.folderList');

    // 禁止选中
    $('body').addClass('userSelect');

    // 添加元素
    $folderJoin.append($('<img/>').attr('src', $this.find('img').attr('src')).addClass('circle'));
    $folderJoin.append($('<span/>').text($this.find('.folderName').text()).addClass('joinText overflow_ellipsis'));
    $('body').append($folderJoin);

    // 移动
    $(document).on('mousemove.folderJoin', event => {
      taskNavigationSettings.globalEvent = event;
      // 默认是隐藏的
      if ($folderJoin.is(':hidden')) {
        $folderJoin.show();
      }

      // 给当前元素加标示
      if (!$this.hasClass('folderJoin') && !$this.closest('.projectFolder').hasClass('folderJoin')) {
        // 当前拖拽的元素加个标�
        const $parentFolder = $this.closest('.projectFolder');
        if ($parentFolder.length > 0) {
          $parentFolder.addClass('folderJoin');
        } else {
          const $pigeonholeFolder = $this.closest('.pigeonholeFolder');
          if ($pigeonholeFolder.length > 0) {
            $pigeonholeFolder.addClass('folderJoin');
          } else {
            $this.addClass('folderJoin');
          }
        }
      }

      const eventX = event.clientX;
      const eventY = event.clientY;

      // 位置 拖拽的元素
      $('#folderJoin').css({
        top: eventY - pointGapY,
        left: eventX - pointGapX,
      });

      const offset = $('.navContent').offset();
      const folderListHeight = $('.navContent').height();
      const folderListWidth = $('.navContent').width();

      // 去除上次选中的颜色
      $folderList.find('li').removeClass('folderJoinBorder');

      // folderList �
      if (
        offset.top < eventY &&
        offset.top + folderListHeight > eventY &&
        offset.left < eventX &&
        offset.left + folderListWidth > eventX
      ) {
        // 当前鼠标的位置去�项目层的位� mTop
        const gap =
          eventY -
          offset.top +
          $('.navContent').scrollTop() -
          $('.topFolderList').height() -
          ($('.networkFolderList').index($('.folderJoin').closest('.networkFolderList')) + 1) * 40;
        const liHeight = 40;
        const index = Math.ceil(gap / liHeight) - 1;
        const $li = $folderList.find('li:visible').eq(index);

        // 不是 未关联项目的文件�不是归档项�以及 置顶
        if (
          !$li.hasClass('nullFolderTask') &&
          !$li.hasClass('pigeonholeFolder') &&
          $li.closest('.pigeonholeFolder').length <= 0 &&
          $li.closest('.folderJoin').length <= 0 &&
          !$li.hasClass('folderJoin') &&
          !$li.hasClass('allFolders') &&
          !$li.hasClass('popTops') &&
          !$li.hasClass('slideFolders') &&
          $li.closest('.slideFolders').length <= 0
        ) {
          if ($li.closest('.projectFolder').length > 0) {
            $li.closest('.projectFolder').addClass('folderJoinBorder');
          } else if ($li.closest('.pigeonholeFolder').length > 0) {
            $li.closest('.pigeonholeFolder').addClass('folderJoinBorder');
          } else {
            $li.addClass('folderJoinBorder');
          }
        }
      } else if (offset.left < eventX && offset.left + folderListWidth > eventX) {
        // 上下滚动条
        that.moveProjectScroll();
      }

      return false;
    });

    // 鼠标弹起
    $(document).on('mouseup.folderJoin', () => {
      $(document).off('mousemove.folderJoin');
      $(document).off('mouseup.folderJoin');
      $folderJoin.remove();
      // 去除当前拖拽元素的样�
      $folderList.find('li').removeClass('folderJoin');
      $('body').removeClass('userSelect');
      const $selLi = $folderList.find('li.folderJoinBorder');

      // 存在
      if ($selLi.length > 0) {
        if ($selLi.hasClass('projectFolder')) {
          // 项目的文件夹
          that.updateFolderMember($this);
        } else {
          // 创建新文件夹
          that.createNewFile($this, $selLi);
        }
        $selLi.removeClass('folderJoinBorder');
      }
    });
  }

  /**
   * 滚动条上下移动
   */
  moveProjectScroll() {
    const that = this;
    const $folderList = $('.navContent');

    // 出现滚动条条�
    if ($folderList.height() < $folderList[0].scrollHeight) {
      if ($folderList.is(':animated')) {
        return false;
      }

      const eventY = taskNavigationSettings.globalEvent.clientY;
      const eventX = taskNavigationSettings.globalEvent.clientX;
      const Offset = $folderList.offset();
      const folderListWdith = Offset.left + $folderList.width();
      const scrollTop = $folderList.scrollTop();

      // 项目
      if (eventX > Offset.left && eventX < folderListWdith) {
        if (Offset.top > eventY) {
          // 头部
          if (scrollTop > 0) {
            $folderList.animate(
              {
                scrollTop: scrollTop - 150,
              },
              300,
              () => {
                // 如果没到头部 �还在此滚动条�循环调用
                that.moveProjectScroll();
              },
            );
          }
        } else if ($(window).height() - 50 < eventY) {
          // 没到底部
          if ($folderList.height() + $folderList.scrollTop() < $folderList[0].scrollHeight) {
            $folderList.animate(
              {
                scrollTop: scrollTop + 150,
              },
              300,
              () => {
                // 如果没到头部 �还在此滚动条�循环调用
                that.moveProjectScroll();
              },
            );
          }
        }
      }
    }
  }

  /**
   * 创建新文件夹
   */
  createNewFile($this, $selLi) {
    let projectId = $selLi.attr('data-projectid');
    if (!checkIsProject(projectId)) {
      projectId = '';
    }
    const $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');
    const $li = $(doT.template(projectFolder)([{ fFileName: _l('新建文件夹'), fFileID: 0 }]));
    // 如果有项目文件夹放最后，没有放置顶下面，没有放最上面
    const $after = $networkFolderList.find('.projectFolder').last();

    $li.find('.projectFolderUl').append($selLi, $this);

    if ($after.length > 0) {
      $after.after($li);
    } else {
      $networkFolderList.find('.folderList').prepend($li);
    }

    $li.trigger('click');
    // 获取焦点
    $li
      .find('.txtProjectNameEdit')
      .removeClass('Hidden')
      .focus()
      .select()
      .siblings('.txtProjectName')
      .addClass('Hidden');
  }

  /**
   * 更新项目文件夹
   */
  updateFolderMember($this) {
    const $folderList = $('.folderList');
    let $selLi = $folderList.find('li.folderJoinIn');
    let fileId = $selLi.data('fileid');
    const projectId = $this.closest('.networkFolderList').attr('data-projectid');
    const folderId = $this.data('id');

    // 不是拖出项目文件夹
    if ($selLi.length <= 0) {
      $selLi = $folderList.find('.folderJoinBorder');
      fileId = $selLi.data('fileid');
    }

    this.updateFolderIntoFile(projectId, folderId, fileId);
  }

  /**
   * 移动项目至指定文件夹(fileID空为移出)
   */
  updateFolderIntoFile(projectId, folderId, fileId) {
    ajaxRequest
      .updateFolderIntoFile({
        folderID: folderId,
        fileID: fileId,
      })
      .then(source => {
        if (source.status) {
          if (!checkIsProject(projectId)) {
            projectId = '';
          }
          const $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');
          const $li = $networkFolderList.find("li[data-id='" + folderId + "']:last").hide();
          const $parent = $li.parent();
          const $projectFolder = $networkFolderList.find('.projectFolder:last');

          // 移出
          if (!fileId) {
            if ($projectFolder.length == 0) {
              $networkFolderList.find('.folderList').prepend($li.slideDown());
            } else {
              $projectFolder.after($li.slideDown());
            }
          } else {
            const $projectFolderUl = $networkFolderList.find(
              '.projectFolder[data-fileid=' + fileId + '] .projectFolderUl',
            );
            if ($projectFolderUl.find('li').length > 0) {
              $projectFolderUl.prepend($li.slideDown());
            }
          }

          // 如果项目文件夹没有项目了
          if ($parent.find('li').length <= 0 && $parent.is('.projectFolderUl')) {
            // 解散项目文件夹
            this.abortProjectFolder(projectId, $parent.parent().data('fileid'));
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 添加文件夹
   */
  addUserFolderFile($this) {
    const $projectFolder = $this.closest('.projectFolder');
    const folderIdArr = [];
    const $lis = $projectFolder.find('.projectFolderUl li');
    const projectId = $projectFolder.closest('.networkFolderList').attr('data-projectid');
    const fileName = $.trim($this.val());

    $.each($lis, (i, item) => {
      folderIdArr.push($(item).data('id'));
    });

    ajaxRequest
      .addUserFolderFile({
        fileName,
        folderIDs: folderIdArr.join(','),
      })
      .then(source => {
        if (source.status) {
          // 成功后处理
          $projectFolder
            .data('fileid', source.data.fFileID)
            .data('projectid', projectId)
            .attr({ 'data-fileid': source.data.fFileID, 'data-projectid': projectId });
          $this
            .addClass('Hidden')
            .attr('title', fileName)
            .siblings('.txtProjectName')
            .text(fileName)
            .removeClass('Hidden');
          this.setFolderState();
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 解散项目文件夹
   */
  abortProjectFolder(projectId, fileId) {
    ajaxRequest
      .deleteUserFolderFile({
        ffileID: fileId,
      })
      .then(source => {
        if (source.status) {
          const $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');
          const $project = $networkFolderList.find("li[data-fileid='" + fileId + "']");
          const $lis = $project.find('li').hide();

          // 移除当前文件夹
          $project.slideUp(function () {
            $(this).remove();
          });

          // 文件夹
          const $projectFolder = $networkFolderList.find('.projectFolder').last();
          if ($projectFolder.length > 0) {
            $projectFolder.after($lis.slideDown());
          } else {
            $networkFolderList.find('.folderList').prepend($lis.slideDown());
          }

          // 文件夹操作层
          $('.projectFolderOp').addClass('Hidden');
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 修改项目文件夹名称
   */
  updateUserFolderFileName(fileId, $this) {
    const newFileName = $.trim($this.val());
    const old = $this.attr('title');
    const updateFileNameFun = function () {
      $this
        .attr('title', newFileName)
        .addClass('Hidden')
        .siblings('.txtProjectName')
        .text(newFileName)
        .removeClass('Hidden');
    };
    // 相同不修改
    if (newFileName == old) {
      updateFileNameFun();
      return;
    }

    ajaxRequest
      .updateUserFolderFile({
        ffileID: fileId,
        fileName: newFileName,
      })
      .then(source => {
        if (source.status) {
          updateFileNameFun();
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 获取指定文件下下的所有项目
   */
  getMainFolderListInFile(projectID, fileID) {
    const { filterUserId } = this.props.taskConfig;

    ajaxRequest
      .getMainFolderListInFile({
        accountID: filterUserId,
        fileID,
      })
      .then(source => {
        if (source.status) {
          if (source.data) {
            const $el = $('.networkFolderList[data-projectid=' + projectID + ']').find(
              '.projectFolder[data-fileid=' + fileID + '] .projectFolderUl',
            );
            this.buildFolderListModule(source.data, $el);
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 获取归档项目list
   */
  getArchiveFolderList(projectID) {
    const { filterUserId } = this.props.taskConfig;

    ajaxRequest
      .getArchiveFolderList({
        accountID: filterUserId,
        projectId: projectID,
      })
      .then(source => {
        if (source.status) {
          if (source.data) {
            const $el = $('.networkFolderList[data-projectid=' + projectID + ']').find('.pigeonholeFolderList');
            this.buildFolderListModule(source.data, $el);
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 获取隐藏项目list
   */
  getHiddenFolderList(projectID) {
    const { filterUserId } = this.props.taskConfig;

    ajaxRequest
      .getHiddenFolderList({
        accountID: filterUserId,
        projectId: projectID,
      })
      .then(source => {
        if (source.status) {
          if (source.data) {
            const $el = $('.networkFolderList[data-projectid=' + projectID + ']').find('.slideFolderList');
            this.buildFolderListModule(source.data, $el);
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 隐藏项目
   */
  updateFolderDisplay(projectId, folderId, isHidden) {
    const that = this;

    ajaxRequest
      .updateFolderDisplay({
        folderID: folderId,
        isHidden,
      })
      .then(source => {
        if (source.status) {
          if (!checkIsProject(projectId)) {
            projectId = '';
          }
          const $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');
          const $li = $networkFolderList.find("li[data-id='" + folderId + "']:last").hide();
          const $parent = $li.parent();

          $(".folderList li[data-id='" + folderId + "']")
            .data('ishidden', isHidden)
            .toggleClass('archivedFolder', isHidden);

          // 取消隐藏
          if (!isHidden) {
            $networkFolderList
              .find('.slideFolders')
              .before($li.slideDown())
              .closest('.slideFolders')
              .removeClass('Hidden');
          } else {
            $networkFolderList
              .find('.slideFolderList')
              .prepend(
                $li.slideDown(() => {
                  // 无项目解散项目文件夹
                  if (!$parent.find('li').length) {
                    // 解散项目文件夹
                    that.abortProjectFolder(projectId, $parent.parent().data('fileid'));
                  }
                }),
              )
              .closest('.slideFolders')
              .removeClass('Hidden');
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * hide dialog
   */
  onCloseDialog = () => {
    this.setState({
      showFolderTemplate: false,
      showCopyFolder: false,
      folderId: '',
      projectId: '',
      folderName: '',
      chargeUser: '',
      isAdmin: false,
    });
  };

  /**
   * 搜索选中
   */
  searchSelect($this) {
    const type = $this.data('type') || 'task';
    const searchText = $.trim($('#leftSearchTaskOrFolder').val());

    // 相当于清空
    if (searchText === '') {
      return;
    }

    const folderId = type === 'folder' ? $this.data('id') : '';
    const taskFilter = type !== 'folder' ? 6 : '';
    const lastMyProjectId = this.props.taskConfig.filterUserId ? this.props.taskConfig.lastMyProjectId : 'all';
    const filterSettings = {
      tags: [],
      customFilter: {},
      selectChargeIds: [],
      folderSearchRange: 6,
    };

    if (type === 'category') {
      filterSettings.tags.push($this.data('id'));
    }

    this.props.dispatch(
      updateStateConfig({
        listSort: 10,
        listStatus: folderId ? getFolderState().listStatus : -1,
        folderId,
        taskFilter,
        keyWords: type === 'task' ? searchText : $this.text(),
        searchKeyWords: type === 'task' ? searchText : '',
        lastMyProjectId,
        filterSettings,
      }),
    );

    $('#taskNavigator .folderList li').removeClass('ThemeBGColor8');
    if (type === 'folder') {
      $('#taskNavigator .folderList li[data-id=' + folderId + ']').addClass('ThemeBGColor8');
    }

    $('.searchDiv .searchContent').fadeOut();
  }

  /**
   * 左侧顶部菜单项
   */
  renderNavMenu() {
    const { filterUserId, isSubUser, taskFilter, keyWords } = this.props.taskConfig;

    // 下属
    if (filterUserId && isSubUser) {
      return (
        <ul className="taskType ThemeBorderColor7">
          <li
            className={cx('otherAndMe ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 7 })}
            data-type="otherAndMe"
          >
            <span className="tip-bottom-right" data-tip={_l('我与他共同参与的任务')}>
              <i className="icon-charger typeIcon ThemeColor9" />
            </span>
            <span className="typeName responsibleText ThemeColor10">{_l('与他协作的任务')}</span>
            <span className="allCountTask Right ThemeColor8" />
          </li>
          <li
            className={cx('responsible ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 2 })}
            data-type="responsible"
          >
            <span className="tip-bottom-right" data-tip={_l('他作为负责人的任务')}>
              <i className="icon-task-responsible typeIcon ThemeColor9" />
            </span>
            <span className="typeName responsibleText ThemeColor10">{_l('他负责的任务')}</span>
            <span className="allCountTask Right ThemeColor8" />
          </li>
          <li className={cx('trust ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 3 })} data-type="trust">
            <span className="tip-bottom-right" data-tip={_l('他托付给其他人负责的任务')}>
              <i className="icon-task-trust typeIcon typeIconTrust ThemeColor9" />
            </span>
            <span className="typeName ThemeColor10">{_l('他托付的任务')}</span>
            <span className="allCountTask Right ThemeColor8" />
          </li>
          <li
            className={cx('participate ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 1 })}
            data-type="participate"
          >
            <span className="tip-bottom-right" data-tip={_l('他仅作为任务参与者的任务')}>
              <i className="icon-task-participate typeIcon typeIconParticipate ThemeColor9" />
            </span>
            <span className="typeName ThemeColor10">{_l('他参与的任务')}</span>
            <span className="allCountTask Right ThemeColor8" />
          </li>
        </ul>
      );
    }

    // 同事
    if (filterUserId && !isSubUser) {
      return (
        <ul className="taskType ThemeBorderColor7">
          <li
            className={cx('otherAndMe ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 7 })}
            data-type="otherAndMe"
          >
            <span className="tip-bottom-right" data-tip={_l('我与他共同参与的任务')}>
              <i className="icon-charger typeIcon ThemeColor9" />
            </span>
            <span className="typeName responsibleText ThemeColor10">{_l('与他协作的任务')}</span>
            <span className="allCountTask Right ThemeColor8" />
          </li>
          <li
            className={cx('otherResponsible ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 10 })}
            data-type="otherResponsible"
          >
            <span className="tip-bottom-right" data-tip={_l('我可见的由他负责的任务')}>
              <i className="icon-task_custom_personnel typeIcon ThemeColor9" />
            </span>
            <span className="typeName responsibleText ThemeColor10">{_l('他负责的任务')}</span>
            <span className="allCountTask Right ThemeColor8" />
          </li>
        </ul>
      );
    }

    return (
      <ul className="taskType ThemeBorderColor7">
        <li
          className={cx('myTask ThemeHoverBGColor7', {
            ThemeBGColor8: (taskFilter === 6 && !keyWords) || taskFilter === 1 || taskFilter === 2 || taskFilter === 3,
          })}
          data-type="myTask"
        >
          <span className="tip-bottom-right" data-tip={_l('我的任务')}>
            <i className="icon-charger typeIcon ThemeColor9" />
          </span>
          <span className="typeName responsibleText ThemeColor10">{_l('我的任务')}</span>
          <span className="allCountTask Right ThemeColor8" />
        </li>
        <li className={cx('aboutMeStar ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 8 })} data-type="star">
          <span className="tip-bottom-right" data-tip={_l('所有添加星标的任务')}>
            <i className="icon-task-star typeIcon ThemeColor9" />
          </span>
          <span className="typeName ThemeColor10">{_l('星标任务')}</span>
          <span className="allCountTask Right ThemeColor8" />
        </li>
        <li
          className={cx('taskSubordinate ThemeHoverBGColor7', { ThemeBGColor8: taskFilter === 9 })}
          data-type="subordinate"
        >
          <span className="tip-bottom-right" data-tip={_l('下属任务')}>
            <i className="icon-group typeIcon ThemeColor9" />
          </span>
          <span className="typeName ThemeColor10">{_l('下属任务')}</span>
          <span className="allCountTask Right ThemeColor8" />
        </li>
      </ul>
    );
  }

  /**
   * 退出查看他人任务
   */
  exitLookOtherTask = () => {
    this.props.dispatch(
      updateStateConfig(
        Object.assign({}, this.props.taskConfig, {
          filterUserId: '',
          taskFilter: 9,
        }),
      ),
    );
  };

  render() {
    const { showFolderTemplate, showCopyFolder, folderId, projectId, chargeUser, folderName, isAdmin } = this.state;

    return (
      <div id="taskNavigator" className="ThemeBGColor9 flexColumn">
        <div
          className={cx('otherBox', { Hidden: !this.props.taskConfig.filterUserId })}
          onClick={this.exitLookOtherTask}
        >
          <div className="closeOther ThemeColor3 Font13">
            <i className="icon-arrow-left-border Font18" />
            {_l('返回下属任务')}
          </div>
        </div>
        <div className="folderSearchBox boxSizing">
          <div className="folderSearch boderRadAll_5 ThemeBorderColor8">
            <span className="icon-search btnFolderSearch ThemeColor9 Font17" />
            <input
              type="text"
              id="leftSearchTaskOrFolder"
              className="txtSearch boxSizing ThemeColor10"
              placeholder={_l('搜索')}
            />
          </div>
        </div>

        {this.renderNavMenu()}

        <div className="navContent boxSizing flex" />

        <div className="createNewBox">
          <span className="createNew ThemeColor9 ThemeBorderColor8 ThemeHoverBGColor7">
            <i className="icon-plus" />
            {_l('创建项目')}
          </span>
        </div>

        <ul className="folderSettingsList boderRadAll_3 boxShadow5 Hidden">
          <li data-type="popTop" className="ThemeBGColor3 importantProject">
            <i className="icon-folder-top" />
            <span>{_l('置顶')}</span>
          </li>
          <li data-type="addfile" className="ThemeBGColor3 addFileBox">
            <i className="icon-addto-folder" />
            {_l('添加到文件夹')}
            <i className="arrorwRight Right " />
            <div className="fileFoldersBox">
              <ul className="fileFolders boderRadAll_3 boxShadow5 Hidden">
                <li data-type="exitfile" className="ThemeBGColor3 Hidden exitFile">
                  {_l('直接移出')}
                </li>
                <li data-id="new" className="ThemeBGColor3 newFile">
                  {_l('新建项目文件夹')}
                </li>
              </ul>
            </div>
          </li>
          <li data-type="copyFolder" className="ThemeBGColor3 copyFolder">
            <i className="icon-task-new-copy" />
            <span>{_l('复制项目')}</span>
          </li>
          <li className="dividerLine" />
          <li data-type="slide" className="ThemeBGColor3 slideFolders">
            <i className="icon-public-folder-hidden" />
            <span>{_l('隐藏项目')}</span>
          </li>
          <li data-type="pigeonhole" className="ThemeBGColor3 pigeonhole">
            <i className="icon-task-pigeonhole" />
            <span>{_l('归档项目')}</span>
          </li>
          <li data-type="del" className="ThemeBGColor3 chargeAuth">
            <i className="icon-task-new-delete" />
            {_l('删除项目')}
          </li>
          <li data-type="exit" className="ThemeBGColor3 Hidden exitFolder">
            <i className="icon-task-new-exit" />
            {_l('退出项目')}
          </li>
        </ul>

        <ul className="projectFolderOp boderRadAll_3 boxShadow5 Hidden">
          <li className="ThemeBGColor3" data-type="rename">
            {_l('重命名项目文件夹')}
          </li>
          <li className="ThemeBGColor3" data-type="abort">
            {_l('解散项目文件夹')}
          </li>
        </ul>

        {showFolderTemplate && <FolderTemplate callback={this.createFolderCallback} onClose={this.onCloseDialog} />}
        {showCopyFolder && (
          <CopyFolder
            isAdmin={isAdmin}
            projectId={projectId}
            chargeUser={chargeUser}
            folderName={folderName}
            folderId={folderId}
            callback={this.createFolderCallback}
            onClose={() => this.setState({ showCopyFolder: false })}
          />
        )}
      </div>
    );
  }
}

export default connect(state => state.task)(TaskNavigation);
