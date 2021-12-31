import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import UserHead from 'src/pages/feed/components/userHead';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { handleChangeOwner, updateRecordOwner } from '../crtl';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
export default function FormHeader(props) {
  const { recordbase, recordinfo, view = {}, updateRecordDailogOwner, sheetSwitchPermit = {}, viewId } = props;
  const { isCharge, worksheetId, recordId, recordTitle, isSmall } = recordbase;
  const {
    allowEdit,
    projectId,
    ownerAccount = {},
    worksheetName,
    createTime,
    updateTime,
    createAccount = {},
    editAccount,
    templateControls,
  } = recordinfo;
  const ownerRef = useRef();
  const ownerControl = _.find(templateControls, c => c.controlId === 'ownerid');
  const showOwner =
    !_.isEmpty(ownerAccount) &&
    !_.find(view.controls, controlId => controlId === 'ownerid') &&
    controlState(ownerControl).visible;
  const ownerEditable = allowEdit && ownerControl && controlState(ownerControl).editable;
  let isOpenLogs = true;
  if (!isOpenPermit(permitList.recordLogSwitch, sheetSwitchPermit, viewId)) {
    isOpenLogs = false;
  }
  return (
    <div className={cx('recordInfoFormHeader Gray_9e', { isSmall })}>
      <div className="worksheetNameCon" style={{ marginTop: 16 }}>
        {!window.isPublicApp ? (
          <a className="worksheetName Gray_9e InlineBlock" target="_blank" href={`/worksheet/${worksheetId}`}>
            {worksheetName}
          </a>
        ) : (
          <span className="worksheetName Gray_9e InlineBlock">{worksheetName}</span>
        )}
        <div className="Right">
          {createTime && isOpenLogs && (
            <span className="lastLog InlineBlock Font12 Gray_9e">
              {createTime === updateTime ? createAccount.fullname : editAccount.fullname}
              {createTime === updateTime ? _l(' 创建于 ') : _l(' 更新于 ')}
              {createTimeSpan(createTime === updateTime ? createTime : updateTime)}
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
                      ownerAccountId: ownerAccount.accountId,
                      projectId,
                      target: ownerRef.current,
                      changeOwner: async (users, accountId) => {
                        try {
                          const { account, record } = await updateRecordOwner({ worksheetId, recordId, accountId });
                          updateRecordDailogOwner(account, record);
                          alert(_l('修改成功'));
                        } catch (err) {
                          alert(_l('修改失败'));
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
                    bindBusinessCard={
                      !_.includes(['user-workflow', 'user-publicform', 'user-api'], ownerAccount.accountId)
                    }
                    user={{
                      accountId: ownerAccount.accountId,
                      userHead: ownerAccount.avatar,
                    }}
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
      <div className="recordTitle flex">{recordTitle}</div>
    </div>
  );
}

FormHeader.propTypes = {
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  view: PropTypes.shape({}),
  updateRecordDailogOwner: PropTypes.func,
};
