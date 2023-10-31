import './css/quickCreateTask.less';
import doT from 'dot';
import ajaxRequest from 'src/api/taskCenter';
import 'src/components/mdDatePicker/mdDatePicker';
import 'src/components/mdBusinessCard/mdBusinessCard';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import dialogSelectUser from 'src/components/dialogSelectUser/dialogSelectUser';
import { expireDialogAsync } from 'src/components/common/function';
import quickCreateTask from './tpl/quickCreateTask.html';
import { errorMessage, checkIsProject } from '../../utils/utils';
import Store from 'redux/configureStore';
import { addTask } from 'src/pages/task/redux/actions';
import { DateTimeRange } from 'ming-ui/components/NewDateTimePicker';
import React from 'react';
import ReactDom from 'react-dom';

class QuickCreateTask {
  init(settings) {
    // 默认参数
    const defaults = {
      stageId: '',
      stageName: '',
      folderId: '',
      projectId: '',
    };

    this.settings = $.extend(defaults, settings);

    const createDom = () => {
      $('.listCreateNew, #taskSearchNullTask').hide();
      if ($('#taskList .listStageTaskContent').length) {
        const $listStageTaskContent = $('#taskList .listStageTaskContent:first');
        if (!$listStageTaskContent.is(':visible')) {
          $('#taskList .taskListStageName:first').click();
        }
        $listStageTaskContent.prepend(doT.template(quickCreateTask)());
      } else {
        $('#taskList').append(doT.template(quickCreateTask)());
      }

      // 事件绑定
      this.bindCreateSinlgeTaskEvent();

      $('#taskList').find('.txtSingleName').focus();

      // 绑定阶段
      if (this.settings.folderId) {
        this.bindStage();
      }
    };

    expireDialogAsync(this.settings.projectId).then(() => {
      createDom();
    });
  }

  // 列表无任务是绑定创建单个任务
  bindCreateSinlgeTaskEvent() {
    const _this = this;
    // 星星
    $('.createNewSingle  .taskStar').on('click', function () {
      $(this).toggleClass('icon-task-star icon-star-hollow');
      if ($(this).hasClass('icon-task-star')) {
        $(this).removeClass('ThemeColor3');
      }
    });

    const $createSingleDate = $('.createNewSingle .createSingleDate');
    const bindDate = () => {
      const { start: defaultStart, end: defaultEnd } = $createSingleDate.data();

      ReactDom.render(
        <DateTimeRange
          selectedValue={[defaultStart, defaultEnd]}
          mode="task"
          timePicker
          separator={_l('至')}
          timeMode="hour"
          placeholder={_l('未指定起止时间')}
          onOk={selectedValue => {
            let [start, end] = selectedValue;

            if (start && end && start >= end) {
              alert(_l('结束时间不能早于或等于开始时间'), 2);
              return false;
            }

            start = start ? start.format('YYYY-MM-DD HH:00') : '';
            end = end ? end.format('YYYY-MM-DD HH:00') : '';
            $createSingleDate.data('start', start);
            $createSingleDate.data('end', end);
          }}
          onClear={() => {
            delete $createSingleDate.data().start;
            delete $createSingleDate.data().end;

            ReactDom.unmountComponentAtNode($createSingleDate[0]);
            bindDate();
          }}
        >
          <span class="icon-bellSchedule"></span>
        </DateTimeRange>,
        $createSingleDate[0],
      );
    };

    bindDate();

    // 文本框
    $('.createNewSingle  .txtSingleName').on('keyup', event => {
      if (event.keyCode === 13) {
        _this.quickCreateTask(true);
      }
    });

    // 点击切换阶段
    $('.createNewSingle')
      .on('click', '.showStage', function () {
        const $stageDrop = $('ul.stageDrop').show();
        const WINHEIGHT = $(window).height();
        const top = $(this).offset().top;
        const stageDropHeight = $stageDrop.height();
        const winBottomGap = 30;
        if (top + stageDropHeight + winBottomGap > WINHEIGHT) {
          $stageDrop.css('top', -stageDropHeight - 3);
        } else {
          $stageDrop.css('top', '38px');
        }
      })
      .on('click', '.stageDrop li', function () {
        const that = $(this);
        _this.settings.stageId = that.data('stageid');
        _this.settings.stageName = $.trim(that.text());
        that.addClass('selected').siblings().removeClass('selected');
        $('ul.stageDrop').hide();

        // 移动阶段
        const $stage = $("#taskList span[data-stageid='" + _this.settings.stageId + "']").parent();
        if ($stage.next().is('.listStageTaskContent')) {
          if (!$stage.next().is(':visible')) {
            $stage.find('.listFolderNameText').trigger('click');
          }
          $stage.next().prepend($('.createNewSingle'));
        } else {
          $stage.after($('.createNewSingle'));
        }

        const $taskList = $('#taskList');
        const taskListHeight = $taskList.height();
        const scrollHeight = $taskList[0].scrollHeight;
        // 移动滚动条 有滚动条
        if (scrollHeight > taskListHeight) {
          const top = $('.createNewSingle').offset().top;
          const taskListTop = $taskList.offset().top;
          const gapTop = top - taskListTop;
          const scrolllTop = $taskList.scrollTop() + gapTop - 30;
          $taskList.scrollTop(scrolllTop);
        }
      });

    // 点击切换负责人
    $('.createNewSingle .chargeImg').on('click', function () {
      const $this = $(this);
      const callback = function (users) {
        _this.updateCharge(users[0].accountId, users[0].avatar);
        $this.data('hasbusinesscard', false).mdBusinessCard('destroy');
      };

      quickSelectUser($this[0], {
        sourceId: _this.settings.folderId,
        showMoreInvite: false,

        fromType: 2,
        filterAccountIds: [$this.attr('data-id')],
        includeUndefinedAndMySelf: true,
        SelectUserSettings: {
          filterAccountIds: [$this.attr('data-id')],
          projectId: checkIsProject(_this.settings.projectId) ? _this.settings.projectId : '',
          unique: true,
          callback,
        },
        selectCb: callback,
      });
    });

    // hover出用户层
    $('.createNewSingle').on(
      {
        mouseover() {
          const $this = $(this);
          const accountId = $this.data('id');

          if (!$this.data('hasbusinesscard')) {
            $this.mdBusinessCard({
              id: 'quickCreateTaskCharge',
              accountId,
              opHtml: "<span class='quickCreateBtn ThemeColor3'>" + _l('将任务托付给他人') + '</span>',
              readyFn() {
                $('#quickCreateTaskCharge_' + accountId + ' .quickCreateBtn').on('click', function () {
                  const that = $(this);
                  const callback = function (users) {
                    _this.updateCharge(users[0].accountId, users[0].avatar);
                    $this.data('hasbusinesscard', false).mdBusinessCard('destroy');
                  };

                  dialogSelectUser({
                    sourceId: _this.settings.folderId,
                    showMoreInvite: false,
                    fromType: 2,
                    SelectUserSettings: {
                      includeUndefinedAndMySelf: true,
                      filterAccountIds: [accountId],
                      projectId: checkIsProject(_this.settings.projectId) ? _this.settings.projectId : '',
                      unique: true,
                      callback,
                    },
                  });
                });
              },
            });
            $this.data('hasbusinesscard', true).mouseenter();
          }
        },
      },
      '.chargeImg',
    );

    // document事件
    $(document)
      .off('click.quickCreateTask')
      .on('click.quickCreateTask', event => {
        const $target = $(event.target);

        // 选择成员层
        if (
          $target.closest('#dialogBoxSelectUser_container').length > 0 ||
          $target.is($('#dialogBoxSelectUser_mask'))
        ) {
          return;
        }

        // 用户选择层 成员被删除了
        if ($target.parent().is('.subItem')) {
          return;
        }

        if ($('.md_dialog:visible').length > 0) {
          return;
        }
        // 头像层
        if ($target.closest('.businessCardSite').length > 0) {
          return;
        }
        // 日历层
        if ($target.closest('.PositionContainer-wrapper').length > 0) {
          return;
        }
        // 提示层
        if ($target.closest('#alertDialog').length > 0) {
          return;
        }

        const $createNewSingle = $('.createNewSingle ');
        // 存在快速创建
        if (
          ($('.listCreateNew, #taskSearchNullTask').length > 0 && $createNewSingle.length > 0) ||
          ($createNewSingle.length > 0 && $createNewSingle.is(':visible'))
        ) {
          // 头像层
          if ($target.closest('.messageDiv').length > 0) {
            return;
          }
          if ($target.closest('.createNewSingle').length <= 0) {
            _this.quickCreateTask(false);
          }
        }

        // 阶段下拉
        if ($target.closest('.stageBox').length <= 0) {
          const $stageDrop = $('ul.stageDrop');
          if ($stageDrop.length > 0) {
            $('ul.stageDrop').hide();
          }
        }
      });
  }

  // 绑定阶段
  bindStage() {
    const _this = this;

    ajaxRequest
      .getFolderStage({
        folderID: _this.settings.folderId,
      })
      .then(source => {
        if (source.status) {
          const stages = source.data;
          const stageCount = stages.length;
          let stage;
          let spanShow;
          let contentHtml = '';
          for (let i = 0; i < stageCount; i++) {
            stage = stages[i];
            contentHtml =
              contentHtml +
              `
            <li data-stageid="${stage.id}" class="overflow_ellipsis boxSizing ${i === 0 ? 'selected' : ''}" title="${
                stage.name
              }">
            ${stage.name}
            </li>
            `;
            if (i === 0) {
              _this.settings.stageId = stage.id;
              _this.settings.stageName = stage.name;
              spanShow = '<span class="showStage boderRadAll_3 icon-task-quick-stage"></span>';
            }
          }
          const sb = `
          <ul class="stageDrop boderRadAll_3 boxShadow5">
          ${contentHtml}
          </ul>
          `;
          const $stageBox = $('.createNewSingle .stageBox');

          if ($stageBox.length > 0) {
            $stageBox.html('').append(spanShow);
            $stageBox.append(sb);
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  // 更换负责人
  updateCharge(uid, uHead) {
    $('.createNewSingle .chargeImg').attr('src', uHead).data('id', uid);
  }

  // 快速创建任务
  quickCreateTask(isEnter) {
    // 创建中
    if ($('#taskList .createNewSingle').data('create')) {
      return;
    }

    const _this = this;
    const settings = _this.settings;
    // 任务名称
    const taskName = $.trim($('.createNewSingle .txtSingleName').val());
    if (taskName) {
      const start = $('.createNewSingle .createSingleDate').data('start');
      const end = $('.createNewSingle .createSingleDate').data('end');

      // 设置为创建中
      $('#taskList .createNewSingle').data('create', 1);
      const favorite = $('.createNewSingle .taskStar').hasClass('icon-task-star');
      const $chargeImg = $('.createNewSingle .chargeImg');
      const avatar = $chargeImg.attr('src');
      const accountID = $chargeImg.data('id');

      ajaxRequest
        .addTask({
          projectId: settings.projectId,
          taskName,
          chargeAccountID: accountID,
          stageID: settings.stageId,
          summary: '',
          members: '',
          parentID: '',
          groupIDstr: '',
          postID: '',
          folderID: settings.folderId,
          star: favorite,
          startTime: start,
          deadline: end,
        })
        .then(source => {
          if (source.status) {
            // 设置为未创建
            $('#taskList .createNewSingle').data('create', 0);

            source.data.star = favorite;
            source.data.taskName = source.data.name;
            source.data.charge = {
              status: 1,
              avatar,
              accountID,
            };
            // 阶段
            source.data.stageID = settings.stageId;
            source.data.projectId = settings.projectId;
            source.data.projectID = settings.ProjectID;
            source.data.stageName = settings.stageName;
            source.data.folderId = settings.folderId;
            source.data.actualStartTime = '';
            source.data.completeTime = '';

            if (isEnter) {
              $('.createNewSingle .txtSingleName').val('');
              $('.createNewSingle .createSingleDate').text('').addClass('icon-bellSchedule').removeClass('selDate');
              $('.createNewSingle .taskStar').removeClass('icon-task-star').addClass('icon-star-hollow');
            } else {
              $(document).off('click.quickCreateTask');
              $('.listCreateNew, #taskSearchNullTask').remove();
              $('.createNewSingle').remove();
            }

            Store.dispatch(addTask(source.data));
          } else {
            errorMessage(source.error);
          }
        });
    } else {
      if (isEnter) {
        alert(_l('请输入任务名称'), 3);
        return;
      }

      $('.listCreateNew, #taskSearchNullTask').show();
      $('.createNewSingle').remove();
    }
  }
}

export default new QuickCreateTask();
