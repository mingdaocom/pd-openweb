import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { useSetState } from 'react-use';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Checkbox, Dialog, VerifyPasswordConfirm } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import { syncAppDetail } from 'src/pages/PageHeader/redux/action';
import { navigateTo } from 'src/router/navigateTo';

const RestoreContentWrap = styled.div`
  p {
    margin-bottom: 0;
  }
`;
const restoreData = [
  {
    type: 'appItem',
    txt: _l('还原应用项'),
  },
  {
    type: 'data',
    txt: _l('还原数据'),
  },
];

export const RestoreContent = props => {
  const {
    containData,
    operationDateTime,
    appItemTotal,
    rowTotal,
    validLimit,
    currentValid,
    isFileRestore,
    fileType,
    handleRestore = () => {},
    onCancel = () => {},
  } = props;
  const [{ appItemChecked, dataChecked, backupCurrentVersion }, setData] = useSetState({
    appItemChecked: true,
    dataChecked: fileType === 1 ? true : false,
    backupCurrentVersion: true,
  });

  const checkRestoreData = restoreData.filter(v =>
    fileType === 1 ? v.type === 'data' : containData ? true : v.type === 'appItem',
  );

  return (
    <RestoreContentWrap>
      <div className="flexRow mBottom50">
        {checkRestoreData.map((item, index) => (
          <div key={index} className={cx({ mLeft80: checkRestoreData.length > 1 && item.type === 'data' })}>
            <div className="flexRow alignItemsCenter">
              <Checkbox
                disabled={item.type === 'appItem' || (fileType === 1 && item.type === 'data')}
                checked={item.type === 'appItem' ? appItemChecked : dataChecked}
                text={item.txt}
                onClick={checked => setData({ [`${item.type}Checked`]: !checked })}
              />
            </div>
            <div className="Font12 Gray_9e pLeft24">
              {item.type === 'appItem' && appItemTotal
                ? _l('共有 %0 个应用项', appItemTotal)
                : item.type === 'data'
                  ? _l('共有 %0 行记录', rowTotal)
                  : ''}
            </div>
          </div>
        ))}
      </div>
      {fileType !== 1 && (
        <p>
          -{' '}
          {_l(
            '在 %0 之后所有配置相关的更改都将丢失，建议勾选左下角还原前备份当前版本',
            moment(operationDateTime).format('YYYY-MM-DD'),
          )}
        </p>
      )}
      {(containData || (isFileRestore && fileType === 1)) && dataChecked && (
        <Fragment>
          <p>- {_l('还原操作将增量覆盖数据且不可逆，请在操作前进行备份以确保数据安全')}</p>
          <p>- {_l('还原后，不会自动清理与缺失记录相关的关联关系，显示为已删除状态')}</p>
        </Fragment>
      )}
      <div className="mTop24 mBottom10">
        <Checkbox
          text={_l('还原前备份当前版本') + (dataChecked ? _l('(同时备份数据)') : '')}
          checked={backupCurrentVersion}
          onClick={checked => {
            if (validLimit !== -1 && currentValid >= validLimit) {
              alert('备份文件已达上限，升级旗舰版可以无限备份', 3);
              return;
            }
            setData({ backupCurrentVersion: !checked });
          }}
        />
      </div>
      <div className="flexRow alignItemsCenter">
        <div className="flex"></div>
        <div className="TxtRight">
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={() => handleRestore({ backupCurrentVersion, containData: dataChecked })}>
            {_l('还原')}
          </Button>
        </div>
      </div>
    </RestoreContentWrap>
  );
};

function RestoreAppDialog(props) {
  const {
    visible,
    appId,
    projectId,
    validLimit,
    currentValid,
    changeRestoreAppVisible = () => {},
    actCurrentFileInfo = {},
  } = props;

  const onOk = data => {
    changeRestoreAppVisible();
    const { backupCurrentVersion, containData } = data;
    VerifyPasswordConfirm.confirm({
      onOk: () => {
        let params = {
          projectId,
          appId,
          id: actCurrentFileInfo.id,
          autoEndMaintain: false,
          backupCurrentVersion,
          isRestoreNew: false,
          containData,
        };

        appManagementAjax.restore(params).then(res => {
          if (res) {
            navigateTo(`/app/${appId}`);
          }
        });
      },
    });
  };

  return (
    <Fragment>
      <Dialog
        visible={visible}
        title={_l('还原备份 "%0"', actCurrentFileInfo.backupFileName)}
        className="restoreAppDialog"
        overlayClosable={false}
        onCancel={changeRestoreAppVisible}
        footer={null}
      >
        <RestoreContent
          validLimit={validLimit}
          currentValid={currentValid}
          {...actCurrentFileInfo}
          handleRestore={data => onOk(data)}
          onCancel={changeRestoreAppVisible}
        />
      </Dialog>
    </Fragment>
  );
}

export default connect(
  state => {
    const { appPkg } = state;
    return { appPkg };
  },
  dispatch => ({ syncAppDetail: detail => dispatch(syncAppDetail(detail)) }),
)(RestoreAppDialog);
