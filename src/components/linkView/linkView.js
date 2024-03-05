// 链接预览
import './style.css';
import postController from 'src/api/post';

var LinkView = function(el, param) {
  var _this = this;
  var defaults = {
    viewUrl: '',
    linkViewData: {
      errorCode: '-2', // 错误码  -2  -1  0  1
      title: '', // 链接标题
      desc: '', // 链接描述
      url: '', // 预览链接
      shortUrl: '', // 短链
      flashUrl: '', // falsh链接
      favico: '', // favico
      img: '', // 链接预览图片
      imgArr: [], // 所有搜索到的链接图片
      error: '', // 链接预览错误信息
    },
    callback: function(data) {},
  };
  var options = $.extend(defaults, param);

  _this.init = function() {
    _this.clear();
    _this.getLinkViewData();
  };
  _this.getLinkViewData = function() {
    if (!options.viewUrl) {
      return false;
    }
    options.linkViewData.url = options.viewUrl.match(/:\/\//) ? options.viewUrl : 'http://' + options.viewUrl;
    postController
      .getLinkViewInfo({
        url: encodeURIComponent(options.viewUrl),
      })
      .then(function(data) {
        options.linkViewData.errorCode = '1';
        if (data) {
          if (!(data.title || '').trim()) {
            data.title = data.url;
          }

          if (data.shortUrl) {
            options.linkViewData.shortUrl = data.shortUrl;
          }

          if (data.title) {
            options.linkViewData.title = data.title;
          } else {
            options.linkViewData.title = options.linkViewData.shortUrl;
          }

          if (data.thumbnails) {
            options.linkViewData.imgArr = data.thumbnails;
          }

          // 链接预览图片
          if (data.thumbnails && data.thumbnails.length > 0) {
            options.linkViewData.img = data.thumbnails[0];
          }

          if (data.description) {
            options.linkViewData.desc = data.description;
          }
          _this.createLinkViewHtml(options.linkViewData);
        }

        // callback
        if (options.callback) {
          options.callback(options.linkViewData);
        }
      })
      .fail(function() {
        if (options.callback) {
          options.callback(options.linkViewData);
        }
      });
  };
  _this.createLinkViewHtml = function(data) {
    var linkViewHTML = `
    <div class='linkView'>
      <table class='fixed' border='0' cellspacing='0' cellpadding='0' width='100%'>
        <tr>
          ${
            data.imgArr && data.imgArr.length > 0
              ? `<td class='pRight15' width='160px' style='box-sizing: initial;'>
                ${data.flashUrl ? `<input class='linkFlashUrl' value='${data.flashUrl}' type='hidden'/>` : ''}
                <div class='picArea'>
                <div class='picList'>
                <table border='0' cellpadding='0' cellspacing='0'><tr><td>
                <img class='linkThumb' src='${data.imgArr[0]}' />
                </td></tr></table>
                </div>
                ${
                  data.imgArr.length > 1
                    ? `<div class='thumbPages'><a class='prevPic Black Visibility' href='javascript:void(0);'> < </a>
                    <span class='thumbCurrentNum'>1</span> of <span class='thumbTotalNum'>${data.imgArr.length}</span>
                    <a class='nextPic Black'  href='javascript:void(0);'> > </a></div>
                    `
                    : ''
                }
                </div>
                </td>
                <td class='TxtTop'>
              `
              : `<td class='TxtTop' style='width:100%;'>`
          }
        <div class='mBottom5'>
        ${data.favico ? `<img class='linkFavico' width='16' height='16' align='middle' src='${data.favico}'/> ` : ''}
        <a class='linkTitle' target='_blank' href='${data.shortUrl}' >${data.title}</a>
        </div>
        <div class='linkDesc' title='${data.desc}' alt='${data.desc}'>
        ${data.desc.length > 85 ? `${data.desc.substring(0, 85)}...` : `${data.desc}`}
        </div>
        ${
          data.error
            ? `<div class='nullPrompt'>
            ${_l('抱歉，您输入的链接没有搜索到相关内容，请尝试重新')}<span class='ThemeColor3'>[${_l('预览')}]</span>
            ${_l('或手工')}<span class='ThemeColor3'>[${_l('编辑')}]</span>
            </div>
            `
            : ''
        }
        <div class='Right mTop10'>
        <span class='linkBtnEdit Hand Font16 Gray_df icon-edit'></span>
        <a class='linkBtnSave Hidden' href='javascript:void(0);' >${_l('保存')}</a>
        <a class='linkBtnCancel Hidden' href='javascript:void(0);'>${_l('取消')}</a>
        </div>
        <div class='Clear'></div>
        </td>
        </tr>
        <tr>
        <td colspan='2'>
        <div class='linkOperator' class='mTop5 Left'>
        ${
          data.imgArr && data.imgArr.length > 0 && !data.flashUrl
            ? `<div><label><input type='checkbox' class='withLinkImg Left' class='Left' checked='checked'/>${_l(
                '发布时加入预览图',
              )}</label></div>`
            : ''
        }
        </div>
        </td>
        </tr>
        </table>
    `;

    $(el).html(linkViewHTML);

    _this.bindEvent();
  };
  // 绑定事件
  _this.bindEvent = function() {
    var $linkView = $(el).find('.linkView');

    if ($linkView) {
      // 前一张预览图
      $linkView.find('.prevPic').on('click', function() {
        _this.changeLinkThumb('prev');
      });

      // 后一张预览图
      $linkView.find('.nextPic').on('click', function() {
        _this.changeLinkThumb('next');
      });

      // 编辑
      $linkView.find('.linkBtnEdit').on('click', function() {
        _this.editLink();
      });

      // 保存
      $linkView.find('.linkBtnSave').on('click', function() {
        _this.saveLink();
      });

      // 取消
      $linkView.find('.linkBtnCancel').on('click', function() {
        _this.cancelLink();
      });

      // 发布时是否加入预览图
      $linkView.find('.withLinkImg').on('click', function() {
        _this.withLinkImg();
      });
    }
  };
  // 预览图切换
  _this.changeLinkThumb = function(type) {
    var $linkView = $(el).find('.linkView');

    var curNum = parseInt($linkView.find('.thumbCurrentNum').html());
    if (type == 'next') {
      curNum++;
    } else {
      curNum--;
    }
    if (curNum == 1) {
      $linkView.find('.prevPic').addClass('Visibility');
      $linkView.find('.nextPic').removeClass('Visibility');
    } else if (curNum == options.linkViewData.imgArr.length) {
      $linkView.find('.prevPic').removeClass('Visibility');
      $linkView.find('.nextPic').addClass('Visibility');
    } else {
      $linkView.find('.prevPic').removeClass('Visibility');
      $linkView.find('.nextPic').removeClass('Visibility');
    }

    $linkView.find('.thumbCurrentNum').html(curNum);

    $linkView.find('.linkThumb').attr('src', options.linkViewData.imgArr[curNum - 1]);

    // 如果发布时加入预览图
    var $withLinkImg = $linkView.find('.withLinkImg');
    if ($withLinkImg.attr('checked')) {
      options.linkViewData.img = options.linkViewData.imgArr[curNum - 1];
      if (options.callback) {
        options.callback(options.linkViewData);
      }
    }
  };
  // 编辑链接
  _this.editLink = function() {
    var $linkView = $(el).find('.linkView');

    var $linkTitle = $linkView.find('.linkTitle');
    var $linkDesc = $linkView.find('.linkDesc');

    if ($linkView.find('.linkTitleDiv').length > 0) {
      $linkView.find('.linkTitleDiv').show();
      $linkView.find('.linkDescDiv').show();
    } else {
      var linkUrlHTML =
        "<div class='linkTitleDiv'><input class='txtLinkTitle TextBox'  type='text' value='" +
        $linkTitle.html() +
        "' style='width:98%;box-sizing: initial;'/></div>";
      var linkDescHTML =
        "<div class='linkDescDiv'><textarea class='txtLinkDesc TextArea' style='width:98%;height:50px;box-sizing: initial;'>" +
        $linkDesc.attr('title') +
        '</textarea></div>';
      $linkTitle.after(linkUrlHTML);
      $linkDesc.after(linkDescHTML);
    }

    $linkTitle.hide();
    $linkDesc.hide();

    $linkView.find('.linkBtnEdit').hide();
    $linkView.find('.linkBtnSave').show();
    $linkView.find('.linkBtnCancel').show();
  };
  // 保存修改
  _this.saveLink = function() {
    var $linkView = $(el).find('.linkView');
    $linkView.find('.nullPrompt').hide();

    var title = $linkView.find('.txtLinkTitle').val();
    if (title) {
      $linkView.find('.linkTitle').html(title);
      $linkView.find('.nullPrompt').hide();
    }
    var desc = $linkView.find('.txtLinkDesc').val();
    if (desc) {
      if (desc.length > 85) {
        $linkView.find('.linkDesc').html(desc.substring(0, 85) + '...');
      } else {
        $linkView.find('.linkDesc').html(desc);
      }
      $linkView
        .find('.linkDesc')
        .attr('alt', desc)
        .attr('title', desc);
      $linkView.find('.nullPrompt').hide();
    }

    $linkView.find('.linkTitleDiv').hide();
    $linkView.find('.linkDescDiv').hide();

    $linkView.find('.linkTitle').show();
    $linkView.find('.linkDesc').show();

    $linkView.find('.linkBtnEdit').show();
    $linkView.find('.linkBtnSave').hide();
    $linkView.find('.linkBtnCancel').hide();

    options.linkViewData.title = title;
    options.linkViewData.desc = desc;
    if (options.callback) {
      options.callback(options.linkViewData);
    }
  };
  // 取消修改
  _this.cancelLink = function() {
    var $linkView = $(el).find('.linkView');
    $linkView.find('.linkTitleDiv').remove();
    $linkView.find('.linkDescDiv').remove();

    $linkView.find('.linkTitle').show();
    $linkView.find('.linkDesc').show();
    $linkView.find('.linkBtnEdit').show();
    $linkView.find('.linkBtnSave').hide();
    $linkView.find('.linkBtnCancel').hide();
  };
  // 发布时是否加入预览图
  _this.withLinkImg = function() {
    var $linkView = $(el).find('.linkView');
    var $withLinkImg = $linkView.find('.withLinkImg');
    if ($withLinkImg.attr('checked')) {
      options.linkViewData.img = $linkView.find('.linkThumb').attr('src');
    } else {
      options.linkViewData.img = '';
    }

    if (options.callback) {
      options.callback(options.linkViewData);
    }
  };
  // 获取XML
  _this.createXML = function(str) {
    if (document.all) {
      var xmlDom = new ActiveXObject('Microsoft.XMLDOM');
      xmlDom.loadXML(str);
      return xmlDom;
    } else {
      var xmlDom = new DOMParser();
      return xmlDom.parseFromString(str, 'text/xml');
    }
  };
  // 清理
  _this.clear = function() {
    $(el).empty();
  };
  _this.init();
};

export default (el, param) => {
  return new LinkView(el, param);
};
