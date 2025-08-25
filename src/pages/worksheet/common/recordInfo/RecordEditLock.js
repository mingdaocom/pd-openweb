import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Dialog, FunctionWrap, MobileConfirmPopup } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { browserIsMobile } from 'src/utils/common';

const EDIT_LOCK_STATUS = {
  UNLOCK: 1, //未锁定
  LOCKED: 2, //其他用户已锁定
  OUT_LOGIN: 3, //未登录
  UN_OPEN: 4, //未开启编辑锁
  CURRENT_USER_LOCK: 5, //当前用户锁定
  ROW_NO_EXIST: 6, //记录不存在
  ROW_NO_PERMISSION: 7, //记录无权限
  ROW_READ_ONLY: 8, //记录只读
};

export default class RecordEditLock {
  constructor({
    worksheetId,
    recordId,
    rowEditLock,
    updateLockedUser = () => {},
    onLockCallBack = () => {},
    onRefreshRecord = () => {},
  }) {
    this.worksheetId = worksheetId;
    this.recordId = recordId;
    this.rowEditLock = rowEditLock || {};
    this.updateLockedUser = updateLockedUser;
    this.onLockCallBack = onLockCallBack;
    this.onRefreshRecord = onRefreshRecord;

    this.lockStatusInterval = null;
    this.toastTimer = null;
    this.lockTimer = null;
    this.timeoutTime = null;

    this.getEditLockStatus();
  }

  //获取锁状态
  getEditLockStatus() {
    const { worksheetId, recordId } = this;
    this.lockData = worksheetAjax.checkRowEditLock({ worksheetId, rowId: recordId }, { ajaxOptions: { sync: true } });

    if (this.lockData.status === EDIT_LOCK_STATUS.LOCKED) {
      if (this.lockStatusInterval) {
        clearInterval(this.lockStatusInterval);
        this.lockStatusInterval = null;
      }
      this.pollGetLockStatus();
    }
  }

  // 轮询获取锁定状态
  pollGetLockStatus() {
    const { worksheetId, recordId } = this;

    this.lockStatusInterval = setInterval(() => {
      worksheetAjax.checkRowEditLock({ worksheetId, rowId: recordId }).then(res => {
        if (res.status === EDIT_LOCK_STATUS.UNLOCK) {
          if (this.lockStatusInterval) clearInterval(this.lockStatusInterval);
          this.updateLockedUser(null);
        }
      });
    }, 10 * 1000);
  }

  updateTimeoutDialog = locked => {
    //更新超时弹层的description文本
    const descDom = document.getElementById('timeoutDesc');
    if (descDom) {
      descDom.innerText = locked
        ? _l('正在被其他人编辑，无法继续编辑。点击获取最新记录')
        : _l('记录已被修改，无法继续编辑。点击获取最新记录');
      descDom.setAttribute('style', 'color: #f44336 !important');
    }
    //disabled按钮
    const continueBtn = document.querySelector('.editTimeoutConfirmClass [data-id="confirmBtn"]');
    if (continueBtn) {
      continueBtn.disabled = true;
      continueBtn.classList.add(browserIsMobile() ? 'adm-button-disabled' : 'Button--disabled');
    }
  };

  //检查锁状态并且占用锁
  checkAndLock = _.throttle(
    (getRowUpdateTime = false) => {
      const { worksheetId, recordId } = this;

      const res = worksheetAjax.getRowEditLock(
        { worksheetId, rowId: recordId, getRowUpdateTime },
        { ajaxOptions: { sync: true } },
      );

      this.lockData = res;

      if (res.submitTime && moment(res.submitTime).isAfter(moment(this.timeoutTime))) {
        this.updateTimeoutDialog();
        return false;
      }

      if (res.status === EDIT_LOCK_STATUS.LOCKED) {
        if (getRowUpdateTime) {
          this.updateTimeoutDialog(true);
        } else {
          alert(_l('有其他用户正在编辑，请稍后再试'), 3);
          this.pollGetLockStatus();
          this.updateLockedUser(res.lockAccount);
          this.onLockCallBack();
        }

        return false;
      }

      if ([EDIT_LOCK_STATUS.UNLOCK, EDIT_LOCK_STATUS.CURRENT_USER_LOCK].includes(res.status)) {
        this.resetLockTimers();
      }
      return true;
    },
    60 * 1000,
    { trailing: false },
  );

  //占锁计时
  resetLockTimers() {
    this.destroy();

    const { expiretime, countdown } = this.rowEditLock;
    const timeOutMs = parseInt(expiretime) * 60 * 1000;
    const countDownMs = parseInt(countdown) * 60 * 1000;

    const dialogProps = {
      rowEditLock: this.rowEditLock,
      onRefreshRecord: this.onRefreshRecord,
      checkAndLock: this.checkAndLock,
      clearThrottle: () => this.checkAndLock.cancel(),
      updateTimeoutTime: time => (this.timeoutTime = time),
    };

    if (countdown !== '0') {
      //启用了倒计时提醒
      const toastStartTime = timeOutMs - countDownMs;
      this.toastTimer = setTimeout(() => {
        openCountdownDialog({
          ...dialogProps,
          onAbortCountdown: seconds => {
            this.lockTimer = setTimeout(() => {
              openTimeoutDialog(dialogProps);
            }, seconds * 1000);
          },
        });
      }, toastStartTime);
    } else {
      this.lockTimer = setTimeout(() => {
        openTimeoutDialog(dialogProps);
      }, timeOutMs);
    }
  }

  cancelEditLock() {
    const { worksheetId, recordId } = this;

    if ([EDIT_LOCK_STATUS.CURRENT_USER_LOCK, EDIT_LOCK_STATUS.UNLOCK].includes(this.lockData?.status)) {
      worksheetAjax.cancelRowEditLock({ worksheetId, rowId: recordId }).then(res => {
        if (res) {
          // 清除 throttle
          this.checkAndLock.cancel();
          this.destroy();
        }
      });
    }
  }

  destroy() {
    if (this.lockStatusInterval) clearInterval(this.lockStatusInterval);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    if (this.lockTimer) clearTimeout(this.lockTimer);
  }
}

const CountDownDialog = props => {
  const { onClose, rowEditLock, onRefreshRecord, checkAndLock, clearThrottle, onAbortCountdown, updateTimeoutTime } =
    props;
  const [remainingSeconds, setRemainingSeconds] = useState(parseInt(rowEditLock.countdown) * 60);
  const countdownRef = useRef(null);

  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          onClose();
          openTimeoutDialog({ rowEditLock, onRefreshRecord, checkAndLock, clearThrottle, updateTimeoutTime });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current); // 组件卸载时清理定时器
  }, []);

  const title = (
    <span>
      {remainingSeconds > 60
        ? _l('距离编辑保护超时还有%0分%1秒', Math.floor(remainingSeconds / 60), remainingSeconds % 60)
        : _l('距离编辑保护超时还有%0秒', remainingSeconds)}
    </span>
  );

  return !browserIsMobile() ? (
    <Dialog
      visible={true}
      closable={false}
      title={title}
      description={_l('继续编辑字段可以延长超时时间')}
      okText={_l('知道了')}
      showCancel={false}
      onOk={() => {
        onAbortCountdown(remainingSeconds);
        onClose();
      }}
    />
  ) : (
    <MobileConfirmPopup
      visible={true}
      title={title}
      subDesc={<div className="Font15 mTop20 Gray">{_l('继续编辑字段可以延长超时时间')}</div>}
      confirmText={_l('知道了')}
      removeCancelBtn={true}
      onConfirm={() => {
        onAbortCountdown(remainingSeconds);
        onClose();
      }}
    />
  );
};

const openCountdownDialog = props => {
  FunctionWrap(CountDownDialog, props);
};

const TimeOutDialog = props => {
  const { onClose, rowEditLock, onRefreshRecord, checkAndLock, clearThrottle, updateTimeoutTime } = props;
  const { expiredaction, expiretime } = rowEditLock;

  useEffect(() => {
    clearThrottle();
    updateTimeoutTime(Date.now());

    return () => updateTimeoutTime(null);
  }, []);

  const onOk = () => {
    if (expiredaction === '2') {
      onClose();
      onRefreshRecord();
    } else {
      checkAndLock(true) && onClose();
    }
  };

  const description = (
    <div className={cx({ Red: expiredaction === '2', 'Font15 mTop20 Gray': browserIsMobile() })} id="timeoutDesc">
      {expiredaction === '2'
        ? _l('编辑已超时，无法继续编辑。点击获取最新记录')
        : _l('您已超过%0分钟未编辑，本次编辑超时', expiretime)}
    </div>
  );

  return !browserIsMobile() ? (
    <Dialog
      className="editTimeoutConfirmClass"
      visible={true}
      closable={false}
      title={_l('编辑超时')}
      description={description}
      okText={expiredaction === '2' ? _l('获取最新记录') : _l('继续编辑')}
      onOk={onOk}
      showCancel={expiredaction !== '2'}
      cancelText={_l('获取最新记录')}
      onCancel={() => {
        onClose();
        onRefreshRecord();
      }}
    />
  ) : (
    <MobileConfirmPopup
      className="editTimeoutConfirmClass"
      visible={true}
      title={_l('编辑超时')}
      subDesc={description}
      confirmText={expiredaction === '2' ? _l('获取最新记录') : _l('继续编辑')}
      removeCancelBtn={expiredaction === '2'}
      onConfirm={onOk}
      cancelText={_l('获取最新记录')}
      onCancel={() => {
        onClose();
        onRefreshRecord();
      }}
    />
  );
};

const openTimeoutDialog = props => {
  FunctionWrap(TimeOutDialog, props);
};
