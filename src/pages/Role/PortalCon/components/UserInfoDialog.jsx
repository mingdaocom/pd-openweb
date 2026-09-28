import React, { useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Modal } from 'ming-ui/antd-components';
import { Button, MobilePopup } from 'ming-ui/antd-mobile-components';
import CustomFields from 'src/components/Form';

const DESKTOP_MODAL_STYLES = {
  container: { maxHeight: 'calc(100vh - 64px)', overflow: 'hidden' },
  body: { overflow: 'hidden auto' },
};
const MOBILE_POPUP_BODY_STYLE = { height: '100%' };
const MOBILE_POPUP_HISTORY_PARAMS = { page: 'portalUserInfo' };

const UserInfoDialogWrap = styled.div`
  display: flex;
  width: 100%;
  .customFieldsContainer {
    width: 100%;
    flex: 1;
    margin: 0;
  }
  .customMobileFormContainer {
    margin: 0;
    padding: 0;
  }
`;

const MobileUserInfoWrap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  color: var(--color-text-primary);
  background: var(--color-background-primary);

  .mobileUserInfoHeader {
    height: 56px;
    flex: none;
    padding: 0 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .mobileUserInfoClose {
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    color: var(--color-text-tertiary);
    background: transparent;
  }
  .mobileUserInfoBody {
    flex: 1;
    min-height: 0;
    padding: 0 16px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
  .mobileUserInfoFooter {
    flex: none;
    display: flex;
    gap: 8px;
    padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
    border-top: 1px solid var(--color-border-secondary);
    background: var(--color-background-primary);
  }
  .mobileUserInfoFooter .adm-button {
    flex: 1;
    border-radius: 18px;
  }
`;

export default function UserInfoDialog(props) {
  const { setShow, show, title, classNames, currentData = [], appId } = props;
  const customwidget = useRef(null);
  const [ids, setIds] = useState([]);
  const isMobilePortal = cx(classNames).split(' ').includes('forMobilePortal');

  const handleClose = () => setShow(false);

  const handleSave = () => {
    let { data = [], hasError } = customwidget.current.getSubmitData();

    if (hasError) {
      return;
    }

    if (data.find(o => o.type === 29 && safeParse(o.value, 'array').length > 5)) {
      alert(_l('最多只能关联 5 条记录'), 3);
      return;
    }

    props.onOk(data, ids);
    handleClose();
  };

  const formContent = (
    <UserInfoDialogWrap>
      <CustomFields
        disableRules
        appId={appId}
        ref={customwidget}
        data={currentData
          .map(o => {
            return { ...o, size: 12 }; //全部按整行显示
          })
          .filter(o => !['avatar', 'roleid', 'status'].includes(o.alias))}
        onChange={(data, ids) => {
          setIds(ids);
        }}
      />
    </UserInfoDialogWrap>
  );

  if (isMobilePortal) {
    return (
      <MobilePopup
        bodyStyle={MOBILE_POPUP_BODY_STYLE}
        className={cx('userInfoDialog mobileModal full', classNames)}
        historyUrlParams={MOBILE_POPUP_HISTORY_PARAMS}
        layerId={`portalUserInfo-${appId}`}
        onClose={handleClose}
        visible={show}
      >
        <MobileUserInfoWrap>
          <div className="mobileUserInfoHeader">
            <span className="Font17 Bold">{title || _l('修改用户信息')}</span>
            <button
              type="button"
              aria-label={_l('关闭')}
              className="mobileUserInfoClose Font20 Hand"
              onClick={handleClose}
            >
              <i className="icon icon-close" />
            </button>
          </div>
          <div className="mobileUserInfoBody">{formContent}</div>
          <div className="mobileUserInfoFooter">
            <Button onClick={handleClose}>{_l('取消')}</Button>
            <Button color="primary" onClick={handleSave}>
              {_l('保存')}
            </Button>
          </div>
        </MobileUserInfoWrap>
      </MobilePopup>
    );
  }

  return (
    <Modal
      title={title || _l('修改用户信息')}
      okText={_l('保存')}
      cancelText={_l('取消')}
      className={cx('userInfoDialog', classNames)}
      styles={DESKTOP_MODAL_STYLES}
      width={800}
      onCancel={handleClose}
      onOk={handleSave}
      open={show}
    >
      {formContent}
    </Modal>
  );
}
