import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import * as utils from '../../utils';
import * as ajax from '../../utils/ajax';
import Constant from '../../utils/constant';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { getClassNameByExt } from 'src/util';

export const splitFiles = list => {
  const ranges = {};
  ranges[_l('今天')] = [moment().startOf('day'), moment().endOf('day')];
  ranges[_l('最近七天')] = [moment().subtract(6, 'days').startOf('day'), moment().endOf('day')];
  ranges[_l('本月')] = [moment().startOf('month'), moment().endOf('day')];
  const oSplit = {};
  list.forEach(file => {
    if (file.type === 2) {
      file.previewUrl = `${file.url}?imageView2/0/w/100/h/100/q/90`;
    }
    file.$date = createTimeSpan(file.time);
    file.$size = utils.formatFileSize(file.size);
    file.iconClass = getClassNameByExt(`.${File.GetExt(file.name)}`);
    const fileTime = moment(file.time);
    let i;
    let sTime;
    const keys = Object.keys(ranges);
    for (i = 0; i < keys.length; i++) {
      if (fileTime.isAfter(ranges[keys[i]][0]) && fileTime.isBefore(ranges[keys[i]][1])) {
        if (!oSplit[keys[i]]) {
          file.splitTime = keys[i];
          oSplit[keys[i]] = true;
        }
        return;
      }
    }
    if (fileTime.isAfter(moment().startOf('year'))) {
      sTime = fileTime.format('M月');
    } else {
      sTime = fileTime.format('YYYY年M月');
    }
    if (!oSplit[sTime]) {
      file.splitTime = sTime;
      oSplit[sTime] = true;
    }
  });
  return list;
};

export class FileItem extends Component {
  constructor(props) {
    super(props);
  }
  handlePreview(item, event) {
    if (event.target.tagName === 'A') return;
    const res = [
      {
        fileid: item.fileId,
        name: item.name,
        path: window.config.FilePath + item.key,
        previewAttachmentType: 'QINIU',
      },
    ];
    require(['previewAttachments'], previewAttachments => {
      previewAttachments(
        {
          attachments: res,
          callFrom: 'chat',
          hideFunctions: ['editFileName'],
        },
        {},
      );
    });
  }
  renderFile() {
    const { item } = this.props;
    const { previewUrl, type, createAccount } = item;
    const isPicture = type === Constant.MSGTYPE_PIC;
    return (
      <div className="ChatPanel-File-item" onClick={this.handlePreview.bind(this, item)}>
        <div className={cx('thumbnail', { withBorder: isPicture })}>
          {isPicture ? <img src={previewUrl} /> : <i className={item.iconClass} />}
        </div>
        <div className="info">
          <div className="name ThemeColor3" title={item.name}>
            {item.name}
          </div>
          <div className="time" title={item.$date}>
            {item.$date}
          </div>
          <div className="creator" title={createAccount.fullname}>
            {createAccount.fullname}
          </div>
        </div>
        {/* <a href={$downUrl} className="download icon-download ThemeColor3" target="_blank" title={_l('下载')} /> */}
      </div>
    );
  }
  render() {
    const { fileType, item } = this.props;
    if (fileType === 2) {
      return [
        item.splitTime ? (
          <div key="splitTime" className="splitTime">
            {item.splitTime}
          </div>
        ) : undefined,
        <div className="ChatPanel-Image-item" key={item.fileId} onClick={this.handlePreview.bind(this, item)}>
          <div className="image">
            <img src={item.previewUrl} />
          </div>
          <div className="name">{item.createAccount.fullname}</div>
        </div>,
      ];
    } else {
      return (
        <div>
          {item.splitTime ? (
            <div>
              <div className="splitTime">{item.splitTime}</div>
              {this.renderFile()}
            </div>
          ) : (
            this.renderFile()
          )}
        </div>
      );
    }
  }
}

export default class Files extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      loading: true,
    };
  }
  componentDidMount() {
    const { session } = this.props;
    ajax
      .getFileList({
        pageIndex: 1,
        pageSize: 3,
        [session.isGroup ? 'groupId' : 'withUser']: session.id,
      })
      .then(result => {
        const { list } = result;
        this.setState({
          loading: false,
          files: list && list.length ? splitFiles(list) : [],
        });
      });
  }
  render() {
    const { loading, files } = this.state;
    const { session } = this.props;
    return (
      <div className="ChatPanel-Files ChatPanel-sessionInfo-item">
        <div className="ChatPanel-Files-hander ChatPanel-sessionInfo-hander">
          <span>{`${_l('文件')}`}</span>
          {files.length ? (
            <span
              onClick={this.props.onSetPanelVisible.bind(this, true)}
              className="ChatPanel-sessionInfo-hander-entry ThemeColor3"
            >
              {_l('所有文件')}
              <i className="icon-sidebar-more" />
            </span>
          ) : undefined}
        </div>
        <div className="ChatPanel-Files-body">
          {files.map((item, index) => (
            <FileItem item={item} key={item.fileId || index} />
          ))}
          {loading ? <LoadDiv size="small" /> : undefined}
          {!loading && !files.length ? (
            <div className="nodata">{session.isGroup ? _l('群组中暂无文件') : _l('该聊天中暂无文件')}</div>
          ) : undefined}
        </div>
      </div>
    );
  }
}
