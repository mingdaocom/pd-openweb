import React, { Component, Fragment } from 'react';
import { Button, Icon, Dialog, Input, LoadDiv } from 'ming-ui';
import { getRandStr } from 'src/components/UploadFiles/utils';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import Config from '../config';
import styled from 'styled-components';
import application from 'src/api/application';
import { getToken } from 'src/util';
import 'rc-trigger/assets/index.css';
import './index.less';
import RegExp from 'src/util/expression';

const UploadContent = styled.div`
  align-items: flex-end;
  #uploadAppIcon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    border: 1px dashed #d9d9d9;
    border-radius: 2px;
    cursor: pointer;
    margin-right: 10px;
  }
  .MdLoader-path {
    stroke: #9e9e9e;
  }
  .avatarUrl {
    width: 88%;
    border-radius: 4px;
  }
`;

class Moreop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menuVisible: false,
    };
  }
  render() {
    return (
      <Trigger
        action={['click']}
        popupVisible={this.state.menuVisible}
        onPopupVisibleChange={visible => {
          this.setState({ menuVisible: visible });
        }}
        popup={
          <div className="card pTop10 pBottom10 z-depth-2 applicationTriggerWrapper">
            <div
              className="item pointer"
              onClick={() => {
                this.setState({ menuVisible: false });
                this.props.onEdit();
              }}
            >
              {_l('编辑')}
            </div>
            <div
              className="item pointer"
              onClick={() => {
                this.setState({ menuVisible: false });
                this.props.onDelete();
              }}
            >
              {_l('删除')}
            </div>
          </div>
        }
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
          overflow: { adjustX: true, adjustY: true },
        }}
      >
        <Icon className="pointer Font17 Gray_75" icon="moreop" />
      </Trigger>
    );
  }
}

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      uploadAvatarUrl: '',
      uploadAvatar: '',
    };
  }
  componentDidMount() {
    this.uploadFile();
  }
  uploadFile() {
    const _this = this;
    $(this.uploadFileEl).plupload({
      url: md.global.FileStoreConfig.uploadHost,
      file_data_name: 'file',
      multi_selection: false,
      max_file_size: '10mb',
      filters: {
        mime_types: [{ title: _l('图片'), extensions: 'gif,png,jpg,jpeg,bmp' }],
        prevent_duplicates: false,
        max_file_size: 0,
      },
      autoUpload: false,
      method: {
        FilesAdded(up, files) {
          _this.setState({ loading: true });
          const tokenFiles = [];

          // 渲染图片列表
          files.forEach(item => {
            let fileExt = `.${File.GetExt(item.name)}`;
            tokenFiles.push({ bucket: 2, ext: fileExt });
          });

          getToken(tokenFiles, 6).then(res => {
            files.forEach((item, i) => {
              item.token = res[i].uptoken;
              item.key = res[i].key;
              item.serverName = res[i].serverName;
              item.fileName = res[i].fileName;
            });

            up.start();
          });
        },
        BeforeUpload(up, file) {
          const fileExt = `.${File.GetExt(file.name)}`;

          up.settings.multipart_params = { token: file.token };
          up.settings.multipart_params.key = file.key;
          up.settings.multipart_params['x:serverName'] = file.serverName;
          up.settings.multipart_params['x:filePath'] = file.key.replace(file.fileName, '');
          up.settings.multipart_params['x:fileName'] = file.fileName.replace(/\.[^\.]*$/, '');
          up.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
            file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
          );
          up.settings.multipart_params['x:fileExt'] = fileExt;
        },
        FileUploaded(up, file, res) {
          const data = JSON.parse(res.response);
          _this.setState({
            uploadAvatar: `${data.fileName}${data.fileExt}`,
            uploadAvatarUrl: `${data.serverName}${data.key}`,
          });
        },
        UploadComplete() {
          const { uploadAvatar, uploadAvatarUrl } = _this.state;
          _this.setState({ loading: false });
          _this.props.update({ uploadAvatar, uploadAvatarUrl });
        },
      },
    });
  }
  render() {
    const { avatarUrl } = this.props;
    const { uploadAvatarUrl } = this.state;
    return (
      <UploadContent className="flexRow">
        <div id="uploadAppIcon" ref={el => (this.uploadFileEl = el)}>
          {this.state.loading ? (
            <LoadDiv size="small" />
          ) : uploadAvatarUrl || avatarUrl ? (
            <img src={uploadAvatarUrl || avatarUrl} className="avatarUrl" />
          ) : (
            <Fragment>
              <Icon icon="add" className="Font22 Gray_9e" />
              <div className="ant-upload-text Gray_9e mTop10">{_l('上传')}</div>
            </Fragment>
          )}
        </div>
        <span className="Gray_9e">{_l('推荐尺寸')}</span>
        <span className="Gray_9e">{'240*240px'}</span>
      </UploadContent>
    );
  }
}

export default class ThirdpartyApp extends Component {
  constructor(props) {
    super(props);
    Config.setPageTitle(_l('第三方应用'));
    this.state = {
      applicationList: [],
      dialogVisible: false,
      loading: true,
      appName: '',
      about: '',
      appUrl: '',
      callbackUrl: '',
      avatarUrl: '',
      uploadAvatarUrl: '',
      currentAppItem: null,
      requestLoading: false,
      imageLoading: false,
    };
  }
  componentWillMount() {
    this.getProjectApplicationList();
  }
  getProjectApplicationList() {
    application
      .getProjectApplicationList({
        projectId: Config.projectId,
      })
      .then(result => {
        this.setState({
          loading: false,
          applicationList: result.map(item => {
            item.appSecretVisible = false;
            return item;
          }),
        });
      });
  }
  handleSetAppSecretVisible = item => {
    const { appId } = item;
    const { applicationList } = this.state;
    const newApplicationList = applicationList.map(item => {
      if (item.appId === appId) {
        item.appSecretVisible = !item.appSecretVisible;
      }
      return item;
    });
    this.setState({
      applicationList: newApplicationList,
    });
  };
  handleCreateApp = () => {
    const {
      appName,
      about,
      appUrl,
      callbackUrl,
      applicationList,
      currentAppItem,
      uploadAvatar,
      uploadAvatarUrl,
      avatarUrl,
    } = this.state;
    if (_.isEmpty(appName)) {
      alert('请输入应用名称', 3);
      return;
    }
    if (_.isEmpty(appUrl)) {
      alert('请输入应用地址', 3);
      return;
    } else if (!RegExp.isUrlRequest(appUrl)) {
      alert('请正确的 url 地址', 3);
      return;
    }
    if (_.isEmpty(callbackUrl)) {
      alert('请输入回调地址', 3);
      return;
    } else if (!RegExp.isUrlRequest(callbackUrl)) {
      alert('请正确的 url 地址', 3);
      return;
    }
    const params = {
      appName,
      about,
      appUrl,
      callbackUrl,
    };
    this.setState({ requestLoading: true });
    if (uploadAvatar) {
      params.avatar = uploadAvatar;
      params.avatarUrl = uploadAvatarUrl;
    } else {
      params.avatar = avatarUrl.replace(/.*\//g, '');
      params.avatarUrl = avatarUrl;
    }
    if (currentAppItem) {
      application
        .editApplication({
          appId: currentAppItem.appId,
          projectId: Config.projectId,
          ...params,
        })
        .then(result => {
          this.setState({ requestLoading: false });
          if (result) {
            alert(_l('修改成功'));
            this.handleHideDialog();
            this.setState({
              applicationList: applicationList.map(item => {
                if (item.appId === currentAppItem.appId) {
                  return {
                    ...item,
                    ...params,
                  };
                }
                return item;
              }),
            });
          } else {
            alert(_l('修改失败'), 2);
          }
        });
    } else {
      application
        .addApplication({
          projectId: Config.projectId,
          ...params,
        })
        .then(result => {
          this.setState({ requestLoading: false });
          if (result) {
            this.handleHideDialog();
            this.setState(
              {
                loading: true,
              },
              this.getProjectApplicationList,
            );
          } else {
            alert(_l('创建失败'), 2);
          }
        });
    }
  };
  handleEdit = item => {
    this.setState({
      dialogVisible: true,
      currentAppItem: item,
      appName: item.appName,
      about: item.about,
      appUrl: item.appUrl,
      callbackUrl: item.callbackUrl,
      avatarUrl: item.avatarUrl,
    });
  };
  handleDelete = item => {
    const { applicationList } = this.state;
    Dialog.confirm({
      title: _l('确认删除 %0 ?', item.appName),
      onOk: () => {
        return application
          .removeApplication({
            appId: item.appId,
            projectId: Config.projectId,
          })
          .then(result => {
            if (result) {
              alert(_l('删除成功'));
              this.setState({
                applicationList: applicationList.filter(n => n.appId !== item.appId),
              });
            } else {
              alert(_l('删除失败'), 2);
            }
          });
      },
    });
  };
  handleHideDialog = () => {
    this.setState({
      dialogVisible: false,
      currentAppItem: null,
      appName: '',
      about: '',
      appUrl: '',
      callbackUrl: '',
      avatarUrl: '',
    });
  };
  renderItme(item) {
    const { appSecretVisible } = item;
    return (
      <div className="applicationItem flexRow TxtCenter" key={item.appId}>
        <div className="appName overflow_ellipsis flexRow valignWrapper">
          <img className="avatarUrl" src={item.avatarUrl} />
          <span>{item.appName}</span>
        </div>
        <div className="about overflow_ellipsis">{item.about || '-'}</div>
        <div className="appKey overflow_ellipsis">{item.appKey}</div>
        <div className="appSecret flexRow valignWrapper overflow_ellipsis">
          <div className="overflow_ellipsis mRight10">{appSecretVisible ? item.appSecret : '********'}</div>
          <Icon
            className={cx('pointer', { mBottom8: !appSecretVisible })}
            icon={appSecretVisible ? 'visibility_off' : 'eye'}
            onClick={() => {
              this.handleSetAppSecretVisible(item);
            }}
          />
        </div>
        <div className="appUrl overflow_ellipsis">{item.appUrl}</div>
        <div className="callbackUrl overflow_ellipsis">{item.callbackUrl}</div>
        <div className="operation">
          <Moreop
            onEdit={() => {
              this.handleEdit(item);
            }}
            onDelete={() => {
              this.handleDelete(item);
            }}
          />
        </div>
      </div>
    );
  }
  renderDialog() {
    const { dialogVisible, appName, about, appUrl, callbackUrl, currentAppItem, requestLoading, avatarUrl } =
      this.state;
    return (
      <Dialog
        overlayClosable={!requestLoading}
        title={<span className="bold">{currentAppItem ? _l('编辑应用') : _l('新建应用')}</span>}
        visible={dialogVisible}
        onCancel={this.handleHideDialog}
        footer={
          <Fragment>
            <Button onClick={this.handleHideDialog} type="link">
              {_l('取消')}
            </Button>
            <Button onClick={this.handleCreateApp} loading={requestLoading}>
              {_l('确定')}
            </Button>
          </Fragment>
        }
      >
        {currentAppItem && (
          <Fragment>
            <div className="mBottom24 mTop24">
              <div className="mBottom5 Gray_75 Font13">{_l('App Key')}</div>
              <div>{currentAppItem.appKey}</div>
            </div>
            <div className="mBottom24 mTop24">
              <div className="mBottom5 Gray_75 Font13">{_l('App Secret')}</div>
              <div>{currentAppItem.appSecret}</div>
            </div>
          </Fragment>
        )}
        <div className="mBottom24 mTop24">
          <div className="mBottom12">{_l('应用图标')}</div>
          <Upload
            avatarUrl={avatarUrl}
            update={data => {
              this.setState({
                uploadAvatar: data.uploadAvatar,
                uploadAvatarUrl: data.uploadAvatarUrl,
              });
            }}
          />
        </div>
        <div className="mBottom24 mTop24">
          <div className="mBottom12">{_l('应用名称')}</div>
          <Input
            className="w100"
            value={appName}
            onChange={value => {
              this.setState({ appName: value });
            }}
          />
        </div>
        <div className="mBottom24">
          <div className="mBottom12">{_l('应用简介')}</div>
          <Input
            className="w100"
            value={about}
            onChange={value => {
              this.setState({ about: value });
            }}
          />
        </div>
        <div className="mBottom24">
          <div className="mBottom12">{_l('应用地址')}</div>
          <Input
            className="w100"
            value={appUrl}
            onChange={value => {
              this.setState({ appUrl: value });
            }}
          />
        </div>
        <div className="mBottom24">
          <div className="mBottom12">{_l('回调地址')}</div>
          <Input
            className="w100"
            value={callbackUrl}
            onChange={value => {
              this.setState({ callbackUrl: value });
            }}
          />
        </div>
      </Dialog>
    );
  }
  render() {
    const { applicationList, loading } = this.state;
    return (
      <div className="thirdpartyAppWrapper card">
        <div className="header flexRow valignWrapper">
          <div className="flex Font17 bold">{_l('第三方应用管理')}</div>
          <Button
            onClick={() => {
              this.setState({ dialogVisible: true });
            }}
          >
            {_l('新建')}
          </Button>
        </div>
        <div className="applicationListWrapper">
          <div className="applicationHeader flexRow TxtCenter">
            <div className="appName">{_l('应用名称')}</div>
            <div className="about">{_l('简介')}</div>
            <div className="appKey">{_l('App Key')}</div>
            <div className="appSecret">{_l('App Secret')}</div>
            <div className="appUrl">{_l('应用地址')}</div>
            <div className="callbackUrl">{_l('回调地址')}</div>
            <div className="operation">{_l('操作')}</div>
          </div>
          {loading ? (
            <LoadDiv className="mTop20 mBottom20" size="big" />
          ) : applicationList.length ? (
            applicationList.map(item => this.renderItme(item))
          ) : (
            <div className="TxtCenter mTop20 mBottom20 Font15 Gray_75">{_l('暂无数据')}</div>
          )}
        </div>
        {this.renderDialog()}
      </div>
    );
  }
}
