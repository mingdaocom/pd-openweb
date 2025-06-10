import React, { Component, Fragment } from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';
import ajaxRequest from 'src/api/calendar';
import preall from 'src/common/preall';
import { addToken, htmlEncodeReg } from 'src/utils/common';
import './style.css';

class CalendarShare extends Component {
  constructor(props) {
    super(props);

    this.settings = {
      token: this.getUrlParam('calendartoken'),
      imgUrl: md.global.Config.WebUrl + 'images/calendar/sharelogo.png',
      link:
        md.global.Config.WebUrl +
        location.pathname.replace(/^\//, '') +
        '?calendartoken=' +
        this.getUrlParam('calendartoken'),
    };
  }

  requesting = false;

  componentDidMount() {
    this.init();
  }

  init() {
    // 是微信打开
    if (window.isWeiXin) {
      // 获取授权id
      this.settings.thirdID = this.getUrlParam('id');
      // 获取jsapi_ticket
      this.settings.jsapi_ticket = this.getUrlParam('t');
      if (!this.settings.thirdID) {
        location.href =
          'http://weixin.mingdao.com/oauth/add?redirect_uri=' + encodeURIComponent(location.href) + '&type=1';
      } else {
        this.getWxConfig();
        $('#joinFooter').removeClass('hide');
      }
    } else if (this.isPc()) {
      // 是pc打开
      this.getShareDetail(0);
      $('#pcFooter').removeClass('hide');
    } else {
      // 获取授权id
      this.settings.thirdID = this.getUrlParam('id');
      // 手机浏览器打开
      this.getShareDetail(-1);
      $('#mFooter').removeClass('hide');
    }
  }

  /**
   * [获取详情]
   * @param  type 0：pc打开 | 1：微信打开 | -1：移动设备打开
   */
  getShareDetail(type) {
    ajaxRequest
      .getCalendarShareDetail({ token: this.settings.token, thirdID: this.settings.thirdID || '' })
      .then(source => {
        if (source.code === 1) {
          var data = source.data;

          // 过滤发起人
          data.calendar.members.forEach(function (member, key) {
            if (member.accountID === data.calendar.createUser) {
              data.calendar.members.splice(key, 1);
              return;
            }
          });

          this.settings.calendarID = data.calendar.id;
          this.settings.data = data.calendar;
          // 过期
          if (data.TimeOut) {
            $('#calendarMain header').addClass('overdue').append('（已过期）');
            $('#calendarMain footer').remove();
          }
          $('#title').html(htmlEncodeReg(data.calendar.calendarName));
          document.title = data.calendar.calendarName;
          $('#dateTime').html(
            '开始时间：' +
              moment(data.calendar.start).format('YYYY-MM-DD HH:mm') +
              '<br>结束时间：' +
              moment(data.calendar.end).format('YYYY-MM-DD HH:mm'),
          );
          /* 是重复日程并且不是特殊的子日程*/
          if (data.calendar.isRecur && !data.calendar.isChildCalendar) {
            var messages = '';
            var frequency = data.calendar.frequency;
            var interval = data.calendar.interval;
            var recurCount = data.calendar.recurCount;
            var untilDate = data.calendar.untilDate;
            var weekDay = data.calendar.weekDay;
            var recurType = data.calendar.recurType;
            var start = moment(data.calendar.start).format('YYYY-MM-DD');
            var weekDayArray = ['日', '一', '二', '三', '四', '五', '六'];

            // 每天
            if (frequency == 1) {
              messages += '每' + (interval == 1 ? '' : interval) + '天';
            } else if (frequency == 2) {
              // 每周
              messages += '每' + (interval == 1 ? '' : interval) + '周 ';

              weekDay = weekDay.split(',').sort();
              if (weekDay.length === 5 && weekDay[0] == 1 && weekDay[4] == 5) {
                messages += '工作日';
              } else {
                weekDay.forEach((item, index) => {
                  if (index === 0) {
                    messages += '星期';
                  } else {
                    messages += '、';
                  }
                  messages += weekDayArray[weekDay[index]];
                });
              }
            } else if (frequency == 3) {
              // 每月
              messages +=
                '每' +
                (interval == 1 ? '' : interval) +
                '月 在第 ' +
                start.split('-')[1] +
                '月' +
                start.split('-')[2] +
                '日';
            } else if (frequency == 4) {
              // 每年
              messages +=
                '每' +
                (interval == 1 ? '' : interval) +
                '年 在 ' +
                start.split('-')[1] +
                '月' +
                start.split('-')[2] +
                '日';
            }

            if (recurType == 1) {
              messages += '，共 ' + recurCount + ' 次';
            } else if (recurType == 2) {
              messages += '，截至到 ' + untilDate;
            }

            $('#dateTime').append('<br>重复：' + messages);
          }

          $('#addressDesc').html(data.calendar.address ? htmlEncodeReg(data.calendar.address) : '未填写地址');
          $('#createUserName').html(htmlEncodeReg(data.calendar.createUserName));

          var memberList = '';
          var folderList = '';
          var imagesList = '';

          data.calendar.members.forEach(item => {
            if (item.UserID !== data.calendar.createUser) {
              if (item.memberName) {
                memberList += htmlEncodeReg(item.memberName) + '，';
              } else if (item.Mobile) {
                memberList += htmlEncodeReg(item.Mobile) + '，';
              } else {
                memberList += htmlEncodeReg(item.Email) + '，';
              }
            }
          });

          if (data.thirdUser) {
            data.thirdUser.forEach(item => {
              memberList += '<span data-thirdid="' + item.thirdID + '">' + htmlEncodeReg(item.nickName) + '</span>，';
            });
          }

          $('#memberList').html(memberList.replace(/，$/g, ''));
          $('#descContent').html(htmlEncodeReg(data.calendar.description));

          data.calendar.attachments.forEach(item => {
            var ext = this.returnExt(item.ext.split('.')[1]);
            if (ext === 'img') {
              imagesList +=
                '<div class="imagesList boxSizing">' +
                '<div class="imagesListItem boxSizing w100">' +
                '<img src="' +
                item.middlePath +
                item.middleName +
                '">' +
                '</div>' +
                '</div>';
            } else {
              folderList +=
                '<div class="folderList boxSizing">' +
                '<div class="folderListItem boxSizing Relative Font14 w100">' +
                '<i class="folderListItemIcon"><span class="icon-' +
                ext +
                '"></span></i>';
              if (item.downloadUrl) {
                folderList +=
                  '<a href="' + item.downloadUrl + '" class="itemDownload"><i class="icons icon-download"></i></a>';
              }

              folderList +=
                '<div class="itemName w100 ellipsis">' +
                item.originalFilename +
                '.' +
                item.ext +
                '</div>' +
                '<div class="itemSize w100 ellipsis">' +
                this.filesize(item.filesize, 1) +
                '</div>' +
                '</div>' +
                '</div>';
            }
          });

          $('#folderList').prepend(folderList);
          $('#imagesList').prepend(imagesList);

          // 非微信
          if (type !== 1) {
            var src =
              md.global.Config.AjaxApiUrl +
              'code/CreateQrCodeImage?url=' +
              encodeURIComponent(md.global.Config.WebUrl + 'm/detail/calendar/?calendartoken=' + this.settings.token);
            $('#mFooter .mQRCode,#pcFooter .pcFooterImg').html('<img src="' + addToken(src) + '" />');
          }

          // 是否在日程中
          var isContain = false;
          if (data.thirdUser) {
            data.thirdUser.forEach(item => {
              if (item.thirdID === this.settings.thirdID) {
                isContain = true;
              }
            });
          }

          // 微信
          if (type === 1 && !data.TimeOut) {
            if (isContain) {
              $('#calendarMain header').addClass('joinStyle').append('（已加入）');
              $('#joinBox').addClass('hide');
            } else {
              $('#leaveBox').addClass('hide');
            }
          }

          // 显示
          $('#noCalendarMain,#loading').remove();
          $('#calendarMain,#openHome').removeClass('hide');
          // 绑定操作方法
          this.bindEvents();
        } else if (source.msg === 'NOTEXISTS') {
          location.href =
            'http://weixin.mingdao.com/oauth/add?redirect_uri=' + encodeURIComponent(this.settings.link) + '&type=1';
        } else {
          $('#calendarMain,#loading').remove();
          $('#noCalendarMain,#openHome').removeClass('hide');
        }
      });
  }

  /**
   * 获取微信分享需要的参数
   */
  getWxConfig() {
    const _this = this;

    ajaxRequest
      .getShareConfig({ url: encodeURIComponent(location.href), jsapi_ticket: _this.settings.jsapi_ticket })
      .then(source => {
        if (source.code == 1) {
          // 微信初始化参数
          wx.config({
            debug: false,
            appId: 'wx26fcef87aadb6001',
            timestamp: source.data.timestamp,
            nonceStr: source.data.nonceStr,
            signature: source.data.signature,
            jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
          });
        }

        wx.ready(function () {
          _this.getShareDetail(1);
        });

        wx.error(function (res) {
          alert(res.errMsg);
        });
      });
  }

  bindEvents() {
    const _this = this;
    const settings = this.settings;

    // 退出日程
    $('#leaveBtn')
      .off()
      .on('click', function () {
        if (confirm('您确定要退出当前日程吗？')) {
          ajaxRequest
            .removeCalendarWeChatMember({
              calendarID: settings.calendarID,
              thirdID: settings.thirdID,
              recurTime: settings.data.recurTime || '',
              isAllCalendar: !settings.data.isChildCalendar,
              removeOwnWeChat: true,
            })
            .then(source => {
              if (source.code === 1) {
                $('#leaveBox').addClass('hide');
                $('#joinBox').removeClass('hide');
                $('#calendarMain header')
                  .html('日程')
                  .removeClass('joinStyle');
                $('#memberList span[data-thirdid=' + settings.thirdID + ']').remove();
                $('#memberList').html(
                  $('#memberList')
                    .html()
                    .replace(/，$|^，/g, ''),
                );
                alert('退出成功！');
              } else {
                alert('退出失败！');
              }
            });
        }
      });

    // 加入日程
    $('#joinBtn')
      .off()
      .on('click', function () {
        if (this.requesting) return;

        this.requesting = true;

        ajaxRequest
          .insertCalendarWeChatMember({
            calendarID: settings.calendarID,
            thirdID: settings.thirdID,
            token: settings.token,
          })
          .then(source => {
            this.requesting = false;

            if (source.code === 1) {
              $('#joinBox').addClass('hide');
              $('#leaveBox').removeClass('hide');
              $('#calendarMain header')
                .html('日程（已加入）')
                .addClass('joinStyle');
              $('#memberList')
                .append('，<span data-thirdid="' + settings.thirdID + '">' + htmlEncodeReg(source.data) + '</span>')
                .html(
                  $('#memberList')
                    .html()
                    .replace(/，$|^，/g, ''),
                );
              alert('加入成功！');
            } else {
              alert('加入失败！失败原因：' + source.msg);
            }
          });
      });

    // 添加到我的本地日程
    $('#addCalendar')
      .off()
      .on('click', function (event) {
        event.preventDefault();
        if (navigator.userAgent.search(/weibo|mqqbrowser|mingdao/i) >= 0) {
          var $addPrompt = $(
            '<div class="promptDiv"><img src="/staticfiles/images/calendar/prompt.png" alt="提示浏览器打开" /></div>',
          );
          $('body').append($addPrompt);
          $addPrompt.on('click', function () {
            $(this).remove();
          });
          return false;
        }

        window.location.href = addToken(
          `${md.global.Config.AjaxApiUrl}download/exportSharedCalendar?token=${settings.token}&thirdId=${settings.thirdID}`,
        );
      });

    // 微信加入日程按钮提示浏览器打开
    $('#wAddCalendar')
      .off()
      .on('click', function (event) {
        event.preventDefault();
        var $addPrompt = $(
          '<div class="promptDiv"><img src="/staticfiles/images/calendar/prompt.png" alt="提示浏览器打开" /></div>',
        );
        $('body').append($addPrompt);
        $addPrompt.on('click', function () {
          $(this).remove();
        });
      });

    // 打开首页
    $('#openHome')
      .off()
      .on('click', function () {
        window.open('/');
      });

    // 分享到朋友圈
    wx.onMenuShareTimeline({
      title: settings.data.calendarName,
      link: settings.link,
      imgUrl: settings.imgUrl,
      success: function () {
        alert('分享成功！');
      },
    });

    // 分享给朋友
    var desc = '时间：' + moment(settings.data.start).format('YYYY-MM-DD HH:mm');
    ' ~ ' + moment(settings.data.end).format('YYYY-MM-DD HH:mm');
    '/地点：' + settings.data.address + '\n';

    wx.onMenuShareAppMessage({
      title: settings.data.calendarName,
      desc: desc,
      link: settings.link,
      imgUrl: settings.imgUrl,
      success: function () {
        alert('分享成功！');
      },
    });
  }

  /**
   * 是否pc浏览
   */
  isPc() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  }

  isIOS() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ['iPhone', 'iPad', 'iPod'];
    var flag = false;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = true;
        break;
      }
    }
    return flag;
  }

  /**
   * 获取url参数
   */
  getUrlParam(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    var r = window.location.href.slice(window.location.href.search(/\?/) + 1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }

  /**
   * 文件类型
   */
  returnExt(ext) {
    switch (ext && ext.toLowerCase()) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp':
        return 'img';
      case 'swf':
      case 'flv':
      case 'f4v':
        return 'flash';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'doc':
      case 'docx':
      case 'dot':
        return 'word';
      case 'ppt':
      case 'pptx':
      case 'pps':
        return 'ppt';
      default:
        return 'other';
    }
  }

  /**
   * 返回大小
   */
  filesize(size, accuracy) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (!size) {
      return '0' + units[0];
    }
    var i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(accuracy) * 1 + units[i];
  }

  render() {
    return (
      <Fragment>
        <div className="w100" id="loading">
          <div className="clipLoader"></div>
        </div>
        <div className="main w100 hide" id="calendarMain">
          <header className="boxSizing Font16 p18 w100">日程</header>
          <div className="content">
            <div className="title boxSizing Font20 p18 w100" id="title"></div>
            <div className="date boxSizing Relative Font16 pLeft55 p18 w100">
              <i className="icons icon-date"></i>时间
            </div>
            <div className="dateTime boxSizing Font14 pLeft55 p18 w100" id="dateTime"></div>
            <div className="address boxSizing Relative Font16 pLeft55 p18 w100">
              <i className="icons icon-address"></i>地点
            </div>
            <div className="addressDesc boxSizing Font14 pLeft55 p18 w100" id="addressDesc"></div>
            <div className="members boxSizing Relative Font16 pLeft55 p18 w100">
              <i className="icons icon-members"></i>人员
            </div>
            <div className="member boxSizing Font14 pLeft55 p18 w100">
              <div className="w100">
                <span id="createUserName"></span>(发起人)
              </div>
              <div className="memberList w100" id="memberList"></div>
            </div>
            <div className="desc boxSizing Relative Font16 pLeft55 p18 w100" id="desc">
              <i className="icons icon-desc"></i>描述
            </div>
            <div className="descContent boxSizing Font14 pLeft55 p18 w100">
              <div className="w100" id="descContent"></div>
              <div className="w100 folder" id="folderList">
                <div className="Clear"></div>
              </div>
              <div className="w100 images" id="imagesList">
                <div className="Clear"></div>
              </div>
            </div>
          </div>
          <footer className="boxSizing Font16 p18 w100">
            <div className="w100 hide" id="joinFooter">
              <div className="w100" id="joinBox">
                <div className="footerTitle w100">您是否确认参加本次日程？</div>
                <a className="join" id="joinBtn">
                  确认参加
                </a>
              </div>
              <div className="w100" id="leaveBox">
                <div className="w100 leaveBoxTitle">
                  <span className="icons"></span>您已加入本次日程
                </div>
                <a href="" className="wAddCalendar" id="wAddCalendar">
                  添加到手机日历
                </a>
                <a className="join leave" id="leaveBtn">
                  退出日程
                </a>
              </div>
            </div>
            <div className="w100 hide" id="pcFooter">
              <div className="pcFooterImg"></div>
              <div className="pcFooterTitle w100 Font17">
                <i></i>微信扫描二维码，加入本次日程
              </div>
            </div>
            <div className="w100 hide" id="mFooter">
              <a className="addCalendar" id="addCalendar">
                添加到手机日历
              </a>
              <div className="Font18 w100 save">保存二维码图片，加入日程</div>
              <div className="mQRCode"></div>
              <div className="Font14 mDesc">
                1.保存此日程的二维码图片到手机
                <br />
                <span>2.使用微信扫一扫中的从相册扫描二维码功能，加入本次日程</span>
              </div>
            </div>
          </footer>
        </div>

        <div className="main w100 hide" id="noCalendarMain">
          <header className="boxSizing Font16 p18 w100">日程</header>
          <div className="content">
            <div className="icons icon-noCalendar w100"></div>
            <div className="Font18 w100 noCalendarTitle boxSizing">此日程不存在或分享内容已经被取消</div>
          </div>
        </div>
      </Fragment>
    );
  }
}

const WrappedComp = preall(CalendarShare, { allowNotLogin: true });
const root = createRoot(document.getElementById('app'));

root.render(<WrappedComp />);
