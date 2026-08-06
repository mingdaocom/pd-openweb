import React, { useEffect, useMemo, useRef, useState } from 'react';
import copy from 'copy-to-clipboard';
import styled from 'styled-components';
import { Dialog, LoadDiv, TagTextarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { emitter } from 'src/utils/common';
import { getDefaultMjml, getMjmlPreviewHtml, getMjmlPreviewTheme } from './mjmlUtils';

const DialogContent = styled.div`
  --mjml-editor-bg: var(--color-background-primary);
  --mjml-editor-text: var(--color-text-primary);
  --mjml-editor-muted: var(--color-text-tertiary);
  --mjml-editor-hover: var(--color-text-secondary);
  --mjml-editor-cursor: var(--color-text-primary);
  --mjml-editor-gutter-border: var(--color-border-primary);
  [data-theme='dark'] & {
    --mjml-editor-bg: var(--color-background-inverse);
    --mjml-editor-text: var(--color-text-inverse);
    --mjml-editor-muted: var(--color-text-disabled);
    --mjml-editor-hover: var(--color-white);
    --mjml-editor-cursor: var(--color-white);
    --mjml-editor-gutter-border: var(--color-border-secondary);
  }
  height: 640px;
  display: flex;
  overflow: hidden;
  border: 1px solid var(--color-border-primary);
  border-radius: 4px;
  .mjmlEditorPane,
  .mjmlPreviewPane {
    width: 50%;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .mjmlEditorPane {
    background: var(--mjml-editor-bg);
    border-right: 1px solid var(--color-border-primary);
    position: relative;
  }
  .mjmlPreviewPane {
    background: var(--color-background-primary);
  }
  .mjmlPaneHeader {
    height: 42px;
    padding: 0 14px;
    align-items: center;
    border-bottom: 1px solid var(--color-border-primary);
  }
  .mjmlEditorPane .mjmlPaneHeader {
    color: var(--mjml-editor-muted);
    border-color: var(--color-border-primary);
  }
  .mjmlCopy {
    color: var(--mjml-editor-muted);
    cursor: pointer;
    &:hover {
      color: var(--mjml-editor-hover);
    }
  }
  .mjmlFields {
    color: var(--mjml-editor-muted);
    cursor: pointer;
    &:hover {
      color: var(--mjml-editor-hover);
    }
  }
  .mjmlCodeBox {
    flex: 1;
    min-height: 0;
    .tagInputareaIuput {
      height: 100% !important;
      border: none !important;
      background: var(--mjml-editor-bg);
      .CodeMirror,
      .CodeMirror-scroll {
        height: 100% !important;
        background: var(--mjml-editor-bg);
        color: var(--mjml-editor-text);
        font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
        font-size: 13px;
        line-height: 20px;
      }
      .CodeMirror-gutters {
        background: var(--mjml-editor-bg);
        border-right: 1px solid var(--mjml-editor-gutter-border);
      }
      .CodeMirror-linenumber {
        color: var(--mjml-editor-muted);
      }
      .CodeMirror-cursor {
        border-left-color: var(--mjml-editor-cursor);
      }
    }
  }
  .mjmlReadonlyCode {
    flex: 1;
    min-height: 0;
    margin: 0;
    padding: 12px 14px;
    overflow: auto;
    white-space: pre;
    font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
    font-size: 13px;
    line-height: 20px;
    background: var(--mjml-editor-bg);
    color: var(--mjml-editor-text);
  }
  .mjmlError {
    padding: 8px 12px;
    color: var(--color-error);
    background: var(--color-error-bg);
    border-bottom: 1px solid var(--color-error-border);
    white-space: pre-wrap;
  }
  .mjmlPreviewLoading {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .mjmlPreviewFrame {
    flex: 1;
    width: 100%;
    border: 0;
    background: var(--color-background-primary);
  }
`;

export default function MJMLEditorDialog({
  value,
  html,
  fieldsPanel,
  formulaMap,
  convertMjml,
  onFieldsClick,
  onFieldInsert = () => {},
  onOk,
  onCancel,
  readOnly = false,
  title,
}) {
  const [mjmlValue, setMjmlValue] = useState(value || getDefaultMjml());
  const [previewHtml, setPreviewHtml] = useState(html || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(!html);
  const [themeVersion, setThemeVersion] = useState(0);
  const latestRequest = useRef(0);
  const editorRef = useRef();
  const previewTheme = useMemo(() => getMjmlPreviewTheme(), [themeVersion]);

  const convert = source => {
    const requestId = ++latestRequest.current;

    setPreviewLoading(true);
    convertMjml(source)
      .then(result => {
        if (requestId !== latestRequest.current) return;

        setPreviewHtml(result.html);
        setError('');
        setPreviewLoading(false);
      })
      .catch(err => {
        if (requestId !== latestRequest.current) return;

        setError(err.message || _l('MJML 格式错误'));
        setPreviewLoading(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => convert(mjmlValue), 500);

    return () => clearTimeout(timer);
  }, [mjmlValue]);

  useEffect(() => {
    const handleThemeChange = () => setThemeVersion(value => value + 1);

    emitter.on('CHANGE_THEME_MODE', handleThemeChange);
    return () => emitter.off('CHANGE_THEME_MODE', handleThemeChange);
  }, []);

  const showPreviewLoading = previewLoading && !previewHtml && !error;

  const handleOk = () => {
    if (saving) return;

    setSaving(true);
    convertMjml(mjmlValue)
      .then(result => {
        setSaving(false);
        setError('');
        onOk(mjmlValue, result.html);
      })
      .catch(err => {
        setSaving(false);
        setError(err.message || _l('MJML 格式错误'));
        alert(_l('MJML 格式错误，请修正后再保存'), 2);
      });
  };

  const insertFieldCode = text => {
    const editor = editorRef.current && editorRef.current.cmObj;

    if (editor) {
      editor.replaceRange(text, editor.getCursor(), undefined, 'insertfield');
      editor.focus();
      return;
    }

    setMjmlValue(`${mjmlValue}${text}`);
  };

  return (
    <Dialog
      visible
      type="fixed"
      width={1280}
      title={title || _l('MJML 编辑')}
      okText={readOnly ? undefined : saving ? _l('转换中...') : _l('确定')}
      onOk={readOnly ? undefined : handleOk}
      footer={readOnly ? null : undefined}
      bodyStyle={{ paddingBottom: 0 }}
      onCancel={onCancel}
    >
      <DialogContent style={readOnly ? { height: '100%' } : undefined}>
        <div className="mjmlEditorPane">
          <div className="mjmlPaneHeader flexRow">
            <span className="flex Font15">MJML</span>
            {!readOnly && (
              <span className="mjmlFields mRight16" onClick={onFieldsClick}>
                <i className="icon-workflow_other Font14 mRight4" />
                {_l('节点对象')}
              </span>
            )}
            <Tooltip title={_l('复制后可在 MJML 编辑模式下编辑')}>
              <span
                className="mjmlCopy"
                onClick={() => {
                  copy(mjmlValue, { format: 'text/plain' });
                  alert(_l('已复制'));
                }}
              >
                <i className="icon-content-copy Font18" />
              </span>
            </Tooltip>
          </div>
          {readOnly ? (
            <pre className="mjmlReadonlyCode">{mjmlValue}</pre>
          ) : (
            <TagTextarea
              className="mjmlCodeBox"
              defaultValue={mjmlValue}
              getRef={editor => (editorRef.current = editor)}
              height="100%"
              codeMirrorMode="xml"
              lineNumbers
              maxHeight={10000000}
              onChange={(err, nextValue) => setMjmlValue(nextValue)}
            />
          )}
          {!readOnly &&
            fieldsPanel &&
            React.cloneElement(fieldsPanel, {
              onClose: () => fieldsPanel.props.onClose && fieldsPanel.props.onClose(),
              handleFieldClick: field => {
                const { nodeId, fieldValueId } = field;

                if (!nodeId || !fieldValueId) return;

                insertFieldCode(`$${nodeId}-${fieldValueId}$`);
                onFieldInsert(field);
                fieldsPanel.props.onClose && fieldsPanel.props.onClose();
                alert(_l('已插入'));
              },
            })}
        </div>
        <div className="mjmlPreviewPane">
          {error && <div className="mjmlError">{error}</div>}
          {showPreviewLoading ? (
            <div className="mjmlPreviewLoading">
              <LoadDiv />
            </div>
          ) : (
            <iframe
              className="mjmlPreviewFrame"
              title={_l('邮件效果预览')}
              sandbox=""
              srcDoc={getMjmlPreviewHtml(previewHtml, formulaMap, previewTheme)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
