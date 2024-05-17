// import react, react-markdown-editor-lite, and a markdown parser you like
import React, { useState } from 'react';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
// import style manually
import 'react-markdown-editor-lite/lib/index.css';
import styled from 'styled-components';
import cx from 'classnames';
import { getToken } from 'src/util';

// Register plugins if required
// MdEditor.use(YOUR_PLUGINS_HERE);

// Initialize a markdown parser
const mdParser = new MarkdownIt(/* Markdown-it options */);

const Wrap = styled.div`
  .MdEditorCon {
    min-height: ${props => props.minHeight || 90}px;
    height: ${props => props.height || 500}px;
    max-height: ${props => props.maxHeight || 500}px;
    ul {
      list-style-type: disc !important;
      padding-left: 36px;
      li {
        list-style: disc !important;
      }
    }
    ol {
      padding-left: 36px;
      list-style-type: decimal !important;
      li {
        list-style: decimal !important;
      }
    }
    li {
      display: list-item !important;
      text-align: -webkit-match-parent !important;
      unicode-bidi: isolate !important;
    }
  }
  .rc-md-editor .editor-container > .section:last-child {
    border: none;
  }
`;

const Markdown = props => {
  const { onSave, disabled, projectId, appId, worksheetId, bucket } = props;
  const [value, setValue] = useState(props.value);
  const handleChange = ({ html, text }) => {
    setValue(text);
    onSave(text);
    // 这里可以处理 newValue，比如保存到服务器等
  };
  const tokenArgs = {
    projectId,
    appId,
    worksheetId,
  };
  MdEditor.addLocale('md_lang', {
    clearTip: _l('您确定要清空所有内容吗？'),
    btnHeader: _l('标题'),
    btnClear: _l('清空'),
    btnBold: _l('加粗'),
    btnItalic: _l('斜体'),
    btnUnderline: _l('下划线'),
    btnStrikethrough: _l('删除线'),
    btnUnordered: _l('无序列表'),
    btnOrdered: _l('有序列表'),
    btnQuote: _l('引用'),
    btnLineBreak: _l('换行'),
    btnInlineCode: _l('行内代码'),
    btnCode: _l('代码块'),
    btnTable: _l('表格'),
    btnImage: _l('图片'),
    btnLink: _l('链接'),
    btnUndo: _l('撤销'),
    btnRedo: _l('重做'),
    btnFullScreen: _l('全屏'),
    btnExitFullScreen: _l('退出全屏'),
    btnModeEditor: _l('仅显示编辑器'),
    btnModePreview: _l('仅显示预览'),
    btnModeAll: _l('显示编辑器与预览'),
    selectTabMap: _l('按下 Tab 键时实际的输入'),
    tab: _l('制表符'),
    spaces: _l('空格'),
  });
  MdEditor.useLocale('md_lang');
  const PLUGINS = [
    'header',
    'font-bold',
    'font-italic',
    'font-underline',
    'font-strikethrough',
    'list-unordered',
    'list-ordered',
    'block-quote',
    'block-wrap',
    'block-code-inline',
    'block-code-block',
    'table',
    'image',
    'link',
    // 'clear',
    'logger',
    'mode-toggle',
    'full-screen',
    'tab-insert',
  ];
  const handleImageUpload = file => {
    return new Promise(resolve => {
      const data = new FormData();
      let fileExt = `.${File.GetExt(file.name)}`;
      let isPic = File.isPicture(fileExt);
      let urlImg = '';
      getToken([{ bucket: bucket || (isPic ? 4 : 2), ext: fileExt }], 9, tokenArgs).then(res => {
        data.append('token', res[0].uptoken);
        data.append('file', file);
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
        data.append('x:fileExt', '.' + File.GetExt(res[0].fileName));
        urlImg = res[0].url || (res[0].serverName && res[0].key) ? res[0].serverName + res[0].key : '';
        const xhr = new XMLHttpRequest();
        xhr.open('POST', md.global.FileStoreConfig.uploadHost, true);
        xhr.onerror = function () {
          reject(new Error('Network Error'));
        };
        xhr.send(data);
        xhr.addEventListener('load', () => {
          const response = xhr.response;
          if (!response || response.error) {
            const genericErrorText = "Couldn't upload file:" + ` ${file.name}.`;
            return reject(response && response.error ? response.error.message : genericErrorText);
          }
          resolve(urlImg);
        });
      });
    });
  };
  return (
    <Wrap className={cx({ Hide: disabled })}>
      <MdEditor
        htmlClass="MdEditorCon"
        markdownClass="MdEditorCon"
        plugins={PLUGINS}
        renderHTML={text => mdParser.render(text)}
        value={value}
        onChange={handleChange}
        onImageUpload={handleImageUpload}
        // https://github.com/HarryChen0506/react-markdown-editor-lite/blob/master/docs/api.zh-CN.md
        config={{
          view: {
            md: !disabled, //编辑
            menu: !disabled, //按钮
            html: true, //预览区
          },
        }}
      />
    </Wrap>
  );
};

export default Markdown;
