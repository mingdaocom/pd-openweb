/**
 * @module chooseInvite
 * @author beck
 * @desc 更多邀请
 * @example
 * require.async('chooseInvite',function(){ $('').chooseInvite(); });
 */
/**
 * @module chooseInvite
 * @author beck
 * @desc 更多邀请
 * @example
 * require.async('chooseInvite',function(){ $('').chooseInvite(); });
 */
import './style.css';

import 'poshytip';
var ProjectController = require('src/api/project');
var InvitationController = require('src/api/invitation');
var Clipboard = require('clipboard');
var mdDialog = require('mdDialog');
import intlTelInput from '@mdfe/intl-tel-input';
import '@mdfe/intl-tel-input/build/css/intlTelInput.min.css';
import utils from '@mdfe/intl-tel-input/build/js/utils';
import RegExp from 'src/util/expression';
import { htmlEncodeReg } from 'src/util';

(function ($) {
  /**
   * chooseInvite callback
   * @callback callback
   * @param {object[]} data inviteMembers array
   * @param {callbackInviteResult} callbackInviteResult
   */

  /**
   * callbackInviteResult
   * @callback callbackInviteResult
   * @param {object} result - inviteResult { status: 0 } 失败 { status: 1 } 成功
   */

  /**
   * @function init
   * @public
   * @param {object} param - options
   * @param {string} param.sourceId 来自哪个好友，群组，任务，知识，网络，日程，项目
   * @param {int} param.fromType 0：好友  1：群组  2：任务  3：知识  4：网络 5：日程 6：项目
   * @param {boolean} param.viewHistory 是否显示历史链接
   * @param {callback} param.callback 回调
   * @returns {ChooseInvite}
   */
  $.fn.chooseInvite = function (param) {
    return new ChooseInvite(this, param);
  };

  var FROMTYPES = {
    Friend: 0,
    Group: 1,
    Task: 2,
    Knowledge: 3,
    Project: 4,
    Calendar: 5,
    Folder: 6,
  };

  var ChooseInvite = function (el, param) {
    var defaults = {
      title: '',
      zIndex: 0,
      sourceId: '', // 来自哪个好友，群组，任务，知识，网络，日程，项目
      fromType: FROMTYPES.Friend, // 0：好友  1：群组  2：任务  3：知识  4：网络 5：日程 6：项目
      viewHistory: true, // 是否显示历史链接
      isEmailInvite: false,
      callback: function (data, callbackInviteResult) {}, // callbackInviteResult({status:1})

      // private
      Types: {
        weixin: 1,
        qq: 2,
        link: 3,
        qrcode: 4,
        dingding: 5,
        email: 101,
        mobile: 102,
      },
      pageIndex: 1,
      pageSize: 10,
      // expire settings
      expire: false,
      expireHours: 24,
      linkUrl: '',
      linkUrlToken: '',
      qrCodeUrl: '',
      qrCodeToken: '',
      iti: [],
    };
    this.options = $.extend(defaults, param);
    this.$el = $(el);
    this.$contentContainer = null;
    this.init();
  };

  ChooseInvite.tips = {
    weixin: _l('微信邀请'),
    qq: _l('QQ邀请'),
    ding: _l('钉钉邀请'),
    link: _l('获取邀请链接'),
    email: _l('输入电子邮箱邀请'),
    mobile: _l('输入手机号邀请'),
    linkQrCode: _l('邀请链接 / 二维码'),
    getInviteLinks: _l('查看使用中的邀请链接'),
    getInviteRecord: _l('查看邀请记录'),
    createTip: _l('创建成功后才能使用'),
    weixinTipTitle: _l('使用微信“扫一扫”'),
    qqTipTitle: _l('使用QQ “扫一扫”'),
    dingdingTipTitle: _l('使用钉钉 “扫一扫”'),
    weixinQQTipText: _l('将打开的页面通过右上角分享功能发送给您的好友'),
    dingdingTipText: _l('将打开的页面通过右上角分享功能发送给您的钉钉好友'),
    qrBtnName: _l('完成'),
    getQrCode: _l('获取邀请二维码'),
    linkQrTip: _l('发送邀请链接，或分享二维码邀请好友加入'),
    linkBtnName: _l('复制邀请链接'),
    back: _l('返回'),
    sendInvite: _l('发送邀请'),
    qrCodeTip: _l('扫描二维码加入'),
    saveQrCode: _l('保存二维码'),
    expireText: _l('为当前链接和二维码设置24小时有效期'),
    expireTip: _l('勾选后，发送的链接或者二维码将在24小时后过期，您可在“使用中的邀请链接中进行管理”'),
    noLinksTip: _l('暂无使用中的邀请链接'),
    noInvitesTip: _l('暂无邀请记录'),
    myInviteRecord: _l('我的邀请记录'),
  };

  $.extend(ChooseInvite.prototype, {
    init: function () {
      var options = this.options;
      var coverClass = this.options.sourceId ? '' : ' coverIcon';

      let html = `
        <div class='chooseInvite'>
        ${options.title}
        <ul class='clearfix'>
        <li class='${coverClass}' type=1>
        <div class='chooseInviteIcon inviteWeixinIcon'>
        <i class='icon-invite-wechat'></i>
        </div>
        <div class='lblTxt'>
        ${ChooseInvite.tips.weixin}</div>
        </li>
        <li class='${coverClass}' type=2>
        <div class='chooseInviteIcon inviteQQIcon'>
        <i class='icon-invite-qq'></i>
        </div>
        <div class='lblTxt'>
        ${ChooseInvite.tips.qq}</div>
        </li>
        <li class='${coverClass}' type=5>
        <div class='chooseInviteIcon inviteDingIcon'>
        <i class='icon-invite-ding'></i>
        </div>
        <div class='lblTxt'>
        ${ChooseInvite.tips.ding}</div>
        </li>
        <li type=101>
        <div class='chooseInviteIcon inviteEmailIcon'>
        <i class='icon-invite-email'></i>
        </div>
        <div class='lblTxt'>
        ${ChooseInvite.tips.email}</div>
        </li>
        <li type=102>
        <div class='chooseInviteIcon inviteMobileIcon'>
        <i class='icon-invite-phone'></i>
        </div>
        <div class='lblTxt'>
        ${ChooseInvite.tips.mobile}</div></li>
        <li class='${coverClass}' type=4>
        <div class='chooseInviteIcon inviteQRCodeIcon'>
        <i class='icon-invite-link'></i>
        </div>
        <div class='lblTxt'>
        ${ChooseInvite.tips.linkQrCode}</div>
        </li>
        </ul>
        ${
          options.viewHistory && options.sourceId
            ? `
        <div class="moreLink">
        ${
          options.fromType == 4
            ? `<div class='mTop20 TxtCenter linkbox'><span class='viewHistoryInvited'>${ChooseInvite.tips.getInviteRecord}</span></div><div class='mTop20 TxtCenter linkbox'><span class='viewHistoryInviteLink'>${ChooseInvite.tips.getInviteLinks}</span></div>`
            : `<div class='mTop20 TxtCenter linkbox'><span class='viewHistoryInviteLink'>${ChooseInvite.tips.getInviteLinks}</span></div>`
        }
        </div>`
            : ''
        }
        </div>
      `;

      this.$el.html(html.toString());

      this.bindEvent();
    },

    // 事件绑定
    bindEvent: function () {
      var _this = this;

      var $chooseInvite = _this.$el.find('.chooseInvite');

      $chooseInvite.find('li').on('click', function () {
        var $this = $(this);
        if ($this.hasClass('coverIcon')) {
          alert(ChooseInvite.tips.createTip, 3);
          return false;
        }
        var type = $this.attr('type');
        _this.showDialog(type);
      });

      $chooseInvite.find('.viewHistoryInviteLink').on('click', function () {
        _this.showHistoryInviteLinkDialog();
      });

      $chooseInvite.find('.viewHistoryInvited').on('click', function () {
        _this.showHistoryInvitedDialog();
      });
    },

    showDialog: function (type) {
      var _this = this;
      var options = _this.options;
      let contentHtml = `<div class="chooseInviteDialog"><div class="titleContainer">${_this.getDialogTitle(type)}</div>
      <div class="contentContainer">${LoadDiv()}</div></div>
      `;

      _this.dialog = mdDialog.index({
        fixed: false,
        zIndex: options.zIndex,
        dialogBoxID: 'chooseInviteDialog',
        container: {
          content: contentHtml,
          hideColseBtn: true,
          width: 500,
          yesText: null,
          noText: null,
        },
        callback: function () {
          $(document).trigger('click.chooseInvite');
        },
      });

      _this.$contentContainer = $('#chooseInviteDialog .contentContainer');
      $('#chooseInviteDialog').on('click', '.closeDialog', function () {
        _this.dialog.closeDialog();
      });

      _this.options.isEmailInvite = false;
      switch (parseInt(type)) {
        case options.Types.weixin:
          _this.getExternalQrCodeData({
            linkFromType: options.Types.weixin,
            tipText: ChooseInvite.tips.weixinTipTitle,
            tipDesc: ChooseInvite.tips.weixinQQTipText,
          });
          break;
        case options.Types.qq:
          _this.getExternalQrCodeData({
            linkFromType: options.Types.qq,
            tipText: ChooseInvite.tips.qqTipTitle,
            tipDesc: ChooseInvite.tips.weixinQQTipText,
          });
          break;
        case options.Types.dingding:
          _this.getExternalQrCodeData({
            linkFromType: options.Types.dingding,
            tipText: ChooseInvite.tips.dingdingTipTitle,
            tipDesc: ChooseInvite.tips.dingdingTipText,
          });
          break;
        case options.Types.email:
          _this.options.isEmailInvite = true;
          _this.getEmailData();
          break;
        case options.Types.mobile:
          _this.getMobileData();
          break;
        case options.Types.qrcode:
          _this.getLinkQrData();
          break;
        default:
          break;
      }
    },

    // 微信 QQ 钉钉
    getExternalQrCodeData: function (args) {
      var linkFromType = args.linkFromType;
      var tipText = args.tipText;
      var tipDesc = args.tipDesc;
      var _this = this;
      _this.getQRCodeInviteLinkUrl(linkFromType, function (data) {
        let html = `<div class='TxtCenter'><div class='qrCodeContainer mTop15'><img src=${data.linkUrl} />
        </div><div class='font12 TxtCenter mTop5'>${tipText}</div><div class='font12 TxtCenter'>${tipDesc}</div>
        <input type='button' value=${ChooseInvite.tips.qrBtnName} class='chooseInviteBtn ThemeBGColor3' /></div>
        `;

        _this.$contentContainer.html(html.toString());

        _this.$contentContainer.find('.chooseInviteBtn').on('click', function () {
          _this.dialog.closeDialog();
        });
      });
    },

    // 邮箱邀请
    getEmailData: function () {
      var _this = this;

      var html = `<div class="accountContainer list"><ul class="inviteAccount">
      ${_this.getEmailInputItem()}
      ${_this.getEmailInputItem()}
      </ul></div>
      <input type='button' value=${ChooseInvite.tips.sendInvite} class='chooseInviteBtn btnArrow ThemeBGColor3' />
      `;

      _this.$contentContainer.html(html);

      _this.bindCheckAcountEvent(true);

      _this.bindSendInviteEvent();
    },

    // 手机号邀请
    getMobileData: function () {
      var _this = this;

      var html = `
      <div class="accountContainer list">
      <ul class="inviteAccount inviteMobileAccount">
      ${_this.getMobileInputItem()}
      ${_this.getMobileInputItem()}
      </ul></div>
      <input type='button' value=${ChooseInvite.tips.sendInvite} class='chooseInviteBtn btnArrow ThemeBGColor3'/>
      `;

      _this.$contentContainer.html(html);

      _this.bindCheckAcountEvent(true);

      _this.bindSendInviteEvent();
    },

    // 链接邀请
    getLinkData: function () {
      var options = this.options;
      this.getInviteLinkUrl(this.options.Types.link, function (data) {
        options.linkUrl = data.linkUrl;
        options.linkUrlToken = data.token;

        var clipboard = new Clipboard('.linkBtn', {
          text: function () {
            return options.linkUrl;
          },
        });
        clipboard.on('success', function () {
          alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
        });
      });
    },

    // 二维码邀请
    getQRCodeData: function ($elem) {
      var _this = this;
      var options = this.options;
      if ($elem.data('ready')) {
        $elem.poshytip('show');
        return;
      }

      _this.getQRCodeInviteLinkUrl(_this.options.Types.qrcode, function (data) {
        var image = new Image();
        var url = data.linkUrl + '&download=true';
        image.src = data.linkUrl;
        options.qrCodeUrl = data.linkUrl;
        options.qrCodeToken = data.token;
        image.onload = function () {
          var $tpl = $(
            '<div class="qrCodeBox">' +
              '<div class="textTip">' +
              ChooseInvite.tips.qrCodeTip +
              '</div>' +
              '<div class="imageBox"></div>' +
              '<a rel="external" href="' +
              url +
              '">' +
              ChooseInvite.tips.saveQrCode +
              '</a>' +
              '</div>',
          );
          $tpl.find('.imageBox').append($(image));
          $elem
            .poshytip({
              additionalClassName: 'z-depth-1-half chooseInvitePoshytip',
              showOn: 'none',
              content: $tpl,
              alignTo: 'target',
              alignX: 'center',
              alignY: 'top',
              offsetY: '-5',
              keepInViewport: false,
            })
            .poshytip('show');

          $elem.data('ready', true);

          $(document)
            .off('click.chooseInvite')
            .on('click.chooseInvite', function (event) {
              if (!$(event.target).closest($elem).length) {
                $elem.poshytip('hide');
              }
            });
        };
      });
    },

    getLinkQrData: function () {
      var _this = this;
      var options = this.options;
      var html = `
      <div class='TxtCenter'><div class='Font14 mTop15 mBottom15 Gray_6'>${ChooseInvite.tips.linkQrTip}</div>
      <div class='linkBtn ThemeColor3'><span class='icon icon-link2 Font20 mRight10'></span>
      ${ChooseInvite.tips.linkBtnName}</div>
      <div class='qrCodeBtn ThemeColor3'><span class='icon icon-zendeskHelp-qrcode Font20 mRight10'></span>
      ${ChooseInvite.tips.getQrCode}</div>
      <input type='button' value=${ChooseInvite.tips.qrBtnName} class='chooseInviteBtn ThemeBGColor3' />
      <div class='TxtCenter'><label class='TxtMiddle Hand'><input type='checkbox' class='setTimeExpire' />
      <span>${ChooseInvite.tips.expireText}</span></label><span class='tip-bottom mLeft5' data-tip=${ChooseInvite.tips.expireTip}>
      <span class='icon-help'></span></span></div>
      `;

      var $tpl = $(html);
      var $elem = $tpl.find('.qrCodeBtn');

      _this.$contentContainer.html($tpl);

      $tpl.on('click', '.qrCodeBtn', $.proxy(this, 'getQRCodeData', $elem));

      $tpl.on('change', '.setTimeExpire', function () {
        options.expire = $(this).prop('checked');
        _this.updateExpire();
      });

      _this.getLinkData();

      _this.$contentContainer.find('.chooseInviteBtn').on('click', function () {
        _this.dialog.closeDialog();
        options.expire = false;
        options.linkUrlToken = '';
        options.qrCodeToken = '';
        options.linkUrl = '';
        options.qrCodeUrl = '';
      });
    },

    updateExpire: function () {
      var options = this.options;
      if (options.linkUrlToken || options.qrCodeToken) {
        var param = {
          hours: options.expire ? options.expireHours : 0,
        };
        var tokens = [];
        options.linkUrlToken ? tokens.push(options.linkUrlToken) : '';
        options.qrCodeToken ? tokens.push(options.qrCodeToken) : '';
        param.tokens = tokens;
        InvitationController.updateAuthDeadtime(param);
      }
    },

    // 获取Dialog标题信息
    getDialogTitle: function (type) {
      var _this = this;
      var options = _this.options;

      var colorClass = '';
      var iconClass = '';
      var title = '';
      switch (parseInt(type)) {
        case options.Types.weixin:
          colorClass = 'inviteWeixinIcon';
          iconClass = 'icon-invite-wechat';
          title = ChooseInvite.tips.weixin;
          break;
        case options.Types.qq:
          colorClass = 'inviteQQIcon';
          iconClass = 'icon-invite-qq';
          title = ChooseInvite.tips.qq;
          break;
        case options.Types.dingding:
          colorClass = 'inviteDingIcon';
          iconClass = 'icon-invite-ding';
          title = ChooseInvite.tips.ding;
          break;
        case options.Types.email:
          colorClass = 'inviteEmailIcon';
          iconClass = 'icon-invite-email';
          title = ChooseInvite.tips.email;
          break;
        case options.Types.mobile:
          colorClass = 'inviteMobileIcon';
          iconClass = 'icon-invite-phone';
          title = ChooseInvite.tips.mobile;
          break;
        case options.Types.qrcode:
          colorClass = 'inviteQRCodeIcon';
          iconClass = 'icon-invite-link';
          title = ChooseInvite.tips.linkQrCode;
          break;
      }

      var titleHtml = `<div class='closeDialog'><span>&lt; ${ChooseInvite.tips.back}</span></div>
      <div class='chooseInviteIcon TxtCenter ${colorClass}' ><i class='${iconClass}' ></i></div>
      <div class='TxtCenter mTop20 Font16'>${title}</div>
      `;
      return titleHtml;
    },

    // EmailInput
    getEmailInputItem: function (isAdd) {
      return (
        '<li><input type="text" placeholder="' +
        _l('请输入Email地址') +
        '"  /> ' +
        (isAdd ? '<span class="removeInput">' + _l('删除') + '</span>' : '') +
        '</li>'
      );
    },

    // MobileInput
    getMobileInputItem: function (isAdd) {
      return (
        '<li><input type="text" placeholder="' +
        _l('填写手机号') +
        '"  /> ' +
        (isAdd ? '<span class="removeInput">' + _l('删除') + '</span>' : '') +
        '</li>'
      );
    },

    // 添加Input
    addInput: function (element) {
      var _this = this;
      var $accountContainer = _this.$contentContainer.find('.accountContainer');
      var $inviteAccount = _this.$contentContainer.find('.inviteAccount');
      if (_this.options.isEmailInvite) {
        $inviteAccount.append(_this.getEmailInputItem(true));
        $accountContainer.scrollTop($accountContainer[0].scrollHeight);
      } else {
        $inviteAccount.append(_this.getMobileInputItem(true));
        $accountContainer.scrollTop();
      }

      _this.bindCheckAcountEvent();
      _this.bindRemoveInput();
    },

    // 移除Input
    bindRemoveInput: function () {
      var _this = this;
      var $removeInputArr = _this.$contentContainer.find('.inviteAccount li .removeInput');
      $removeInputArr.each(function () {
        var $this = $(this);
        $this.unbind().on('click', function () {
          $this.parent('li:first').remove();
          _this.bindCheckAcountEvent();
        });
      });
    },

    // 检测输入是帐号是否合法
    bindCheckAcountEvent: function (isFirst) {
      var _this = this;
      var $inputArr = _this.$contentContainer.find('.inviteAccount li input');

      if (!_this.options.isEmailInvite) {
        $inputArr.each(function (i, ele) {
          _this.options.iti[i] = intlTelInput(ele, {
            initialCountry: 'cn',
            loadUtils: '',
            preferredCountries: ['cn'],
            utilsScript: utils,
            separateDialCode: true,
          });
        });
        if (isFirst) $('.inviteAccount input:first').focus();
      } else {
        if (isFirst) $('.inviteAccount input:first').focus();
      }

      $inputArr.each(function (i) {
        var $this = $(this);
        $this.unbind().on({
          focus: function () {
            $this.removeClass('rightFlag errorFlag');
            if (i == $inputArr.length - 1) {
              // 最后一个Input
              _this.addInput(this);
            }
          },
          blur: function () {
            var $this = $(this);
            var account = $this.val().trim();
            if (account) {
              if (_this.options.isEmailInvite) {
                if (RegExp.isEmail(account)) {
                  $this.removeClass('errorFlag').addClass('rightFlag');
                } else {
                  $this.removeClass('rightFlag').addClass('errorFlag');
                }
              } else {
                // if ($.fn.intlTelInput) {
                var isValid = _this.options.iti[i].isValidNumber();
                if (isValid) {
                  $this.removeClass('errorFlag').addClass('rightFlag');
                } else {
                  $this.removeClass('rightFlag').addClass('errorFlag');
                }
                // }
              }
            } else {
              $this.removeClass('rightFlag errorFlag');
            }
          },
        });
      });
    },

    // 获取邀请链接
    getInviteLinkUrl: function (linkFromType, callback) {
      var _this = this;
      var options = _this.options;

      InvitationController.getInviteLink({
        sourceId: options.sourceId,
        fromType: options.fromType,
        linkFromType: linkFromType,
        hours: options.expire ? options.expireHours : 0,
      }).then(function (data) {
        callback(data);
      });
    },

    // 获取二维码邀请链接
    getQRCodeInviteLinkUrl: function (linkFromType, callback) {
      var _this = this;
      var options = _this.options;
      var params = {
        sourceId: options.sourceId,
        fromType: options.fromType,
        linkFromType: linkFromType,
        width: 180,
        height: 180,
      };

      if (linkFromType === options.Types.qrcode) {
        params.hours = options.expire ? options.expireHours : 0;
      }

      InvitationController.getQRCodeInviteLink(params).then(function (data) {
        callback(data);
      });
    },

    // 发送邀请
    bindSendInviteEvent: function () {
      var _this = this;
      var options = _this.options;

      var $chooseInviteBtn = _this.$contentContainer.find('.chooseInviteBtn');

      $chooseInviteBtn.on('click', function () {
        var $this = $(this);
        var $inviteAccount = _this.$contentContainer.find('.inviteAccount');
        var $errorInputArr = $inviteAccount.find('input.errorFlag');
        var $rightInputArr = $inviteAccount.find('input.rightFlag');
        if ($errorInputArr.length > 0) {
          alert(_this.options.isEmailInvite ? _l('请输入有效的邮箱地址') : _l('请输入有效的手机号'), 3);
          return;
        }

        if ($rightInputArr.length == 0) {
          return;
        }

        var accountArr = [];
        $rightInputArr.each(function (i) {
          var account = null;
          if (_this.options.isEmailInvite) {
            account = $(this).val().trim();
          } else {
            // if ($.fn.intlTelInput) {
            account = _this.options.iti[i].getNumber();
            // }
          }
          accountArr.push(account);
        });

        var accountObj = {};
        for (var i = 0, length = accountArr.length; i < length; i++) {
          accountObj[accountArr[i]] = '';
        }

        $this.val(_l('发送中...')).attr('disbaled', true).addClass('cursorDefault');
        InvitationController.getInviteAccountInfo({
          accounts: accountObj,
        }).then(function (data) {
          if (data) {
            _this.options.callback(data, _this.callbackInviteResult.bind(_this));
          }
        });
      });
    },

    // 获取发送结果
    callbackInviteResult: function (data) {
      var _this = this;
      if (data && data.status == 1) {
        var $inviteAccount = _this.$contentContainer.find('.inviteAccount');
        $inviteAccount.find('>li:gt(1)').remove();
        $inviteAccount.find('>li input').removeClass('rightFlag errorFlag').val('');
        _this.bindCheckAcountEvent();
        alert(_l('邀请已发送'));
      } else {
        alert(_l('邀请发送失败'), 2);
      }
      var $chooseInviteBtn = _this.$contentContainer.find('.chooseInviteBtn');
      $chooseInviteBtn.val(_l('发送邀请')).attr('disbaled', false).removeClass('cursorDefault');
    },

    // 发送链接历史记录
    showHistoryInviteLinkDialog: function () {
      var _this = this;
      var options = _this.options;

      var contentHtml = `
      <div class="historyInviteLinkDialog">
      <div class="titleContainer"> <span class="lblBack ThemeColor3"><span class="icon-arrow-left-border Font20"></span>
      ${ChooseInvite.tips.back}</span></div>
      <div class="contentContainer list">${LoadDiv()}</div></div>
      `;

      _this.historyLinkDialog = mdDialog.index({
        dialogBoxID: 'historyInviteLinkDialog',
        container: {
          header: '',
          showClose: false,
          content: contentHtml,
          width: 500,
        },
      });
      _this.$contentContainer = $('#historyInviteLinkDialog .historyInviteLinkDialog');
      _this.getHistoryInviteLinkData();
    },
    // 邀请记录
    showHistoryInvitedDialog: function () {
      var _this = this;
      var options = _this.options;

      var contentHtml = `
      <div class="historyInvitedDialog">
      <div class="titleContainer"> <span class="lblBack ThemeColor3"><span class="icon-arrow-left-border Font20"></span>
      ${ChooseInvite.tips.back}</span><span class="Font16 mLeft10">${ChooseInvite.tips.myInviteRecord}</span></div>
      <div class="contentContainer list">${LoadDiv()}</div></div>
      `;

      _this.historyInviteDialog = mdDialog.index({
        dialogBoxID: 'historyInvitedDialog',
        container: {
          header: '',
          showClose: false,
          content: contentHtml,
          width: 500,
        },
      });

      _this.$contentContainer = $('#historyInvitedDialog .historyInvitedDialog');
      options.pageIndex = 1;

      _this.getHistoryInvitedData();
    },

    // 绑定事件
    bindHistoryInviteLinkEvent: function () {
      var _this = this;
      // 关闭窗口
      _this.$contentContainer.find('.lblBack').on('click', function () {
        _this.historyLinkDialog.closeDialog();
      });

      var $contentContainer = _this.$contentContainer.find('.contentContainer');
      $contentContainer.on('click', '.closeLink', function () {
        _this.removeHistoryInviteLink(this);
      });
    },

    bindHistoryInvitedEvent: function () {
      var _this = this;
      var options = this.options;
      // 关闭窗口
      _this.$contentContainer.find('.lblBack').on('click', function () {
        _this.historyInviteDialog.closeDialog();
      });

      _this.$contentContainer.find('.nano').on('scrollend', function () {
        if (options.isLoading) {
          return false;
        }
        if (options.isMoreRecord) {
          options.pageIndex++;
        } else {
          return false;
        }
        _this.getHistoryInvitedData();
      });

      var $contentContainer = _this.$contentContainer.find('.contentContainer');
      $contentContainer.on('click', '.inviteLink', function () {
        _this.reInvite(this);
      });
    },

    // 获取数据
    getHistoryInviteLinkData: function () {
      var _this = this;
      var $contentContainer = _this.$contentContainer.find('.contentContainer');
      InvitationController.getAllValidTokenByAccountId({
        sourceId: _this.options.sourceId,
      })
        .then(function (data) {
          $contentContainer.html(_this.getHistoryInviteLinkHtml(data || []));
          _this.historyLinkDialog.dialogCenter();
        })
        .always(function () {
          _this.bindHistoryInviteLinkEvent();
        });
    },

    getHistoryInvitedData: function () {
      var _this = this;
      var options = _this.options;
      var $contentContainer = _this.$contentContainer.find('.contentContainer');

      options.isLoading = true;

      require(['nanoScroller'], function () {
        ProjectController.getInvitedUsersJoinProjectLog({
          projectId: options.sourceId,
          pageIndex: options.pageIndex,
          pageSize: options.pageSize,
        })
          .then(function (data) {
            var func = options.pageIndex == 1 ? 'html' : 'append';

            if (options.pageIndex == 1) {
              $contentContainer[func](_this.getHistoryInvitedHtml(data.listDetail || []));
              if (data.allCount) {
                $contentContainer.find('.nano').nanoScroller();
              }
              _this.bindHistoryInvitedEvent();
            } else {
              $contentContainer
                .find('.historyInviteList .nano-content')
                [func](_this.getHistoryInvitedHtml(data.listDetail));
            }

            if (data && data.listDetail) {
              options.isMoreRecord = data.listDetail.length >= options.pageSize;
            }

            _this.historyInviteDialog.dialogCenter();
          })
          .always(function () {
            options.isLoading = false;
          });
      });
    },

    // 获取数据HTML
    getHistoryInviteLinkHtml: function (dataArr) {
      let contentHtml = '';
      if (dataArr.length > 0) {
        let content = '';
        for (var i = 0, length = dataArr.length; i < length; i++) {
          var dataItem = dataArr[i];
          var fullname = htmlEncodeReg(dataItem.createAccount.fullname);
          var date = moment(dataItem.deadTime);
          content =
            content +
            `<li>
            <div>${_l('%0创建了邀请（%1）', fullname, this.getLinkTypeDesc(dataItem.linkFromType))}</div>
            <div class='Gray_9 Font14'>${dataItem.inviteUrl}</div>
            <div class='Gray_9'>${_l('链接截止时间：')}
            ${date.format('YYYY') === '9999' ? _l('永久有效') : date.format('YYYY年MM月DD日 HH:mm')}
            </div>
            <div class='closeLink icon-delete' title=${_l('取消')} token=${dataItem.token}></div>
            </li>
          `;
        }
        contentHtml = `<ul class='h100 Relative'>${content}</ul>`;
      }

      var html = `<div class='historyLinkList h100' data-title=${ChooseInvite.tips.noLinksTip}>${contentHtml}</div>`;

      return html;
    },

    // 获取数据HTML
    getHistoryInvitedHtml: function (dataArr) {
      let html = '';
      if (this.options.pageIndex === 1) {
        let contentHtml = '';
        let content = '';
        if (dataArr.length > 0) {
          for (var i = 0, length = dataArr.length; i < length; i++) {
            var dataItem = dataArr[i];
            content =
              content +
              `<li class='clearfix'><div class='Font14 Left'>${dataItem.fullName}</div>
            ${
              dataItem.isMember
                ? `<div class='Right mRight5'>${_l('已加入')}</div>`
                : `<a class='inviteLink Right mRight5' title=${_l('再次发送')} data-accountid=${
                    dataItem.accountId
                  }>${_l('再次发送')}</a>`
            }
            </li>
            `;
          }
          contentHtml = `<ul class='nano-content pRight10'>${content}</ul>`;
        }
        html = `<div class='historyInviteList nano' data-title=${ChooseInvite.tips.noInvitesTip}>${contentHtml}</div>`;
      }

      return html;
    },

    getLinkTypeDesc: function (linkType) {
      var _this = this;
      var options = _this.options;

      switch (linkType) {
        case options.Types.weixin:
          return _l('微信邀请QRCode');
          break;
        case options.Types.qq:
          return _l('QQ邀请QRCode');
          break;
        case options.Types.link:
          return _l('链接邀请URL');
          break;
        case options.Types.qrcode:
          return _l('二维码邀请QRCode');
          break;
        case options.Types.dingding:
          return _l('钉钉邀请QRCode');
          break;
      }
    },

    // 取消邀请链接
    removeHistoryInviteLink: function (obj) {
      var _this = this;
      var $obj = $(obj);
      var token = $obj.attr('token');
      if (token) {
        InvitationController.updateAuthToExpire({
          token: token,
        }).then(function (data) {
          if (data) {
            $obj.parents('li:first').remove();
            var $contentContainer = _this.$contentContainer.find('.contentContainer');
            var $liArr = $contentContainer.find('.historyLinkList li');
            if ($liArr.length == 0) {
              $contentContainer.find('ul').remove();
            }
          } else {
            alert(_l('操作失败'), 2);
          }
        });
      }
    },
    // 重新邀请
    reInvite: function (elem) {
      var $elem = $(elem);
      var accountId = $elem.data('accountid');
      if (!accountId) return;
      InvitationController.inviteUser({
        accountIds: [accountId],
        sourceId: this.options.sourceId,
        fromType: this.options.fromType,
      }).done(function (result) {
        require(['mdFunction'], function (mdFunction) {
          mdFunction.existAccountHint(result);
        });
      });
    },
  });
})(jQuery);
