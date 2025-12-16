import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, FunctionWrap, QiniuUpload, Support, VerifyPasswordConfirm } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import importActiveImg from 'src/pages/Admin/app/appManagement/img/import_active.png';
import importDisabledImg from 'src/pages/Admin/app/appManagement/img/import_disabled.png';
import { navigateTo } from 'src/router/navigateTo';
import { formatFileSize } from 'src/utils/common';
import { RestoreContent } from './RestoreAppDialog';

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
  .errTip {
    color: #f51744;
  }
`;

const SupportWrap = styled(Support)`
  .customStyle {
    color: #9e9e9e !important;
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
    this.timer = null;
  }

  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
  }

  checkFile = () => {
    const { appId } = this.props;
    const { file, url } = this.state;
    appManagementAjax
      .checkRestoreFile({ appId, fileUrl: url, fileName: file.name })
      .then(({ state, appItemCount, time, fileType, id, rowCount, containData }) => {
        if (fileType === 1) {
          this.getTarTaskInfo(id);
        } else {
          // mdy文件
          this.setState({
            checkLoading: false,
            checkSuccess: state === 1,
            time,
            analyzeLoading: false,
            fileType,
            appItemCount,
            rowCount,
            containData,
            errTip: _.includes([2, 4], state) ? _l('文件校验失败，只能通过本应用备份文件来还原') : '',
          });
        }
      })
      .catch(() => {
        this.setState({ checkLoading: false, checkSuccess: false, analyzeLoading: false });
      });
  };

  // 获取tar文件上传状态
  getTarTaskInfo = id => {
    const { appId } = this.props;

    appManagementAjax
      .getTarTaskInfo({ id, appId })
      .then(({ state, appItemCount, time, rowCount, fileType }) => {
        clearTimeout(this.timer);

        if (!_.includes([1, 2, 4], state)) {
          this.timer = setTimeout(() => {
            this.getTarTaskInfo(id);
          }, 1000);
          return;
        }

        this.setState({
          checkLoading: false,
          checkSuccess: state === 1,
          appItemCount,
          time,
          analyzeLoading: false,
          rowCount,
          fileType,
          errTip: _.includes([2, 4], state) ? _l('文件校验失败，只能通过本应用备份文件来还原') : '',
          taskId: id,
        });
      })
      .catch(() => {
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
            mime_types: [{ extensions: 'mdy,mdyd' }],
          },
          type: 21,
        }}
        onAdd={() => {
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
              url: md.global.FileStoreConfig.documentHost + '/' + key,
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
    const { backupCurrentVersion, containData } = data;
    const { projectId, appId } = this.props;
    const { file = {}, taskId, fileType, url } = this.state;
    VerifyPasswordConfirm.confirm({
      onOk: () => {
        if (fileType === 1) {
          appManagementAjax
            .restoreData({ id: taskId, projectId, appId, fileUrl: url, fileName: file.name, backupCurrentVersion })
            .then(res => {
              if (res.data) {
                navigateTo(`/app/${appId}`);
              }
            });
        } else {
          appManagementAjax
            .restore({
              projectId,
              appId,
              autoEndMaintain: false,
              backupCurrentVersion,
              isRestoreNew: false,
              containData,
              fileUrl: url,
              fileName: file.name,
            })
            .then(res => {
              if (res) {
                navigateTo(`/app/${appId}`);
              }
            });
        }
      },
    });
  };

  render() {
    const { onCancel = () => {}, appName, validLimit, currentValid } = this.props;
    const {
      file,
      checkLoading,
      analyzeLoading,
      errTip,
      checkSuccess,
      appItemCount,
      time,
      fileType,
      rowCount,
      containData,
    } = this.state;

    return (
      <Dialog
        visible
        title={
          <Fragment>
            <span className="TxtMiddle">{_l('从文件还原')}</span>
            <SupportWrap className="customStyle" type={1} href="https://help.mingdao.com/application/backup-restore/" />
          </Fragment>
        }
        footer={null}
        width={600}
        onCancel={onCancel}
      >
        {!checkLoading && checkSuccess ? (
          <RestoreContent
            validLimit={validLimit}
            currentValid={currentValid}
            containData={containData}
            time={time}
            isFileRestore={true}
            appName={appName}
            appItemTotal={appItemCount}
            rowTotal={rowCount}
            handleRestore={this.handleRestore}
            onCancel={onCancel}
            fileType={fileType}
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
                    <span className="icon-cancel Font15 mRight6"></span>
                    <span>{_l(errTip)}</span>
                  </div>
                )}
              </Fragment>
            ) : (
              <div className="Gray_bd">{_l('请选择 *.mdy 或 *.mdyd 格式的备份文件')}</div>
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
