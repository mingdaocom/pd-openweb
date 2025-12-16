import React, { useMemo, useRef } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon, UserHead, UserName } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { controlState } from 'src/components/Form/core/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getTranslateInfo } from 'src/utils/app';
import { dateConvertToUserZone } from 'src/utils/project';
import { handleChangeOwner, updateRecordOwner } from '../crtl';

export default function FormHeader(props) {
  const {
    isLock,
    hideFormHeader,
    recordbase,
    recordinfo,
    view = {},
    updateRecordDialogOwner,
    sheetSwitchPermit = {},
    viewId,
    maskinfo = {},
    from,
    isRecordLock,
  } = props;
  const { worksheetId, recordId, recordTitle, isSmall, editLockedUser } = recordbase;
  const {
    allowEdit,
    projectId,
    ownerAccount = {},
    worksheetName,
    createTime,
    updateTime,
    createAccount = {},
    editAccount = {},
    formData,
    appId,
    entityName,
  } = recordinfo;
  const isPublicShare =
    _.get(window, 'shareState.isPublicRecord') ||
    _.get(window, 'shareState.isPublicView') ||
    _.get(window, 'shareState.isPublicPage');
  const { maskPermissions, handleUnMask } = maskinfo;
  const ownerRef = useRef();
  const ownerControl = _.find(formData, c => c.controlId === 'ownerid');
  const showOwner =
    ownerControl &&
    !_.isEmpty(ownerAccount) &&
    !_.find(view.controls, controlId => controlId === 'ownerid') &&
    (controlState(ownerControl).visible || ownerControl.controlId === 'ownerid');
  const ownerEditable = useMemo(
    () =>
      ownerControl &&
      allowEdit &&
      controlState(ownerControl).editable &&
      !isLock &&
      !isRecordLock &&
      !recordinfo.isLock &&
      from !== RECORD_INFO_FROM.DRAFT &&
      !window.isPublicApp &&
      !editLockedUser,
    [allowEdit, isLock, isRecordLock, recordinfo.isLock, editLockedUser],
  );

  let isOpenLogs = true;
  if (!isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)) {
    isOpenLogs = false;
  }

  return (
    <div className={cx('recordInfoFormHeader Gray_9e', { isSmall })}>
      {!isPublicShare && !hideFormHeader && (
        <div className="worksheetNameCon mTop12">
          {!(window.isPublicApp || md.global.Account.isPortal) ? (
            <a className="worksheetName Gray_9e InlineBlock" target="_blank" href={`/worksheet/${worksheetId}`}>
              {getTranslateInfo(appId, null, worksheetId).name || worksheetName}
            </a>
          ) : (
            <span className="worksheetName Gray_9e InlineBlock">
              {getTranslateInfo(appId, null, worksheetId).name || worksheetName}
            </span>
          )}
          <div className="Right">
            {createTime && isOpenLogs && (
              <span className="lastLog InlineBlock Font12 Gray_9e">
                {createTimeSpan(dateConvertToUserZone(createTime === updateTime ? createTime : updateTime))}
                &nbsp;
                {createTime === updateTime ? createAccount.fullname : editAccount.fullname}
                <span className="mRight3">{createTime === updateTime ? _l('创建') : _l('更新了')}</span>
              </span>
            )}
            {showOwner && (
              <span className={cx('owner Font12 Gray_9e', { noBorder: !isOpenLogs })}>
                {_l('拥有者')}：
                <span
                  className={cx('ownerBlock', { disabled: !ownerEditable, Hand: ownerEditable })}
                  ref={ownerRef}
                  onClick={() => {
                    if (ownerEditable) {
                      handleChangeOwner({
                        recordId,
                        appId,
                        ownerAccountId: ownerAccount.accountId,
                        projectId,
                        target: ownerRef.current,
                        changeOwner: async (users, accountId) => {
                          try {
                            const { account, record } = await updateRecordOwner({
                              worksheetId,
                              recordId,
                              accountId:
                                accountId === 'user-self' ? _.get(md, ['global', 'Account', 'accountId']) : accountId,
                            });
                            updateRecordDialogOwner(account, record);
                            alert(_l('修改成功'));
                          } catch (err) {
                            if (err && err.resultCode === 72) {
                              alert(_l('%0已锁定，修改失败', entityName), 3);
                              return;
                            }
                            console.log(err);
                            alert(_l('修改失败'), 2);
                          }
                        },
                      });
                    }
                  }}
                >
                  <span className="InlineBlock">
                    <UserHead
                      className="cursorDefault"
                      size={24}
                      user={{
                        accountId: ownerAccount.accountId,
                        userHead: ownerAccount.avatar,
                      }}
                      appId={appId}
                      projectId={projectId}
                      headClick={() => {}}
                    />
                  </span>
                  <span className="Gray mLeft4">{ownerAccount.fullname}</span>
                  <i className="icon icon-arrow-down Hand Font12 Gray_75 mLeft4"></i>
                </span>
              </span>
            )}
          </div>
        </div>
      )}
      <div className="recordTitle flex">
        <span className={cx({ maskHoverTheme: maskPermissions })}>
          {recordTitle}
          {maskPermissions && (
            <i
              className="icon icon-eye_off Hand Font20 Gray_bd mLeft4"
              style={{ verticalAlign: 'middle' }}
              onClick={e => {
                if (!maskPermissions) return;
                e.stopPropagation();
                if (_.isFunction(handleUnMask)) {
                  handleUnMask();
                }
              }}
            ></i>
          )}
        </span>
      </div>

      {editLockedUser && (
        <div className="lockedUserInfo">
          <div className="lineTag" />
          <Tooltip title={_l('当前记录不允许多人同时编辑。请稍后重试')} placement="bottom">
            <Icon icon="workflow_write" className="Font16 ThemeColor mLeft5 mRight5" />
          </Tooltip>
          <UserName
            user={{ userName: editLockedUser.fullname, accountId: editLockedUser.accountId }}
            projectId={projectId}
            appId={appId}
            className="userName"
          />
          <div className="mLeft5 Gray_75">{_l('编辑中···')}</div>
        </div>
      )}
    </div>
  );
}

FormHeader.propTypes = {
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  view: PropTypes.shape({}),
  updateRecordDialogOwner: PropTypes.func,
};
