import React, { Component } from 'react';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, QiniuUpload } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import FunctionWrap from 'ming-ui/components/FunctionWrap';
import appManagementAjax from 'src/api/appManagement';
import importActiveImg from 'src/pages/Admin/app/appManagement/img/import_active.png';
import importDisabledImg from 'src/pages/Admin/app/appManagement/img/import_disabled.png';

const passwordData = [
  { title: _l('导入密码'), key: 'importPassword' },
  { title: _l('应用锁密码'), key: 'lockPassword' },
];

const DialogWrap = styled(Dialog)`
  .mui-dialog-default-title {
    .title {
      font-weight: 500;
    }
  }
  .mui-dialog-body {
    padding: 0 20px 30px;
  }
`;
const Wrap = styled.div`
  width: 648px;
  height: 432px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow-y: auto;
  border: 1px dashed #e0e0e0;
  box-sizing: border-box;
  margin-bottom: 20px;
  .uploadImg {
    width: 52px;
    height: 59px;
    margin-bottom: 15px;
  }
  .passwordWrap {
    width: 476px;
    .password {
      width: 180px;
      height: 32px;
      padding-left: 10px;
      display: inline-block;
      line-height: 32px;
      background: #f5f5f5;
      border-radius: 3px 3px 3px 3px;
    }
  }
  .successTxt {
    font-size: 14px;
    color: #4caf50;
    margin-top: 20px;
  }
`;

export default class Dectypt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {},
      importPassword: '', //导入密码
      lockPassword: '', //应用锁密码
    };
  }

  checkFile = () => {
    const { projectId } = this.props;
    const { url, file } = this.state;
    this.setState({ checkLoading: true });

    appManagementAjax
      .getMdyInfo({
        projectId,
        url,
        name: file.name,
      })
      .then(res => {
        const { resultCode, password, lockPassword } = res;
        if (resultCode === 0) {
          alert(_l('文件无法解析，请重新上传'), 2);
        } else if (resultCode === 2) {
          alert(_l('该文件不是当前组织的应用，请重新上传'), 2);
        } else if (resultCode === 3) {
          alert(_l('该文件没有任何密码，无需解密'), 2);
        }
        this.setState({
          importPassword: password,
          lockPassword,
          checkLoading: false,
          file: _.includes([0, 2, 3], resultCode) ? {} : file,
        });
      })
      .catch(() => {
        this.setState({
          importPassword: '',
          lockPassword: '',
          checkLoading: false,
          file: {},
        });
      });
  };

  render() {
    const { onCancel = () => {} } = this.props;
    const { file = {}, analyzeLoading, checkLoading, importPassword, lockPassword } = this.state;
    const loading = analyzeLoading || checkLoading;

    return (
      <DialogWrap
        visible
        onCancel={onCancel}
        footer={null}
        width={696}
        title={
          <div className="Font18 Black Normal">
            <span className="TxtMiddle title">{_l('获取文件密码')}</span>
            <span className="Gray_9e Font13"> {_l('上传应用 .mdy文件，获取导入密码、应用锁密码')}</span>
          </div>
        }
      >
        <Wrap>
          <img className="uploadImg" src={file.name ? importActiveImg : importDisabledImg}></img>
          <div className={cx('Gray_bd', { hide: file.name })}>{_l('请选择.mdy格式的应用文件')}</div>
          <QiniuUpload
            ref={ele => (this.uploaderWrap = ele)}
            className={cx('upgradeAppUpload mTop24', { hide: file.name })}
            options={{
              filters: {
                mime_types: [{ extensions: 'mdy' }],
              },
            }}
            onAdd={up => {
              this.setState({ analyzeLoading: true });
              up.disableBrowse();
            }}
            onBeforeUpload={(up, file) => {
              this.setState({ file });
            }}
            onUploaded={(up, file, response) => {
              up.disableBrowse(false);
              const { key } = response;
              this.setState(
                {
                  file: file,
                  url: md.global.FileStoreConfig.documentHost + '/' + key,
                  analyzeLoading: false,
                },
                this.checkFile,
              );
            }}
            onError={() => {
              alert(_l('文件上传失败'), 2);
              this.setState({
                file: {},
                url: '',
                password: '',
                analyzeLoading: false,
              });
            }}
          >
            <Button radius>{_l('上传文件')}</Button>
          </QiniuUpload>
          <div className="Font15 Black w100 pLeft10 pRight10 ellipsis TxtCenter">{file.name}</div>
          {loading && file.name && (
            <div className="flexRow mTop16">
              <div className="notificationIconWrap">
                <i className="icon-loading_button Font20 ThemeColor3"></i>
              </div>
              {<span className="Gray_75 mLeft10">{_l('正在解析文件...')}</span>}
            </div>
          )}
          {!loading && (importPassword || lockPassword) && <div className="successTxt">{_l('解密成功')}</div>}
          <div className="passwordWrap flexRow mTop80 justifyContentCenter">
            {passwordData.map(item => {
              if (!this.state[item.key]) return;
              return (
                <div key={item.key} style={{ marginRight: item.key === 'importPassword' ? 68 : 0 }}>
                  <div className="mBottom8 Gray_75 Font14">{item.title}</div>
                  <div>
                    <span className="password">{this.state[item.key]}</span>
                    <Tooltip title={_l('复制')}>
                      <i
                        className="icon icon-copy Hand Gray_9e Font16 mLeft8"
                        onClick={() => {
                          copy(this.state[item.key]);
                          alert(_l('复制成功'));
                        }}
                      />
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </Wrap>
      </DialogWrap>
    );
  }
}

export const decryptFunc = props => FunctionWrap(Dectypt, props);
