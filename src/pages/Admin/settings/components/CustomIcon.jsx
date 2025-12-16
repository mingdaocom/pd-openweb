import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import { Checkbox, Icon, QiniuUpload, ScrollView, SvgIcon } from 'ming-ui';
import ajaxRequest from 'src/api/appManagement';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigateTo';
import './index.less';

export default class CustomIcon extends Component {
  state = {
    selected: [],
    data: null,
    preserveColor: false,
    cacheKey: +new Date(),
  };

  cacheData = [];
  uploadLoadingKey = undefined;

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
    window
      .mdyAPI(
        '',
        '',
        { projectId, fileNames: selected },
        {
          ajaxOptions: {
            url: `${__api_server__.main}Download/CustomIcon`,
            responseType: 'blob',
          },
          customParseResponse: true,
        },
      )
      .then(data => {
        saveAs(data, 'MDFont_' + new Date().getTime());
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

  startLoading = () => {
    this.uploadLoadingKey = +new Date();
    alert({
      msg: _l('上传中，请耐心等待...'),
      type: 5,
      duration: 0,
      key: this.uploadLoadingKey,
    });
  };

  render() {
    const { projectId } = this.props;
    const { selected, data, preserveColor, cacheKey } = this.state;

    return (
      <div className="orgManagementWrap flex flexColumn">
        <AdminTitle prefix={_l('自定义图标')} />

        <div className="orgManagementHeader flexRow">
          <div className="flexRow alignItemsCenter">
            <Icon
              icon="backspace"
              className="Font22 ThemeHoverColor3 pointer"
              onClick={() => navigateTo(`/admin/settings/${projectId}`)}
            />
            <div className="Font17 bold flex mLeft10">{_l('自定义图标')}</div>
          </div>
          <div className="flexRow alignItemsCenter">
            <Checkbox
              className="InlineBlock mRight15"
              text={_l('上传图标保留颜色')}
              checked={preserveColor}
              onClick={() => this.setState({ preserveColor: !preserveColor, cacheKey: +new Date() })}
            />
            <QiniuUpload
              key={cacheKey}
              options={{
                filters: {
                  mime_types: [{ extensions: 'svg' }],
                },
                ext_blacklist: [],
                bucket: 2,
                type: 5,
              }}
              getTokenParam={{
                extend: preserveColor ? 'preserve' : '',
              }}
              onUploaded={(up, files) => {
                this.cacheData.push(files);
                !this.uploadLoadingKey && this.startLoading();
              }}
              onUploadComplete={res => {
                if (res) {
                  const data = this.cacheData.map(file => ({
                    fileName: file.fileName.replace(/\.[^.]*$/, ''),
                    originalFileName: file.originalFileName,
                    serverName: file.serverName,
                    key: file.key,
                  }));
                  ajaxRequest.addCustomIcon({ projectId, data }).then(() => {
                    this.cacheData = [];
                    this.getList();
                    window.destroyAlert(this.uploadLoadingKey);
                    this.uploadLoadingKey = undefined;
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
        </div>
        <div className="mTop16 mLeft24 mRight24">
          {!selected.length ? (
            <span className="Gray_9e">
              {_l('上传的图标可用于应用配置时的图标选择，建议使用 SVG 格式的单色图标')}（{_l('推荐下载地址')}
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
                <Icon icon="trash" className="Font16 mRight5" />
                {_l('删除')}
              </span>
            </Fragment>
          )}
        </div>
        <div className="flex appManagementCustom overflowHidden">
          <ScrollView className="h100">
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
