import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Checkbox, Support, SvgIcon, LoadDiv } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import cx from 'classnames';

const CreateBackupCon = styled.div`
  font-size: 13px;
  line-height: 17px;
  &.emptyWrap {
    height: 216px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .warning {
    background: rgba(255, 159, 51, 0.15);
    height: 32px;
    line-height: 32px;
    color: #e68619;
    .icon {
      color: #ff9f33;
    }
  }
  .limitNum {
    color: #ff1100;
  }
  .FontW {
    font-weight: 600;
  }
  .appIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 6px;
  }
`;

const Footer = styled.div`
  font-size: 14px;
  line-height: 36px;
  min-height: 36px;
  span {
    font-size: 14px;
    line-height: 36px;
    min-height: 36px;
    display: inline-block;
    box-sizing: border-box;
    text-shadow: none;
    border: none;
    outline: none;
    border-radius: 3px;
    color: #fff;
    vertical-align: middle;
    cursor: pointer;
    width: 92px;
    text-align: center;
  }
  .cancelBtn {
    color: #9e9e9e;
  }
  .cancelBtn:hover {
    color: #1e88e5;
  }
  .disabledConfirmBtn {
    color: #fff;
    background: #bdbdbd;
  }
  .confirmBtn {
    background: #2196f3;
    cursor: pointer;
  }
  .confirmBtn:hover {
    background-color: #1565c0;
  }
  .disabledBtn {
    cursor: not-allowed;
    background-color: #bdbdbd;
    color: #fff;
    &:hover {
      background-color: #bdbdbd;
    }
  }
`;

export default function CreateBackupModal(props) {
  const { appId, projectId, appName, data = {}, getList = () => {} } = props;
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCurrentValid] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
  const [containData, setContainData] = useState(false);
  const [countInfo, setCountInfo] = useState({});

  useEffect(() => {
    if (!appId) return;
    getBackupCount();
    getAppSupportInfo();
  }, [appId]);

  const getBackupCount = () => {
    appManagementAjax.getValidBackupFileInfo({ appId, projectId }).then(res => {
      setCountLoading(false);
      setValidLimit(res.validLimit);
      setCurrentValid(res.currentValid);
    });
  };

  const getAppSupportInfo = () => {
    appManagementAjax.getAppSupportInfo({ appId }).then(res => {
      setCountInfo(res);
    });
  };

  const onOk = () => {
    if (!countInfo.appItemTotal) return;

    if (validLimit !== -1 && currentValid >= validLimit) {
      alert('备份文件已达上限，升级旗舰版可以无限备份', 3);
      props.closeDialog();
      props.openManageBackupDrawer();
      return;
    }

    appManagementAjax
      .backup({
        appId,
        containData,
      })
      .then(res => {
        if (res === 1) {
          getList();
        } else if (res === 2) {
          alert('备份文件已达上限，升级旗舰版可以无限备份', 3);
        }
      });

    props.closeDialog();
  };

  return (
    <Dialog
      title={_l('备份')}
      visible={true}
      width={580}
      onCancel={() => props.closeDialog()}
      className="createIndexDialog"
      overlayClosable={false}
      okText={_l('备份')}
      footer={
        <Footer className="flexRow">
          <div className="Gray_9e flex TxtLeft Font13">
            {validLimit !== -1 ? _l('已备份:%0', `${currentValid}/${validLimit}`) : ''}
          </div>
          <span className="cancelBtn" onClick={props.closeDialog}>
            {_l('取消')}
          </span>
          <span className={cx('confirmBtn', { disabledBtn: !countInfo.appItemTotal })} type="primary" onClick={onOk}>
            {_l('确认')}
          </span>
        </Footer>
      }
    >
      {countLoading ? (
        <CreateBackupCon className="emptyWrap">
          <LoadDiv />
        </CreateBackupCon>
      ) : (
        <CreateBackupCon>
          <div className="Font12 gray_9e mBottom12">{_l('正在备份应用：')}</div>
          <div className="flexRow mBottom30">
            <div className="appIcon mRight12" style={{ background: data.iconColor }}>
              <SvgIcon url={data.iconUrl} fill="#fff" size={24} />
            </div>
            <div>
              <div className="bold Font16 Gray">{appName}</div>
              <div className="Gray_9e Font12 mTop3">{_l('共有 %0 个应用项', countInfo.appItemTotal)}</div>
            </div>
          </div>
          {(!md.global.Config.IsLocal || md.global.SysSettings.enableBackupWorksheetData) && (
            <Fragment>
              <div className="flexRow alignItemsCenter">
                <Checkbox
                  text={_l('同时备份数据')}
                  checked={containData}
                  onClick={checked => {
                    setContainData(!checked);
                  }}
                />
              </div>

              <div className="Font12 Gray_9e pLeft24">{_l('预计共有 %0 行记录', countInfo.rowTotal)}</div>
            </Fragment>
          )}

          {validLimit === -1 ? (
            <Fragment>
              <div className="mTop50"> - {_l('不限制备份文件个数')}</div>
              <div>
                {'-' + ' '}
                {md.global.Config.IsLocal
                  ? _l('每个备份文件仅保留%0天有效期，超过%0天的会自动删除', md.global.SysSettings.appBackupRecycleDays)
                  : _l('备份文件一年有效，占用应用附件存储量')}
                <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/application/backup-restore" />
              </div>
            </Fragment>
          ) : (
            <Fragment>
              <div className="mTop50"> - {_l('每个应用最多可备份10个文件')}</div>
              <div>
                - {_l('每个备份文件仅保留60天有效期，超过60天的会自动删除')}
                <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/application/backup-restore" />
              </div>
            </Fragment>
          )}
        </CreateBackupCon>
      )}
    </Dialog>
  );
}
