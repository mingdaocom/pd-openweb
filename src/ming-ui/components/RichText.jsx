import React, { useRef, useEffect, useState } from 'react';
import { CKEditor } from '@mdfe/ckeditor5-react';
import styled from 'styled-components';
import { getToken } from 'src/util';
import './less/RichText.less';
import cx from 'classnames';
import '@mdfe/ckeditor5-custom-build/build/translations/zh.js';
import '@mdfe/ckeditor5-custom-build/build/translations/en.js';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import _, { get } from 'lodash';
import autoSize from 'ming-ui/decorators/autoSize';
import RegExpValidator from 'src/util/expression';
let whiteListClone = Object.assign({}, whiteList, {
  img: ['src'],
  div: ['lang', 'dir', 'role', 'aria-labelledby'],
  table: [],
  tbody: [],
  td: [],
  tfoot: [],
  th: [],
  thead: [],
  tr: [],
  figure: [],
  oembed: ['url'],
  label: [],
  input: [],
  button: [],
  iframe: ['src'],
});
let newWhiteList = {};
for (let key in whiteListClone) {
  newWhiteList[key] = [
    ...new Set([
      'id',
      'class',
      'style',
      'contenteditable',
      'alt',
      'title',
      'width',
      'height',
      'border',
      'align',
      'valign',
      'rowspan',
      'colspan',
      'disabled',
      'type',
      'checked',
      'tabindex',
      ...whiteListClone[key],
    ]),
  ];
}
const Wrapper = styled.div(
  ({ minHeight, maxWidth, maxHeight, dropdownPanelPosition = {}, width }) => `
  .ck {
    &.ckByHtml {
      .ck-content table td, .ck-content table th {
        min-width: 2em;
        padding: 0.4em;
        border: 1px solid #bfbfbf;
      }
    }
    .ck-sticky-panel {
      display: none;
    }
    &.ck-toolbar,
    &.ck-button {
      min-height: 28px !important;
      .ck-icon{
        font-size: 10px;
        color: #515151;
      }
    }
    &.ck-toolbar-dropdown>.ck-dropdown__panel{
      max-width: ${maxWidth || width}px ;
    }
    .ck-toolbar__items {
      height: 100% !important;
    }
    &.ck-editor__top {
      .ck-toolbar_grouping {
        background: #fafafa !important;
        border: 1px solid #dddddd !important;
        height: 36px !important;
      }
      .ck-dropdown__panel {
        .ck-list {
          margin-left: 0;
        }
      }
      .ck-dropdown__panel.ck-dropdown__panel_sw {
        background: #ffffff !important;
        border: 1px solid #e8e8e8 !important;
        box-shadow: 0px 3px 6px 0px rgba(0, 0, 0, 0.16) !important;
      }
      .ck-dropdown__panel.ck-dropdown__panel_ne,
      .ck.ck-dropdown .ck-dropdown__panel.ck-dropdown__panel_se{
        // left: ${dropdownPanelPosition.left ? dropdownPanelPosition.left : 'initial'} ;
        // right:  ${dropdownPanelPosition.right ? dropdownPanelPosition.right : '0'};
        max-height: 300px ;
        overflow-y: auto;
      }
    }
    .ck-content {
      min-height: ${minHeight || 90}px !important;
      max-height: ${maxHeight ? `${maxHeight}px` : 'initial'} ;
      border: 1px solid #f7f7f7 !important;
      font-size: 13px !important;
      background: #f7f7f7 !important;
      border-radius: 3px !important;
      box-shadow: none !important;
      padding: 0 7.8px;
      > :first-child {
        margin-top: 11.7px;
      }
      > :last-child {
        margin-bottom: 11.7px;
      }
      &.ck-focused {
        background: #fff !important;
        border: 1px solid #2196f3 !important;
      }
    }
  }
  &.clickInit {
    cursor: text;
  }
  &.disabled {
    .ck-content {
      background: #fff !important;
      border: 0px !important;
      &.ck-focused {
        background: #fff !important;
        border: 1px solid #fff !important;
      }
    }
    .ck.ck-editor__editable.ck-blurred .ck-widget.ck-widget_selected, .ck.ck-editor__editable.ck-blurred .ck-widget.ck-widget_selected:hover{
      outline: none !important;
    }
  }
  &.mdEditorContent{
    .ck {
      .ck-content {
        border: none !important;
        background: #fff !important;
        border-radius: none !important;
        box-shadow: none !important;
        &.ck-focused {
          background: #fff !important;
          border: none !important;
        }
      }
    }
  }
  &.showTool{
    .ck-sticky-panel {
      display: block;
      .ck-toolbar{
        background: #fafafa;
        border: 1px solid #eaeaea !important;
        border-left:0;
        border-right:0;
      }
    }
  }
  &.editorNull{
    min-height: ${minHeight || 90}px ;
    background: #fff ;
    border-radius: 2px;
    padding: 10px;
    color: #bdbdbd;
    border: 1px solid #dddddd;
    overflow: hidden;
  }
  &.remarkControl{
    .ck .ck-content {
      max-height: 600px !important;
      border: 0 !important;
      background: none !important;
      padding: 0 !important;
      min-height: auto !important;
    }
  }
`,
);
class MyUploadAdapter {
  constructor(loader, tokenArgs, options = {}) {
    this.loader = loader;
    this.tokenArgs = tokenArgs;
    this.options = options;
  }

  // Starts the upload process.
  upload() {
    return new Promise((resolve, reject) => {
      this._initRequest();
      this._initListeners(resolve, reject);
      this._sendRequest(resolve, reject);
    });
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  // Example implementation using XMLHttpRequest.
  _initRequest() {
    const xhr = (this.xhr = new XMLHttpRequest());

    xhr.open('POST', md.global.FileStoreConfig.uploadHost, true);
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners(resolve, reject) {
    const xhr = this.xhr;
    const loader = this.loader;
    const genericErrorText = "Couldn't upload file:" + ` ${loader.file.name}.`;

    xhr.addEventListener('error', () => reject(genericErrorText));
    xhr.addEventListener('abort', () => reject());
    // xhr.addEventListener('load', () => {
    //   const response = xhr.response;
    //   if (!response || response.error) {
    //     return reject(response && response.error ? response.error.message : genericErrorText);
    //   }

    //   // If the upload is successful, resolve the upload promise with an object containing
    //   // at least the "default" URL, pointing to the image on the server.
    //   resolve({
    //     default: JSON.parse(xhr.responseText).keyUrl,
    //   });
    // });

    if (xhr.upload) {
      xhr.upload.addEventListener('progress', evt => {
        if (evt.lengthComputable) {
          loader.uploadTotal = evt.total;
          loader.uploaded = evt.loaded;
        }
      });
    }
  }

  // Prepares the data and sends the request.
  _sendRequest(resolve, reject) {
    const data = new FormData();
    this.loader.file.then(result => {
      let fileExt = `.${RegExpValidator.getExtOfFileName(result.name)}`;
      let isPic = RegExpValidator.fileIsPicture(fileExt);
      this.url = '';
      getToken([{ bucket: get(this, 'options.bucket') || (isPic ? 4 : 2), ext: fileExt }], 9, this.tokenArgs).then(
        res => {
          data.append('token', res[0].uptoken);
          data.append('file', result);
          data.append('key', res[0].key);
          data.append('x:serverName', res[0].serverName);
          data.append('x:filePath', res[0].key.replace(res[0].fileName, ''));
          data.append('x:fileName', res[0].fileName);
          data.append(
            'x:originalFileName',
            encodeURIComponent(
              res[0].fileName.indexOf('.') > -1 ? res[0].fileName.split('.').slice(0, -1).join('.') : res[0].fileName,
            ),
          );
          var fileExt = '.' + RegExpValidator.getExtOfFileName(res[0].fileName);
          data.append('x:fileExt', fileExt);
          this.url = res[0].url || (res[0].serverName && res[0].key ? res[0].serverName + res[0].key : '');
          this.xhr.send(data);
        },
      );
      this.xhr.addEventListener('load', () => {
        const response = this.xhr.response;
        if (!response || response.error) {
          return reject(response && response.error ? response.error.message : genericErrorText);
        }

        // If the upload is successful, resolve the upload promise with an object containing
        // at least the "default" URL, pointing to the image on the server.
        resolve({
          default: this.url,
        });
        this.url = '';
      });
    });
  }
}

const RichText = ({
  bucket,
  projectId,
  appId,
  worksheetId,
  data,
  disabled,
  onSave,
  onActualSave,
  className,
  placeholder,
  minHeight,
  showTool,
  onClickNull,
  changeSetting,
  id,
  maxWidth,
  maxHeight,
  dropdownPanelPosition,
  toolbarList,
  isRemark,
  clickInit = false,
  autoFocus = false,
  width,
  handleFocus = () => {},
}) => {
  const [MDEditor, setComponent] = useState(null);
  const editorDiv = useRef();
  let editorDom = useRef();
  const lang = () => {
    const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;
    if (lang === 'zh-Hant') {
      return 'zh';
    } else if (lang === 'ja') {
      return 'ja';
    } else if (lang !== 'en') {
      return 'zh-cn';
    } else {
      return 'en';
    }
  };
  const tokenArgs = {
    projectId,
    appId,
    worksheetId,
  };

  function initEditor() {
    import('@mdfe/ckeditor5-custom-build').then(component => {
      setComponent(component);
      setTimeout(() => {
        if (!disabled && editorDom && editorDom.current && editorDom.current.editor) {
          editorDom.current.editor.plugins.get('FileRepository').createUploadAdapter = loader => {
            return new MyUploadAdapter(loader, tokenArgs, { bucket });
          };
          if (clickInit || autoFocus) {
            editorDom.current.editor.focus();
            editorDom.current.editor.model.change(writer => {
              writer.setSelection(writer.createPositionAt(editorDom.current.editor.model.document.getRoot(), 'end'));
            });
          }
        }
      }, 20);
    });
  }

  useEffect(() => {
    if (disabled) {
      $(editorDiv.current).find('a').attr('target', '_blank'); // 只读的情况下，a标签新开页处理
    } else if (!MDEditor && !clickInit) {
      initEditor();
    }
  }, [disabled]);

  let content;
  if (disabled || !MDEditor) {
    content = (
      <div className="ck ck-reset ck-editor ck-rounded-corners ckByHtml" role="application" dir="ltr" lang="zh-cn">
        <div className="ck ck-editor__main" role="presentation">
          <div
            className="ck-blurred ck ck-content ck-editor__editable ck-rounded-corners ck-editor__editable_inline ck-read-only"
            lang="zh-cn"
            dir="ltr"
            role="textbox"
            contenteditable="false"
            dangerouslySetInnerHTML={{
              __html: filterXSS(data || placeholder, {
                whiteList: newWhiteList,
                css: false,
              }),
            }}
          />
        </div>
      </div>
    );
  } else if (MDEditor) {
    content = (
      <CKEditor
        editor={MDEditor.default}
        id={id}
        config={{
          language: lang(),
          toolbar: {
            items: toolbarList
              ? toolbarList
              : [
                  'undo',
                  'redo',
                  'findAndReplace',
                  '|',
                  'paragraph',
                  'heading1',
                  'heading2',
                  'heading3',
                  '|',
                  'fontFamily',
                  'fontSize',
                  'fontColor',
                  'highlight',
                  '|',
                  'bold',
                  'italic',
                  'underline',
                  'strikethrough',
                  'subscript',
                  'superscript',
                  'removeFormat',
                  '|',
                  'bulletedList',
                  'numberedList',
                  'todoList',
                  '|',
                  'alignment',
                  'indent',
                  'outdent',
                  '|',
                  'horizontalLine',
                  'blockQuote',
                  'link',
                  'code',
                  'imageUpload',
                  'insertTable',
                  'codeBlock',
                  '|',
                  'sourceEditing',
                  // 'htmlEmbed',
                ],
            shouldNotGroupWhenFull: showTool,
          },
          heading: {
            options: [
              { model: 'paragraph', title: _l('正文'), class: 'ck-heading_paragraph' },
              { model: 'heading1', view: 'h1', title: _l('一级标题'), class: 'ck-heading_heading1' },
              { model: 'heading2', view: 'h2', title: _l('二级标题'), class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: _l('三级标题'), class: 'ck-heading_heading3' },
            ],
          },
          image: {
            resizeUnit: 'px',
            toolbar: [
              'imageTextAlternative',
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
              '|',
              'toggleImageCaption',
            ],
          },
          highlight: {
            options: [
              {
                model: 'yellowMarker',
                class: 'marker-yellow',
                title: _l('黄色标记'),
                color: 'var(--ck-highlight-marker-yellow)',
                type: 'marker',
              },
              {
                model: 'greenMarker',
                class: 'marker-green',
                title: _l('绿色标记'),
                color: 'var(--ck-highlight-marker-green)',
                type: 'marker',
              },
              {
                model: 'pinkMarker',
                class: 'marker-pink',
                title: _l('粉色标记'),
                color: 'var(--ck-highlight-marker-pink)',
                type: 'marker',
              },
              {
                model: 'blueMarker',
                class: 'marker-blue',
                title: _l('蓝色标记'),
                color: 'var(--ck-highlight-marker-blue)',
                type: 'marker',
              },
            ],
          },
          fontFamily: {
            options: [
              'default',
              '宋体, STFangsong, SimSun',
              '黑体, STHeiti,  SimHei',
              '微软雅黑,  Microsoft YaHei',
              '楷体, STKaiti, STKaiti',
              '仿宋, STFangsong, FangSong_GB2312',
              'Arial, Helvetica, sans-serif',
              'Courier New, Courier, monospace',
              'Georgia, serif',
              'Lucida Sans Unicode, Lucida Grande, sans-serif',
              'Tahoma, Geneva, sans-serif',
              'Times New Roman, Times, serif',
              'Trebuchet MS, Helvetica, sans-serif',
              'Verdana, Geneva, sans-serif',
            ],
          },
          table: {
            contentToolbar: [
              'tableColumn',
              'tableRow',
              'mergeTableCells',
              'tableProperties',
              'tableCellProperties',
              'toggleTableCaption',
            ],
          },
          htmlSupport: {
            allow: [
              {
                name: /^(p|span|div|img|table|tbody|thead|tfoot|tr|td|th|col|colgroup|caption|hr|br|ul|ol|li|blockquote|em|h[2-6])$/,
                styles: true,
              },
              {
                name: 'iframe',
                attributes: true,
                styles: true,
              },
            ],
          },
        }}
        disabled={disabled}
        data={data}
        ref={editorDom}
        onReady={editor => {
          if (editor && editor.plugins) {
            editor.plugins.get('FileRepository').createUploadAdapter = loader => {
              return new MyUploadAdapter(loader, tokenArgs);
            };
          }
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          changeSetting && changeSetting(true);
          if (onActualSave) {
            onActualSave(data);
          }
        }}
        onBlur={(event, editor) => {
          if (onSave) {
            const data = editor.getData();
            onSave(data);
          }
        }}
        onFocus={(event, editor) => {
          setTimeout(() => {
            !showTool && $(editorDiv.current).find('.ck-sticky-panel').show();
          }, 300);
          handleFocus();
        }}
      />
    );
  }
  return (
    <Wrapper
      className={cx(className, {
        clickInit,
        disabled,
        showTool,
        editorNull: disabled && !data,
        Hand: !!onClickNull,
        remarkControl: isRemark,
      })}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      dropdownPanelPosition={dropdownPanelPosition}
      ref={editorDiv}
      onClick={() => {
        if (disabled && _.isFunction(onClickNull)) {
          onClickNull();
        }
        if (!disabled && !MDEditor && clickInit) {
          if (!disabled && !MDEditor) {
            initEditor();
          }
        }
      }}
      width={width}
    >
      {content}
    </Wrapper>
  );
};
export default autoSize(RichText, { onlyWidth: true });
