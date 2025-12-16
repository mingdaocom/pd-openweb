import React, { Fragment, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Steps } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, FullScreenCurtain, Icon, LoadDiv, QiniuUpload, Support } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import AppManagementAjax from 'src/pages/workflow/api/ApiManagement.js';
import importActiveImg from 'src/pages/Admin/app/appManagement/img/import_active.png';
import importDisabledImg from 'src/pages/Admin/app/appManagement/img/import_disabled.png';
import { UPGRADE_ERRORMSG } from 'src/pages/AppSettings/config.js';
import { formatFileSize } from 'src/utils/common';
import UpgradeItemWrap from './UpgradeItemWrap';

const { Step } = Steps;

const Wrap = styled.div`
  width: 100%;
  height: 100%;
  background: #fff;
  .headerCon {
    width: 100%;
    height: 50px;
    background: #ffffff;
    box-shadow: 0px 1px 2px 1px rgba(0, 0, 0, 0.16);
    border-radius: 0px 0px 0px 0px;
  }
  .upgradeProcessContent {
    width: 70%;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin: 0px auto 0;
    padding-top: 90px;
    .pBottom68 {
      padding-bottom: 68px;
    }
    .ant-steps-item-icon {
      width: 30px;
      height: 30px;
      font-size: 15px;
      line-height: 30px;
      .ant-steps-icon {
        top: -1.5px;
      }
    }
    .ant-steps-item-wait .ant-steps-item-icon {
      background: #eaeaea;
      border-color: #eaeaea;
    }
    .ant-steps-item-finish .ant-steps-item-icon {
      border-color: #e5f4fe;
      background: #e5f4fe;
    }
    .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
      color: #1677ff;
    }
    .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon {
      color: #757575;
    }
    .ant-steps-item-title {
      line-height: 30px;
    }
    .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title,
    .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
      color: #151515;
      font-weight: 600;
    }
    .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title {
      color: #9e9e9e;
      font-weight: 600;
    }
    .ant-steps-item-process > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after,
    .ant-steps-item-finish > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
      background-color: #e3e3e3;
    }
  }
  .upgradeProcessFooter {
    width: 100%;
    height: 68px;
    position: fixed;
    bottom: 0;
    left: 0;
    background-color: #fff;
    box-shadow: 0px -2px 6px 1px rgba(0, 0, 0, 0.08);
    z-index: 1000;
    .actionContent {
      width: 70%;
      height: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
  .pBottom68 {
    padding-bottom: 68px;
  }
  .uploadWrap {
    width: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    overflow-y: auto;
    border: 1px dashed #eaeaea;
    box-sizing: border-box;
    margin-bottom: 20px;
    .uploadImg {
      width: 52px;
      height: 59px;
      margin-bottom: 15px;
    }
    .passwordInputBox {
      width: 250px;
      line-height: 34px;
      border: 1px solid #1677ff;
      border-radius: 3px;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .errTip {
      color: #f51744;
    }
  }
  .scopeLoadingWrap {
    height: calc(~'100% - 68px');
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;
const ITEMS = [
  { title: _l('上传文件'), key: 'renderUploadFile' },
  { title: _l('升级范围'), key: 'renderUpgradeScope' },
  { title: _l('开始导入') },
];
export default function Upgrade(props) {
  const { onClose, info, onUpgrade, projectId } = props;
  const [
    { current, file, errTip, compareLoading, analyzeLoading, contrasts, batchCheckUpgradeLoading, url, upgradeId },
    setState,
  ] = useSetState({
    current: 0,
    contrasts: {},
    file: {},
    errTip: _l('导入文件不在允许升级范围内'),
    compareLoading: false,
    batchCheckUpgradeLoading: false,
    url: '',
    upgradeId: '',
  });
  const uploaderWrap = useRef();

  useEffect(() => {
    () => destroyUploadWrap();
  }, []);

  useEffect(() => {
    url && checkUpgrade();
  }, [url]);

  const destroyUploadWrap = () => {
    if (uploaderWrap.current && uploaderWrap.current.uploader) {
      uploaderWrap.current.uploader.destroy();
    }
  };

  //升级check
  const checkUpgrade = () => {
    setState({ compareLoading: true });
    AppManagementAjax.check(
      {
        fileName: file.name,
        id: info.id,
        projectId,
        url,
      },
      { isIntegration: true },
    )
      .then(res => {
        const { resultCode, contrasts = {}, id } = res;
        if (resultCode === 0) {
          setState({
            current: 1,
            compareLoading: false,
            analyzeLoading: false,
            errTip: '',
            contrasts,
            upgradeId: id,
          });
        } else {
          setState({
            password: '',
            compareLoading: false,
            analyzeLoading: false,
            contrasts: {},
            errTip: UPGRADE_ERRORMSG[resultCode],
          });
        }
      })
      .catch(() => {
        setState({ compareLoading: false, analyzeLoading: false });
      });
  };

  const onUploadComplete = (up, file, response) => {
    const { key } = response;
    const fileInfo = { ...file, key };
    setState({
      file: fileInfo,
      url: md.global.FileStoreConfig.documentHost + '/' + fileInfo.key,
      errTip: '',
      analyzeLoading: false,
    });
  };

  const renderUploadFile = () => {
    return (
      <Fragment>
        <div className="Gray_75 mBottom20">
          {_l('导入 API 配置文件，实现对当前 API 的快速升级，升级过程中不影响原有API正常使用。')}
          <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/application/upgrade" />
        </div>
        <div className="uploadWrap flex">
          <Fragment>
            <img className="uploadImg" src={file.name ? importActiveImg : importDisabledImg}></img>
            {file.name ? (
              <Fragment>
                <div className="Font17">{file.name}</div>
                <div className="Gray_75 mTop6">{_l('大小：%0', formatFileSize(file.size))}</div>
                {errTip && (
                  <div className="mTop15 errTip Font14">
                    <span className="icon-cancel Font15 mRight6"></span>
                    <span>{_l(errTip)}</span>
                  </div>
                )}
              </Fragment>
            ) : (
              <div className="Gray_bd">{_l('请选择.mdy格式的文件')}</div>
            )}
            {(analyzeLoading || compareLoading) && (
              <div className="flexRow mTop16">
                <div className="notificationIconWrap">
                  <i className="icon-loading_button Font20 ThemeColor3"></i>
                </div>
                <span className="Gray_75 mLeft10">
                  {compareLoading ? _l('正在校验升级内容...') : _l('正在解析文件...')}
                </span>
              </div>
            )}
            {compareLoading && <div className="Gray_9e Font14 mTop16">{_l('此步骤可能耗时较久，请耐心等待')}</div>}
          </Fragment>
          {!compareLoading && (
            <QiniuUpload
              ref={uploaderWrap}
              className="upgradeAppUpload mTop24"
              options={{
                filters: {
                  mime_types: [{ extensions: 'mdy' }],
                },
              }}
              onAdd={() => {
                setState({ errTip: '' });
              }}
              onBeforeUpload={(up, file) => {
                !analyzeLoading && setState({ file: file, analyzeLoading: true });
              }}
              onUploaded={onUploadComplete}
              onError={() => {
                setState({
                  file: {},
                  files: [],
                  url: '',
                  password: '',
                  errTip: _l('文件上传失败'),
                  analyzeLoading: false,
                });
              }}
            >
              {_.isEmpty(file) ? (
                <Button type="primary" radius className={cx({ Visibility: analyzeLoading })}>
                  {_l('上传文件')}
                </Button>
              ) : (
                <div className={cx('ThemeColor Hand', { Visibility: analyzeLoading })}>{_l('重新上传')}</div>
              )}
            </QiniuUpload>
          )}
        </div>
      </Fragment>
    );
  };
  const renderUpgradeScope = () => {
    return (
      <div className={cx('pBottom68', { h100: batchCheckUpgradeLoading })}>
        <div className="Font14 mBottom20">
          {_l('导入 API 配置文件，实现对当前 API 的快速升级，升级过程中不影响原有API正常使用。')}
        </div>
        {batchCheckUpgradeLoading ? (
          <div className="h100 scopeLoadingWrap">
            <LoadDiv size="middle" className="mBottom14" />
            <div className="Gray_9e Font13 TxtCenter">{_l('数据正在加载中...')}</div>
          </div>
        ) : _.isEmpty(contrasts.apis) ? (
          ''
        ) : (
          <UpgradeItemWrap itemList={contrasts.apis || []} />
        )}
      </div>
    );
  };
  //导入
  const handleUpgrade = () => {
    AppManagementAjax.importApi(
      {
        packageId: info.id,
        id: upgradeId,
      },
      { isIntegration: true },
    );
    onUpgrade();
  };
  const renderFooter = () => {
    return (
      <div className="upgradeProcessFooter">
        <div className="actionContent">
          <Button type="primary" className="mLeft30" disabled={batchCheckUpgradeLoading} onClick={handleUpgrade}>
            {_l('开始导入')}
          </Button>
        </div>
      </div>
    );
  };
  const renderCon = () => {
    switch (current) {
      case 0:
        return renderUploadFile();
      default:
        return renderUpgradeScope();
    }
  };
  return (
    <FullScreenCurtain>
      <Wrap className="">
        <div className="headerCon flexRow alignItemsCenter pLeft30">
          <div className="flex">
            <Tooltip title={_l('返回上一步')} placement="bottom">
              <Icon icon="backspace mRight8 Hand ThemeHoverColor3 Font18" onClick={() => onClose()} />
            </Tooltip>
            <span className="Font18 Bold mLeft10">{_l('导入升级')}</span>
          </div>
          <div className="Gray_9d Font14 mRight24">
            <Support title={_l('帮助')} type={1} href="https://help.mingdao.com/application/upgrade" />
          </div>
        </div>
        <div className={cx('upgradeProcessContent')}>
          <Fragment>
            <Steps current={current} className="mBottom20">
              {ITEMS.map(item => {
                return <Step key={item.title} title={item.title} disabled={true}></Step>;
              })}
            </Steps>
          </Fragment>
          {renderCon()}
          {current !== 0 && renderFooter()}
        </div>
      </Wrap>
    </FullScreenCurtain>
  );
}
