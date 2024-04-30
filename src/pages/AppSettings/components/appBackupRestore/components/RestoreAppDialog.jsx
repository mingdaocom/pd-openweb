import React, { Fragment } from 'react';
import { Dialog, VerifyPasswordConfirm, Button, Checkbox } from 'ming-ui';
import { useSetState } from 'react-use';
import { syncAppDetail } from 'src/pages/PageHeader/redux/action';
import { connect } from 'react-redux';
import appManagementAjax from 'src/api/appManagement';
import Beta from '../../Beta';
import cx from 'classnames';
import moment from 'moment';
import styled from 'styled-components';
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
    handleRestore = () => {},
    onCancel = () => {},
  } = props;
  const [{ appItemChecked, dataChecked, backupCurrentVersion }, setData] = useSetState({
    appItemChecked: true,
    dataChecked: false,
    backupCurrentVersion: false,
  });

  return (
    <RestoreContentWrap>
      <div className="flexRow mBottom50">
        {restoreData
          .filter(v => (containData ? true : v.type === 'appItem'))
          .map((item, index) => (
            <div key={index} className={cx({ mLeft80: item.type === 'data' })}>
              <div className="flexRow alignItemsCenter">
                <Checkbox
                  disabled={item.type === 'appItem'}
                  checked={item.type === 'appItem' ? appItemChecked : dataChecked}
                  text={item.txt}
                  onClick={checked => setData({ [`${item.type}Checked`]: !checked })}
                />
                {item.type === 'data' && <Beta />}
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
      <p>
        - {_l(
          '在 %0 之后所有配置相关的更改都将丢失，建议勾选左下角还原前备份当前版本',
          moment(operationDateTime).format('YYYY-MM-DD'),
        )}
      </p>
      {containData && dataChecked && (
        <Fragment>
          <p>- {_l('还原操作将增量覆盖数据且不可逆，请在操作前进行备份以确保数据安全')}</p>
        </Fragment>
      )}

      <div className="flexRow alignItemsCenter mTop24">
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
        <div className="flex TxtRight">
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
    getList = () => {},
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
