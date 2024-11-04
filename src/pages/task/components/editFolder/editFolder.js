import './css/editFolder.less';
import doT from 'dot';
import editFolderTpl from './tpl/editFolder.html';
import ajaxRequest from 'src/api/taskCenter';
import { Dialog, Button } from 'ming-ui';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SelectGroupTrigger } from 'ming-ui/functions/quickSelectGroup';

const EditFolder = function (opts) {
  const defaults = {
    folderId: null,
    visibility: null,
    selectGroup: null,
    callback: null,
    projectId: null,
    projectName: '',
    scope: undefined,
  };

  this.settings = $.extend(defaults, opts);
  this.init();
};

$.extend(EditFolder.prototype, {
  init() {
    const _this = this;
    const settings = this.settings;
    // 数据
    const editFolderHtml = doT.template(editFolderTpl)(settings);
    // 创建弹出层
    Dialog.confirm({
      dialogClasses: 'editFolder',
      title: settings.projectName === _l('个人') ? _l('编辑项目') : _l('在组织 “%0” 下编辑项目', settings.projectName),
      okText: _l('保存'),
      children: <div dangerouslySetInnerHTML={{ __html: editFolderHtml }}></div>,
      footer: (
        <div className="Dialog-footer-btns">
          <Button type="link" onClick={() => $('.editFolder').parent().remove()}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            onClick={() => {
              let sign = _this.edit();
              if (sign === false) return;
              $('.editFolder').parent().remove();
            }}
          >
            {_l('保存')}
          </Button>
        </div>
      ),
      width: 570,
    });

    setTimeout(() => {
      _this.initEvent();
    }, 200);
  },

  // 事件初始件
  initEvent() {
    const settings = this.settings;
    const project = [];
    let group = [];

    if (settings.visibility === 2) {
      project.push(settings.projectId);
    } else if (settings.visibility === 1) {
      group = settings.selectGroup.split(',');
    }

    const defaultValue = { shareProjectIds: project, shareGroupIds: group };
    settings.scope = defaultValue;

    const root = createRoot(document.getElementById('privateGroupRange'));
    root.render(
      <SelectGroupTrigger
        className="editFolderSelectGroup"
        defaultValue={defaultValue}
        projectId={settings.projectId}
        isMe={false}
        everyoneOnly={true}
        onChange={this.handleChangeGroup.bind(this)}
      />,
    );

    // 公开项目
    if (settings.visibility !== 0) {
      $('#publicFolder').find(':radio').prop('checked', true);
    }

    // radio切换
    $('.editFolder .folderAuth').on('click', function () {
      $(this).find(':radio').prop('checked', true);
    });
  },

  handleChangeGroup(value) {
    const settings = this.settings;

    settings.scope =
      !(value.shareGroupIds || []).length &&
      !(value.shareProjectIds || []).length &&
      !(value.radioProjectIds || []).length
        ? undefined
        : _.pick(value, ['radioProjectIds', 'shareGroupIds', 'shareProjectIds']);
  },

  // 验证部分数据
  returnCheck() {
    const settings = this.settings;
    let visibility;
    let groupIds = [];
    const scope = settings.scope;

    if ($('#privateFolder :radio').prop('checked')) {
      // 私密项目
      visibility = 0;
    } else if (
      !scope ||
      (scope.shareGroupIds.length === 0 && scope.shareProjectIds.indexOf(settings.projectId) === -1)
    ) {
      // 公开项目未选群组
      alert(_l('请选择公开的范围'), 3);
      return false;
    } else if (scope.shareProjectIds.indexOf(settings.projectId) > -1) {
      // 全公司可见
      visibility = 2;
      groupIds.push('everyone');
    } else {
      visibility = 1;
      groupIds = scope.shareGroupIds;
    }

    return {
      visibility,
      groupIds: groupIds.join(','),
    };
  },

  // 修改项目
  edit() {
    const _this = this;
    const settings = _this.settings;
    const folderObj = _this.returnCheck();

    if (!folderObj) {
      return false;
    }

    // 群组可见
    if (folderObj.visibility === 1) {
      folderObj.groupInfo = [];
      $('.editFolderSelectGroup')
        .next()
        .find('.select.item')
        .each(function () {
          folderObj.groupInfo.push({
            groupID: $(this).attr('data-groupid'),
            groupName: $(this).attr('data-name'),
          });
        });
    }

    // 编辑项目
    ajaxRequest
      .updateFolderVisibility({
        folderID: settings.folderId,
        projectId: settings.projectId,
        visibility: folderObj.visibility,
        groupID: folderObj.groupIds,
      })
      .then(source => {
        if (source.status) {
          if ($.isFunction(settings.callback)) {
            settings.callback(folderObj);
          }
        } else {
          alert(_l('操作失败，请稍后再试'), 2);
        }
      });
  },
});

export default function (opts) {
  return new EditFolder(opts);
}
