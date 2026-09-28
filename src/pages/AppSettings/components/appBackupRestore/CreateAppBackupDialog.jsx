import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import { LoadDiv, Support, SvgIcon } from 'ming-ui';
import { Checkbox, Modal } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';

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
    color: var(--color-warning);
    .icon {
      color: var(--color-warning);
    }
  }
  .limitNum {
    color: var(--color-error);
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

export default function CreateBackupModal(props) {
  const { appId, projectId, appName, data = {}, getList = () => {} } = props;
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCurrentValid] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
  const [containData, setContainData] = useState(false);
  const [countInfo, setCountInfo] = useState({});

  useEffect(() => {
    if (!appId) return;

    let cancelled = false;

    appManagementAjax.getValidBackupFileInfo({ appId, projectId }).then(res => {
      if (cancelled) return;

      setCountLoading(false);
      setValidLimit(res.validLimit);
      setCurrentValid(res.currentValid);
    });
    appManagementAjax.getAppSupportInfo({ appId }).then(res => {
      if (!cancelled) {
        setCountInfo(res);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [appId, projectId]);

  const onOk = () => {
    if (!countInfo.appItemTotal) return;

    if (validLimit !== -1 && currentValid >= validLimit) {
      alert(_l('备份文件已达上限，升级旗舰版可以无限备份'), 3);
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
          alert(_l('备份文件已达上限，升级旗舰版可以无限备份'), 3);
        }
      });

    props.closeDialog();
  };

  return (
    <Modal
      title={_l('备份')}
      open
      width={580}
      onCancel={() => props.closeDialog()}
      className="createIndexDialog"
      mask={{ closable: false }}
      okText={_l('确认')}
      okDisabled={!countInfo.appItemTotal}
      keyboard
      onOk={onOk}
    >
      {countLoading ? (
        <CreateBackupCon className="emptyWrap">
          <LoadDiv />
        </CreateBackupCon>
      ) : (
        <CreateBackupCon>
          <div className="Font12 textTertiary mBottom12">{_l('正在备份应用：')}</div>
          <div className="flexRow mBottom30">
            <div className="appIcon mRight12" style={{ background: data.iconColor }}>
              <SvgIcon url={data.iconUrl} fill="#fff" size={24} />
            </div>
            <div>
              <div className="bold Font16 textPrimary">{appName}</div>
              <div className="textTertiary Font12 mTop3">{_l('共有 %0 个应用项', countInfo.appItemTotal)}</div>
            </div>
          </div>
          {(window.platformENV.isHap || md.global.SysSettings.enableBackupWorksheetData) && (
            <Fragment>
              <div className="flexRow alignItemsCenter">
                <Checkbox
                  checked={containData}
                  onChange={event => {
                    setContainData(event.target.checked);
                  }}
                >
                  {_l('同时备份数据')}
                </Checkbox>
              </div>

              <div className="Font12 textTertiary pLeft24">{_l('预计共有 %0 行记录', countInfo.rowTotal)}</div>
            </Fragment>
          )}

          {validLimit === -1 ? (
            <Fragment>
              <div className="mTop50"> - {_l('不限制备份文件个数')}</div>
              <div>
                {'-' + ' '}
                {window.platformENV.isOverseas || window.platformENV.isLocal
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
      {validLimit !== -1 && (
        <div className="textTertiary TxtLeft Font13 mTop20">{_l('已备份:%0', `${currentValid}/${validLimit}`)}</div>
      )}
    </Modal>
  );
}
