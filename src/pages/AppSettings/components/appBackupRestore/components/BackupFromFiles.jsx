import React, { Component, Fragment } from 'react';
import { Dialog, QiniuUpload, Button, FunctionWrap, VerifyPasswordConfirm } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import { RestoreContent } from './RestoreAppDialog';
import appManagementAjax from 'src/api/appManagement';
import { formatFileSize } from 'src/util';
import importDisabledImg from 'src/pages/Admin/app/appManagement/img/import_disabled.png';
import importActiveImg from 'src/pages/Admin/app/appManagement/img/import_active.png';

const Wrap = styled.div`
  height: 340px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  .uploadImg {
    width: 52px;
    height: 59px;
    margin-bottom: 15px;
  }
`;

class BackupFromFilesCom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {},
      errTip: '',
      checkLoading: true,
      currentBackChecked: false,
      appItemChecked: false,
      dataChecked: false,
    };
  }

  checkFile = () => {
    const { appId } = this.props;
    const { file } = this.state;
    appManagementAjax
      .checkRestoreFile({ appId, fileUrl: file.url })
      .then(({ state, appItemCount, time }) => {
        state = 1;
        this.setState({ checkLoading: false, checkSuccess: state === 1, appItemCount, time, analyzeLoading: false });
      })
      .catch(err => {
        this.setState({ checkLoading: false, checkSuccess: false, analyzeLoading: false });
      });
  };

  renderUploadBtn = children => {
    return (
      <QiniuUpload
        ref={ele => (this.uploaderWrap = ele)}
        className="upgradeAppUpload mTop24"
        options={{
          filters: {
            mime_types: [{ extensions: 'mdy' }],
          },
        }}
        onAdd={(up, files) => {
          this.setState({ isEncrypt: false, errTip: '' });
        }}
        onBeforeUpload={(up, file) => {
          setTimeout(() => {
            this.setState({ file, analyzeLoading: true });
          }, 200);
        }}
        onUploaded={(up, file, response) => {
          const { key } = response;
          this.setState(
            {
              file: file,
              url: md.global.FileStoreConfig.documentHost + key,
              errTip: '',
            },
            this.checkFile,
          );
        }}
        onError={() => {
          this.setState({
            file: {},
            url: '',
            password: '',
            errTip: _l('文件上传失败'),
            analyzeLoading: false,
          });
        }}
      >
        {children}
      </QiniuUpload>
    );
  };

  // 还原
  handleRestore = data => {
    this.props.onCancel();
    const { backupCurrentVersion } = data;
    const { projectId, appId } = this.props;
    const { file = {} } = this.state;
    VerifyPasswordConfirm.confirm({
      onOk: () => {
        let params = {
          projectId,
          appId,
          autoEndMaintain: false,
          backupCurrentVersion,
          isRestoreNew: false,
          containData: false,
          fileUrl: file.url,
          fileName: file.name,
        };

        appManagementAjax.restore(params).then(res => {
          if (res) {
            props.getBackupCount();
          }
        });
      },
    });
  };

  render() {
    const { onCancel = () => {}, appName, validLimit, currentValid } = this.props;
    const { file, checkLoading, analyzeLoading, errTip, checkSuccess, appItemCount, time } = this.state;

    return (
      <Dialog
        visible
        title={!checkLoading && checkSuccess ? _l('还原备份 "%0"', file.name) : _l('从文件还原')}
        footer={null}
        width={600}
        onCancel={onCancel}
      >
        {!checkLoading && checkSuccess ? (
          <RestoreContent
            validLimit={validLimit}
            currentValid={currentValid}
            containData={false}
            time={time}
            isFileRestore={true}
            appName={appName}
            appItemTotal={appItemCount}
            handleRestore={this.handleRestore}
            onCancel={onCancel}
          />
        ) : (
          <Wrap>
            <img className="uploadImg" src={file.name ? importActiveImg : importDisabledImg}></img>
            {file.name ? (
              <Fragment>
                <div className="Font17">{file.name}</div>
                <div className="Gray_75 mTop6">{_l('大小：%0', formatFileSize(file.size))}</div>
                {errTip && (
                  <div className="mTop15 errTip Font14">
                    <span className="icon-closeelement-bg-circle Font15 mRight6"></span>
                    <span>{_l(errTip)}</span>
                  </div>
                )}
              </Fragment>
            ) : (
              <div className="Gray_bd">{_l('请选择.mdy格式的应用文件')}</div>
            )}
            {analyzeLoading && (
              <div className="flexRow mTop16">
                <div className="notificationIconWrap">
                  <i className="icon-loading_button Font20 ThemeColor3"></i>
                </div>
                <span className="Gray_75 mLeft10">{_l('正在解析文件...')}</span>
              </div>
            )}
            {_.isEmpty(file)
              ? this.renderUploadBtn(
                  <Button type="primary" radius className={cx({ Visibility: analyzeLoading })}>
                    {_l('上传文件')}
                  </Button>,
                )
              : this.renderUploadBtn(
                  <div className={cx('ThemeColor Hand', { Visibility: analyzeLoading })}>{_l('重新上传')}</div>,
                )}
          </Wrap>
        )}
      </Dialog>
    );
  }
}

export default props => FunctionWrap(BackupFromFilesCom, { ...props });
