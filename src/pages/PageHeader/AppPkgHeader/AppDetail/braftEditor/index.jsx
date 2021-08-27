import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import filterXSS from 'xss';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import { getUrlByBucketName } from 'src/util';
import { Icon } from 'ming-ui';
import 'braft-polyfill';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';
import './braftEditor.less';
import { whiteList } from 'xss/lib/default';
import { ADVANCE_AUTHORITY } from '../../config';

const newWhiteList = Object.assign({}, whiteList, { span: ['style'] });

export default class Editor extends Component {
  static propTypes = {
    cacheKey: PropTypes.string, // 缓存内容key
    isEditing: PropTypes.bool, // 编辑状态
    auth: PropTypes.bool, // 权限
    permissionType: PropTypes.number,
    className: PropTypes.string, // 类名
    summary: PropTypes.string, // 内容
    placeholder: PropTypes.string, // 无内容的时候引导文案
    joinEditing: PropTypes.func, // 进入编辑
    onCancel: PropTypes.func, // 取消回调
    onSave: PropTypes.func, // 确定回调
  };

  static defaultProps = {
    cacheKey: '',
    isEditing: false,
    auth: true,
    className: '',
    summary: '',
    placeholder: '',
    joinEditing: () => {},
    onCancel: () => {},
    onSave: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showCache: false,
      bindCreateUpload: false,
    };
  }

  componentDidMount() {
    // a 链接点击
    $('body').on('click.editor', '.mdEditorContent a', function (e) {
      e.stopPropagation();
      e.preventDefault();

      const a = document.createElement('a');
      a.href = $(this).attr('href');
      a.target = '_blank';
      a.rel = 'nofollow noopener noreferrer';
      a.click();
    });

    $('body').on('click.editor', '.BraftEditor-container a.braft-link', e => {
      e.stopPropagation();
      e.preventDefault();
    });

    if (this.props.isEditing) {
      this.createUploader();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { cacheKey, summary } = nextProps;
    const cacheSummary = localStorage.getItem('mdEditor_' + cacheKey);

    if (!this.props.isEditing && nextProps.isEditing && cacheSummary && cacheSummary !== summary) {
      this.setState({ showCache: true });
    }
  }

  componentDidUpdate() {
    if (this.props.isEditing && !this.state.bindCreateUpload) {
      this.createUploader();
    }
  }

  componentWillUnmount() {
    $('body').off('.editor');
  }

  /**
   * 创建上传
   */
  createUploader() {
    this.uploader = createUploader({
      browse_button: 'editorFiles',
      bucket: 2,
      init: {
        FilesAdded: (up, files) => {
          up.setOption('auto_start', true);
        },
        FileUploaded: (up, file, info) => {
          const { bucket, key, fsize } = info.response;
          this.editorInstance.insertMedias([
            {
              type: 'IMAGE',
              name: '',
              url: getUrlByBucketName(bucket) + key,
            },
          ]);
        },
      },
    });

    this.setState({ bindCreateUpload: true });
  }

  /**
   * 缓存内容
   */
  onChange = html => {
    const { cacheKey, isEditing } = this.props;

    if (cacheKey && isEditing) {
      localStorage.setItem('mdEditor_' + cacheKey, html);
    }
  };

  /**
   * 判断是否有缓存的内容
   */
  renderRecovery() {
    const { cacheKey, summary } = this.props;
    const cacheSummary = localStorage.getItem('mdEditor_' + cacheKey);

    if (this.state.showCache && cacheSummary && cacheSummary !== summary) {
      return (
        <Fragment>
          <div className="mdEditorTipColor">{_l('检测到有上次未保存的内容，')}</div>
          <div className="pointer ThemeColor3 ThemeHoverColor2" onClick={this.recovery}>
            {_l('点击恢复')}
          </div>
          <div className="mdEditorTipColor mLeft5 mRight5">{_l('或')}</div>
          <div className="pointer ThemeColor3 ThemeHoverColor2" onClick={this.clearStorage}>
            {_l('忽略')}
          </div>
        </Fragment>
      );
    }

    return null;
  }

  /**
   * 点击恢复
   */
  recovery = () => {
    const { cacheKey } = this.props;
    const cacheSummary = localStorage.getItem('mdEditor_' + cacheKey);

    this.editorInstance.setContent(cacheSummary, 'html');
    this.setState({ showCache: false });
  };

  /**
   * 忽略
   */
  clearStorage = () => {
    const { cacheKey } = this.props;
    localStorage.removeItem('mdEditor_' + cacheKey);
    this.setState({ showCache: false });
  };

  /**
   * onSave
   */
  onSave = () => {
    this.clearStorage();

    let content = this.editorInstance.getContent('html');
    const links = content.match(/href=\"(.*?)\"/gi) || [];
    let linkURL;
    const isURL = url => {
      const regex = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
      return regex.test(url);
    };

    // 处理未带协议
    links.forEach(link => {
      linkURL = link.replace(/href=\"|\"| /gi, '');
      if (linkURL && isURL(linkURL)) {
        if (linkURL.indexOf('http') === -1) {
          linkURL = 'http://' + linkURL;
        }
      } else {
        linkURL = '';
      }

      content = content.replace(link, `href="${linkURL}"`);
    });

    // 没有文本清空标签 且 无图片
    if (!_.trim(content.replace(/<[^>]+>/g, '')) && content.indexOf('<img') === -1) {
      content = '';
    }

    this.props.onSave(content);
  };

  render() {
    const that = this;
    const { isEditing, auth, className, placeholder, joinEditing, onCancel, permissionType } = this.props;
    const summary = this.props.summary
      .replace(/<input type="image" src="[^"]*\/images\/ico_unchecked.gif" class="ico_checkbox">/gi, '☐')
      .replace(/<input type="image" src="[^"]*\/images\/ico_checked.gif" class="ico_checkbox">/gi, '☑');
    const lang = getCookie('i18n_langtag') || getNavigatorLang();
    const acceptType = ['png', 'jpg', 'gif', 'jpeg'];
    const editorProps = {
      height: 0,
      contentFormat: 'html',
      language: lang === 'en' ? 'en' : lang === 'zh-Hans' ? 'zh' : 'zh-hant',
      controls: ['headings', 'text-color', 'bold', 'italic', 'underline', 'remove-styles', 'list_ul', 'list_ol', 'link', 'hr', 'media'],
      initialContent: summary,
      onChange: this.onChange,
      media: {
        allowPasteImage: true, // 是否允许直接粘贴剪贴板图片（例如QQ截图等）到编辑器
        image: true, // 开启图片插入功能
        externalMedias: {
          image: false,
          audio: false,
          video: false,
          embed: false,
        },
        uploadFn: param => {
          this.uploader.addFile(param.file);
        },
      },
      imageControls: {
        floatLeft: false,
        floatRight: false,
        alignLeft: false,
        alignCenter: false,
        alignRight: false,
        link: false,
        size: true,
      },
      extendControls: [
        {
          type: 'button',
          text: _l('图片'),
          html: '<i class="icon-picture"></i><input type="file" id="editorFile" accept="image/*">',
          hoverTitle: _l('图片'),
          className: '',
          onClick: () => {
            $('#editorFile')
              .click()
              .off()
              .on('change', e => {
                const file = e.target.files[0];
                const fileNames = file.name.split('.');

                // 是图片文件
                if (_.includes(acceptType, fileNames[fileNames.length - 1])) {
                  that.uploader.addFile(file);
                } else {
                  alert(_l('请选择图片格式的文件'), 2);
                }

                $('#editorFile').val('');
              });
          },
        },
      ],
    };

    if (!isEditing) {
      return (
        <div className={cx('mdEditor', { Alpha8: !auth }, className, { pBottom15: summary })} onClick={joinEditing}>
          <header className="appIntroHeader">
            <div className="caption">{_l('应用说明')}</div>
            {!isEditing && permissionType >= ADVANCE_AUTHORITY && (
              <div className="editAppIntro" onClick={() => this.props.changeEditState(true)}>
                <Icon icon="edit" />
                <span className="Font13 ">{_l('编辑')}</span>
              </div>
            )}
          </header>
          {summary ? (
            <div
              className="mdEditorContent"
              dangerouslySetInnerHTML={{
                __html: filterXSS(summary, {
                  stripIgnoreTag: true,
                  whiteList: newWhiteList,
                }),
              }}
            />
          ) : null}
        </div>
      );
    }

    return (
      <div className={cx('mdEditor', className)}>
        <button id="editorFiles" />
        <div className="flexRow mdEditorHeader">
          <div className="caption">{_l('应用说明')}</div>
          {this.renderRecovery()}
          <div className="flex" />
          <div
            className="mdEditorCancel ThemeColor3"
            onClick={() => {
              this.clearStorage();
              onCancel();
            }}
          >
            {_l('取消')}
          </div>
          <div className="mdEditorSave ThemeBGColor3 ThemeHoverBGColor2" onClick={this.onSave}>
            {_l('保存')}
          </div>
        </div>
        <BraftEditor
          {...editorProps}
          ref={instance => (this.editorInstance = instance)}
          placeholder={_l('为应用填写使用说明，当用户第一次访问应用时会打开此说明')}
        />
      </div>
    );
  }
}
