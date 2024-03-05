import React, { Fragment, useState } from 'react';
import cx from 'classnames';

export default function DrawerFooterOption(props) {
  const {
    actType,
    typeCursor,
    isUploading,
    editCurrentUser = {},
    handleSubmit = () => {},
    saveFn = () => {},
    onClose = () => {},
  } = props;

  const { accountId } = editCurrentUser;

  return (
    <Fragment>
      {(typeCursor === 0 || typeCursor === 1) && actType === 'add' && (
        <div className="btnGroups">
          <a
            className="btnBootstrap addBtn"
            href="javascript:void(0);"
            disabled={isUploading}
            onMouseDown={() => handleSubmit()}
          >
            {_l('添加')}
          </a>
          <a
            className="btnBootstrap mLeft8 addContinueBtn"
            href="javascript:void(0);"
            disabled={isUploading}
            onMouseDown={() => handleSubmit(true)}
          >
            {_l('继续添加')}
          </a>
          <span
            className="Hand cancelBtn mLeft8"
            onClick={() => {
              onClose(true);
            }}
          >
            {_l('取消')}
          </span>
        </div>
      )}
      {(typeCursor === 0 || typeCursor === 1) && actType !== 'add' && (
        <div className="btnGroups flexRow">
          <div className="flex">
            <a
              className={cx('btnBootstrap addBtn', { disabledBtn: isUploading })}
              href="javascript:void(0);"
              disabled={isUploading}
              onClick={() => {
                if (isUploading) {
                  return;
                }
                saveFn();
              }}
            >
              {_l('保存')}
            </a>
            <span
              className="Hand cancelBtn mLeft8"
              onClick={() => {
                onClose(true);
              }}
            >
              {_l('取消')}
            </span>
          </div>
        </div>
      )}
      {typeCursor === 2 && (
        <div className="btnGroups flexRow">
          <div className="flex">
            <a
              className="btnBootstrap addBtn"
              href="javascript:void(0);"
              onClick={() => props.fetchReInvite([accountId], onClose)}
            >
              {_l('重新邀请')}
            </a>
            <span className="Hand cancelBtn mLeft8" onClick={onClose}>
              {_l('取消')}
            </span>
          </div>
        </div>
      )}
      {typeCursor === 3 && (
        <div className="btnGroups flexRow">
          <div className="flex">
            <span className="btnBootstrap addBtn" onClick={props.agreeJoin}>
              {_l('批准加入')}
            </span>
            <span
              className="Hand cancelBtn mLeft8"
              onClick={() => {
                onClose(true);
              }}
            >
              {_l('取消')}
            </span>
          </div>
        </div>
      )}
    </Fragment>
  );
}
