import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { createUploader } from 'src/pages/kc/utils/qiniuUpload';
import BraftEditor from 'braft-editor';
import 'braft-editor/dist/braft.css';
import './braftEditor.less';
import { emitter } from 'src/pages/worksheet/util';
import Content from './Content';

export default class Editor extends Component {
  static propTypes = {
    actualSave: PropTypes.bool, // 实时保存
    cacheKey: PropTypes.string, // 缓存内容key
    isEditing: PropTypes.bool, // 编辑状态
    auth: PropTypes.bool, // 权限
    className: PropTypes.string, // 类名
    summary: PropTypes.string, // 内容
    placeholder: PropTypes.string, // 无内容的时候引导文案
    noFooter: PropTypes.bool, // 是否显示底部
    joinEditing: PropTypes.func, // 进入编辑
    onCancel: PropTypes.func, // 取消回调
    onSave: PropTypes.func, // 确定回调
    onActualSave: PropTypes.func, // 实时保存回调
  };

  static defaultProps = {
    actualSave: false,
    cacheKey: '',
    isEditing: false,
    auth: true,
    className: '',
    summary: '',
    placeholder: '',
    noFooter: false,
    joinEditing: () => {},
    onCancel: () => {},
    onSave: () => {},
    onActualSave: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      showCache: false,
      bindCreateUpload: false,
    };
  }

  componentDidMount() {
    const { isEditing, actualSave, onCancel } = this.props;

    if (isEditing) {
      this.createUploader();
    }

    if (actualSave) {
      emitter.addListener('SAVE_CANCEL_RECORD', onCancel);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { cacheKey, summary } = nextProps;
    const cacheSummary = localStorage.getItem('mdEditor_' + cacheKey);

    if (!this.props.isEditing && nextProps.isEditing && cacheSummary && cacheSummary !== summary) {
      this.setState({ showCache: true });
    }
  }

  componentDidUpdate(prevProps) {
    this.isFocus = false;

    if (this.props.isEditing && !this.state.bindCreateUpload) {
      this.createUploader();
    }

    if ((!prevProps.isEditing && this.props.isEditing) || this.props.autoFocus) {
      setTimeout(() => {
        this.isFocus = true;

        if (!this.editorInstance) return;

        this.editorInstance.focus();
        const range = window.getSelection();

        range.selectAllChildren($('.DraftEditor-editorContainer .public-DraftEditor-content')[0]);
        range.collapseToEnd();
      }, 300);
    }
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
              url: file.url,
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
    const { cacheKey, isEditing, actualSave } = this.props;

    if (actualSave) {
      this.onSave();
    } else if (cacheKey && isEditing && !this.isFocus) {
      localStorage.setItem('mdEditor_' + cacheKey, html);
    }

    if (this.isFocus) {
      this.isFocus = false;
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
    const { actualSave, summary } = this.props;

    this.clearStorage();

    if (!this.editorInstance) return;

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

    if (actualSave) {
      if (summary !== content) {
        this.props.onActualSave(content);
      }
    } else {
      this.props.onSave(content);
    }
  };

  render() {
    const that = this;
    const { isEditing, className, noFooter, onCancel, actualSave } = this.props;
    const summary = this.props.summary
      .replace(/<input type="image" src="[^"]*\/images\/ico_unchecked.gif" class="ico_checkbox">/gi, '☐')
      .replace(/<input type="image" src="[^"]*\/images\/ico_checked.gif" class="ico_checkbox">/gi, '☑')
      .replace(/background-color:#ffffff/g, 'background-color:transparent');
    const lang = getCookie('i18n_langtag') || getNavigatorLang();
    const acceptType = ['png', 'jpg', 'gif', 'jpeg'];
    const editorProps = {
      height: 0,
      contentFormat: 'html',
      language: lang === 'en' ? 'en' : lang === 'zh-Hans' ? 'zh' : 'zh-hant',
      controls: [
        'headings',
        'font-size',
        'text-color',
        'bold',
        'italic',
        'underline',
        'remove-styles',
        'list_ul',
        'list_ol',
        'link',
        'hr',
        'media',
      ],
      initialContent: summary,
      onChange: this.onChange,
      fontSizes: [12, 13, 14, 16, 18, 20, 24, 28, 30, 32, 36, 48],
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
                if (_.includes(acceptType, fileNames[fileNames.length - 1].toLowerCase())) {
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
      return <Content {...this.props} />;
    }

    return (
      <div className={cx('mdEditor', className)}>
        <button id="editorFiles" />
        <BraftEditor {...editorProps} ref={instance => (this.editorInstance = instance)} />
        <div className="flexRow mdEditorFooter">
          {this.renderRecovery()}
          <div className="flex" />
          {noFooter ? null : actualSave ? (
            <div className="mdEditorSave ThemeBGColor3 ThemeHoverBGColor2" onClick={onCancel}>
              {_l('完成')}
            </div>
          ) : (
            <Fragment>
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
            </Fragment>
          )}
        </div>
      </div>
    );
  }
}
