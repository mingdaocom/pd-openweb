import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Button } from 'ming-ui';
import cx from 'classnames';
import AssistantConfig from './AssistantConfig';
import ChatBox from '../chatBox';
import 'src/pages/workflow/components/Switch/index.less';
import assistantApi from 'src/api/assistant';
import _ from 'lodash';

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: flex;
  z-index: 1;
  height: 55px;
  min-height: 55px;
  padding: 0 16px 0 10px;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 2px 1px rgba(0, 0, 0, 0.16);

  .headerBtn {
    min-width: 50px;
    height: 38px;
    padding: 0 16px;

    &.disabled {
      background: #93c4f1 !important;
    }
  }
  .workflowStatusWrap {
    .disable,
    .disable:hover {
      .iconWrap .workflowSwitchIcon-active {
        color: #bdbdbd !important;
      }
    }
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;

  .left {
    border-right: 1px solid #e0e0e0;
    background: #fff;
  }
  .right {
    .tabWrapper {
      display: flex;
      width: 330px;
      height: 40px;
      padding: 4px;
      margin: 24px 0 16px 0;
      background: #eff0f0;
      border-radius: 4px;
      .tabItem {
        flex: 1;
        border-radius: 4px;
        line-height: 32px;
        text-align: center;
        font-weight: 500;
        color: #757575;
        cursor: pointer;
        &.isActive {
          background: #fff;
          color: #2196f3;
        }
      }
    }
  }
`;

const HEAD_TAB_LIST = [
  { key: 'create', text: _l('创建') },
  { key: 'setting', text: _l('配置') },
];

export default function CreateOrUpdateAssistant(props) {
  const {
    onClose,
    projectId,
    assistantId,
    assistantName,
    knowledgeBase = {},
    onRefreshList,
    onUpdateSuccess,
    onSwitchStatus,
  } = props;
  const [assistantConfig, setAssistantConfig] = useSetState({
    id: assistantId,
    name: assistantName,
    iconUrl: '',
    description: '',
    instructions: '',
    preamble: '',
    exampleQuestions: [''],
    status: 1,
    ...knowledgeBase,
  });
  const [createMsgList, setCreateMsgList] = useState([{ role: 'assistant', content: '' }]);
  const [currentTab, setCurrentTab] = useState(assistantId ? 'setting' : 'create');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveDisabled, setSaveDisabled] = useState(true);
  const { id, status, instructions, knowledgeBaseName } = assistantConfig;
  const statusKey = status === 2 ? 'active' : 'close';

  useEffect(() => {
    assistantId &&
      assistantApi.get({ projectId, assistantId }).then(res => {
        res && setAssistantConfig(_.omit(res, ['creator', 'createTime']));
      });
  }, []);

  const onSave = () => {
    if (saveLoading || saveDisabled) {
      return;
    }

    if (!instructions) {
      alert(_l('指示不能为空'), 3);
      return;
    }

    if (!knowledgeBaseName) {
      alert(_l('知识库不存在'), 3);
      return;
    }

    setSaveLoading(true);
    assistantApi
      .upsert({
        projectId,
        ..._.pick(assistantConfig, [
          'id',
          'icon',
          'iconColor',
          'name',
          'description',
          'instructions',
          'knowledgeBaseId',
          'preamble',
        ]),
        exampleQuestions: assistantConfig.exampleQuestions.filter(item => !!item),
      })
      .then(res => {
        if (res) {
          alert(_l('保存成功'));
          !id && setAssistantConfig({ id: res });
          id ? onUpdateSuccess(id, assistantConfig) : onRefreshList();
          setSaveLoading(false);
        }
      })
      .catch(error => setSaveLoading(false));
  };

  return (
    <Wrapper>
      <HeaderWrapper>
        <div className="flexRow alignItemsCenter Hand" onClick={onClose}>
          <Icon icon="arrow_back" className="Gray_75 Font22 bold" />
          <span className="Gray Font16 bold pLeft10">{assistantId ? assistantName : _l('创建助手')}</span>
        </div>

        <div className="flexRow">
          {status === 1 && id && (
            <Button
              type="ghost"
              className="headerBtn"
              onClick={() =>
                onSwitchStatus(id, 2, () => {
                  setAssistantConfig({ status: 2 });
                  alert(_l('发布成功'));
                })
              }
            >
              {_l('发布助手')}
            </Button>
          )}

          {_.includes([2, 3], status) && (
            <div className="workflowStatusWrap">
              <div
                className={cx('switchWrap', `switchWrap-${statusKey}`, { disable: false })}
                onClick={() => {
                  const targetStatus = status === 2 ? 3 : 2;
                  onSwitchStatus(id, targetStatus, () => {
                    setAssistantConfig({ status: targetStatus });
                    alert(targetStatus === 2 ? _l('开启成功') : _l('关闭成功'));
                  });
                }}
              >
                <div className={cx('contentWrap', `contentWrap-${statusKey}`)}>
                  <div>{status === 2 ? _l('运行中') : _l('已关闭')}</div>
                </div>
                <div className={cx('iconWrap', `iconWrap-${statusKey}`)}>
                  <Icon icon="hr_ok" className={cx('Font20 Gray_bd', `workflowSwitchIcon-${statusKey}`)} />
                </div>
              </div>
            </div>
          )}

          <Button
            type="primary"
            className={cx('headerBtn mLeft16', { disabled: saveLoading || saveDisabled })}
            disabled={saveLoading || saveDisabled}
            onClick={onSave}
          >
            {saveLoading ? _l('保存中...') : _l('保存')}
          </Button>
        </div>
      </HeaderWrapper>

      <ContentWrapper>
        <div className="flex minWidth0">
          <ChatBox className="left" assistantConfig={assistantConfig} projectId={projectId} />
        </div>

        <div className="flex right flexColumn alignItemsCenter">
          <div className="tabWrapper">
            {HEAD_TAB_LIST.map(item => {
              return (
                <div
                  className={cx('tabItem', { isActive: item.key === currentTab })}
                  onClick={() => setCurrentTab(item.key)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>

          {currentTab === 'create' ? (
            <ChatBox
              isDialogueCreate={true}
              notAllowRestart={true}
              projectId={projectId}
              assistantConfig={assistantConfig}
              onChangeConfig={data => {
                setSaveDisabled(false);
                setAssistantConfig(data);
              }}
              createMsgList={createMsgList}
              setCreateMsgList={setCreateMsgList}
            />
          ) : (
            <AssistantConfig
              projectId={projectId}
              assistantConfig={assistantConfig}
              onChangeConfig={data => {
                setSaveDisabled(false);
                setAssistantConfig(data);
              }}
            />
          )}
        </div>
      </ContentWrapper>
    </Wrapper>
  );
}
