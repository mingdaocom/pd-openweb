import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cx from 'classnames';
import { get, isFunction } from 'lodash';
import _ from 'lodash';
import styled from 'styled-components';
import { Modal } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { SYSTEM_CONTROL, WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import noAiPng from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/assets/noAi.png';
import ChatLLM from './ChatBot/ChatLLM';
import ReactCodeEditor from './ChatBot/ReactCodeEditor';
import ControlPreview from './ControlPreview';
import DevelopGuide from './DevelopGuide';
import DragHelper from './DragHelper';
import EditableText from './EditableText';
import EmptyHolder from './EmptyHolder';
import EnvConfig from './EnvConfig';
import { Icon, IconButton } from './styled';
import { getDefaultCompCode, getEnvControls, getFormData } from './util';

const Con = styled.div`
  height: 100vh;
  background: #f5f5f9;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 50px;
  background: #ffffff;
  box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  padding: 0 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Container = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: row;
  gap: 6px;
  flex: 1;
  box-sizing: border-box;
  overflow: hidden;
`;

const PreviewAndEditor = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.08);
  overflow-y: auto;
`;

const Preview = styled(Card)`
  height: ${props => props.height || '240'}px;
`;

const Editor = styled(Card)`
  position: relative;
  padding-bottom: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  .file-name {
    margin-left: 5px;
    font-family: monospace;
  }
  hr {
    margin: 0 20px;
    border: none;
    border-top: 1px solid #eaeaea;
  }
`;

const EditorHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 48px;
  padding: 0 20px;
  flex-shrink: 0;
`;

const CodingArea = styled.div`
  flex: 1;
  overflow: hidden;
`;

const Terminal = styled.div`
  height: ${props => props.height || '200'}px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .header {
    height: 36px;
    flex-shrink: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 20px;
    border-top: 1px solid #eaeaea;
    border-bottom: 1px solid #eaeaea;
  }
  .content {
    flex: 1;
    padding: 4px 20px;
    color: #af0f00;
  }
`;

const ConfigAndLLM = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 40%;
  gap: 6px;
  flex-shrink: 0;
`;

const Config = styled(Card)`
  height: ${props => props.height || '220'}px;
  overflow-y: auto;
`;

const LLM = styled(Card)`
  flex: 1;
`;

const ExitButton = styled.div`
  cursor: pointer;
  font-weight: bold;
  border-radius: 4px;
  padding: 0 20px;
  background: #f5f5f4;
  height: 34px;
  line-height: 34px;
  font-size: 13px;
  color: #1677ff;
  &:hover {
    background: #efefef;
  }
`;

const TOP_MIN_HEIGHT = 200;
const BOTTOM_MIN_HEIGHT = 400;

function getDefaultCode(control) {
  const isNewControl = !/\w{24}/.test(control.controlId);
  return isNewControl ? getDefaultCompCode(control) : '';
}

export default function DevelopWithAI(props) {
  const { worksheetId, control = {}, rest = {}, onClose = _.noop } = props;
  const defaultCode = props.defaultCode || getDefaultCode(control);
  const [changes, setChanges] = useState({});
  const [controlName, setControlName] = useState(control.controlName);
  const freeId = get(control, 'advancedSetting.freeid');
  const [previewHeight, setPreviewHeight] = useState(
    Number(localStorage.getItem(`preview_height_${window.screen.width}x${window.screen.height}`) || TOP_MIN_HEIGHT),
  );
  const [configHeight, setConfigHeight] = useState(
    Number(localStorage.getItem(`config_height_${window.screen.width}x${window.screen.height}`) || TOP_MIN_HEIGHT),
  );
  const { onChange } = rest;
  const llmRef = useRef(null);
  const [reference, setReference] = useState(getAdvanceSetting(control, 'reference') || []);
  const [llmIsGenerating, setLlmIsGenerating] = useState(false);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [codeFileName, setCodeFileName] = useState('Free_field.jsx');
  const [codeStore, setCodeStore] = useState({});
  const [runnerCode, setRunnerCode] = useState(defaultCode);
  const [runFlag, setRunFlag] = useState();
  const [currentCode, setCurrentCode] = useState(defaultCode);
  const [showEmptyHolder, setShowEmptyHolder] = useState(!props.defaultCode);
  const [lastCode, setLastCode] = useState();
  const [error, setError] = useState();
  const [mockRecord, setMockRecord] = useState();
  const [envIsMobile, setEnvIsMobile] = useState(false);
  const [envIsDisabled, setEnvIsDisabled] = useState(false);
  const formData = useMemo(
    () => getFormData(rest.allControls.concat([...SYSTEM_CONTROL, ...WORKFLOW_SYSTEM_CONTROL]), mockRecord),
    [rest.allControls, mockRecord],
  );
  const handleCodeCardClick = useCallback(
    messageId => {
      if (codeStore[messageId]) {
        setCurrentCode(codeStore[messageId].code);
        setCodeFileName(codeStore[messageId].fileName);
      }
    },
    [lastCode, Object.keys(codeStore)],
  );
  const handleExit = () => {
    const blobSizeOfKb = new Blob([currentCode]).size / 1024;
    if (blobSizeOfKb > 64) {
      alert(_l('代码无法保存，代码长度不能超过64KB'), 3);
      return;
    }
    onChange({ ...control, ...changes });
    onClose();
  };
  useEffect(() => {
    setChanges(prev => ({
      ...prev,
      advancedSetting: { ...(prev.advancedSetting || control.advancedSetting), custom_js: currentCode },
    }));
  }, [currentCode]);
  return (
    <Modal visible fullScreen bodyStyle={{ padding: 0 }} closeIcon={<span />}>
      <Con>
        <Header>
          <i className="icon-backspace Font16 mRight12 Gray_75 ThemeHoverColor3 pointer" onClick={handleExit} />
          <EditableText
            value={control.controlName}
            onChange={(newName = '') => {
              setChanges(prev => ({ ...prev, controlName: newName }));
              setControlName(newName);
            }}
          />
          <div className="flex TxtCenter Font14 bold">
            {_l('此字段处于公测体验阶段，欢迎体验使用，如有问题欢迎反馈。')}
          </div>
          <ExitButton onClick={handleExit}>{_l('退出AI辅助开发')}</ExitButton>
        </Header>
        <Container>
          <PreviewAndEditor>
            <DragHelper
              defaultTop={previewHeight + 3}
              onChange={newValue => {
                setPreviewHeight(newValue);
                localStorage.setItem(`preview_height_${window.screen.width}x${window.screen.height}`, newValue);
              }}
              min={240}
              max={window.innerHeight - 50 - 10 - BOTTOM_MIN_HEIGHT}
            />
            <Preview height={previewHeight} style={envIsMobile ? { width: 400, margin: '0 auto' } : {}}>
              <ControlPreview
                controlName={controlName}
                currentControlId={control.controlId}
                runFlag={runFlag}
                code={runnerCode}
                formData={formData}
                reference={reference}
                isDisabled={envIsDisabled}
                isMobile={envIsMobile}
                onError={newError => {
                  setTerminalVisible(true);
                  setError(newError);
                }}
              />
            </Preview>
            <Editor>
              <EditorHeader>
                <Icon className="icon icon-react" color="#9e9e9e" size={24} />
                <span className="file-name">{codeFileName}</span>
                <div style={{ flex: 1 }}></div>
                <IconButton
                  onClick={() => {
                    if (runnerCode === currentCode) {
                      setRunFlag(Math.random());
                    } else {
                      setRunnerCode(currentCode);
                    }
                  }}
                >
                  <Icon className="icon icon-play_circle_filled" color="#01ca83" />
                  <span className="text">{_l('运行')} </span>
                </IconButton>
                <IconButton
                  className={cx('mLeft15', { disabled: !lastCode || llmIsGenerating })}
                  onClick={
                    lastCode
                      ? () => {
                          setCurrentCode(lastCode);
                          setLastCode(undefined);
                        }
                      : undefined
                  }
                >
                  <Icon className="icon icon-rotate" color="#9e9e9e" />
                  <span className="text">{_l('撤销')} </span>
                </IconButton>
                <IconButton
                  className="mLeft15"
                  textColor={terminalVisible ? '#1677ff' : '#151515'}
                  onClick={() => setTerminalVisible(prevVisible => !prevVisible)}
                >
                  <Icon className="icon icon-fact_check_black" color={terminalVisible ? '#1677ff' : '#9e9e9e'} />
                  <span className="text">{_l('控制台')} </span>
                </IconButton>
                <DevelopGuide />
              </EditorHeader>
              <CodingArea>
                <ReactCodeEditor value={currentCode} onChange={setCurrentCode} />
              </CodingArea>
              {terminalVisible && (
                <Terminal height={window.innerHeight - 50 - 10 - 240 - 6 - 200 < 200 ? 100 : 200}>
                  <div className="header">
                    <Icon className="icon icon-fact_check_black" color="#9e9e9e" />
                    <span className="text mLeft4 Gray_75">{_l('控制台')} </span>
                    <div className="flex"></div>
                    <IconButton
                      textColor="#757575"
                      className={error ? '' : 'disabled'}
                      onClick={() => {
                        if (!error) {
                          return;
                        }
                        if (isFunction(get(llmRef, 'current.sendMessage'))) {
                          setShowEmptyHolder(false);
                          llmRef.current.setInput(_l('我在运行组件时出现了如下错误，请帮忙修复。```%0```', error));
                        }
                      }}
                    >
                      <Icon className="icon icon-ai1" color="#757575" />
                      <span className="text">{_l('修复建议')} </span>
                    </IconButton>
                    <IconButton
                      textColor="#757575"
                      className={cx('mLeft15 Hand', { disabled: !error })}
                      onClick={() => setError('')}
                    >
                      <Icon className="icon icon-block" color="#9e9e9e" />
                      <span className="text">{_l('清除')} </span>
                    </IconButton>
                    <Icon
                      className="icon icon-close mLeft15 mRight2 Hand"
                      fontSize={20}
                      color="#9e9e9e"
                      onClick={() => setTerminalVisible(false)}
                    />
                  </div>
                  <div className="content">{error}</div>
                </Terminal>
              )}
              {showEmptyHolder && (
                <EmptyHolder
                  control={control}
                  onBeginWithMessage={message => {
                    if (isFunction(get(llmRef, 'current.sendMessage'))) {
                      setShowEmptyHolder(false);
                      setCurrentCode('');
                      setError('');
                      llmRef.current.sendMessage(message, { noCode: true });
                    }
                  }}
                  onEnterEditor={() => {
                    setShowEmptyHolder(false);
                  }}
                />
              )}
              <hr />
            </Editor>
          </PreviewAndEditor>
          <ConfigAndLLM>
            <DragHelper
              defaultTop={configHeight + 3}
              onChange={newValue => {
                setConfigHeight(newValue);
                localStorage.setItem(`config_height_${window.screen.width}x${window.screen.height}`, newValue);
              }}
              min={220}
              max={window.innerHeight - 50 - 10 - BOTTOM_MIN_HEIGHT}
            />
            <Config height={configHeight}>
              <EnvConfig
                worksheetId={worksheetId}
                control={control}
                rest={rest}
                reference={reference}
                setReference={setReference}
                controls={rest.allControls}
                mockRecord={mockRecord}
                setMockRecord={setMockRecord}
                envIsMobile={envIsMobile}
                envIsDisabled={envIsDisabled}
                setEnvIsMobile={setEnvIsMobile}
                setEnvIsDisabled={setEnvIsDisabled}
                onUpdate={value =>
                  setChanges(prev => ({
                    ...prev,
                    advancedSetting: {
                      ...(prev.advancedSetting || control.advancedSetting),
                      reference: _.isEmpty(value) ? '' : JSON.stringify(value),
                    },
                  }))
                }
              />
            </Config>
            {md.global.SysSettings.hideAIBasicFun ? (
              <LLM className="alignItemsCenter justifyContentCenter TxtCenter flexColumn">
                <img src={noAiPng} width={209} alt="placeholder" />
                <p className="mTop36 TxtCenter Gray_75 Font16">
                  {!md.global.Account.superAdmin
                    ? _l('AI服务未配置，AI对话生成代码暂不可用，请联系管理员反馈')
                    : _l('AI服务未配置，AI对话生成代码暂不可用')}
                  {md.global.Account.superAdmin && (
                    <span
                      className="ThemeColor3 ThemeHoverColor3 Hand mLeft8"
                      onClick={() => {
                        location.href = md.global.Config.WebUrl + 'pm/sysconfig/hub';
                      }}
                    >
                      {_l('去配置')}
                    </span>
                  )}
                </p>
              </LLM>
            ) : (
              <LLM>
                <ChatLLM
                  showEmptyHolder={showEmptyHolder}
                  worksheetId={worksheetId}
                  control={control}
                  freeId={freeId}
                  ref={llmRef}
                  env={{
                    controls: getEnvControls(reference, rest.allControls),
                  }}
                  currentCode={currentCode}
                  setLlmIsGenerating={setLlmIsGenerating}
                  onCodeUpdate={(newCode, { title, fileName, isComplete, messageId } = {}) => {
                    setShowEmptyHolder(false);
                    if (!lastCode) {
                      setLastCode(currentCode);
                    }
                    setCurrentCode(newCode);
                    if (fileName) {
                      setCodeFileName(fileName);
                    }
                    if (isComplete) {
                      if (!codeStore[messageId]) {
                        setCodeStore(prev => ({
                          ...prev,
                          [messageId]: {
                            code: newCode,
                            title,
                            fileName,
                          },
                        }));
                        setRunnerCode(newCode);
                      }
                    }
                  }}
                  onCodeCardClick={handleCodeCardClick}
                />
              </LLM>
            )}
          </ConfigAndLLM>
        </Container>
      </Con>
    </Modal>
  );
}

export function openDevelopWithAI(props) {
  functionWrap(DevelopWithAI, props);
}

/**
 * TODO
 * formData 只传配置了引用的字段
 * AI 使用别名
 * 组件加载状态
 * 组件运行时不要显示报错
 * env prompt
 * 告诉大模型环境变量
 * env 老是瞎取，取值不正确
 * 重新运行，controlPreview 值要清空
 */
