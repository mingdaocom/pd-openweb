import './style.css';
import { htmlEncodeReg } from 'src/util';
import fixedDataAjax from 'src/api/fixedData';
import { index as dialog } from 'src/components/mdDialog/dialog';
import departmentController from 'src/api/department';

var DialogSelectMapGroupDepart = function(param) {
  var _this = this;
  var defaults = {
    title: _l('设置关联部门'),
    defaultSelectId: '',
    defaultSelectName: '',
    projectId: '',
    loadNextPage: false,
    departmentsData: [],
    postData: {
      pageIndex: 1,
      pageSize: 20,
      keywords: '',
      sortType: 0,
      sortField: 0,
    },
    callback: function(data) {},
  };

  var options = $.extend(defaults, param);

  // 初始化
  _this.init = function() {
    var html = `
    <div class="dialogSelectMapGroupDepart">
    <div class="searchContainer">
    <input type="text" class="txtSearch" placeholder="${_l('搜索')}" />
    <span class="searchImage"><span class="lineSpan"></span></span>
    <div class="Clear"></div>
    </div>
    <div class="mappingList"><div class="title">
    <div class="titleItem"><span class="mLeft30 InlineBlock" id="sortDept" sortType="0">
    <span class="Left">${_l('部门')}</span><div class="sortItem Left">
    <span sortType="1" class="Left icon-arrow-up font8 Gray_c6"></span>
    <span sortType="0" class="Left icon-arrow-down font8 Gray_c6"></span></div>
    <div class="Clear"></div></span></div><div class="titleItem"><span class="mLeft25">
    ${_l('关联群组')}</span></div></div><div class="contentBox">${LoadDiv()}</div></div>
    <div class="mapBottom"><div class="mapDept"><span class="ThemeColor3 showInput">
    ${_l('创建部门')}<i class="icon-arrow-down-border font8"></i></span>
    <input type="button" class="btnBootstrap btnBootstrap-primary btnBootstrap-small btnConfirm" value="${_l(
      '确定',
    )}" />
    <div class="Clear"></div></div><div class="mapForm Hidden mBottom15">
    <input type="text" class="txtNewDeptName" placeholder="${_l('请输入部门名称')}" maxlength="64" />
    <input type="button" class="btnBootstrap btnBootstrap-primary btnBootstrap-small btnCreateDept" value="${_l(
      '创建',
    )}">
    <div class="Clear"></div></div></div></div>
    `;

    _this.dialog = dialog({
      dialogBoxID: 'dialogSelectMapGroupDepart',
      width: 400,
      container: {
        header: options.title,
        content: html,
        yesText: '',
        noText: '',
      },
      readyFn: () => {
        _this.loadData();
        _this.bindEvent();
      },
    });
  };

  _this.loadData = function() {
    options.postData.projectId = options.projectId;

    departmentController
      .getProjectDepartmentByPage(options.postData)
      .then(function(result) {
        var currentPageData = result.list;
        options.departmentsData =
          options.postData.pageIndex > 1 ? options.departmentsData.concat(currentPageData) : currentPageData;
        var departments = options.departmentsData;
        options.loadNextPage = currentPageData && currentPageData.length === options.postData.pageSize ? true : false;
        var $dialogSelectMapGroupDepart = $('#dialogSelectMapGroupDepart');
        if (departments && departments.length > 0) {
          var html = '';
          for (var i = 0; i < departments.length; i++) {
            html = html + `${_this.getItemHtml(departments[i])}`;
          }
          $dialogSelectMapGroupDepart.find('.contentBox').html(html);

          if (options.defaultSelectId || options.defaultSelectName) {
            var $contentBox = $dialogSelectMapGroupDepart.find('.contentBox');
            var $selectItem = $dialogSelectMapGroupDepart
              .find("input[name='mapDepartment']")
              .filter(
                "[data-departmentid='" +
                  options.defaultSelectId +
                  "'],[data-departmentname='" +
                  options.defaultSelectName +
                  "']",
              );
            if ($selectItem) {
              $selectItem.attr('checked', true);
              $contentBox.scrollTop($selectItem.parents('.contentItem').index() * 30);
            }
          }
        } else {
          $dialogSelectMapGroupDepart.find('.contentBox').html(_this.getNullItemHtml());
          // 为空情况下创建部门
          $dialogSelectMapGroupDepart.find('.triggerShowInput').on('click', function() {
            if (!$dialogSelectMapGroupDepart.find('.mapForm').is(':visible')) {
              $dialogSelectMapGroupDepart.find('.showInput').click();
            }
            if (options.postData.keywords) {
              $dialogSelectMapGroupDepart.find('.txtNewDeptName').val(options.postData.keywords);
            }
          });
        }
      })
      .fail(function() {
        alert(_l('数据加载失败'), 2);
      });
  };

  // 获取每一条记录
  _this.getItemHtml = function(item) {
    var departmentName = htmlEncodeReg(item.departmentName);
    var html = `<div class="contentItem"><div class="contentColumn overflow_ellipsis">
    <label title="${departmentName}" class="Hand LineHeight30 InlineBlock" style="height: 30px;">
    <input type="radio" name="mapDepartment" data-departmentId="${item.departmentId}"
    data-departmentName="${departmentName}" class="mRight7"/>${departmentName}</label></div>
    <div class="contentColumn overflow_ellipsis"><span class="mLeft35">
    ${item.mappingGroupID ? item.mappingGroupName : `<span class="Gray_c">${_l('未关联')}</span>`}
    </span></div></div>
    `;
    return html;
  };

  // 没有数据提示
  _this.getNullItemHtml = function() {
    var resultStr = options.postData.keywords ? _l('未搜索到结果') : _l('当前没有部门');
    var html = `<div class="TxtCenter mTop20 Gray_a">${resultStr}，${_l('建议您：')}
    <a href='javascript:;' class='triggerShowInput'>${_l('创建部门')}</a>
    `;
    return html;
  };

  // 绑定事件
  _this.bindEvent = function() {
    var $dialogSelectMapGroupDepart = $('#dialogSelectMapGroupDepart');

    // 确认选择关联的部门
    var $btnConfirm = $dialogSelectMapGroupDepart.find('.btnConfirm');

    // 创建部门区域
    var $mapForm = $dialogSelectMapGroupDepart.find('.mapForm');

    // 部门名称
    var $txtNewDeptName = $dialogSelectMapGroupDepart.find('.txtNewDeptName');

    // 搜索关键词
    var $txtSearch = $dialogSelectMapGroupDepart.find('.txtSearch');

    // 下拉分页区域
    var $contentBox = $dialogSelectMapGroupDepart.find('.contentBox');

    // 关键词搜索部门
    $dialogSelectMapGroupDepart.find('.searchImage').on('click', function() {
      options.postData.keywords = $txtSearch.val().trim();
      options.postData.pageIndex = 1;
      _this.loadData();
    });
    $txtSearch.on('keydown', function(event) {
      if (event.keyCode == '13') {
        $dialogSelectMapGroupDepart.find('.searchImage').click();
      }
    });

    // 排序
    $('#sortDept').on('click', function() {
      var $this = $(this);
      var sortType = parseInt($this.attr('sortType'));

      // 重置为灰色
      $this
        .find('.sortItem span')
        .removeClass('Gray_6')
        .addClass('Gray_c6');
      $this
        .find('.sortItem span[sortType=' + sortType + ']')
        .addClass('Gray_6')
        .removeClass('Gray_c6');
      $this.attr('sortType', (sortType + 1) % 2);

      options.postData.sortField = 1;
      options.postData.sortType = sortType;
      _this.loadData();
    });

    // 显示创建部门区域
    $dialogSelectMapGroupDepart.find('.showInput').on('click', function() {
      var $this = $(this);
      $this.find('i').toggleClass('icon-arrow-up-border icon-arrow-down-border');
      if ($mapForm.is(':visible')) {
        $mapForm.stop().slideUp(0, function() {
          $btnConfirm.show();
        });
      } else {
        $btnConfirm.hide();
        $mapForm.stop().slideDown();
        $txtNewDeptName.focus();
      }
    });

    // 创建部门按钮
    $dialogSelectMapGroupDepart.find('.btnCreateDept').on('click', function() {
      var department = $txtNewDeptName.val().trim();
      if (department) {
        fixedDataAjax.checkSensitive({ content: department }).then(res => {
          if (res) {
            return alert(_l('输入内容包含敏感词，请重新填写'), 3);
          }
          _this.createDepartment(department, function(result) {
            if (result.resultStatus == 1) {
              alert(_l('创建成功'));
              // 部门输入框为空
              $txtNewDeptName.val('');
              // 隐藏部门创建区域
              $dialogSelectMapGroupDepart.find('.showInput').click();
              // 关键词置空
              $dialogSelectMapGroupDepart.find('.txtSearch').val('');
              options.postData.keywords = '';
              options.defaultSelectName = department;
              options.defaultSelectId = '';
              options.postData.pageIndex = 1;
              // 重新加载数据
              _this.loadData();
            } else if (result.resultStatus == 2) {
              alert(_l('此部门已存在'), 3);
            } else {
              alert(_l('创建失败'), 2);
            }
          });
        });
      } else {
        alert(_l('请输入部门名称'), 3);
        $txtNewDeptName.focus();
      }
    });

    // 确认选择
    $btnConfirm.on('click', function() {
      var $checkRadio = $dialogSelectMapGroupDepart.find("input[name='mapDepartment']:checked");
      if ($checkRadio && $checkRadio.length > 0) {
        var data = {
          departmentId: $checkRadio.attr('data-departmentId'),
          departmentName: $checkRadio.attr('data-departmentName'),
        };
        _this.dialog.closeDialog();
        options.callback(data);
      } else {
        alert(_l('请选择要关联的部门'), 3);
      }
    });

    //下拉分页
    $contentBox.on('scroll', function() {
      if (this.clientHeight + this.scrollTop >= this.scrollHeight && options.loadNextPage) {
        options.postData.pageIndex = options.postData.pageIndex + 1;
        _this.loadData();
      }
    });
  };

  // 创建部门
  _this.createDepartment = function(department, callback) {
    departmentController
      .addDepartment({
        projectId: options.projectId,
        departmentName: department,
      })
      .then(function(result) {
        callback(result);
      });
  };

  _this.init();
};

export default param => {
  return new DialogSelectMapGroupDepart(param);
};
