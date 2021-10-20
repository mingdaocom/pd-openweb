import { navigateTo } from 'src/router/navigateTo';
import './search.less';
import 'pager';
import doT from 'dot';
import moment from 'moment';
import MDFunction from 'mdFunction';
import smartSearchCtrl from 'src/api/smartSearch';
import rowsTpl from './tpl/search.html';
import { getRequest, getClassNameByExt, htmlEncodeReg } from 'src/util';

var Search = {};
Search.options = {
  pageIndex: 1,
  pageSize: 20,
  searchType: 'all',
  keywords: '',
  dateRange: '',
  projectId: '',
  searchRange: 0,
  postType: -1,
};
Search.init = function () {
  var Request = getRequest();
  var strHtml = doT.template(rowsTpl)({});
  $('.keyWordsMain').html(strHtml.toString());
  Search.selectPostAction();
  $('.mianSearchContentBox').css({
    'max-height': $(window).height() - 170,
  });
  $(window).resize(function (event) {
    $('.mianSearchContentBox').css({
      'max-height': $(window).height() - 170,
    });
  });
  // URL带有search_key和searchType
  var searchKey = Request.search_key;
  var searchType = Request.searchType;
  if (searchKey) {
    Search.options.keywords = searchKey;
    $('#lblKeywords').text(Search.options.keywords);
    $('#keywords').val(Search.options.keywords);
    $('.mian_search_area .closeIcon').show();
    var keyStrW = $.trim($('#keywords').val());
    var splitContent = keyStrW.substr(0, 18);
    if (splitContent.length < keyStrW.length) {
      keyStrW = splitContent + '...';
    }
    $('.search_header .searchKeyword').html(keyStrW);
    if (searchType) {
      Search.options.searchType = searchType;
      Search.options.pageIndex = 1;
      Search.loadListByType();
      Search.resetHeader();
    } else {
      Search.doAdvancedSearch();
    }
  } else {
    $('.search_header').hide();
    Search.doAdvancedSearch();
  }
  Search.selectProjectInput();
  Search.bindEvent();
  // 日期选择
  require([
    'bootstrap-daterangepicker',
    'bootstrap-daterangepicker/daterangepicker.css',
    '@mdfe/date-picker-tpl/datePickerTpl.css',
  ], function () {
    var formatDate = 'YYYY-MM-DD'; //  'YYYY-MM-DD HH:MM'
    var cb = function (start, end, label) {
      var timeStr = $('#dateRangePicker').val();
      var temp =
        $.trim(timeStr.split(_l('至'))[0]) === Search.getDateStr(1) ||
        $.trim(timeStr) === _l('全部时间') ||
        $.trim(timeStr) === _l('搜索特定时间...')
          ? ''
          : $.trim(timeStr);
      var tempTime = temp.split(_l('至'))[0] + '|' + temp.split(_l('至'))[1];
      if (tempTime !== Search.options.dateRange) {
        Search.options.dateRange = tempTime;
        Search.manyConditionSearch();
      }
    };
    var ranges = {};
    ranges[_l('今天')] = [moment().startOf('day'), moment().endOf('day')];
    ranges[_l('最近七天')] = [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')];
    ranges[_l('本月')] = [moment().startOf('month'), moment().endOf('day')];
    ranges[_l('上月')] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
    var optionSet = {
      template: require('@mdfe/date-picker-tpl').double,
      linkedCalendars: false,
      minDate: '2010-01-01', // 最早日期
      maxDate: moment().format('YYYY-MM-DD'), // 最晚日期
      showDropdowns: true, // 显示下拉框
      ranges: ranges,
      opens: 'right',
      autoUpdateInput: false,
      locale: {
        separator: _l('至'),
        format: formatDate, // 定义显示格式
        applyLabel: _l('确定'),
        cancelLabel: _l('清除'),
        fromLabel: '开始时间',
        toLabel: '结束时间',
        customRangeLabel: _l('自定义日期'),
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6].map(function (item) {
          return moment().day(item).format('dd');
        }),
        monthNames: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function (item) {
          return moment().month(item).format('MMM');
        }),
        firstDay: 1,
      },
    };

    // 将定义的日期格式应用
    $('#dateRangePicker').daterangepicker(optionSet, cb);

    // 取消特定时间搜索
    $('#dateRangePicker').on('cancel.daterangepicker', function (ev, picker) {
      Search.options.dateRange = '';
      $('#dateRangePicker').val('');
      Search.manyConditionSearch();
    });
    $('#dateRangePicker').on('apply.daterangepicker', function (ev, picker) {
      $('#dateRangePicker').val(
        picker.startDate.format(formatDate) + (' ' + _l('至') + ' ' || ' 至 ') + picker.endDate.format(formatDate),
      );
      cb(picker.startDate, picker.endDate);
    });
  });
};
// 个人和企业单选按钮组
Search.selectProjectInput = function () {
  var projects = md.global.Account.projects;
  var resultDivHTML = '';
  if (projects.length > 0) {
    for (var i = 0; i < projects.length; i++) {
      var searchProject = '';
      searchProject = Search.options.projectId === projects[i].projectId ? 'ThemeColor3' : '';
      resultDivHTML =
        resultDivHTML +
        `
      <li projectId=${projects[i].projectId} class="textNowrap pLeft10 ${searchProject}" searchRange=2>
      ${htmlEncodeReg(projects[i].companyName)}
      </li>
      `;
    }
    resultDivHTML = resultDivHTML + `<li projectId="" class="textNowrap pLeft10" searchRange=1>${_l('个人')}</li>`;
  }
  $('.mian_search_area .projects ul').append(resultDivHTML);
  Search.selectProject();
};
// 设置头部信息样式
Search.setHeader = function () {
  $('.search_header').show();
  $('.totalCount').html(0);
  Search.options.postType = -1;
  $('.postSelectBox span.choosePost').text(_l('全部'));
  $('.postSelectBox').find('li').first().addClass('ThemeColor3').siblings('li').removeClass('ThemeColor3');
  $('.allInfo>.fa').each(function () {
    $(this).removeClass('curText').removeClass('ThemeBorderColor3');
    if ($(this).attr('type') === Search.options.searchType) {
      $(this).addClass('curText').addClass('ThemeBorderColor3');
    }
    if (Search.options.searchType === 'post') {
      $('.postSelectBox').show();
    } else {
      $('.postSelectBox').hide();
    }
  });
  var keyStrW;
  var splitContent;
  if ($.trim($('#keywords').val())) {
    keyStrW = $.trim($('#keywords').val());
    splitContent = keyStrW.substr(0, 18);
    if (splitContent.length < keyStrW.length) {
      keyStrW = splitContent + '...';
    }
    $('.search_header .searchKeyword').html(keyStrW);
  } else {
    keyStrW = Search.options.keywords;
    splitContent = keyStrW.substr(0, 18);
    if (splitContent.length < keyStrW.length) {
      keyStrW = splitContent + '...';
    }
    $('.search_header .searchKeyword').html(keyStrW);
  }
  $('.mianSearchContentBox').scrollTop(0);
  var searchUrl = $.trim($('#keywords').val());
  navigateTo(location.pathname + '?search_key=' + searchUrl);
};
// 重置头部信息
Search.resetHeader = function () {
  Search.options.keywords = $.trim(
    $('#keywords')
      .val()
      .replace(/\<|\>|\*/g, ''),
  );
  Search.options.pageIndex = 1;
  Search.setHeader();
  Search.options.searchRange = 0;
};
Search.bindEvent = function () {
  $('#keywords')
    .focus(function () {
      if ($(this).val() === _l('搜索关键字...')) {
        $(this).val('');
      }
      $(this).select();
      $('.searchArea').addClass('ThemeBorderColor3');
    })
    .blur(function () {
      $('.searchArea').removeClass('ThemeBorderColor3');
    })
    .keyup(function () {
      if ($(this).val() != _l('搜索关键字...') && $(this).val() != '') {
        $('.closeIcon').show();
      } else {
        $('.closeIcon').hide();
      }
    })
    .keydown(function (e) {
      Search.options.keywords = $.trim(
        $('#keywords')
          .val()
          .replace(/\<|\>|\*/g, ''),
      );
      var key = window.event ? e.keyCode : e.which;
      if (key === 13) {
        var keyStrW = $.trim($('#keywords').val());
        var splitContent = keyStrW.substr(0, 18);
        if (splitContent.length < keyStrW.length) {
          keyStrW = splitContent + '...';
        }
        $('.search_header .searchKeyword').html(keyStrW);
        Search.setHeader();
        Search.doAdvancedSearch();
      }
    });
  // 点击搜索按钮搜索
  $('#btnSearch').click(function () {
    Search.options.keywords = $.trim(
      $('#keywords')
        .val()
        .replace(/\<|\>|\*/g, ''),
    );
    Search.setHeader();
    Search.doAdvancedSearch();
  });

  // /*搜索框清空搜素结果*/
  $('.mian_search_area')
    .find('.closeIcon')
    .live('click', function () {
      $(this).hide();
      $('#keywords').val('');
      Search.options.searchType = 'all';
      $('.search_header').hide();
      Search.doAdvancedSearch();
    });

  // 各分类点击查询
  $('.allInfo')
    .find('.fa')
    .live('click', function () {
      Search.options.searchType = $(this).attr('type');
      Search.options.pageIndex = 1;
      Search.setHeader();
      Search.manyConditionSearch();
    })
    .live('mouseover', function () {
      $(this).addClass('curText').addClass('ThemeBorderColor3');
    })
    .live('mouseout', function () {
      if ($(this).attr('type') != Search.options.searchType) {
        $(this).removeClass('curText').removeClass('ThemeBorderColor3');
      }
    });

  $('.advancedSearchTxt').live('click', function (e) {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollTop > 0) {
      $('body,html').animate(
        {
          scrollTop: 0,
        },
        1000,
      );
    }
  });

  // 各分类数量点击查询
  $('.content_area .title>div,.showAll').live('click', function () {
    Search.options.pageIndex = 1;
    Search.options.searchType = $(this).attr('type');
    Search.setHeader();
    Search.loadListByType();

    $('body,html').animate(
      {
        scrollTop: 0,
      },
      1000,
    );
  });
  // 搜索结果单行鼠标hover
  $('.content_area ul li')
    .live('mouseover', function () {
      if ($(this).attr('class') !== 'noneBorder') {
        $(this).addClass('liHover');
      } else {
        $(this).find('.showAll').removeClass('ThemeColor3').addClass('ThemeColor2');
      }
    })
    .live('mouseout', function () {
      $(this).removeClass('liHover').find('.showAll').addClass('ThemeColor3').removeClass('ThemeColor2');
    });
};
Search.getDateStr = function (addDayCount) {
  var dd = new Date();
  dd.setDate(dd.getDate() + addDayCount); // 获取AddDayCount天后的日期
  var y = dd.getFullYear();
  var m = dd.getMonth() + 1; // 获取当前月份的日期
  if (m < 10) {
    m = '0' + m;
  }
  var d = dd.getDate();
  if (d < 10) {
    d = '0' + d;
  }
  return y + '-' + m + '-' + d;
};
Search.manyConditionSearch = function () {
  $('#divPager').hide();
  var tempKeywords = $.trim(
    $('#keywords')
      .val()
      .replace(/\<|\>|\*/g, ''),
  );
  if (tempKeywords === '' || tempKeywords === _l('搜索关键字...') || tempKeywords.length < 2) {
    var str = '<div class="LoadDiv">' + LoadDiv() + '</div>';
    str += '<div class="Font16 Alpha4 TxtCenter LoadDivText">' + _l('请输入搜索关键字') + '</div>';
    $('.search_content').html(str.toString());
    $('.advancedSearchTxt').hide();
  } else {
    Search.options.pageIndex = 1;
    if (Search.options.keywords != '') {
      if (Search.options.searchType != 'all') {
        Search.loadListByType();
      } else {
        Search.doAdvancedSearch();
      }
    }
  }
};
// 单个分类搜索结果
Search.loadListByType = function () {
  $('#divPager').hide();
  $('.advancedSearchTxt').hide();
  $('.search_content .LoadDiv').show();
  let startDate, endDate;
  if (Search.options.dateRange) {
    const dataRangeArr = Search.options.dateRange.split('|');
    if (dataRangeArr.length && dataRangeArr[0] && dataRangeArr[1]) {
      // dataRange 现在有可能是 | undefined
      startDate = $.trim(dataRangeArr[0]);
      endDate = $.trim(dataRangeArr[1]);
    }
  }

  smartSearchCtrl
    .search({
      keywords: Search.options.keywords,
      searchType: Search.options.searchType,
      startDate: startDate,
      endDate: endDate,
      projectId: Search.options.projectId,
      pageIndex: Search.options.pageIndex,
      pageSize: Search.options.pageSize,
      searchRange: Search.options.searchRange, //  0:全部；1：个人 ；2：group
      postType: Search.options.postType,
    })
    .then(function (info) {
      if (info.length > 0) {
        var data = info[0];
        var resultDivHTML = '';
        resultDivHTML += '<div class="content_area">';

        var tempKey = Search.options.keywords;

        var keyArr = Search.options.keywords.split(' ');
        if (keyArr.length > 1) {
          tempKey = '';
          for (var i = 0; i < keyArr.length; i++) {
            tempKey += keyArr[i];
            tempKey += '|';
          }
          tempKey = tempKey.substring(0, tempKey.length - 1);
        }

        var reg = new RegExp('(' + tempKey + ')', 'gi');
        Search.infoNum(data);
        var stringUser = '';
        if (data.type === 'user') {
          stringUser = Search.userHtml(data, reg, tempKey);
        } else if (data.type === 'group') {
          stringUser = Search.groupHtml(data, reg, tempKey);
        } else if (data.type === 'post') {
          stringUser = Search.postHtml(data, reg, tempKey);
        } else if (data.type === 'task') {
          stringUser = Search.taskHtml(data, reg, tempKey);
        } else if (data.type === 'kcnode') {
          stringUser = Search.kcnodeHtml(data, reg, tempKey);
        }
        resultDivHTML += stringUser;
        resultDivHTML += '</div>';
        resultDivHTML += '<div class="LoadDiv">' + LoadDiv() + '</div>';
        $('.search_content').html(resultDivHTML.toString());
        $('.noneBorder').hide();

        if (Number(data.count) > 0) {
          $('#divPager')
            .show()
            .Pager({
              pageIndex: Search.options.pageIndex,
              pageSize: Search.options.pageSize,
              count: Number(data.count),
              changePage: function (pIndex) {
                Search.subMethod(pIndex);
                $('.mianSearchContentBox').scrollTop(0);
              },
            });
        } else {
          $('#divPager').hide();
        }
        $('.advancedSearchTxt').show();
      } else {
        var str = '<div class="LoadDiv">' + LoadDiv() + '</div>';
        str += '<div class="Font16 Alpha4 TxtCenter LoadDivText">' + _l('无匹配结果') + '</div>';
        $('.search_content').html(str.toString());
        $('.advancedSearchTxt').hide();
        $('#divPager').hide();
        Search.infoNum(info);
      }
    });
};
Search.userHtml = function (data, reg) {
  var strHtml = '';
  var tpl = require('./tpl/user.html');
  strHtml = doT.template(tpl)({
    user: data,
    reg: reg,
    searchKeyword: Search.searchKeyword,
    companyName: Search.companyName,
    htmlEncodeReg: htmlEncodeReg,
  });
  return strHtml;
};
Search.groupHtml = function (data, reg) {
  var strHtml = '';
  var tpl = require('./tpl/group.html');
  strHtml = doT.template(tpl)({
    group: data,
    reg: reg,
    searchKeyword: Search.searchKeyword,
    companyName: Search.companyName,
  });
  return strHtml;
};
Search.removeHTMLTag = function (str) {
  str = str.replace(/<\/?[^>]*>/g, ''); // 去除HTML tag
  str = str.replace(/[ | ]*\n/g, '\n'); // 去除行尾空白
  str = str.replace(/\n[\s| | ]*\r/g, '\n'); // 去除多余空行
  str = str.replace(/&nbsp;/gi, ''); // 去掉&nbsp;
  return str;
};
Search.postHtml = function (data, reg, searchKeyword) {
  var messageFn = function (dataItem) {
    var content = dataItem.postContent ? Search.removeHTMLTag(dataItem.postContent) : '';
    var message = MDFunction.createLinksForMessage({
      message: content,
      rUserList: dataItem.rUserList,
      rGroupList: dataItem.rGroupList,
      categories: dataItem.categories,
      noLink: true,
      filterFace: true,
    });
    var start = 0;
    var prefix = '';

    var index = message.indexOf(searchKeyword);
    if (index - 10 > 0) {
      start = index - 10;
      prefix = '...';
    }
    message = message.substring(start);
    return {
      prefix: prefix,
      message: message,
      content: content,
    };
  };
  var attachment = function (str) {
    var attachmentIcon = '';
    if (str.postType === '2' || str.postType === '3') {
      attachmentIcon = "<span class='icon-attachment Font14 ThemeColor3'></span>";
    }
    return attachmentIcon;
  };
  var strHtml = '';
  var tpl = require('./tpl/post.html');
  strHtml = doT.template(tpl)({
    post: data,
    reg: reg,
    searchKeyword: Search.searchKeyword,
    attachment: attachment,
    message: messageFn,
    companyName: Search.companyName,
  });
  return strHtml;
};
Search.taskHtml = function (data, reg) {
  var contentStr = function (dataItem) {
    var content = dataItem.taskContent ? Search.removeHTMLTag(dataItem.taskContent) : '';
    if (!dataItem.taskSummart) {
      dataItem.taskSummart = '';
    }
    var taskSummart = dataItem.taskSummart ? Search.removeHTMLTag(dataItem.taskSummart) : '';
    var str = taskSummart.replace(/&lt;.*?&gt;/g, '');
    return {
      content: content,
      taskSummart: str,
    };
  };
  var strHtml = '';
  var tpl = require('./tpl/task.html');
  strHtml = doT.template(tpl)({
    task: data,
    reg: reg,
    searchKeyword: Search.searchKeyword,
    contentStr: contentStr,
    companyName: Search.companyName,
    htmlEncodeReg: htmlEncodeReg,
  });
  return strHtml;
};
Search.kcnodeHtml = function (data, reg) {
  var contentStr = function (dataItem) {
    var content = dataItem.fileName ? Search.removeHTMLTag(dataItem.fileName) : '';
    var fileContent = dataItem.fileContent ? Search.removeHTMLTag(dataItem.fileContent) : '';
    var icon = getClassNameByExt(dataItem.type === 2 ? dataItem.fileName : false);
    return {
      content: content,
      fileContent: fileContent,
      icon: icon,
    };
  };
  var strHtml = '';
  var tpl = require('./tpl/kcnode.html');
  strHtml = doT.template(tpl)({
    kcnode: data,
    reg: reg,
    searchKeyword: Search.searchKeyword,
    contentStr: contentStr,
    companyName: Search.companyName,
  });
  return strHtml;
};
Search.doAdvancedSearch = function () {
  $('#divPager').hide();
  var tempKeywords = $.trim(($('#keywords').val() || '').replace(/\<|\>|\*/g, ''));
  if (tempKeywords != _l('搜索关键字...') && tempKeywords.length > 0) {
    Search.options.keywords = tempKeywords;
    Search.options.pageIndex = 1;
    $('#lblKeywords').text(Search.options.keywords);
    Search.bindAdvancedSearchData();
  } else {
    $('#lblKeywords').text('');
    var str = '<div class="LoadDiv">' + LoadDiv() + '</div>';
    str += '<div class="Font16 Alpha4 TxtCenter LoadDivText">' + _l('请输入搜索关键字') + '</div>';
    $('.search_content').html(str.toString());
    $('.advancedSearchTxt').hide();
  }
};
Search.autoCompleteMatchKywordsCallBack = function (key, value) {
  Search.options.keywords = $.trim($('#keywords').val());
  $('#keywords').val(Search.options.keywords);
  Search.manyConditionSearch();
};
Search.subMethod = function (index) {
  Search.options.pageIndex = index;
  Search.loadListByType();
};
// 全局搜索结果
Search.bindAdvancedSearchData = function () {
  var listSize = 5;
  $('.advancedSearchTxt').hide();
  $('.search_content .LoadDiv').show();
  let startDate, endDate;
  if (Search.options.dateRange) {
    const dataRangeArr = Search.options.dateRange.split('|');
    if (dataRangeArr.length && dataRangeArr[0] && dataRangeArr[1]) {
      // dataRange 现在有可能是 | undefined
      startDate = $.trim(dataRangeArr[0]);
      endDate = $.trim(dataRangeArr[1]);
    }
  }

  smartSearchCtrl
    .search({
      keywords: Search.options.keywords,
      startDate,
      endDate,
      searchType: Search.options.searchType,
      projectId: Search.options.projectId,
      pageSize: listSize,
      searchRange: Search.options.searchRange, //  0:全部；1：个人 ；2：group
      postType: Search.options.postType,
    })
    .then(function (data) {
      if (data.length > 0) {
        var tempKey = Search.options.keywords;
        var keyArr = Search.options.keywords.split(' ');
        if (keyArr.length > 1) {
          tempKey = '';
          for (var i = 0; i < keyArr.length; i++) {
            tempKey += keyArr[i];
            tempKey += '|';
          }
          tempKey = tempKey.substring(0, tempKey.length - 1);
        }

        var reg = new RegExp('(' + tempKey + ')', 'gi');
        var stringUser = '';
        for (var j = 0; j < data.length; j++) {
          if (data[j].type === 'user') {
            stringUser += Search.userHtml(data[j], reg, tempKey);
          } else if (data[j].type === 'group') {
            stringUser += Search.groupHtml(data[j], reg, tempKey);
          } else if (data[j].type === 'post') {
            stringUser += Search.postHtml(data[j], reg, tempKey);
          } else if (data[j].type === 'task') {
            stringUser += Search.taskHtml(data[j], reg, tempKey);
          } else if (data[j].type === 'kcnode') {
            stringUser += Search.kcnodeHtml(data[j], reg, tempKey);
          }
        }
        var resultDivHTML = `
        <div class="content_area">
        ${stringUser.toString()}
        </div>
        <div class="LoadDiv">${LoadDiv()}</div>
        `;

        $('.search_content').html(resultDivHTML);
        $('.advancedSearchTxt').show();
      } else {
        var str = '<div class="LoadDiv">' + LoadDiv() + '</div>';
        str += '<div class="Font16 Alpha4 TxtCenter LoadDivText">' + _l('无匹配结果') + '</div>';
        $('.search_content').html(str.toString());
        $('.advancedSearchTxt').hide();
      }
      Search.infoNum(data);
    });
};
Search.searchKeyword = function () {
  var keyStr = $.trim($('#keywords').val()) ? $.trim($('#keywords').val()) : Search.options.keywords;
  keyStr = htmlEncodeReg(keyStr);
  return keyStr;
};
Search.companyName = function (companyInfo) {
  var companyStr = '';
  var lastNum = companyInfo.length - 1;
  var ext = '';
  var companyInfoOne = function (str) {
    var splitContent = str.substr(0, 10);
    if (splitContent.length < str.length) {
      ext = '...';
    }
    return splitContent + ext;
  };
  if (companyInfo[0] === 'True') {
    if (companyInfo.length >= 3) {
      companyStr = _l('个人') + ' ' + _l('%0等%1个组织', companyInfoOne(companyInfo[1]), lastNum);
    } else if (companyInfo.length >= 2) {
      companyStr = _l('个人') + ' ' + companyInfoOne(companyInfo[1]);
    } else {
      companyStr = _l('个人');
    }
  } else {
    lastNum = companyInfo.length;
    if (companyInfo.length >= 2) {
      companyStr = _l('%0等%1个组织', companyInfoOne(companyInfo[0]), lastNum);
    } else {
      companyStr = companyInfoOne(companyInfo[0]);
    }
  }
  return htmlEncodeReg(companyStr);
};
//  信息个数显示
Search.infoNum = function (data) {
  if (data && data.length > 0) {
    var totalCount = 0;
    for (var i = 0; i < data.length; i++) {
      totalCount += data[i].count;
    }
    $('.totalCount').html(totalCount);
  } else if (data && data.count > 0) {
    $('.totalCount').html(data.count);
  } else {
    $('.totalCount').html(0);
  }
  require(['mdBusinessCard'], function () {
    $('img[data-accountid]').each(function () {
      $(this).mdBusinessCard({
        reset: true,
        chatByLink: true,
      });
    });
  });
};
// 选择查询范围
Search.selectProject = function () {
  $('.projects').on('click', '.projectNow', function (event) {
    $(this).siblings('ul').toggle();
  });
  $(document).click(function (e) {
    if (!(e.target === $('.projects')[0] || $.contains($('.projects')[0] || [], e.target))) {
      $('.projects ul').hide();
    }
  });
  $('.projects')
    .on('click', 'ul li', function (event) {
      Search.options.projectId = $(this).attr('projectId');
      Search.options.searchRange = $(this).attr('searchRange');
      $(this).parent('ul').hide();
      $(this).addClass('ThemeColor3').siblings('li').removeClass('ThemeColor3');
      var projectName = $(this).html();
      $('.projectNow span').text(projectName);
      Search.manyConditionSearch();
    })
    .on('mouseenter', 'ul li', function (event) {
      if ($(this).hasClass('ThemeColor3')) {
        return;
      }
      $(this).addClass('ThemeBGColor4').addClass('White');
    })
    .on('mouseleave', 'ul li', function (event) {
      $(this).removeClass('ThemeBGColor4').removeClass('White');
    });
};
// 选择查询范围
Search.selectPostAction = function () {
  $('.postSelectBox').on('click', function (event) {
    $(this).find('ul').toggle();
  });
  $(document).click(function (e) {
    var $target = $(e.target);
    if (!$target.closest('.postSelectBox').length) {
      $('.postSelectBox ul').hide();
    }
  });
  $('.postSelectBox')
    .on('click', 'li', function () {
      var $this = $(this);
      Search.options.postType = Number($this.attr('postType'));
      Search.options.searchType = 'post';
      $(this).addClass('ThemeColor3').siblings('li').removeClass('ThemeColor3');
      $('.postSelectBox span.choosePost').text($this.html());
      Search.manyConditionSearch();
    })
    .on('mouseenter', 'li', function () {
      if ($(this).hasClass('ThemeColor3')) {
        return;
      }
      $(this).addClass('ThemeBGColor4').addClass('White');
    })
    .on('mouseleave', 'li', function () {
      $(this).removeClass('ThemeBGColor4').removeClass('White');
    });
};

module.exports = Search;
