import React, { useEffect, useState } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import { Button, Dialog, Icon, Input, QiniuUpload, Support, SvgIcon } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import fileApi from 'src/api/file';
import importActiveImg from 'src/pages/Admin/app/appManagement/img/import_active.png';
import importDisabledImg from 'src/pages/Admin/app/appManagement/img/import_disabled.png';
import { formatFileSize } from 'src/utils/common';
import { fileCheckErrorMsg } from '../config';
import { API_EXTENDS, pluginApiConfig } from '../config';

const UploadWrapper = styled.div`
  .uploadBox {
    width: 100%;
    height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    border: 1px dashed #eaeaea;
    box-sizing: border-box;
    .uploadImg {
      width: 52px;
      height: 59px;
      margin-bottom: 15px;
    }
    .error {
      color: #f44336;
    }
  }
`;

const PluginInfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  .labelText {
    width: 80px;
  }
  .selectItem {
    flex: 1;
    font-size: 13px;
    .ant-select-selector {
      min-height: 36px;
      padding: 2px 11px !important;
      border: 1px solid #ccc !important;
      border-radius: 3px !important;
      box-shadow: none !important;
    }
    &.ant-select-focused {
      .ant-select-selector {
        border-color: #1e88e5 !important;
      }
    }
  }
`;

function ExistPluginDialog(props) {
  const { onClose, pluginInfo, onImport, importing, projectId, pluginType } = props;
  const [pluginList, setPluginList] = useState([]);
  const [pluginId, setPluginId] = useState(undefined);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const { pluginSourceId, name, versionCode, releaseTime } = pluginInfo;

  const pluginApi = pluginApiConfig[pluginType];

  useEffect(() => {
    pluginSourceId &&
      pluginApi.getPluginListBySourece({ projectId, sourceId: pluginSourceId }, API_EXTENDS).then(res => {
        res && setPluginList(res);
      });
  }, [pluginSourceId]);

  const footer = (
    <div className="flexRow alignItemsCenter justifyContentRight">
      <Button type="link" onClick={onClose}>
        {_l('取消')}
      </Button>
      <Button
        onClick={() => {
          setIsCreateLoading(false);
          onImport(false, pluginId === 'create' ? undefined : pluginId);
        }}
      >
        <div className="flexRow alignItemsCenter">
          {importing && !isCreateLoading && (
            <div className="notificationIconWrap mRight8">
              <i className="icon-loading_button Font20 White"></i>
            </div>
          )}
          {_l('确认')}
        </div>
      </Button>
    </div>
  );

  return (
    <Dialog
      visible
      width={580}
      title={_l('检测到已有插件')}
      description={_l('检测到当前组织中存在相同的插件，您可以选择导入已有插件或者创建一个新插件')}
      footer={footer}
      onCancel={onClose}
    >
      <PluginInfoItem className="mTop24">
        <div className="labelText">{_l('将插件')}</div>
        <div className="bold">{[name, versionCode, `(${releaseTime})`].join(' ')}</div>
      </PluginInfoItem>
      <PluginInfoItem className="mBottom0">
        <div className="labelText">{_l('导入到')}</div>
        <Select
          className="selectItem"
          allowClear={true}
          options={[{ label: _l('创建新插件'), value: 'create' }].concat(
            pluginList.map(item => {
              return {
                label: (
                  <span>
                    {[item.name, item.currentVersion.versionCode, `(${item.currentVersion.releaseTime})`].join(' ')}
                  </span>
                ),
                value: item.id,
              };
            }),
          )}
          notFoundContent={_l('暂无发布历史')}
          value={pluginId}
          onChange={value => setPluginId(value)}
        />
      </PluginInfoItem>
    </Dialog>
  );
}

function ImportPlugin(props) {
  const { onClose, projectId, pluginId, onImportCreateSuccess, pluginType } = props;
  const [file, setFile] = useState({});
  const [uploading, setUploading] = useState(false);
  const [fileChecking, setFileChecking] = useState(false);
  const [errorTip, setErrorTip] = useState('');
  const [isEncrypt, setIsEncrypt] = useState(false);
  const [password, setPassword] = useState('');
  const [pluginInfo, setPluginInfo] = useState({});
  const [importing, setImporting] = useState(false);
  const [existVisible, setExistVisible] = useState(false);

  const pluginApi = pluginApiConfig[pluginType];

  const onCheckFile = async (url, alertError) => {
    setFileChecking(true);
    let checkSuccess = false;
    await fileApi
      .check({ projectId, source: 1, url, pluginId, password: isEncrypt ? password : undefined })
      .then(res => {
        setFileChecking(false);
        switch (res.resultCode) {
          case 0: //成功
            setPluginInfo(res.metadata || {});
            checkSuccess = true;
            break;
          case 2: //需要输入密码
            setIsEncrypt(true);
            setPluginInfo(res.metadata || {});
            break;
          case 13:
            setExistVisible(true);
            setPluginInfo(res.metadata || {});
            break;
          default:
            const error = fileCheckErrorMsg[res.resultCode] || _l('文件解析错误');
            alertError ? alert(error, 2) : setErrorTip(error);
            break;
        }
      })
      .catch(() => {
        alertError ? alert(_l('文件解析错误'), 2) : setErrorTip(_l('文件解析错误'));
        setFileChecking(false);
      });
    return checkSuccess;
  };

  const onImport = async (needCheck, pluginId) => {
    setImporting(true);
    const url = md.global.FileStoreConfig.documentHost + '/' + file.key;
    const checkSuccess = !needCheck || !!(await onCheckFile(url, true));
    if (checkSuccess) {
      pluginApi
        .import({ projectId, url, pluginId }, API_EXTENDS)
        .then(res => {
          setImporting(false);
          if (res === 1) {
            alert(_l('导入插件成功'));
            onImportCreateSuccess && onImportCreateSuccess();
            onClose();
          } else {
            alert(_l('导入插件失败'), 2);
          }
        })
        .catch(() => setImporting(false));
    } else {
      setImporting(false);
    }
  };

  const renderUpload = children => {
    return (
      <QiniuUpload
        className="mTop24"
        options={{
          multi_selection: false,
          filters: {
            mime_types: [{ extensions: 'mdye' }],
          },
        }}
        onAdd={() => {
          //   setUploading(true);
          setErrorTip('');
          setIsEncrypt(false);
        }}
        onUploaded={(up, file, response) => {
          setUploading(false);
          setFile({ ...file, key: response.key });
          const url = md.global.FileStoreConfig.documentHost + '/' + response.key;
          onCheckFile(url);
        }}
        onError={() => {
          alert(_l('上传失败, 请选择.mdye格式文件'), 2);
          setFile({});
          setUploading(false);
        }}
      >
        {children}
      </QiniuUpload>
    );
  };

  const renderPluginInfo = () => {
    const { name, iconUrl, iconColor, versionCode, author, releaseTime, description, type } = pluginInfo;
    return (
      <React.Fragment>
        <div className="flexRow mTop24">
          <PluginInfoItem className="flex">
            <div className="labelText">{_l('名称')}</div>
            {iconUrl ? (
              <SvgIcon url={iconUrl} fill={iconColor} size={16} />
            ) : (
              <Icon icon="extension" className="Font16 Gray_bd" />
            )}
            <span title={name} className="mLeft8 bold overflow_ellipsis">
              {name}
            </span>
          </PluginInfoItem>
          <PluginInfoItem className="flex">
            <div className="labelText">{_l('插件类型')}</div>
            <div className="bold">{type === 1 ? _l('视图') : ''}</div>
          </PluginInfoItem>
        </div>
        <div className="flexRow">
          <PluginInfoItem className="flex">
            <div className="labelText">{_l('版本')}</div>
            <div className="bold">{versionCode}</div>
          </PluginInfoItem>
          <PluginInfoItem className="flex">
            <div className="labelText">{_l('作者')}</div>
            <div className="bold">{author}</div>
          </PluginInfoItem>
        </div>
        <PluginInfoItem className="flex">
          <div className="labelText">{_l('发布时间')}</div>
          <div className="bold">{moment(releaseTime).format('YYYY-MM-DD HH:mm:ss')}</div>
        </PluginInfoItem>
        <PluginInfoItem className="flex">
          <div className="labelText">{_l('发布说明')}</div>
          <div className="bold">{description}</div>
        </PluginInfoItem>
        {isEncrypt && (
          <PluginInfoItem>
            <div className="labelText">{_l('密码')}</div>
            <Input
              className="flex"
              placeholder={_l('请输入导出时设置的密码')}
              value={password}
              onChange={value => setPassword(value)}
            />
          </PluginInfoItem>
        )}
      </React.Fragment>
    );
  };

  return (
    <Dialog
      visible
      width={580}
      title={_l('导入插件')}
      showFooter={!_.isEmpty(pluginInfo)}
      okDisabled={isEncrypt && !password}
      okText={
        <div className="flexRow alignItemsCenter">
          {importing && (
            <div className="notificationIconWrap mRight8">
              <i className="icon-loading_button Font20 White"></i>
            </div>
          )}
          <span>{!pluginId ? _l('导入创建') : _l('导入')}</span>
        </div>
      }
      onOk={() => !importing && onImport(isEncrypt, pluginId)}
      onCancel={onClose}
    >
      {_.isEmpty(pluginInfo) ? (
        <UploadWrapper>
          <div className="Gray_75 mBottom24">
            {_l('将插件文件导入组织创建一个新的插件，启用后即可在全组织范围内使用。')}
            <Support text={_l('帮助')} type={3} href="https://help.mingdao.com/" />
          </div>
          <div className="uploadBox">
            <img className="uploadImg" src={file.name ? importActiveImg : importDisabledImg} />
            {file.name ? (
              <React.Fragment>
                <div className="Font17">{file.name}</div>
                <div className="Gray_75 mTop6">{_l('大小：') + formatFileSize(file.size)}</div>
                {errorTip && (
                  <div className="mTop15 error Font14">
                    <span className="icon-cancel Font15 mRight6"></span>
                    <span>{_l(errorTip)}</span>
                  </div>
                )}
              </React.Fragment>
            ) : (
              <div className="Gray_9e">{_l('请选择.mdye格式的应用文件')}</div>
            )}
            {(fileChecking || uploading) && (
              <div className="flexRow mTop16">
                <div className="notificationIconWrap">
                  <i className="icon-loading_button Font20 ThemeColor3"></i>
                </div>
                {<span className="Gray_75 mLeft10">{fileChecking ? _l('正在解析文件...') : _l('文件上传中...')}</span>}
              </div>
            )}

            {!(fileChecking || uploading) &&
              (_.isEmpty(file)
                ? renderUpload(
                    <Button type="primary" radius>
                      {_l('上传文件')}
                    </Button>,
                  )
                : renderUpload(<div className="ThemeColor Hand">{_l('重新上传')}</div>))}
          </div>
        </UploadWrapper>
      ) : (
        renderPluginInfo()
      )}

      {existVisible && (
        <ExistPluginDialog
          onClose={() => setExistVisible(false)}
          pluginInfo={pluginInfo}
          onImport={onImport}
          importing={importing}
          projectId={projectId}
          pluginType={pluginType}
        />
      )}
    </Dialog>
  );
}

export default props => functionWrap(ImportPlugin, { ...props });
