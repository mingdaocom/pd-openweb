import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import moment from 'moment';
import { FunctionWrap } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import { mdNotification } from 'ming-ui/functions';
import calendarAjax from 'src/api/calendar';
import { htmlEncodeReg } from 'src/utils/core/string';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import './css/createShare.css';

const SHARE_BUTTON_STYLE = { marginRight: 24 };

const getDefaultCalendarOpt = () => ({
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
  shareCallback: null,
});

const getShareData = setting => {
  const shareUrl = `${setting.openURL}?calendartoken=${setting.token}`;
  const url = `${md.global.Config.AjaxApiUrl}code/CreateQrCodeImage?url=${encodeURIComponent(shareUrl)}`;
  const copyContent =
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
    shareUrl +
    '\n\n' +
    _l('分享自日程');

  return { url, copy: copyContent };
};

function CreateShare(props) {
  const {
    isCreate = true,
    isCalendar = false, // 为true时弹左下角框
    linkURL = '',
    content = '',
    calendarOpt,
    onClose = () => {},
  } = props;

  const [setting, setSetting] = useState(() => calendarOpt || getDefaultCalendarOpt());
  const [visible, setVisible] = useState(!isCreate);
  const [data, setData] = useState(() => getShareData(calendarOpt || getDefaultCalendarOpt()));
  const [isUpdating, setIsUpdating] = useState(false);
  const requestPending = useRef(false);

  useEffect(() => {
    if (!isCreate) return;

    const btnList = [];

    if (isCalendar) {
      btnList.push({
        text: _l('邀请微信好友'),
        onClick: () => setVisible(true),
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
  }, [content, isCalendar, isCreate, linkURL]);

  const handleCopy = () => {
    copy(data.copy);
    alert(_l('已经复制到粘贴板，你可以使用Ctrl+V 贴到需要的地方去了哦'));
  };

  const handleShareBtn = async () => {
    if (requestPending.current) return;

    const currentSetting = setting;
    const keyStatus = !currentSetting.keyStatus;
    requestPending.current = true;
    setIsUpdating(true);

    try {
      const resource = await calendarAjax.updateCalednarShare({
        calendarID: currentSetting.shareID,
        recurTime: currentSetting.recurTime,
        keyStatus,
      });

      if (resource.code !== 1) {
        alert(_l('操作失败'), 2);
        return;
      }

      const token = keyStatus ? resource.data : currentSetting.token;
      const nextSetting = { ...currentSetting, keyStatus, token };
      setSetting(nextSetting);
      if (keyStatus) setData(getShareData(nextSetting));
      if (typeof currentSetting.shareCallback === 'function') {
        currentSetting.shareCallback(keyStatus, token);
      }
    } catch (error) {
      console.error(error);
      alertIfNotUnauthorized(error, _l('操作失败'), 2);
    } finally {
      requestPending.current = false;
      setIsUpdating(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      open
      rootClassName="createShareDialog"
      footer={null}
      mask={{ closable: false }}
      keyboard
      title={setting.title}
      onCancel={onClose}
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
                <Button
                  color="danger"
                  variant="link"
                  size="small"
                  style={SHARE_BUTTON_STYLE}
                  loading={isUpdating}
                  onClick={handleShareBtn}
                >
                  {_l('取消分享')}
                </Button>
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
                  <Button
                    color="var(--color-success)"
                    variant="link"
                    size="small"
                    style={SHARE_BUTTON_STYLE}
                    loading={isUpdating}
                    onClick={handleShareBtn}
                  >
                    {_l('开启分享')}
                  </Button>
                </div>
              </Fragment>
            ) : (
              <div className="noShareContent Font16 noShareContentP">{_l('此日程的分享已经被发起者关闭')}</div>
            )}
          </Fragment>
        )}
      </div>
    </Modal>
  );
}

export default props => {
  FunctionWrap(CreateShare, { ...props, onClose: () => {} });
};
