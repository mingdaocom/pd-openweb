import React from 'react';
import doT from 'dot';
import _ from 'lodash';
import { Modal } from 'ming-ui/antd-components';
import { SelectGroupPopover } from 'ming-ui/functions/quickSelectGroup';
import ajaxRequest from 'src/api/taskCenter';
import createRoot from 'src/common/theme/createRootWithAntdConfig';
import editFolderTpl from './tpl/editFolder.html';
import './css/editFolder.less';

const EditFolder = function (opts) {
  const defaults = {
    folderId: null,
    visibility: null,
    selectGroup: null,
    callback: null,
    projectId: null,
    projectName: '',
    scope: undefined,
    groupInfo: [],
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
    Modal.confirm({
      wrapClassName: 'editFolder',
      title: settings.projectName === _l('个人') ? _l('编辑项目') : _l('在组织 “%0” 下编辑项目', settings.projectName),
      okText: _l('保存'),
      styles: { body: { overflow: 'visible' } },
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: editFolderHtml,
          }}
        ></div>
      ),
      manualClose: true,
      onOk: close => {
        const sign = _this.edit();

        if (sign !== false) close();
      },
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
      <SelectGroupPopover
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

  handleChangeGroup(value, selectedGroups) {
    const settings = this.settings;

    settings.scope =
      !(value.shareGroupIds || []).length &&
      !(value.shareProjectIds || []).length &&
      !(value.radioProjectIds || []).length
        ? undefined
        : _.pick(value, ['radioProjectIds', 'shareGroupIds', 'shareProjectIds']);
    settings.groupInfo = (value.shareGroupIds || []).map(groupId => {
      const selectedGroup = _.find(selectedGroups, { id: groupId });
      const currentGroup = _.find(settings.groupInfo, { groupID: groupId });

      return {
        groupID: groupId,
        groupName: _.get(selectedGroup, 'value') || _.get(currentGroup, 'groupName') || '',
      };
    });
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
      groupInfo: visibility === 1 ? settings.groupInfo : [],
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
          if (_.isFunction(settings.callback)) {
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
