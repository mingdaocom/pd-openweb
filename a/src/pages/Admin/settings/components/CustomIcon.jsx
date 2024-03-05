import React, { Component, Fragment } from 'react';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import cx from 'classnames';
import { Icon, ScrollView, QiniuUpload } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import SvgIcon from 'src/components/SvgIcon';
import './index.less';
import _ from 'lodash';

export default class CustomIcon extends Component {
  state = {
    selected: [],
    data: null,
  };

  cacheData = [];

  componentWillMount() {
    this.getList();
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

    fetch(`${__api_server__.main}Download/CustomIcon`, {
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
    const { onClose, projectId } = this.props;
    const { selected, data } = this.state;

    return (
      <div className="orgManagementWrap flex flexColumn">
        <AdminTitle prefix={_l('自定义图标')} />

        <div className="orgManagementHeader flexRow">
          <div className="flexRow alignItemsCenter">
            <Icon icon="backspace" className="Font22 ThemeHoverColor3 pointer" onClick={onClose} />
            <div className="Font17 bold flex mLeft10">{_l('自定义图标')}</div>
          </div>

          <QiniuUpload
            options={{
              filters: {
                mime_types: [{ extensions: 'svg' }],
              },
              ext_blacklist: [],
              bucket: 2,
              type: 5,
            }}
            onUploaded={(up, files) => {
              this.cacheData.push(files);
            }}
            onUploadComplete={res => {
              if (res) {
                const data = this.cacheData.map(file => ({
                  fileName: file.fileName.replace(/\.[^\.]*$/, ''),
                  originalFileName: file.originalFileName,
                  serverName: file.serverName,
                  key: file.key,
                }));
                ajaxRequest.addCustomIcon({ projectId, data }).then(() => {
                  this.cacheData = [];
                  this.getList();
                });
              }
            }}
            onError={(up, err, errTip) => {
              alert(errTip, 2);
            }}
          >
            <div className="ThemeBGColor3 ThemeHoverBGColor2 pointer White appManagementUploadBtn" id="customIconBtn">
              <Icon icon="add" className="Font18 mRight2" />
              {_l('上传图标')}
            </div>
          </QiniuUpload>
        </div>
        <div className="mTop16 mLeft24 mRight24">
          {!selected.length ? (
            <span className="Gray_9e">
              {_l('上传的图标可用于应用、应用项、工作表的图标选择，使用SVG格式的单色图标')}（{_l('推荐下载地址')}
              <a className="ThemeColor3 ThemeHoverColor2" href="https://www.iconfont.cn" target="_blank">
                iconfont
              </a>
              ）。
            </span>
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
