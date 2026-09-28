import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import chatAjax from 'src/api/chat';
import { SOURCE_TYPE } from 'src/components/comment/config';
import Emotion from 'src/components/emotion';
import MentionsInput from 'src/components/MentionsInput';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { setCaretPosition } from 'src/utils/platform/browser/dom';
import { getToken } from 'src/utils/services/request/authenticated';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import * as utils from '../../utils';
import Constant from '../../utils/constant';
import fileConfirm from '../fileConfirm/fileConfirm';
import './index.less';

const recurShowFileConfirm = (up, files, i, length, cb) => {
  if (i >= length) {
    // 最后一次调用时启动重新开始上传
    up.start();
    return false;
  }

  const file = files[i];

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
    };
  }
  componentDidMount() {
    const { isGroup } = this.props.session;
    // 本地文件上传
    setTimeout(() => {
      this.initUpload();
    }, 500);
    // AT
    isGroup && this.initKeyAT();
  }
  componentWillUnmount() {
    const { session } = this.props;
    const textarea = $(`#ChatPanel-${session.id}`).find('.ChatPanel-textarea textarea').get(0);
    textarea && textarea.destroy && textarea.destroy();
  }
  handleEmotionSelect = ({ code, src, text, type }) => {
    if (type !== 'sticker') {
      this.props.onSendEmotionTextMsg(text || code);
      return;
    }

    const name = code === 'null' || code === null ? null : code;
    // 注意：ft 这个字段是作为七牛文件存储的类型判断的，所以要注意加上这个字段
    // 1.图片 2.附件 3.音频
    const emotionFile = {
      ft: 1,
      hash: '',
      key: src.replace(/.*images\//, ''),
      name: name || `[${_l('表情')}]`,
      size: 0,
      aid: md.global.Account.accountId,
      isEmotion: true,
    };
    const message = {
      file: emotionFile,
      type: Constant.MSGTYPE_EMOTION,
    };
    this.props.onSendEmotionPicMsg(message);
  };
  initUpload() {
    const { session, socketState = 0 } = this.props;
    const _this = this;
    const { fileUploadLimitSize } = _.get(md, 'global.SysSettings') || {};

    const config = {
      browse_button: this.uploadFile,
      url: md.global.FileStoreConfig.uploadHost,
      file_data_name: 'file',
      multi_selection: true,
      drop_element: `ChatPanel-${session.id}`,
      paste_element: `ChatPanel-${session.id}`,
      max_file_size: fileUploadLimitSize ? `${fileUploadLimitSize}m` : undefined,
      autoUpload: false,
      method: {
        FilesAdded(uploader, files) {
          let count = 0;
          const emptyFile = 0;
          const tokenFiles = [];

          for (let j = 0; j < files.length; j++) {
            if (RegExpValidator.validateFileExt('.' + RegExpValidator.getExtOfFileName(files[j].name))) {
              count++;
            } else {
              uploader.removeFile(files[j]);
            }

            let fileExt = `.${RegExpValidator.getExtOfFileName(files[j].name)}`;

            tokenFiles.push({ bucket: 1, ext: fileExt }); //chat 上传都用 bucket: 1
          }

          const emptyFiles = files => {
            files.forEach(item => {
              uploader.removeFile(item);
            });
          };

          if (socketState) {
            emptyFiles(files);
            return false;
          }

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
          const fileExt = `.${RegExpValidator.getExtOfFileName(file.name)}`;
          uploader.settings.multipart_params = { token: file.token };
          uploader.settings.multipart_params.key = file.key;
          uploader.settings.multipart_params['x:serverName'] = window.config.FilePath; //chat 上传都用 window.config.FilePath
          uploader.settings.multipart_params['x:filePath'] = file.key ? file.key.replace(file.fileName, '') : '';
          uploader.settings.multipart_params['x:fileName'] = (file.fileName || '').replace(/\.[^.]*$/, '');
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
          const isPicture = RegExpValidator.fileIsPicture(ext);
          const isVideoFile = RegExpValidator.isVideo(ext);
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
          if (error.code === window.plupload.FILE_SIZE_ERROR) {
            alert(_l('单个文件大小超过%0MB，无法支持上传', fileUploadLimitSize), 2);
          } else {
            alert(_l('上传失败，请稍后再试。'), 2);
          }
        },
      },
    };

    const uploader = new plupload.Uploader(config);

    uploader.bind('FilesAdded', config.method.FilesAdded);
    uploader.bind('BeforeUpload', config.method.BeforeUpload);
    uploader.bind('UploadProgress', config.method.UploadProgress);
    uploader.bind('FileUploaded', config.method.FileUploaded);
    uploader.bind('Error', config.method.Error);
    uploader.bind('PostInit', function bindPluploadPaste(up) {
      var paste = document.getElementById(config.paste_element);
      if (paste) {
        const onPaste = _.throttle(e => {
          var items = e.originalEvent.clipboardData && e.originalEvent.clipboardData.items;
          var data = { files: [] };
          if (items && items.length) {
            $.each(items, function (index, item) {
              var file = item.getAsFile && item.getAsFile();
              if (file) {
                file.isFromClipBoard = true;
                data.files.push(file);
              }
            });
            if (data.files.length > 0) {
              up.addFile(data.files);
            }
          }
        }, 500);
        $(paste).on('paste', onPaste);
      }
    });
    uploader.init();

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
    MentionsInput({
      input: textarea.get(0),
      sourceType: SOURCE_TYPE.CHAT,
      isAddressBookSelect: false,
      defaultMaxHeight: 380,
      getPopupContainer: () => textarea.get(0).parentNode,
      chatParas: {
        groupId: session.id,
        avatar: session.avatar,
      },
      onSelected: user => {
        this.props.onSelectedUser(`@${user}`);
      },
    });
  }
  handleOpenAt() {
    const { at } = this;
    const { session, onChangeValue } = this.props;
    const $textarea = $(`#ChatPanel-${session.id}`).find('.ChatPanel-textarea textarea');
    const $target = $(at);
    const $container = $(`#ChatPanel-${session.id}`).find('.mentionsAutocompleteList');

    if (!$target.data('open') || !$container.is(':visible')) {
      onChangeValue($textarea.val() + '@');
      setTimeout(() => {
        setCaretPosition($textarea.get(0), $textarea.val().length);
      }, 0);
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
    const { session, socketState } = this.props;

    if (socketState || session.id === Constant.FILE_TRANSFER.id) {
      return;
    }

    import('src/components/kc/folderSelectDialog/folderSelectDialog').then(selectNode => {
      selectNode
        .default({
          isFolderNode: 2,
          reRootName: true,
          dialogTitle: _l('选择路径'),
        })
        .then(result => {
          if (!result || !result.node) {
            throw new Error();
          }

          result.node.forEach(item => {
            this.handleSendCardToChat(item);
          });
        });
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
    chatAjax
      .sendCardToChat(params)
      .then(() => {
        alert(_l('发送成功'));
      })
      .catch(_requestError => {
        alertIfNotUnauthorized(_requestError, _l('发送失败'), 2);
      });
  }
  handleRecord() {
    const { session } = this.props;
    utils.recordCursortPosition(session.id);
  }
  renderMenuItems() {
    const { id } = this.props.session;
    const isFileTransfer = id === Constant.FILE_TRANSFER.id;

    return [
      {
        key: 'localFile',
        icon: <Icon icon="local_file" className="Font16 textSecondary" />,
        label: (
          <span
            ref={uploadFile => {
              this.uploadFile = uploadFile ? uploadFile.closest('[role="menuitem"]') || uploadFile : uploadFile;
            }}
            id={`file-${id}`}
          >
            {_l('本地文件')}
          </span>
        ),
        onClick: this.handleLocalFile.bind(this),
      },
      !isFileTransfer && {
        key: 'knowledgeFile',
        icon: <Icon icon="knowledge_file" className="Font16 textSecondary" />,
        label: _l('知识中心'),
        onClick: this.handleKnowledgeFile.bind(this),
      },
    ].filter(Boolean);
  }
  renderFile() {
    const { visible, isHidden } = this.state;
    const { id } = this.props.session;
    return (
      <Dropdown
        align={{ offset: [id === Constant.FILE_TRANSFER.id ? -45 : -15, -20] }}
        classNames={{ root: cx({ Hidden: isHidden }) }}
        forceRender
        getPopupContainer={() => document.querySelector('.ChatPanel-wrapper')}
        menu={{ items: this.renderMenuItems(), style: { width: 150 } }}
        open={visible}
        placement="top"
        trigger={['click']}
        onOpenChange={this.handleChange.bind(this)}
      >
        <div>
          <Tooltip title={_l('发送本地文件')}>
            <div className="icon-btn">
              <i className="icon-attachment" />
            </div>
          </Tooltip>
        </div>
      </Dropdown>
    );
  }
  render() {
    const { session } = this.props;
    const { id } = session;

    return (
      <div className="ChatPanel-sendToolbar">
        <Emotion
          closeOnSelect={false}
          historySize={30}
          placement="topRight"
          showAru
          showBear
          onOpenChange={open => open && this.handleRecord()}
          onSelect={this.handleEmotionSelect}
        >
          <Tooltip title={_l('发表情')}>
            <div className="icon-btn">
              <i className="icon-smilingFace" />
            </div>
          </Tooltip>
        </Emotion>
        {this.renderFile()}
        {session.isGroup ? (
          <Tooltip title={_l('@聊天成员，给ta发送一个抖动')} placement="topRight">
            <div
              onClick={this.handleOpenAt.bind(this)}
              ref={at => {
                this.at = at;
              }}
              className="icon-btn"
            >
              <i className="icon-chat-at" />
            </div>
          </Tooltip>
        ) : id === 'file-transfer' ? undefined : (
          <Tooltip title={_l('抖动ta的屏幕')}>
            <div onClick={this.props.onShake.bind(this)} className="icon-btn">
              <i className="icon-chat-shake" />
            </div>
          </Tooltip>
        )}
        <Tooltip title={_l('截屏')}>
          <div
            className={cx('icon-btn', { btnCapture: !window.isMDClient })}
            onClick={this.handleIpcRenderer.bind(this)}
          >
            <i className="icon-outil_capture" />
          </div>
        </Tooltip>
      </div>
    );
  }
}
