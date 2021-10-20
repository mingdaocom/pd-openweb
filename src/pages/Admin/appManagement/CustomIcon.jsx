import React, { Component, Fragment } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import './index.less';
import cx from 'classnames';
import { Icon, ScrollView } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import SvgIcon from 'src/components/SvgIcon';
import { getToken } from 'src/util';

export default class CustomIcon extends Component {
  state = {
    selected: [],
    data: null,
  };

  cacheData = [];

  componentWillMount() {
    this.getList();
  }

  componentDidMount() {
    this.uploadFile();
  }

  /**
   * 上传绑定
   */
  uploadFile() {
    const _this = this;
    const { projectId } = this.props;

    $(this.uploadFileEl).plupload({
      url: md.global.FileStoreConfig.uploadHost,
      file_data_name: 'file',
      multi_selection: true,
      max_file_size: '50mb',
      filters: {
        mime_types: [{ title: 'SVG', extensions: 'svg' }],
        prevent_duplicates: false,
        max_file_size: 0,
      },
      autoUpload: false,
      method: {
        FilesAdded(up, files) {
          const tokenFiles = [];

          // 渲染图片列表
          files.forEach(item => {
            let fileExt = `.${File.GetExt(item.name)}`;
            tokenFiles.push({ bucket: 2, ext: fileExt });
          });

          getToken(tokenFiles, 5).then(res => {
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

          _this.cacheData.push({
            fileName: data.fileName,
            originalFileName: data.originalFileName,
            serverName: data.serverName,
            key: data.key,
          });
        },
        UploadComplete() {
          ajaxRequest.addCustomIcon({ projectId, data: _this.cacheData }).then(() => {
            _this.cacheData = [];
            _this.getList();
          });
        },
      },
    });
  }

  /**
   * 获取列表
   */
  getList() {
    const { projectId } = this.props;

    ajaxRequest.getCustomIconByProject({ projectId }).then(data => {
      this.setState({ data });
    });
  }

  /**
   * 选中
   */
  onSelected(fileName) {
    const newSelected = [].concat(this.state.selected);

    if (_.includes(newSelected, fileName)) {
      _.remove(newSelected, key => key === fileName);
    } else {
      newSelected.push(fileName);
    }

    this.setState({ selected: newSelected });
  }

  /**
   * 下载
   */
  download = () => {
    const { projectId } = this.props;
    const { selected } = this.state;

    fetch(`${__api_server__}Download/CustomIcon`, {
      method: 'POST',
      body: JSON.stringify({ projectId, fileNames: selected }),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    })
      .then(res => res.blob())
      .then(data => {
        let blobUrl = window.URL.createObjectURL(data);
        const a = document.createElement('a');

        a.download = 'MDFont_' + new Date().getTime();
        a.href = blobUrl;
        a.click();
      });
  };

  /**
   * 删除
   */
  delete = () => {
    const { projectId } = this.props;
    const { selected } = this.state;

    ajaxRequest.deleteCustomIcon({ projectId, fileNames: selected }).then(() => {
      this.setState({ selected: [] });
      this.getList();
    });
  };

  render() {
    const { onClose } = this.props;
    const { selected, data } = this.state;

    return (
      <div className="appManagementList flex flexColumn">
        <AdminTitle prefix={_l('自定义图标')} />

        <div className="appManagementHeader flexRow">
          <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
          <div className="Font17 bold flex mLeft10">{_l('自定义图标')}</div>
          <div
            className="ThemeBGColor3 ThemeHoverBGColor2 pointer White appManagementUploadBtn"
            id="customIconBtn"
            ref={el => (this.uploadFileEl = el)}
          >
            <Icon icon="add" className="Font18 mRight2" />
            {_l('上传图标')}
          </div>
        </div>
        <div className="mTop16 mLeft24 mRight24">
          {!selected.length ? (
            <span className="Gray_9e">{_l('上传的图标可用于应用、工作表的图标选择，格式仅支持SVG')}</span>
          ) : (
            <Fragment>
              <span>{_l('已选中%0个', selected.length)}</span>
              <span className="ThemeHoverColor3 pointer mLeft15 Gray_75" onClick={this.download}>
                <Icon icon="download" className="Font16 mRight5" />
                SVG
              </span>
              <span className="pointer mLeft20 Gray_75 hoverRed" onClick={this.delete}>
                <Icon icon="delete2" className="Font16 mRight5" />
                {_l('删除')}
              </span>
            </Fragment>
          )}
        </div>
        <div className="flex appManagementCustom">
          <ScrollView>
            {!(data || []).length && (
              <div className="manageListNull flexColumn h100">
                <div className="iconWrap">
                  <Icon icon="hr_custom" />
                </div>
                <div className="emptyExplain">{_l('暂无图标')}</div>
              </div>
            )}
            {(data || []).map(item => {
              return (
                <span
                  key={item.fileName}
                  className={cx('appManagementCustomItem', { selected: _.includes(selected, item.fileName) })}
                  onClick={() => this.onSelected(item.fileName)}
                >
                  <SvgIcon url={item.iconUrl} fill="#47505B" size={32} />
                </span>
              );
            })}
          </ScrollView>
        </div>
      </div>
    );
  }
}