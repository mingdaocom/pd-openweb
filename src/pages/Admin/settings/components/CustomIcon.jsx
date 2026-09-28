import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { saveAs } from 'file-saver';
import _ from 'lodash';
import { Icon, QiniuUpload, ScrollView, SvgIcon } from 'ming-ui';
import { Button, Checkbox } from 'ming-ui/antd-components';
import ajaxRequest from 'src/api/appManagement';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import { navigateTo } from 'src/router/navigation/navigateTo';
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
  requestPending = false;

  componentDidMount() {
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
    if (this.requestPending) return;

    const { projectId } = this.props;
    const { selected } = this.state;

    this.requestPending = true;
    return ajaxRequest
      .deleteCustomIcon({ projectId, fileNames: selected })
      .then(() => {
        this.setState({ selected: [] });
        this.getList();
      })
      .finally(() => {
        this.requestPending = false;
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
              className="Font22 hoverColorPrimary pointer"
              onClick={() => navigateTo(`/admin/settings/${projectId}`)}
            />
            <div className="Font17 bold flex mLeft10">{_l('自定义图标')}</div>
          </div>
          <div className="flexRow alignItemsCenter">
            <Checkbox
              className="mRight15"
              checked={preserveColor}
              onChange={() =>
                this.setState({
                  preserveColor: !preserveColor,
                  cacheKey: +new Date(),
                })
              }
            >
              {_l('上传图标保留颜色')}
            </Checkbox>
            <QiniuUpload
              key={cacheKey}
              options={{
                filters: {
                  mime_types: [{ extensions: 'svg' }],
                },
                ext_blacklist: [],
                bucket: 2,
                type: 5,
                error_callback: errorType => {
                  if (errorType === 2) {
                    alert(_l('单次最多上传%0个图标', 100), 3);
                  }
                },
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
              <Button type="primary" shape="round" icon={<Icon icon="add" />} id="customIconBtn">
                {_l('上传图标')}
              </Button>
            </QiniuUpload>
          </div>
        </div>
        <div className="mTop16 mLeft24 mRight24">
          {!selected.length ? (
            <span className="textTertiary">
              {_l('上传的图标可用于应用配置时的图标选择，建议使用 SVG 格式的单色图标')}（{_l('推荐下载地址')}
              <a className="colorPrimary hoverColorPrimaryDark" href="https://www.iconfont.cn" target="_blank">
                iconfont
              </a>
              ）。
            </span>
          ) : (
            <Fragment>
              <span>{_l('已选中%0个', selected.length)}</span>
              <span className="hoverColorPrimary pointer mLeft15 textSecondary" onClick={this.download}>
                <Icon icon="download" className="Font16 mRight5" />
                SVG
              </span>
              <span className="pointer mLeft20 textSecondary hoverRed" onClick={this.delete}>
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
