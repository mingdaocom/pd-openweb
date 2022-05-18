import React, { useState, useEffect } from 'react';
import { Dialog } from 'ming-ui';
import { getApps, getValidBackupFileInfo } from 'src/api/appManagement';
import styled from 'styled-components';
import cx from 'classnames';
import { LoadDiv, Support } from 'ming-ui';
import './less/manageBackupFilesDialog.less';

const CreatBackupCon = styled.div`
  font-size: 13px;
  line-height: 17px;
  color: #757575;
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
  .disabledCofirmBtn {
    color: #fff;
    background: #bdbdbd;
  }
  .comfirmBtn {
    background: #2196f3;
    cursor: pointer;
  }
  .comfirmBtn:hover {
    background-color: #1565c0;
  }
`;

export default function CreateBackupModal(props) {
  const { appId, projectId, appName, getList = () => {} } = props;
  const [validLimit, setValidLimit] = useState(0);
  const [currentValid, setCcurrentValid] = useState(0);
  const [countLoading, setCounLoading] = useState(true);
  useEffect(() => {
    if (!appId) return;
    getBackupCount();
  }, [appId]);

  const getBackupCount = () => {
    getValidBackupFileInfo({ appId, projectId }).then(res => {
      setCounLoading(false);
      setValidLimit(res.validLimit);
      setCcurrentValid(res.currentValid);
    });
  };
  const onOk = () => {
    if (currentValid >= validLimit) {
      alert('创建备份失败', 2);
      props.closeDialog();
      props.openManageBackupDrawer();
      return;
    }
    let params = {
      projectId,
      appId,
      accountId: md.global.Account.accountId,
      appName,
    };
    getApps({ appIds: [appId] }).then(({ token }) => {
      params.token = token;
      $.ajax({
        type: 'POST',
        url: `${md.global.Config.AppFileServer}AppFile/BackUp`,
        data: JSON.stringify(params),
        dataType: 'JSON',
        contentType: 'application/json',
      }).done(res => {
        const { state } = res;
        getList(1);
        if (state === 2) {
          alert(_l('程序异常', 3));
        } else if (state == 3) {
          alert(_l('token失效', 3));
        } else if (state == 4) {
          alert(_l('网络版本过低，无法使用高版本功能', 3));
        }
      });
    });
    props.closeDialog();
  };
  return (
    <Dialog
      title={_l('确认备份“%0”应用？', appName)}
      visible={true}
      widhth={580}
      onCancel={() => props.closeDialog()}
      className="createIndexDialog"
      overlayClosable={false}
      footer={
        <Footer>
          <span className="cancelBtn" onClick={props.closeDialog}>
            {_l('取消')}
          </span>
          <span className="comfirmBtn" onClick={onOk}>
            {_l('确认')}
          </span>
        </Footer>
      }
    >
      <CreatBackupCon>
        {/* {validLimit && currentValid >= validLimit && (
          <div className="warning">
            <Icon icon="info" className="mRight8" />
            {_l('该应用已备份文件达到上限%0个，请前往“管理备份文件”删除一些备份文件后再进行备份', validLimit)}
          </div>
        )} */}
        <div>
          <span>{_l('此操作仅备份')}</span>
          <span>{_l('当前应用的结构和配置，该应用下的数据不会备份。每个备份文件仅保留')}</span>
          <span className="Black FontW">{_l('60天')}</span>
          <span>{_l('有效期，超过60天的会自动删除，每个应用最多可备份')}</span>
          <span className="Black FontW">{_l('10个')}</span>
          <span>{_l('文件。')}</span>
          <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/backup.html" />
        </div>

        <div className="mTop24">
          {_l('当前已备份:')}{' '}
          {countLoading ? (
            <LoadDiv />
          ) : (
            <span>
              <span className={cx({ limitNum: currentValid >= validLimit })}>{currentValid}</span>
              {`/${validLimit}`}
            </span>
          )}
        </div>
      </CreatBackupCon>
    </Dialog>
  );
}
