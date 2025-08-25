import React, { Fragment, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Icon, LoadDiv, QiniuUpload, SvgIcon } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';

const FileListWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-height: 0;
  border-radius: 8px;
  overflow-y: auto;
  border: 1px dashed #eaeaea;
  box-sizing: border-box;
  margin-bottom: 20px;
  flex: 1;
  padding: 32px 0 32px 56px;
  ::-webkit-scrollbar-thumb {
    background: #f5f5f5;
    background-clip: padding-box;
  }
  .upgradeAppUploadButton {
    width: fit-content;
  }
`;

const FileItemWrap = styled.div`
  display: flex;
  align-items: center;
  .itemInfo {
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    width: 310px;
    height: 72px;
    padding: 0 24px 0 16px;
    display: flex;
    align-items: center;
    .iconWrap {
      width: 40px;
      height: 40px;
      display: inline-block;
      background: #fff;
      border-radius: 4px 4px 4px 4px;
      color: #fff;
      text-align: center;
      line-height: 40px;
      .icon,
      svg {
        vertical-align: middle !important;
      }
    }
  }
  .addFileButton {
    .iconWrap {
      border: 1px dashed #bdbdbd;
    }
  }
  .greenColor {
    color: #4caf50;
  }
  .redColor {
    color: #f44336;
  }
  .passwordInputBox {
    width: 248px;
    line-height: 40px;
    border: 1px solid #1677ff;
    border-radius: 3px;
    padding: 0 12px;
    box-sizing: border-box;
  }
`;

const CHECK_FILE_ERROR_TEXT = {
  '-1': _l('请求校验异常'),
  1: _l('文件中包含多个应用'),
  4: _l('重试超过6次'),
  5: _l('解析错误'),
  6: _l('工作表数量超标'),
};

const MAX_FILES = 20;

export default function UpgradeFileList(props) {
  const { files, projectId, addFilesLoading, batchCheckFiles, updateFiles } = props;
  const [passwords, setPasswords] = useState({});
  const uploadFiles = useRef([]);

  const onDelete = fileName => {
    const item = _.find(files, l => l.fileName === fileName);
    const password = (passwords[item.fileName] || '').trim();

    if (!password && [2, 3].includes(item.code)) {
      alert(_l('请输入密码'), 2);
      return;
    }

    appManagementAjax
      .batchImportCheck({
        projectId,
        removed: true,
        password,
        ..._.pick(item, ['batchId', 'url']),
      })
      .then(res => {
        switch (res.code) {
          case 0:
            updateFiles(files.filter(l => l.fileName !== fileName));
            break;
          case 10004:
            password ? alert(_l('密码不正确，请重新输入密码'), 2) : alert(_l('删除失败'), 2);
            break;
          default:
            alert(_l('删除失败'), 2);
        }
      });
  };

  const renderItemStatus = item => {
    switch (item.code) {
      case 0:
        return <span className="Gray_9e">{_l('已上传')}</span>;
      case -1:
      case 1:
      case 4:
      case 5:
      case 6:
        return (
          <Fragment>
            <Icon icon="info_outline" className="mRight3 redColor Font15" />
            <span className="redColor">{CHECK_FILE_ERROR_TEXT[String(item.code)]}</span>
          </Fragment>
        );
      case 2:
      case 3:
        return (
          <Fragment>
            <input
              className="passwordInputBox mRight20"
              placeholder={_l('请输入密码')}
              value={passwords[item.fileName]}
              onChange={e => setPasswords({ ...passwords, [item.fileName]: e.target.value })}
            />
            <Button
              type="primary"
              disabled={!(passwords[item.fileName] || '').trim()}
              onClick={() => batchCheckFiles([{ ...item, password: passwords[item.fileName].trim() }], true)}
            >
              {_l('确认')}
            </Button>
          </Fragment>
        );
      default:
        return null;
    }
  };

  const renderAddButton = () => {
    const count = files.length || 0;

    return (
      <QiniuUpload
        className="upgradeAppUploadButton mTop24"
        key={`upgradeAppUploadButton-${count}`}
        options={{
          filters: {
            mime_types: [{ extensions: 'mdy' }],
          },
        }}
        onUploaded={(up, file, response) => {
          const { key } = response;
          uploadFiles.current = uploadFiles.current.concat({ ...file, key });

          if (up.files.length === uploadFiles.current.length) {
            batchCheckFiles(uploadFiles.current.slice(0, MAX_FILES - count));
            uploadFiles.current = [];
          }
        }}
        onError={() => {
          alert(_l('文件上传失败'), 3);
        }}
      >
        <FileItemWrap className="Hand">
          <div className="itemInfo addFileButton">
            <span className="iconWrap mRight10">
              <Icon icon="add" className="icon Font16 Gray_bd" />
            </span>
            <span className="flex overflow_ellipsis Font15 ThemeColor">{_l('上传文件')}</span>
          </div>
        </FileItemWrap>
      </QiniuUpload>
    );
  };

  return (
    <FileListWrap>
      {files.map((item, i) => {
        const appInfo = _.get(item, 'apps[0]') || {};
        return (
          <FileItemWrap key={`UpgradeFileList-${i}-${item.fileName}`}>
            <div className="itemInfo mRight20">
              <span className="iconWrap mRight10" style={{ background: appInfo.iconColor }}>
                <SvgIcon url={appInfo.iconUrl} fill="#fff" size={24} />
              </span>
              <span className="flex name overflow_ellipsis Font15">{appInfo.name}</span>
              <span className="remove Font13 Gray_9e Hand" onClick={() => onDelete(item.fileName)}>
                {_l('移除')}
              </span>
            </div>
            <Icon icon="check_circle" className={cx('mRight16 Font20', item.code === 0 ? 'greenColor' : 'Gray_bd')} />
            {renderItemStatus(item)}
          </FileItemWrap>
        );
      })}
      {addFilesLoading && <LoadDiv size="middle" className="" />}
      {files.length < MAX_FILES && renderAddButton()}
    </FileListWrap>
  );
}
