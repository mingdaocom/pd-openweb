import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import { Dialog, FunctionWrap } from 'ming-ui';
import { mdNotification } from 'ming-ui/functions';
import { htmlEncodeReg } from 'src/utils/common';
import './css/createShare.css';

function createShare(props) {
  const {
    isCreate = true,
    isCalendar = false, // 为true时弹左下角框
    linkURL = '',
    content = '',
    calendarOpt = {
      title: _l('分享日程'),
      openURL: '',
      isAdmin: true,
      keyStatus: true,
      name: '',
      startTime: '',
      endTime: '',
      address: '',
      shareID: '',
      recurTime: '',
      token: '',
      ajaxRequest: null,
      shareCallback: null,
    },
  } = props;

  const [visible, setVisible] = useState(false);
  const [setting, setSetting] = useState(calendarOpt);
  const [data, setData] = useState({ url: '', copy: '' });

  useEffect(() => {
    if (isCreate) {
      createDialog();
    } else {
      openDialog();
    }
    updateData();
  }, []);

  const getURL = () => {
    return setting.openURL + '?calendartoken=' + setting.token;
  };

  const updateData = () => {
    const getUrl = getURL();
    const url = md.global.Config.AjaxApiUrl + 'code/CreateQrCodeImage?url=' + encodeURIComponent(getUrl);
    const html = copyHtml(getUrl);
    setData({
      url,
      copy: html,
    });
  };

  const createDialog = () => {
    const btnList = [];
    if (isCalendar) {
      btnList.push({
        text: _l('邀请微信好友'),
        onClick: () => openDialog(),
      });
    }
    if (!(window.location.href.search(/\/calendar\/home/i) >= 0 && isCalendar)) {
      btnList.push({
        text: _l('前往查看'),
        onClick: () => window.open(linkURL),
      });
    }
    mdNotification.success({
      title: content,
      duration: 5,
      btnList,
    });
  };

  const openDialog = () => setVisible(true);

  const copyHtml = url => {
    return (
      htmlEncodeReg(setting.name) +
      '\n' +
      _l('时间：') +
      _l(
        '%0 至 %1',
        moment(setting.startTime).format('YYYY-MM-DD HH:mm'),
        moment(setting.endTime).format('YYYY-MM-DD HH:mm'),
      ) +
      '\n' +
      _l('地点：') +
      htmlEncodeReg(setting.address) +
      '\n\n' +
      _l('加入日程') +
      '\n' +
      url +
      '\n\n' +
      _l('分享自日程')
    );
  };

  const handleShareBtn = () => {
    setting.ajaxRequest
      .updateCalednarShare({
        calendarID: setting.shareID,
        recurTime: setting.recurTime,
        keyStatus: !setting.keyStatus,
      })
      .then(function (resource) {
        const keyStatus = !setting.keyStatus;
        const token = keyStatus ? resource.data : setting.token;
        if (resource.code === 1) {
          setSetting({
            ...setting,
            keyStatus: keyStatus,
            token: token,
          });
          keyStatus && updateData();
          // 回调
          if (typeof setting.shareCallback === 'function') {
            setting.shareCallback(keyStatus, token);
          }
        }
      });
  };

  const handleCopy = () => {
    copy($('.createShareCopy span').attr('data-clipboard-text'));
    alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
  };

  if (!visible) return null;

  return (
    <Dialog
      visible
      dialogClasses="createShareDialog"
      showFooter={false}
      title={setting.title}
      handleClose={() => $('.createShareDialog').parent().remove()}
    >
      <div>
        {setting.keyStatus ? (
          <Fragment>
            <div className="qrCode">
              <img src={data.url} />
            </div>
            <div className="createShareDesc Font16">{_l('扫扫二维码，发送给微信上的朋友加入日程')}</div>
            <div className={cx('createShareCopy Font14 ', { createSharePadding: !setting.isAdmin })}>
              <span data-clipboard-text={data.copy} onClick={handleCopy}>
                <i></i>
                {_l('复制日程分享链接')}
              </span>
            </div>
            {setting.isAdmin && (
              <div className="shareOperator">
                <span className="shareBtn shareBtnClose ThemeColor3" data-tip={_l('取消分享')} onClick={handleShareBtn}>
                  {_l('取消分享')}
                </span>
              </div>
            )}
          </Fragment>
        ) : (
          <Fragment>
            <div className="noShare">
              <i></i>
            </div>
            {setting.isAdmin ? (
              <Fragment>
                <div className="noShareContent Font16">
                  {_l('生成分享链接，通过微信、QQ等方式发送给好友')}
                  <br />
                  {_l('所有收到此分享链接的人都可以申请加入日程')}
                </div>
                <div className="shareOperator">
                  <span className="shareBtn cancelStyle" onClick={handleShareBtn}>
                    {_l('开启分享')}
                  </span>
                </div>
              </Fragment>
            ) : (
              <div className="noShareContent Font16 noShareContentP">{_l('此日程的分享已经被发起者关闭')}</div>
            )}
          </Fragment>
        )}
      </div>
    </Dialog>
  );
}

export default props => {
  FunctionWrap(createShare, { ...props, onClose: () => {} });
};
