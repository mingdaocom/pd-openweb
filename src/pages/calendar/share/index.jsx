import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';
import ajaxRequest from 'src/api/calendar';
import preall from 'src/common/entries/preall';
import { addToken } from 'src/utils/platform/browser/download';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import './style.css';

const getUrlParam = name => new URLSearchParams(window.location.search).get(name);

const isPc = () => !/Android|iPhone|SymbianOS|Windows Phone|iPad|iPod/i.test(navigator.userAgent);

const getFileType = extension => {
  const ext = extension?.replace(/^\./, '').toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext)) return 'img';
  if (['swf', 'flv', 'f4v'].includes(ext)) return 'flash';
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['doc', 'docx', 'dot'].includes(ext)) return 'word';
  if (['ppt', 'pptx', 'pps'].includes(ext)) return 'ppt';
  return 'other';
};

const formatFileSize = (size, accuracy = 1) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (!size) return `0${units[0]}`;
  const index = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  return `${Number((size / Math.pow(1024, index)).toFixed(accuracy))}${units[index]}`;
};

const getSafeUrl = url => {
  if (!url) return '';
  try {
    const parsedUrl = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(parsedUrl.protocol) ? parsedUrl.href : '';
  } catch {
    return '';
  }
};

const formatRepeat = calendar => {
  if (!calendar.isRecur || calendar.isChildCalendar) return '';

  const interval = Number(calendar.interval);
  const start = moment(calendar.start);
  let message = '';

  if (calendar.frequency === 1) {
    message = _l('每%0天', interval === 1 ? '' : interval);
  } else if (calendar.frequency === 2) {
    const weekdays = String(calendar.weekDay).split(',').map(Number).sort();
    const weekdayText =
      weekdays.length === 5 && weekdays[0] === 1 && weekdays[4] === 5
        ? _l('工作日')
        : `${_l('星期')}${weekdays.map(day => moment().day(day).format('dd')).join('、')}`;
    message = `${_l('每%0周', interval === 1 ? '' : interval)} ${weekdayText}`;
  } else if (calendar.frequency === 3) {
    message = _l('每%0月 在%1日', interval === 1 ? '' : interval, start.date());
  } else if (calendar.frequency === 4) {
    message = _l('每%0年 在%1月%2日', interval === 1 ? '' : interval, start.month() + 1, start.date());
  }

  if (calendar.recurType === 1) message += _l('，共 %0 次', calendar.recurCount);
  if (calendar.recurType === 2) message += _l('，截至到 %0', calendar.untilDate);
  return message;
};

function CalendarShare() {
  const token = useMemo(() => getUrlParam('calendartoken'), []);
  const thirdIdRef = useRef(getUrlParam('id') || '');
  const requestPendingRef = useRef(false);
  const [status, setStatus] = useState('loading');
  const [calendarData, setCalendarData] = useState(null);
  const [thirdUsers, setThirdUsers] = useState([]);
  const [isTimeout, setIsTimeout] = useState(false);
  const [joined, setJoined] = useState(false);
  const [openType, setOpenType] = useState(0);
  const [pendingAction, setPendingAction] = useState('');
  const [showBrowserPrompt, setShowBrowserPrompt] = useState(false);

  const link = useMemo(
    () => pathCompletion(`${window.location.pathname}?calendartoken=${encodeURIComponent(token || '')}`),
    [token],
  );

  const configureWechatShare = useCallback(
    calendar => {
      if (!window.wx) return;
      const shareConfig = {
        title: calendar.calendarName,
        link,
        imgUrl: '/staticfiles/images/calendar/sharelogo.png',
        success: () => alert(_l('分享成功！')),
      };
      window.wx.onMenuShareTimeline(shareConfig);
      window.wx.onMenuShareAppMessage({
        ...shareConfig,
        desc: `${_l('时间：')}${moment(calendar.start).format('YYYY-MM-DD HH:mm')} ~ ${moment(calendar.end).format(
          'YYYY-MM-DD HH:mm',
        )}\n${_l('地点：')}${calendar.address || _l('无')}`,
      });
    },
    [link],
  );

  const getShareDetail = useCallback(
    type => {
      return ajaxRequest
        .getCalendarShareDetail({ token, thirdID: thirdIdRef.current })
        .then(source => {
          if (source.code !== 1) {
            if (source.msg === 'NOTEXISTS') {
              window.location.href =
                'http://weixin.mingdao.com/oauth/add?redirect_uri=' + encodeURIComponent(link) + '&type=1';
              return;
            }

            setStatus('missing');
            return;
          }

          const data = source.data || {};
          const calendar = {
            ...data.calendar,
            members: (data.calendar.members || []).filter(member => member.accountID !== data.calendar.createUser),
          };
          const nextThirdUsers = data.thirdUser || [];
          const isJoined = nextThirdUsers.some(user => user.thirdID === thirdIdRef.current);

          setOpenType(type);
          setCalendarData(calendar);
          setThirdUsers(nextThirdUsers);
          setIsTimeout(!!data.TimeOut);
          setJoined(isJoined);
          setStatus('ready');
          document.title = calendar.calendarName;
          if (type === 1) configureWechatShare(calendar);
        })
        .catch(error => {
          console.error(error);
          setStatus('missing');
        });
    },
    [configureWechatShare, link, token],
  );

  useEffect(() => {
    if (window.isWeiXin) {
      if (!thirdIdRef.current) {
        window.location.href =
          'http://weixin.mingdao.com/oauth/add?redirect_uri=' + encodeURIComponent(window.location.href) + '&type=1';
        return;
      }

      const jsapiTicket = getUrlParam('t');
      ajaxRequest
        .getShareConfig({ url: encodeURIComponent(window.location.href), jsapi_ticket: jsapiTicket })
        .then(source => {
          if (source.code === 1 && window.wx) {
            window.wx.config({
              debug: false,
              appId: 'wx26fcef87aadb6001',
              timestamp: source.data.timestamp,
              nonceStr: source.data.nonceStr,
              signature: source.data.signature,
              jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage'],
            });
            window.wx.ready(() => getShareDetail(1));
            window.wx.error(res => alert(res.errMsg));
          } else {
            getShareDetail(1);
          }
        })
        .catch(() => getShareDetail(1));
    } else {
      getShareDetail(isPc() ? 0 : -1);
    }
  }, [getShareDetail]);

  const handleLeave = () => {
    if (!window.confirm(_l('您确定要退出当前日程吗？')) || requestPendingRef.current) return;
    requestPendingRef.current = true;
    setPendingAction('leave');
    ajaxRequest
      .removeCalendarWeChatMember({
        calendarID: calendarData.id,
        thirdID: thirdIdRef.current,
        recurTime: calendarData.recurTime || '',
        isAllCalendar: !calendarData.isChildCalendar,
        removeOwnWeChat: true,
      })
      .then(source => {
        if (source.code !== 1) throw new Error(source.msg);
        setJoined(false);
        setThirdUsers(current => current.filter(user => user.thirdID !== thirdIdRef.current));
        alert(_l('退出成功！'));
      })
      .catch(_requestError => alertIfNotUnauthorized(_requestError, _l('退出失败！')))
      .finally(() => {
        requestPendingRef.current = false;
        setPendingAction('');
      });
  };

  const handleJoin = () => {
    if (requestPendingRef.current) return;
    requestPendingRef.current = true;
    setPendingAction('join');
    ajaxRequest
      .insertCalendarWeChatMember({
        calendarID: calendarData.id,
        thirdID: thirdIdRef.current,
        token,
      })
      .then(source => {
        if (source.code !== 1) throw new Error(source.msg);
        setJoined(true);
        setThirdUsers(current => [
          ...current.filter(user => user.thirdID !== thirdIdRef.current),
          { thirdID: thirdIdRef.current, nickName: source.data },
        ]);
        alert(_l('加入成功！'));
      })
      .catch(error => alertIfNotUnauthorized(error, _l('加入失败！失败原因：%0', error.message || '')))
      .finally(() => {
        requestPendingRef.current = false;
        setPendingAction('');
      });
  };

  const downloadCalendar = event => {
    event.preventDefault();
    if (/weibo|mqqbrowser|mingdao/i.test(navigator.userAgent)) {
      setShowBrowserPrompt(true);
      return;
    }

    window.location.href = addToken(
      `${md.global.Config.AjaxApiUrl}download/exportSharedCalendar?token=${token}&thirdId=${thirdIdRef.current}`,
    );
  };

  if (status === 'loading') {
    return (
      <div className="w100" id="loading">
        <div className="clipLoader" />
      </div>
    );
  }

  if (status === 'missing') {
    return (
      <>
        <div className="main w100" id="noCalendarMain">
          <header className="boxSizing Font16 p18 w100">{_l('日程')}</header>
          <div className="content">
            <div className="icons icon-noCalendar w100" />
            <div className="Font18 w100 noCalendarTitle boxSizing">{_l('此日程不存在或分享内容已经被取消')}</div>
          </div>
        </div>
      </>
    );
  }

  const repeatText = formatRepeat(calendarData);
  const attachments = calendarData.attachments || [];
  const imageAttachments = attachments.filter(
    item => getFileType(item.ext || item.originalFilename?.split('.').pop()) === 'img',
  );
  const fileAttachments = attachments.filter(
    item => getFileType(item.ext || item.originalFilename?.split('.').pop()) !== 'img',
  );
  const qrCodeUrl = addToken(
    `${md.global.Config.AjaxApiUrl}code/CreateQrCodeImage?url=${encodeURIComponent(
      pathCompletion(`/m/detail/calendar/?calendartoken=${token}`),
    )}`,
  );
  const headerText = isTimeout ? _l('日程（已过期）') : joined ? _l('日程（已加入）') : _l('日程');

  return (
    <>
      <div className="main w100" id="calendarMain">
        <header className={`boxSizing Font16 p18 w100 ${isTimeout ? 'overdue' : ''} ${joined ? 'joinStyle' : ''}`}>
          {headerText}
        </header>
        <div className="content">
          <div className="title boxSizing Font20 p18 w100">{calendarData.calendarName}</div>
          <div className="date boxSizing Relative Font16 pLeft55 p18 w100">
            <i className="icons icon-date" />
            {_l('时间')}
          </div>
          <div className="dateTime boxSizing Font14 pLeft55 p18 w100">
            {_l('开始时间：%0', moment(calendarData.start).format('YYYY-MM-DD HH:mm'))}
            <br />
            {_l('结束时间：%0', moment(calendarData.end).format('YYYY-MM-DD HH:mm'))}
            {repeatText && (
              <>
                <br />
                {_l('重复：%0', repeatText)}
              </>
            )}
          </div>
          <div className="address boxSizing Relative Font16 pLeft55 p18 w100">
            <i className="icons icon-address" />
            {_l('地点')}
          </div>
          <div className="addressDesc boxSizing Font14 pLeft55 p18 w100">
            {calendarData.address || _l('未填写地址')}
          </div>
          <div className="members boxSizing Relative Font16 pLeft55 p18 w100">
            <i className="icons icon-members" />
            {_l('人员')}
          </div>
          <div className="member boxSizing Font14 pLeft55 p18 w100">
            <div className="w100">
              {calendarData.createUserName} {_l('(发起人)')}
            </div>
            <div className="memberList w100">
              {[
                ...calendarData.members.map(member => member.memberName || member.Mobile || member.Email),
                ...thirdUsers.map(user => user.nickName),
              ]
                .filter(Boolean)
                .join('，')}
            </div>
          </div>
          <div className="desc boxSizing Relative Font16 pLeft55 p18 w100">
            <i className="icons icon-desc" />
            {_l('描述')}
          </div>
          <div className="descContent boxSizing Font14 pLeft55 p18 w100">
            <div className="w100 shareCalendarDescription">{calendarData.description}</div>
            <div className="w100 folder">
              {fileAttachments.map(item => {
                const type = getFileType(item.ext || item.originalFilename?.split('.').pop());
                const downloadUrl = getSafeUrl(item.downloadUrl);
                return (
                  <div
                    className="folderList boxSizing"
                    key={item.fileID || `${item.originalFilename}-${item.filesize}`}
                  >
                    <div className="folderListItem boxSizing Relative Font14 w100">
                      <i className="folderListItemIcon">
                        <span className={`icon-${type}`} />
                      </i>
                      {downloadUrl && (
                        <a href={downloadUrl} className="itemDownload" target="_blank" rel="noopener noreferrer">
                          <i className="icons icon-download" />
                        </a>
                      )}
                      <div className="itemName w100 ellipsis">{`${item.originalFilename}.${String(item.ext || '').replace(/^\./, '')}`}</div>
                      <div className="itemSize w100 ellipsis">{formatFileSize(item.filesize)}</div>
                    </div>
                  </div>
                );
              })}
              <div className="Clear" />
            </div>
            <div className="w100 images">
              {imageAttachments.map(item => {
                const imageUrl = getSafeUrl(`${item.middlePath || ''}${item.middleName || ''}`);
                return imageUrl ? (
                  <div
                    className="imagesList boxSizing"
                    key={item.fileID || `${item.originalFilename}-${item.filesize}`}
                  >
                    <div className="imagesListItem boxSizing w100">
                      <img src={imageUrl} alt={item.originalFilename || ''} />
                    </div>
                  </div>
                ) : null;
              })}
              <div className="Clear" />
            </div>
          </div>
        </div>

        {!isTimeout && (
          <footer className="boxSizing Font16 p18 w100">
            {openType === 1 && (
              <div className="w100">
                {!joined ? (
                  <div className="w100">
                    <div className="footerTitle w100">{_l('您是否确认参加本次日程？')}</div>
                    <button type="button" className="join" disabled={!!pendingAction} onClick={handleJoin}>
                      {pendingAction === 'join' ? _l('正在加入...') : _l('确认参加')}
                    </button>
                  </div>
                ) : (
                  <div className="w100">
                    <div className="w100 leaveBoxTitle">
                      <span className="icons" />
                      {_l('您已加入本次日程')}
                    </div>
                    <button
                      type="button"
                      className="wAddCalendar"
                      disabled={!!pendingAction}
                      onClick={() => setShowBrowserPrompt(true)}
                    >
                      {_l('添加到手机日历')}
                    </button>
                    <button type="button" className="join leave" disabled={!!pendingAction} onClick={handleLeave}>
                      {pendingAction === 'leave' ? _l('正在退出...') : _l('退出日程')}
                    </button>
                  </div>
                )}
              </div>
            )}
            {openType === 0 && (
              <div className="w100" id="pcFooter">
                <div className="pcFooterImg">
                  <img src={qrCodeUrl} alt={_l('日程二维码')} />
                </div>
                <div className="pcFooterTitle w100 Font17">
                  <i />
                  {_l('微信扫描二维码，加入本次日程')}
                </div>
              </div>
            )}
            {openType === -1 && (
              <div className="w100" id="mFooter">
                <button type="button" className="addCalendar" onClick={downloadCalendar}>
                  {_l('添加到手机日历')}
                </button>
                <div className="Font18 w100 save">{_l('保存二维码图片，加入日程')}</div>
                <div className="mQRCode">
                  <img src={qrCodeUrl} alt={_l('日程二维码')} />
                </div>
                <div className="Font14 mDesc">
                  {_l('1.保存此日程的二维码图片到手机')}
                  <br />
                  <span>{_l('2.使用微信扫一扫中的从相册扫描二维码功能，加入本次日程')}</span>
                </div>
              </div>
            )}
          </footer>
        )}
      </div>

      {showBrowserPrompt && (
        <button type="button" className="promptDiv" onClick={() => setShowBrowserPrompt(false)}>
          <img src="/staticfiles/images/calendar/prompt.png" alt={_l('提示浏览器打开')} />
        </button>
      )}
    </>
  );
}

const WrappedComp = preall(CalendarShare, { allowNotLogin: true });
const root = createRoot(document.getElementById('app'));

root.render(<WrappedComp />);
