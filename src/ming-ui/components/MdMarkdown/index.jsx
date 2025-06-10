import React, { useEffect, useRef } from 'react';
import Vditor from '@mdfe/vditor';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { getToken } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import '/staticfiles/vditordist/index.css';

const TOOLBAR = [
  'emoji',
  'headings',
  'bold',
  'italic',
  'strike',
  'link',
  '|',
  'list',
  'ordered-list',
  'check',
  'outdent',
  'indent',
  '|',
  'line',
  'quote',
  'code',
  'inline-code',
  'insert-before',
  'insert-after',
  '|',
  {
    name: 'upload',
    tip: _l('上传图片'),
  },
  // 'record',
  'table',
  '|',
  'undo',
  'redo',
  // '|',
  // 'edit-mode',
  // {
  //   name: 'more',
  //   toolbar: ['both', 'code-theme', 'content-theme', 'export', 'outline', 'preview', 'devtools', 'info', 'help'],
  // },
];

const Wrap = styled.div`
  height: ${props => (props.isFullScreen ? '100%' : 'auto')};
  ${props => (props.maxHeight && !props.isFullScreen ? `max-height: ${props.maxHeight}px` : '')};
  .vditor {
    max-height: inherit;
  }
  .vditor-toolbar {
    background: #fafafa;
    padding: 0 5px !important;
    border: 1px solid #dddddd !important;
  }
  .vditor-reset {
    ${props => (props.isFullScreen ? 'padding: 10px !important;' : '')}
    font-size: 13px;
    color: #151515;
    font-family:
      'Helvetica Neue', Helvetica, Arial, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi Micro Hei',
      sans-serif !important;

    & > div[data-block='0'] {
      min-height: 24px;
    }

    ul,
    ol {
      margin-block-start: 1em;
      margin-block-end: 1em;
      margin-inline-start: 0px;
      margin-inline-end: 0px;
      padding-inline-start: 40px;
      li {
        display: list-item !important;
        list-style: inherit;
        text-align: -webkit-match-parent !important;
      }
    }
    ol {
      list-style-type: decimal;
      ol {
        list-style-type: lower-latin;
        ol {
          list-style-type: lower-roman;
          ol {
            list-style-type: upper-latin;
            ol {
              list-style-type: upper-roman;
            }
          }
        }
      }
    }
    ul {
      list-style-type: disc;
      ul {
        list-style-type: circle;
        ul {
          list-style-type: square;
          ul {
            list-style-type: square;
          }
        }
      }
    }
  }
  .vditor-ir pre.vditor-reset[contenteditable='false'] {
    opacity: 1 !important;
  }

  .vditor-toolbar--hide {
    display: none;
  }
`;

function MdMarkdown(props) {
  const {
    mode = 'ir',
    maxHeight,
    minHeight = 90,
    placeholder = '',
    data = '',
    disabled = false,
    isFullScreen = false,
    projectId,
    appId,
    bucket,
    worksheetId,
    hideToolbar = false,
    registerRef = () => {},
    handleFocus = () => {},
    handleChange = () => {},
    handleBlur = () => {},
  } = props;

  const vditorRef = useRef(null);
  const vditorInstance = useRef(null);

  useEffect(() => {
    createEditor();
  }, []);

  useEffect(() => {
    if (vditorInstance.current) {
      if (disabled) {
        vditorInstance.current.disabled();
      } else {
        vditorInstance.current.enable();
      }
    }
  }, [disabled]);

  useEffect(() => {
    if (vditorInstance.current && vditorInstance.current.getValue() !== data) {
      vditorInstance.current.setValue(data);
    }
  }, [data]);

  const customUpload = files => {
    return new Promise((resolve, reject) => {
      const urlList = [];
      const showList = [];

      files.forEach(file => {
        const formData = new FormData();
        const fileExt = `.${RegExpValidator.getExtOfFileName(file.name)}`;
        const isPic = RegExpValidator.fileIsPicture(fileExt);

        getToken([{ bucket: bucket || (isPic ? 4 : 2), ext: fileExt }], 9, {
          projectId,
          appId,
          worksheetId,
        })
          .then(res => {
            formData.append('token', res[0].uptoken);
            formData.append('file', file);
            formData.append('key', res[0].key);
            formData.append('x:serverName', res[0].serverName);
            formData.append('x:filePath', res[0].key.replace(res[0].fileName, ''));
            formData.append('x:fileName', res[0].fileName);
            formData.append(
              'x:originalFileName',
              encodeURIComponent(
                res[0].fileName.indexOf('.') > -1 ? res[0].fileName.split('.').slice(0, -1).join('.') : res[0].fileName,
              ),
            );
            formData.append('x:fileExt', '.' + RegExpValidator.getExtOfFileName(res[0].fileName));

            return window.mdyAPI('', '', formData, {
              ajaxOptions: {
                url: md.global.FileStoreConfig.uploadHost,
              },
              customParseResponse: true,
            });
          })
          .then(res => {
            if (res) {
              const urlImg = res.url || (res.serverName && res.key) ? res.serverName + res.key : '';
              urlList.push(urlImg);
              showList.push(`${(file.type || '').includes('image') ? '!' : ''}[${file.name}](${urlImg})`);
              if (urlList.length === files.length) {
                resolve(urlList);
                if (vditorInstance.current) {
                  const markdownText = showList.join('\n');
                  vditorInstance.current.insertValue(markdownText);
                }
              }
            }
          })
          .catch(error => {
            console.error('上传失败:', error);
            reject(error);
          });
      });
    });
  };

  const createEditor = () => {
    if (!vditorRef.current) return;
    const vditor = new Vditor(vditorRef.current, {
      mode,
      ...(isFullScreen ? { height: '100%' } : { minHeight }),
      cdn: '/staticfiles',
      placeholder,
      toolbar: TOOLBAR,
      toolbarConfig: {
        hide: hideToolbar,
      },
      lazyLoadImage: 'loading',
      preview: {
        delay: 0,
        actions: [],
        hljs: {
          style: 'monokai',
          lineNumber: true,
        },
        math: {
          inlineDigit: true,
          macros: {
            bf: '{\\boldsymbol f}',
            bu: '{\\boldsymbol u}',
            bv: '{\\boldsymbol v}',
            bw: '{\\boldsymbol w}',
          },
        },
      },
      tab: '\t',
      typewriterMode: true,
      cache: {
        enable: false,
      },
      upload: {
        accept: 'image/*',
        handler: customUpload,
      },
      after() {
        vditor.setValue(data);
        vditorInstance.current = vditor;
        registerRef(vditor);

        if (vditorInstance.current) {
          if (disabled) vditorInstance.current.disabled();
        }
      },
      input(val) {
        handleChange(val);
      },
      ...(isFullScreen ? {} : { focus: val => handleFocus(val), blur: val => handleBlur(val) }),
    });
  };

  return (
    <Wrap isFullScreen={isFullScreen} maxHeight={maxHeight}>
      <div ref={vditorRef} />
    </Wrap>
  );
}

export default MdMarkdown;

MdMarkdown.propTypes = {
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number,
  placeholder: PropTypes.string,
  data: PropTypes.string,
  disabled: PropTypes.bool,
  hideToolbar: PropTypes.bool,
  /**
   * 编辑模式：所见即所得（wysiwyg）、即时渲染（ir）、分屏预览（sv）
   */
  mode: PropTypes.string,
  isFullScreen: PropTypes.bool,
  handleChange: PropTypes.func,
};
