import React, { Fragment, useEffect, useState } from 'react';
import { useRef } from 'react';
import _ from 'lodash';
import { FunctionWrap } from 'ming-ui';
import { Input, Modal } from 'ming-ui/antd-components';
import addressBookController from 'src/api/addressBook';
import userController from 'src/api/user';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import './css/style.css';

function AddFriendConfirm(props) {
  const { accountId, callback, onClose } = props;
  const [data, setData] = useState(null);
  const contentRef = useRef();
  const handleClose = () => onClose();

  useEffect(() => {
    userController
      .getAccountBaseInfo({
        accountId: md.global.Account.accountId,
      })
      .then(function (data) {
        if (data) {
          setData({
            ...data,
            showExtraInput: !data.companyName || !data.profession,
          });
        }
      });
  }, []);

  const save = () => {
    const param = {
      accountId,
      message: data.message,
    };

    if (data.showExtraInput) {
      param.company = data.companyName;
      param.profession = data.profession;
    }

    addressBookController
      .addFriend(param)
      .then(function (data) {
        if (data.status === 1) {
          if (typeof callback === 'function') {
            callback();
          }

          alert(_l('发送成功'));
        } else if (data.status === 2) {
          alert(_l('对方已是您的好友'), 3);
        } else {
          if (data.joinFriendType === 2) {
            alert(_l('对方暂不允许他人加其为好友'), 3);
          } else {
            alert(_l('发送失败'), 2);
          }
        }

        handleClose();
      })
      .catch(function (_requestError) {
        alertIfNotUnauthorized(_requestError, _l('发送失败'), 2);
        handleClose();
      });
  };

  if (!data) return null;

  return (
    <Modal
      open
      className="addFriendConfirm"
      width={480}
      title={_l('添加为好友')}
      okDisabled={!data.companyName || !data.profession}
      mask={{ closable: true }}
      onOk={save}
      onCancel={() => handleClose()}
    >
      <div className="recBox clearfix" ref={contentRef}>
        {!data.showExtraInput ? (
          <div className="tip">{_l('发送验证信息，等待好友确认')}</div>
        ) : (
          <div className="tip">{_l('您需要完善组织/职位信息，等待好友确认')}</div>
        )}
        {data.showExtraInput && (
          <Fragment>
            <div>
              <Input
                className="w100 mTop12"
                size="large"
                placeholder={_l('组织（必填）')}
                value={data.companyName}
                data-type="company"
                onChange={event => {
                  setData({
                    ...data,
                    companyName: _.trim(event.target.value),
                  });
                }}
              />
            </div>
            <div>
              <Input
                className="w100 mTop12"
                size="large"
                placeholder={_l('职位（必填）')}
                value={data.profession}
                data-type="profession"
                onChange={event => {
                  setData({
                    ...data,
                    profession: _.trim(event.target.value),
                  });
                }}
              />
            </div>
          </Fragment>
        )}
        <div>
          <Input.TextArea
            autoSize
            className="inputControl applyMsg borderColorPrimary"
            defaultValue={data.message || _l('我是%0', md.global.Account.fullname)}
            onChange={event => {
              setData({
                ...data,
                message: event.target.value,
              });
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default props => {
  FunctionWrap(AddFriendConfirm, { ...props, onClose: () => {} });
};
