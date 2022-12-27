import './style.less';
import 'src/components/mdDialog/dialog';
import doT from '@mdfe/dot';
import { getRenderInfo } from '../util';
import departmentController from 'src/api/department';
import fixedDataAjax from 'src/api/fixedData.js';
import chargerTpl from './tpl/chargeUserTpl.html';
import mainHtml from './tpl/main.html';
import { updateTreeData } from 'src/pages/Admin/structure/modules/util';
import dialog from '../dialogSelectDeptUser';

const mainTpl = mainHtml.replace('#include.chargeUserTpl', chargerTpl);

var RESULTS = {
  FAILED: 0,
  SUCCESS: 1,
  EXISTS: 2,
  NOTDEPARTMENTUSER: 3,
  PARENTNOTTOSUB: 4,
  /* 设置的上级部门是自己的子部门 */
};

var DELETE_RESULTS = {
  FAILED: 0,
  /* 失败 */
  SUCCESS: 1,
  /* 成功 */
  EXISTSUBDEPARTMENT: 2,
  /* 存在子部门 */
  EXISTUSER: 3,
  /* 部门存在成员 */
};

var DEFAULTS = {
  type: 'edit',
  createDialogId: 'createDeptDialog_',
  editDialogId: 'editDeptDialog_',
  projectId: null,
  departmentId: null,
  callback: function (payload) {
    console.log(payload);
  },
  readyFn: function () {},
};

var CreateEditDeptDialog = function (options) {
  this.options = Object.assign({}, DEFAULTS, options);
  this.init();
};

CreateEditDeptDialog.prototype.init = function () {
  var options = this.options;
  var _this = this;
  var type = options.type;
  var id = options.departmentId || options.projectId;
  options.dialogBoxID = (type === 'create' ? options.createDialogId : options.editDialogId) + id;
  this.dialog = $.DialogLayer({
    dialogBoxID: options.dialogBoxID,
    className: 'createEditDeptDialog',
    container: {
      header: type === 'create' ? _l('创建部门') : _l('编辑部门'),
      yesText: type === 'create' ? _l('创建') : _l('保存'),
      noFn: options.noFn,
      yesFn: function () {
        if (type === 'create') {
          _this.createDept();
        } else {
          _this.editDept();
        }
        // 默认不关闭
        return false;
      },
    },
  });
  _this.renderMain();
};

CreateEditDeptDialog.prototype.renderMain = function () {
  var options = this.options;
  var _this = this;
  var tplFunc = doT.template(mainTpl);
  getRenderInfo(options.projectId, options.departmentId).then(function (data) {
    options.data = data;
    var renderData = Object.assign({}, data, {
      type: options.type,
      isLevel0: options.isLevel0,
    });
    _this.dialog.content(tplFunc(renderData));
    setTimeout(function () {
      if (options.type === 'edit') {
        _this.appendDeleteDeptBtn();
      }
      _this.getDom();
      _this.bindEvent();
    }, 0);
  });
};

CreateEditDeptDialog.prototype.appendDeleteDeptBtn = function () {
  this.$deleteBtn = $(
    '<span style="" class="LineHeight20 Left mTop5 Hand deleteBtn"><i class="icon-task-new-delete Font16 mRight10"></i><span>' +
      _l('删除') +
      '</span></span>',
  );
  $('#' + this.options.dialogBoxID)
    .find('.footer')
    .prepend(this.$deleteBtn);
};

CreateEditDeptDialog.prototype.getDom = function () {
  var options = this.options;
  this.$content = $('#' + options.dialogBoxID).find('.departmentInfoList');
  this.$name = this.$content.find('.departmentName .deptName');
  this.$icon = this.$content.find('.departmentName .icon');
  this.$parent = this.$content.find('.parentDepartment .deptName');
  this.$charger = this.$content.find('.departmentCharger .chargerUser');

  this.$changeParent = this.$content.find('.parentDepartment .info');
};

CreateEditDeptDialog.prototype.bindEvent = function () {
  var _this = this;
  var options = this.options;
  // var parentDepartment = options.type === 'create' ? options.data : options.data.parentDepartment;
  this.$changeParent.on('click', function () {
    if (options.type === 'create') {
      return;
    }
    var parentDepartment = {
      departmentId: _this.$parent.data('departmentid'),
      departmentName: _this.$parent.text(),
    };
    import('src/components/dialogSelectDept').then(selectDeptDialog => {
      selectDeptDialog.default({
        projectId: options.projectId,
        selectedDepartment: [parentDepartment],
        includeProject: true,
        showCreateBtn: false,
        fromAdmin: true,
        // unique: false,
        selectFn: function ([dept = {}]) {
          _this.$parent.text(dept.departmentName).data({
            departmentid: dept.departmentId,
          });
        },
      });
    });
  });

  this.$content.on('click', '.chargeUserDel', function (evt) {
    if ($(evt.target).closest('.chargerUserItem').length) {
      $(evt.target).closest('.chargerUserItem').remove();
    }
  });

  if (options.type === 'edit') {
    this.$deleteBtn.on('click', function () {
      _this.deleteDepartment();
    });

    this.$charger.on('click', function () {
      var chargeAccountIds = [];

      _this.$charger
        .siblings('.chargerUserBox')
        .find('.chargeUserName')
        .map((index, item) => {
          chargeAccountIds.push($(item).data('accountid'));
        });

      dialog({
        projectId: options.projectId,
        departmentId: options.departmentId,
        selectedUsers: chargeAccountIds,
        isUnique: false,
        maxCount: 5,
        callback: function (accounts) {
          var tpl = doT.template(chargerTpl)({
            rebuild: true,
            accounts: accounts,
          });
          _this.$charger.siblings('.chargerUserBox').html(tpl);
        },
      });
    });
  }
};

CreateEditDeptDialog.prototype.createDept = function () {
  var _this = this;
  var options = this.options;
  var deptName = this.$name.val();
  var parentId = this.$parent.data('departmentid');
  if ($.trim(deptName) === '') {
    return alert(_l('请输入部门名称'), 2);
  }
  fixedDataAjax.checkSensitive({ content: deptName }).then(res => {
    if (res) {
      return alert(_l('输入内容包含敏感词，请重新填写'), 3);
    }
    options.promise = departmentController
      .addDepartment({
        projectId: options.projectId,
        departmentName: deptName,
        parentId: parentId,
      })
      .then(function (data) {
        if (data.resultStatus !== RESULTS.SUCCESS) {
          return $.Deferred().reject(data).promise();
        } else {
          options.callback.call(null, {
            type: 'CREATE',
            departmentId: options.departmentId,
            response: data.departmentInfo,
          });
          _this.dialog.closeDialog();
        }
      })
      .then(null, function (error) {
        _this.createErrorHandler(error.resultStatus);
      });
  });
};

CreateEditDeptDialog.prototype.createErrorHandler = function (errMessage) {
  switch (errMessage) {
    case RESULTS.FAILED:
      return alert(_l('创建失败'), 2);
    case RESULTS.EXISTS:
      alert(_l('该部门已存在'), 3);
      this.$name.focus();
      break;
    case RESULTS.PARENTNOTTOSUB:
      return alert(_l('不能设置子部门为自己的上级部门'), 3);
    default:
      break;
  }
};

CreateEditDeptDialog.prototype.editDept = function () {
  var _this = this;
  var options = this.options;
  var deptName = this.$name.val();
  var parentId = this.$parent.data('departmentid');
  var chargeAccountIds = [];

  this.$charger
    .siblings('.chargerUserBox')
    .find('.chargeUserName')
    .map((index, item) => {
      chargeAccountIds.push($(item).data('accountid'));
    });

  if (parentId && parentId === options.departmentId) {
    return alert(_l('不能设设置自己为上级部门'), 3);
  }
  if ($.trim(deptName) === '') {
    return alert(_l('请输入部门名称'), 2);
  }
  fixedDataAjax.checkSensitive({ content: deptName }).then(res => {
    if (res) {
      return alert(_l('输入内容包含敏感词，请重新填写'), 3);
    }
    options.promise = departmentController
      .editDepartment({
        projectId: options.projectId,
        departmentId: options.departmentId,
        departmentName: deptName,
        parentId: parentId,
        chargeAccountIds,
      })
      .then(function (data) {
        if (!data || data.resultStatus !== RESULTS.SUCCESS) {
          return $.Deferred().reject(data).promise();
        } else {
          return $.Deferred().resolve(data.departmentInfo);
        }
      })
      .then(
        function (departmentInfo) {
          let { newDepartments = [], expandedKeys } = updateTreeData(
            options.newDepartments,
            options.departmentId,
            departmentInfo.departmentName,
            parentId,
          );
          options.callback.call(null, {
            type: 'EDIT',
            departmentId: options.departmentId,
            expandedKeys,
            response: {
              ...departmentInfo,
              parentDepartment: parentId,
              chargeUsers: chargeAccountIds,
              newDepartments,
            },
          });
          _this.dialog.closeDialog();
        },
        function (error) {
          _this.editErrorHandler(error.resultStatus);
        },
      );
  });
};

CreateEditDeptDialog.prototype.editErrorHandler = function (errMessage) {
  switch (errMessage) {
    case RESULTS.FAILED:
      return alert(_l('编辑失败'), 2);
    case RESULTS.EXISTS:
      alert(_l('该部门已存在'), 3);
      this.$name.select().focus();
      break;
    case RESULTS.NOTDEPARTMENTUSER:
      alert(_l('部门负责人不是部门成员'), 3);
      break;
    case RESULTS.PARENTNOTTOSUB:
      alert(_l('不能设置子部门为自己的上级部门'), 3);
      break;
    default:
      break;
  }
};

CreateEditDeptDialog.prototype.deleteDepartment = function () {
  var options = this.options;
  var _this = this;
  const { departmentId } = options.data.parentDepartment;
  options.promise = departmentController
    .deleteDepartments({
      projectId: options.projectId,
      departmentId: options.departmentId,
    })
    .then(function (data) {
      if (data !== DELETE_RESULTS.SUCCESS) {
        return $.Deferred().reject(data).promise();
      } else {
        alert(_l('删除成功'));
        options.callback.call(null, {
          type: 'DELETE',
          response: {
            departmentId: options.departmentId,
            parentDepartmentId: departmentId,
          },
        });
        _this.dialog.closeDialog();
      }
    })
    .then(null, function (error) {
      _this.deleteErrorHandler(error);
    });
};

CreateEditDeptDialog.prototype.deleteErrorHandler = function (errMessage) {
  switch (errMessage) {
    case DELETE_RESULTS.FAILED:
      return alert(_l('删除失败'), 2);
    case DELETE_RESULTS.EXISTUSER:
      return alert(_l('部门存在成员，无法删除'), 3);
    case DELETE_RESULTS.EXISTSUBDEPARTMENT:
      return alert(_l('部门存在子部门，无法删除'), 3);
    default:
      break;
  }
};

export default function (opts) {
  return new CreateEditDeptDialog(opts);
}
