import React, { Fragment, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Progress } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Button, Dialog, QiniuUpload, Support } from 'ming-ui';
import AppManagementAjax from 'src/pages/workflow/api/ApiManagement.js';
import importActiveImg from 'src/pages/Admin/app/appManagement/img/import_active.png';
import importDisabledImg from 'src/pages/Admin/app/appManagement/img/import_disabled.png';
import { UPGRADE_ERRORMSG } from 'src/pages/AppSettings/config.js';
import { formatFileSize } from 'src/utils/common';

const Wrap = styled.div`
  &.importAppContainer {
    .importAppContentItem {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      .svgBox {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 5px;
        div {
          height: 14px;
        }
      }
    }
    .importAppContentCenter {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .dashBorder {
      border: 2px dashed #eaeaea;
    }
    .solidBorder {
      border: 1px solid #eaeaea;
    }
    .importAppContent {
      width: 100%;
      height: 362px;
      border-radius: 3px;
      overflow-y: auto;
      box-sizing: border-box;

      .uploadImg {
        width: 52px;
        height: 59px;
        margin-bottom: 15px;
      }

      .Hidden {
        display: none !important;
      }

      .errorColor {
        color: #f51744;
      }

      .notificationIconWrap {
        display: flex;
        align-items: center;
        animation: rotate 3s ease-in-out infinite;
      }

      .exportBtn {
        width: 95px;
        height: 36px;
        line-height: 36px;
        background: #1677ff;
        border-radius: 18px;
        &:hover {
          background: #0073ce;
        }
      }

      .passwordInputBox {
        width: 250px;
        line-height: 34px;
        border: 1px solid #1677ff;
        border-radius: 3px;
        padding: 0 12px;
        box-sizing: border-box;
      }

      .submitPassword {
        width: 95px;
        height: 36px;
        line-height: 36px;
        background: #1677ff;
        &.disabled {
          background: #bdbdbd !important;
        }
        &:hover {
          background: #0073ce;
        }
      }
    }
    .exportBottomOption {
      display: flex;
      align-items: center;
      justify-content: end;
      .flexCenter {
        display: flex;
        align-items: center;
      }
      .importBtn {
        width: 107px;
        height: 36px;
        border-radius: 2px;
        color: #fff !important;
      }
    }
  }
`;

export default function ImportDialog(props) {
  const uploaderWrap = useRef();
  const { projectId, onFresh, onClose } = props;
  const [{ file, errTip, analyzeLoading, upgradeId }, setState] = useSetState({
    file: {},
    errTip: '',
    url: '',
    analyzeLoading: false,
    upgradeId: '',
  });

  useEffect(() => {
    () => destroyUploadWrap();
  }, []);

  //导入
  const importConnect = async () => {
    AppManagementAjax.importApi(
      {
        projectId,
        id: upgradeId,
      },
      { isIntegration: true },
    ).then(() => {
      onFresh();
      onClose();
    });
  };

  const renderFileInfo = () => {
    if (file.name) {
      return (
        <Fragment>
          <div className="Font17">{file.name}</div>
          {errTip ? (
            <div className="mTop6 errorColor">
              <span className="icon-info TxtMiddle Font15 mRight6"></span>
              <span>{_l(errTip)}</span>
            </div>
          ) : (
            <div className="Gray_75 mTop6">{_l('大小：%0', formatFileSize(file.size))}</div>
          )}
        </Fragment>
      );
    } else {
      return <div className="Gray_bd">{_l('请选择.mdy格式的应用文件')}</div>;
    }
  };

  const onUploadComplete = (up, file, response) => {
    const { key } = response;
    checkUpgrade({ ...file, key });
  };

  //升级check
  const checkUpgrade = file => {
    const fileName = file.name;
    const url = md.global.FileStoreConfig.documentHost + file.key;
    AppManagementAjax.check(
      {
        fileName,
        url,
        projectId,
      },
      { isIntegration: true },
    )
      .then(res => {
        const { resultCode, id } = res;
        if (resultCode === 0) {
          setState({
            file,
            url,
            analyzeLoading: false,
            errTip: '',
            upgradeId: id,
          });
        } else {
          setState({
            upgradeId: '',
            analyzeLoading: false,
            errTip: UPGRADE_ERRORMSG[resultCode],
          });
          alert(UPGRADE_ERRORMSG[resultCode], 2);
        }
      })
      .catch(() => {
        setState({ analyzeLoading: false, upgradeId: '' });
      });
  };

  const destroyUploadWrap = () => {
    if (uploaderWrap.current && uploaderWrap.current.uploader) {
      uploaderWrap.current.uploader.destroy();
      uploaderWrap.current = null;
    }
  };

  const renderStepContent = () => {
    return (
      <div
        className={cx('importAppContent importAppContentCenter', file.name ? 'solidBorder' : 'dashBorder')}
        id="importExcel"
      >
        <img className="uploadImg" src={file.name ? importActiveImg : importDisabledImg}></img>
        {renderFileInfo()}
        <QiniuUpload
          ref={uploaderWrap}
          className="upgradeAppUpload mTop24"
          options={{
            filters: {
              mime_types: [{ extensions: 'mdy' }],
            },
          }}
          onAdd={() => {
            setState({ errTip: '', upgradeId: '' });
          }}
          onBeforeUpload={(up, file) => {
            !analyzeLoading && setState({ file: file, analyzeLoading: true, upgradeId: '' });
          }}
          onUploaded={onUploadComplete}
          onError={() => {
            setState({
              file: {},
              upgradeId: '',
              url: '',
              errTip: _l('文件上传失败'),
              analyzeLoading: false,
            });
          }}
        >
          {!file.name ? (
            <Button type="primary" radius className={cx({ Visibility: analyzeLoading })}>
              {_l('上传文件')}
            </Button>
          ) : (
            <div
              className={cx('ThemeColor Hand', {
                Visibility: analyzeLoading,
              })}
            >
              {_l('重新上传')}
            </div>
          )}
        </QiniuUpload>
        {file.name && (
          <div className={cx('flexRow mTop16', { Hidden: file.loaded === file.size })}>
            <Progress
              style={{ width: 250 }}
              trailColor="#eaeaea"
              strokeColor="#1677ff"
              strokeWidth={8}
              percent={Math.floor((file.loaded / (file.size || 0)) * 100)}
            />
            <span
              className="icon-cancel Gray_9e Font16 Hover_49 mLeft12 LineHeight22"
              onClick={() => {
                uploaderWrap.current.uploader.stop();
                uploaderWrap.current.uploader.removeFile(file);
                setState({
                  file: {},
                  errTip: '',
                  upgradeId: '',
                  analyzeLoading: false,
                });
              }}
            ></span>
          </div>
        )}
        {/* {file.name && file.loaded === file.size && !errTip && (
          <div className="flexRow mTop16">
            <div className="notificationIconWrap">
              <i className="icon-loading_button Font20 ThemeColor3"></i>
            </div>
            <span className="Gray_75 mLeft10">{_l('正在解析文件...')}</span>
          </div>
        )} */}
      </div>
    );
  };
  return (
    <Dialog
      title={_l('导入连接')}
      visible={true}
      footer={null}
      width={640}
      overlayClosable={false}
      onCancel={() => onClose()}
    >
      <Wrap className="importAppContainer">
        <div className="mBottom24">
          <span className="Gray_75">{_l('导入连接配置文件，生成一个新的连接')}</span>
          <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/application/import-export" />
        </div>
        {renderStepContent()}
        {file.name && upgradeId && (
          <div className="exportBottomOption mTop16">
            <button type="button" className="ming Button Button--link Hover_49 Bold" onClick={() => onClose()}>
              {_l('取消')}
            </button>
            <button
              type="button"
              className="ming Button Button--primary Hover_49 importBtn Bold mLeft20"
              onClick={() => importConnect()}
            >
              {_l('立即导入')}
            </button>
          </div>
        )}
      </Wrap>
    </Dialog>
  );
}
