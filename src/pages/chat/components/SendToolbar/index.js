import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import config from '../../utils/config';
import * as utils from '../../utils';
import * as ajax from '../../utils/ajax';
import * as socket from '../../utils/socket';
import Constant from '../../utils/constant';
import fileConfirm from 'fileConfirm';
import Trigger from 'rc-trigger';
import GroupController from 'src/api/group';
import { sendCardToChat } from 'src/api/chat';
import _ from 'lodash';
import '../../lib/mentionInput/js/mentionInput';
import { isVideo, setCaretPosition, getToken } from 'src/util';
import { errorCode } from 'src/components/UploadFiles';

const recurShowFileConfirm = (up, files, i, length, cb) => {
  if (i >= length) {
    // 最后一次调用时启动重新开始上传
    up.start();
    return false;
  }
  const file = files[i];

  if (file && file.getNative().isFromClipBoard) {
    file.name = '剪切板贴图.png';
  }
  fileConfirm(file, {
    yesFn() {
      if (i < length) {
        // 防止快速点击上传
        const timer = setTimeout(() => {
          recurShowFileConfirm(up, files, ++i, length, cb);
          clearTimeout(timer);
        }, 300);
      }
      const message = {
        type: Constant.MSGTYPE_FILE,
        file,
      };
      cb && cb(message);
    },
    noFn() {
      up.removeFile(file);
      if (i < length) {
        // 防止快速点击上传
        var timer = setTimeout(() => {
          recurShowFileConfirm(up, files, ++i, length, cb);
          clearTimeout(timer);
        }, 100);
      }
    },
  });
};

export default class SendToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      isHidden: true,
      isCapture: _.includes(navigator.userAgent, 'MDClient'),
    };
  }
  componentDidMount() {
    const { isGroup } = this.props.session;
    // 表情
    this.initEmotion();
    // 本地文件上传
    socket
      .fetchUploadToken({
        type: 1,
      })
      .then(data => {
        this.initUpload(data);
      });
    // AT
    isGroup && this.initKeyAT();
  }
  initEmotion() {
    const emotionEl = $(this.emotion);
    const { id } = this.props.session;
    const isFileTrsnsfer = id === 'file-transfer';
    emotionEl.emotion({
      historySize: 30,
      autoHide: false,
      mdBear: true,
      showAru: true,
      offset: isFileTrsnsfer ? 313 : 263,
      relatedLeftSpace: isFileTrsnsfer ? -304 : -254,
      historyKey: `${md.global.Account.accountId || ''}_mdEmotions`,
      onMDBearSelect: (name, src, targetEmotionSrc) => {
        // 注意：ft 这个字段是作为七牛文件存储的类型判断的，所以要注意加上这个字段
        // 1.图片 2.附件 3.音频
        const bearFile = {
          ft: 1,
          hash: '',
          key: targetEmotionSrc.replace(/.*images\//, ''),
          name: name ? name : `[${_l('表情')}]`,
          size: 0,
          aid: md.global.Account.accountId,
          isEmotion: true,
        };
        const message = {
          file: bearFile,
          type: Constant.MSGTYPE_EMOTION,
        };
        this.props.onSendEmotionPicMsg(message);
      },
      onSelect: (name, value, emotionText) => {
        this.props.onSendEmotionTextMsg(emotionText || name);
      },
    });
  }
  initUpload(data) {
    const { token, key } = data;
    const { uploadFile } = this;
    const { session } = this.props;
    const _this = this;

    $(uploadFile).plupload({
      url: md.global.FileStoreConfig.uploadHost,
      file_data_name: 'file',
      multi_selection: true,
      drop_element: `ChatPanel-${session.id}`,
      paste_element: `ChatPanel-${session.id}`,
      autoUpload: false,
      method: {
        FilesAdded(uploader, files) {
          let count = 0;
          const emptyFile = 0;
          const tokenFiles = [];
          for (let j = 0; j < files.length; j++) {
            if (File.isValid('.' + File.GetExt(files[j].name))) {
              count++;
            } else {
              uploader.removeFile(files[j]);
            }
            let fileExt = `.${File.GetExt(files[j].name)}`;
            let isPic = File.isPicture(fileExt);
            tokenFiles.push({ bucket: 1, ext: fileExt }); //chat 上传都用 bucket: 1
          }

          const emptyFiles = files => {
            files.forEach(item => {
              uploader.removeFile(item);
            });
          };

          if (count != files.length) {
            alert(_l('含有不支持格式的文件'), 3);
            emptyFiles(files);
            return false;
          }

          if (emptyFile > 0) {
            alert(_l('您上传的文件有问题，请重试，如果是QQ图片请重新打开图片进行复制粘贴'), 3);
            emptyFiles(files);
            return false;
          }

          if (files.length > 10) {
            alert(_l('同时最多只能上传10份文件'), 3);
            emptyFiles(files);
            return false;
          }

          getToken(tokenFiles).then(res => {
            files.forEach((item, i) => {
              item.token = res[i].uptoken;
              item.key = res[i].key;
              item.serverName = res[i].serverName;
              item.fileName = res[i].fileName;
            });
            recurShowFileConfirm(uploader, files, 0, files.length, _this.props.onPrepareUpload.bind(this));
          });
        },
        BeforeUpload(uploader, file) {
          const fileExt = `.${File.GetExt(file.name)}`;
          uploader.settings.multipart_params = { token: file.token };
          uploader.settings.multipart_params.key = file.key;
          uploader.settings.multipart_params['x:serverName'] = window.config.FilePath; //chat 上传都用 window.config.FilePath
          uploader.settings.multipart_params['x:filePath'] = file.key ? file.key.replace(file.fileName, '') : '';
          uploader.settings.multipart_params['x:fileName'] = (file.fileName || '').replace(/\.[^\.]*$/, '');
          uploader.settings.multipart_params['x:originalFileName'] = encodeURIComponent(
            file.name.indexOf('.') > -1 ? file.name.split('.').slice(0, -1).join('.') : file.name,
          );
          uploader.settings.multipart_params['x:fileExt'] = fileExt;
          const cb = window[`chatBeforeUpload${file.id}`];
          cb && cb(uploader);
        },
        UploadProgress(uploader, file) {
          const uploadPercent = ((file.loaded / file.size) * 100).toFixed(1);
          const cb = window[`chatUploadProgress${file.id}`];
          cb && cb(uploadPercent);
        },
        FileUploaded(uploader, file, response) {
          const uploadFile = JSON.parse(response.response);
          const ext = uploadFile.fileExt;
          const isPicture = File.isPicture(ext);
          const isVideoFile = isVideo(ext);
          const msg = isPicture ? `[${_l('图片')}]` : isVideoFile ? `[${_l('视频')}]` : `[${_l('文件')}] ${file.name}`;
          const type = isPicture
            ? Constant.MSGTYPE_PIC
            : isVideoFile
            ? Constant.MSGTYPE_APP_VIDEO
            : Constant.MSGTYPE_FILE;
          uploadFile.id = file.id;
          uploadFile.name = file.name;
          uploadFile.ft = isPicture ? 1 : 2;

          _this.props.onSendFileMsg({ file: uploadFile, type }, msg);
        },
        Error(uploader, error) {
          if (error.code === 50001) {
            alert(error.message, 2);
          } else if (errorCode[error.code]) {
            alert(errorCode[error.code], 2);
          } else {
            alert(_l('上传失败'), 2);
          }
        },
      },
    });

    this.setState(
      {
        visible: false,
      },
      () => {
        this.setState({
          isHidden: false,
        });
      },
    );
  }
  initKeyAT() {
    const { session } = this.props;
    const textarea = $(`#ChatPanel-${session.id}`).find('.ChatPanel-textarea textarea');
    const _this = this;
    textarea.wcMentionsInput({
      remoteURLParas: {
        groupId: session.id,
        pageSize: 10,
        pageIndex: 1,
      },
      ajaxController: GroupController,
      showAvatars: false,
      onShow($target) {
        $target.height(230);
      },
      addAtAll(keyword) {
        const result = [];

        if (_l('全体成员').indexOf(keyword) !== -1) {
          result.push({
            type: 'user',
            id: 'all',
            name: _l('全体成员'),
            logo: session.avatar,
          });
        }

        return result;
      },
      onSelected(user) {
        _this.props.onSelectedUser(`@${user}`);
      },
    });
  }
  handleOpenAt() {
    const { at } = this;
    const { session } = this.props;
    const $textarea = $(`#ChatPanel-${session.id}`).find('.ChatPanel-textarea textarea');
    const $target = $(at);
    const $container = $(`#ChatPanel-${session.id}`).find('.mentions-autocomplete-list');
    if (!$target.data('open') || !$container.is(':visible')) {
      $textarea.val($textarea.val() + '@').trigger('keyup');
      setCaretPosition($textarea.get(0), $textarea.val().length);
      $textarea.focus();
      $target.data('open', true);
    } else {
      $textarea.blur();
      $target.data('open', false);
    }
  }
  handleChange(visible) {
    this.setState({
      visible,
    });
  }
  handleKnowledgeFile() {
    import('src/components/kc/folderSelectDialog/folderSelectDialog').then(selectNode => {
      selectNode
        .default({
          isFolderNode: 2,
          reRootName: true,
          dialogTitle: _l('选择路径'),
        })
        .then(result => {
          if (!result || !result.node) {
            return $.Deferred().reject();
          }
          result.node.forEach(item => {
            this.handleSendCardToChat(item);
          });
        })
        .always(() => {});
    });
    this.setState({ visible: false });
  }
  handleLocalFile() {
    this.setState({ visible: false });
  }
  handleIpcRenderer() {
    window.ipcRenderer && window.ipcRenderer.send('cutpic', 'O');
  }
  handleSendCardToChat(file) {
    const { session } = this.props;
    const params = {
      cards: [
        {
          entityId: file.id,
          cardType: 'kcfile',
          title: file.name + '.' + file.ext,
        },
      ],
      // message: `[${ _l('知识') }] ${ file.name }`,
      message: '',
      [session.isGroup ? 'toGroupId' : 'toAccountId']: session.id,
    };
    sendCardToChat(params)
      .then(reuslt => {
        alert(_l('发送成功'));
      })
      .fail(error => {
        alert(_l('发送失败'), 2);
      });
  }
  handleRecord() {
    const { session } = this.props;
    utils.recordCursortPosition(session.id);
  }
  renderMenu() {
    const { id } = this.props.session;
    return (
      <div className="ChatPanel-addToolbar-menu ChatPanel-addToolbar-KnowledgeMenu">
        <div
          className="menuItem ThemeBGColor3"
          onClick={this.handleLocalFile.bind(this)}
          ref={uploadFile => {
            this.uploadFile = uploadFile;
          }}
          id={`file-${id}`}
        >
          <i className="icon-local_file" />
          <div className="menuItem-text">{_l('本地文件')}</div>
        </div>
        <div className="menuItem ThemeBGColor3" onClick={this.handleKnowledgeFile.bind(this)}>
          <i className="icon-knowledge_file" />
          <div className="menuItem-text">{_l('知识中心')}</div>
        </div>
      </div>
    );
  }
  renderFile() {
    const { visible, isHidden } = this.state;
    const { id } = this.props.session;
    return (
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={this.handleChange.bind(this)}
        popupClassName={cx('ChatPanel-Trigger', { Hidden: isHidden })}
        action={['click']}
        popupPlacement="top"
        builtinPlacements={config.builtinPlacements}
        popup={this.renderMenu()}
        popupAlign={{ offset: [id === 'file-transfer' ? -50 : -20, -20] }}
        getPopupContainer={() => document.querySelector('.ChatPanel-wrapper')}
      >
        <div className="icon-btn tip-top" data-tip={_l('发送本地文件')}>
          <i className="icon-attachment" />
        </div>
      </Trigger>
    );
  }
  render() {
    const { session } = this.props;
    const { id } = session;
    const { isCapture } = this.state;
    return (
      <div className="ChatPanel-sendToolbar">
        <div
          onClick={this.handleRecord.bind(this)}
          ref={emotion => {
            this.emotion = emotion;
          }}
          className="icon-btn tip-top"
          data-tip={_l('发表情')}
        >
          <i className="icon-smilingFace" />
        </div>
        {this.renderFile()}
        {session.isGroup ? (
          <div
            onClick={this.handleOpenAt.bind(this)}
            ref={at => {
              this.at = at;
            }}
            className="icon-btn tip-top-left"
            data-tip={_l('@聊天成员，给ta发送一个抖动')}
          >
            <i className="icon-chat-at" />
          </div>
        ) : id === 'file-transfer' ? undefined : (
          <div onClick={this.props.onShake.bind(this)} className="icon-btn tip-top" data-tip={_l('抖动ta的屏幕')}>
            <i className="icon-chat-shake" />
          </div>
        )}
        <div
          className={cx('icon-btn tip-top', { btnCapture: !isCapture })}
          data-tip={_l('截屏')}
          onClick={this.handleIpcRenderer.bind(this)}
        >
          <i className="icon-outil_capture" />
        </div>
      </div>
    );
  }
}
