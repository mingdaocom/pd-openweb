import React, { useState } from 'react';
import styled from 'styled-components';
import { ScrollView, Icon, Input, Textarea, Dialog, LoadDiv, SvgIcon } from 'ming-ui';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import selectKnowledge from './SelectKnowledgeBase';
import assistantApi from '../../../../api/assistant';
import _ from 'lodash';
import { formatFileSize } from 'src/util';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';

const Wrapper = styled.div`
  padding: 0 50px;

  .avatarWrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
    height: 64px;
    .updateAvatarBtn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      cursor: pointer;
      &.isAdd {
        border: 1px dashed #bdbdbd;
      }
    }
  }

  .divider {
    height: 1px;
    background: #e0e0e0;
    margin: 20px 0;
  }
  .requiredStar {
    color: #f44336;
    margin-left: 4px;
    font-size: 15px;
    font-weight: bold;
  }
  .groupTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    .titleText {
      font-size: 17px;
      font-weight: 600;
      margin-left: 4px;
    }
    .autoGenerate {
      display: flex;
      align-items: center;
      height: 36px;
      padding: 0 8px;
      border-radius: 5px;

      i {
        color: #f19f39;
        font-size: 20px;
      }
      span {
        color: #757575;
        margin-left: 4px;
      }
      &.notGenerating {
        cursor: pointer;
        &:hover {
          background: #fff;
        }
      }
    }
  }
`;

const FormItem = styled.div`
  margin-bottom: 16px;
  .labelText {
    font-size: 14px;
    margin-bottom: 8px;
  }
  input {
    width: 100%;
  }
  .knowledgeLibWrapper {
    display: flex;
    align-items: center;
    height: 56px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    padding: 0 16px;
    font-size: 15px;
    font-weight: 600;
    background-color: #fff;
    cursor: pointer;

    &.isDel {
      border: 1px solid #f44336;
      .delText {
        color: #f44336;
      }
    }
    .swapIcon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      i {
        color: #bdbdbd;
        font-size: 20px;
      }
      &:hover {
        background: #f5f5f5;
      }
    }
  }
  .exampleQuestionList {
    .questionItem {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }
  }
  .linkBox {
    display: flex;
    width: 100%;
    min-height: 36px;
    line-height: 36px;
    box-sizing: border-box;
    border-radius: 3px;
    padding: 0 12px;
    font-size: 14px;
    background: #fff;
    .copyBtn {
      cursor: pointer;
      margin-left: 12px;
      margin-top: 10px;
      font-size: 16px;
      color: #757575;
      &:hover {
        color: #2196f3;
      }
    }
  }
`;

const IndicateDialog = styled(Dialog)`
  .indicateExample {
    padding: 12px 8px;
    border-radius: 4px;
    background: #f5f5f5;
  }
`;

export default function AssistantConfig(props) {
  const { assistantConfig, onChangeConfig, projectId } = props;
  const {
    id,
    icon,
    iconColor,
    iconUrl,
    name,
    description,
    instructions,
    preamble,
    exampleQuestions = [],
    knowledgeBaseName,
    knowledgeFileSize,
    status,
    shareUrl,
  } = assistantConfig;
  const [foldedItems, setFoldedItems] = useState([]);
  const [indicateDialogVisible, setIndicateDialogVisible] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);

  const iframeUrl = `<iframe width=“100%” height=“100%” style=“border: none;margin: 0; padding: 0;” src=“${shareUrl}”></iframe>`;

  const onAutoGenerate = () => {
    if (autoGenerating) return;

    if (!name || !description || !instructions) {
      alert(!name ? _l('名称不能为空') : !description ? _l('描述不能为空') : _l('指示不能为空'), 3);
      return;
    }

    setAutoGenerating(true);
    assistantApi
      .generateAssistantPreamble({ projectId, name, description, instructions })
      .then(res => {
        setAutoGenerating(false);
        const generateRes = safeParse(
          _.get(safeParse(res), ['choices', '0', 'message', 'tool_calls', '0', 'function', 'arguments']) || '{}',
        );
        if (!_.isEmpty(generateRes)) {
          const welcomeMsg = generateRes['welcome_message'] || '';
          const exampleQues = generateRes['Example_Questions'] || '';
          onChangeConfig({ preamble: welcomeMsg, exampleQuestions: exampleQues });
        }
      })
      .catch(error => setAutoGenerating(false));
  };

  const renderGroupTitle = type => {
    const groupInfo = {
      knowledgeBase: { text: _l('知识库'), isRequired: true },
      chatSet: { text: _l('对话设置'), isRequired: false },
      integrationSet: { text: _l('集成设置'), isRequired: false },
    };
    const isFolded = _.includes(foldedItems, type);
    return (
      <div className="groupTitle">
        <div
          className="flexRow alignItemsCenter pointer"
          onClick={() => {
            setFoldedItems(isFolded ? foldedItems.filter(item => item !== type) : foldedItems.concat(type));
          }}
        >
          <Icon icon={isFolded ? 'arrow-right-border' : 'arrow-down-border'} />
          <div className="titleText">{groupInfo[type].text}</div>
          {groupInfo[type].isRequired && <span className="requiredStar">*</span>}
        </div>
        {type === 'chatSet' && (
          <div className={cx('autoGenerate', { notGenerating: !autoGenerating })} onClick={onAutoGenerate}>
            {autoGenerating ? <LoadDiv size="small" /> : <Icon icon="ai" />}
            <span>{autoGenerating ? _l('生成中...') : _l('自动生成')}</span>
          </div>
        )}
      </div>
    );
  };

  const renderIndicateDialog = () => {
    const exampleInstructions =
      '# 角色 企业级知识库问答助手## 目标  您的主要任务是根据客户问题和上传的企业知识库文档提供总结答案。您需要在回答中展示对文档内容的深刻理解并处理企业相关的查询，从企业知识库中提取必要的信息，帮助解答员工的疑问。## 技能  1. 用户提出基于企业知识库的问题。2. 分析问题，确定关键词和相关领域。3. 在企业知识库中检索相关信息。4. 根据检索结果，形成准确、全面的回答## 限制  1. 仅使用企业知识库中的信息进行回答，不引入外部信息。2. 保持回答的专业性和准确性，确保信息的安全性和保密性。3. 在交互过程中保持中立，避免提供任何主观判断或建议。';
    return (
      <IndicateDialog
        visible
        title={_l('示例')}
        okText={_l('使用')}
        onOk={() => {
          onChangeConfig({ instructions: exampleInstructions });
          setIndicateDialogVisible(false);
        }}
        onCancel={() => setIndicateDialogVisible(false)}
      >
        <div className="mBottom16">
          {_l(
            '我们建议使用结构化提示来创建助手的角色和预提示。结构化提示更易于阅读，可以提高迭代效率，并使Bot的性能更加稳定。以下是一位企业知识库助手的例子：',
          )}
        </div>
        <div className="indicateExample">{exampleInstructions}</div>
      </IndicateDialog>
    );
  };

  return (
    <ScrollView className="flex">
      <Wrapper>
        <div className="avatarWrapper">
          <Trigger
            action={['click']}
            popup={
              <SelectIcon
                hideInput
                style={{ left: '-480px', top: '10px' }}
                iconColor={iconColor || '#2196f3'}
                icon={icon}
                projectId={projectId}
                onModify={({ iconColor, icon, iconUrl }) => {
                  let updateObj = {};
                  if (iconColor) {
                    updateObj = { iconColor };
                  } else {
                    updateObj = { icon, iconUrl };
                  }
                  onChangeConfig(updateObj);
                }}
              />
            }
            zIndex={1000}
            popupAlign={{
              points: ['tl', 'bl'],
              overflow: {
                adjustX: true,
                adjustY: true,
              },
            }}
          >
            <div
              className={cx('updateAvatarBtn', { isAdd: !iconUrl })}
              style={{ backgroundColor: iconUrl ? iconColor || '#2196f3' : '' }}
            >
              {iconUrl ? (
                <SvgIcon url={iconUrl} fill={'#fff'} size={32} />
              ) : (
                <Icon icon="add" className="Font28 Gray_bd" />
              )}
            </div>
          </Trigger>
        </div>

        <FormItem>
          <div className="labelText">{_l('名称')}</div>
          <Input maxLength={20} value={name} onChange={name => onChangeConfig({ name })} />
        </FormItem>
        <FormItem>
          <div className="labelText">{_l('描述')}</div>
          <Input maxLength={200} value={description} onChange={description => onChangeConfig({ description })} />
        </FormItem>
        <FormItem>
          <div className="flexRow">
            <div className="labelText flex">
              {_l('指示')}
              <span className="requiredStar">*</span>
            </div>
            <div className="ThemeColor ThemeHoverColor2 pointer" onClick={() => setIndicateDialogVisible(true)}>
              {_l('查看示例')}
            </div>
          </div>
          <Textarea
            value={instructions}
            onChange={instructions => onChangeConfig({ instructions })}
            minHeight={160}
            maxHeight={240}
            placeholder={_l('可以设定对话的背景、角色及限制条件，以便根据这些设定来定制和优化助手的回答')}
          />
          {indicateDialogVisible && renderIndicateDialog()}
        </FormItem>
        <div className="divider" />

        {renderGroupTitle('knowledgeBase')}
        {!_.includes(foldedItems, 'knowledgeBase') && (
          <FormItem>
            <div className={cx('knowledgeLibWrapper', { isDel: id && !knowledgeBaseName })}>
              {!(id && !knowledgeBaseName) ? (
                <React.Fragment>
                  <span>{knowledgeBaseName}</span>
                  <span className="Font12 Gray_bd mLeft16">{formatFileSize(knowledgeFileSize)}</span>
                </React.Fragment>
              ) : (
                <span className="delText">{_l('知识库已删除')}</span>
              )}

              <div className="flex" />
              <div
                className="swapIcon"
                onClick={e => {
                  e.stopPropagation();
                  selectKnowledge({
                    projectId,
                    onOk: knowledgeBase =>
                      onChangeConfig({
                        knowledgeBaseId: knowledgeBase.id,
                        knowledgeBaseName: knowledgeBase.name,
                        knowledgeFileSize: knowledgeBase.fileSize,
                      }),
                  });
                }}
              >
                <Icon icon="swap_horiz" />
              </div>
            </div>
          </FormItem>
        )}
        <div className="divider" />

        {renderGroupTitle('chatSet')}
        {!_.includes(foldedItems, 'chatSet') && (
          <React.Fragment>
            <FormItem>
              <div className="labelText">{_l('开场白')}</div>
              <Textarea
                value={preamble}
                onChange={preamble => onChangeConfig({ preamble })}
                minHeight={76}
                maxHeight={76}
              />
            </FormItem>
            <FormItem>
              <div className="labelText">{_l('示例提问')}</div>
              <div className="exampleQuestionList">
                {exampleQuestions.map((q, index) => {
                  return (
                    <div className="questionItem" key={index}>
                      <Input
                        className="flex"
                        value={q}
                        onChange={value => {
                          onChangeConfig({
                            exampleQuestions: exampleQuestions.map((item, i) => (i === index ? value : item)),
                          });
                        }}
                      />
                      <Icon
                        icon="remove_circle_outline1"
                        className={`Font20 mLeft10 ${
                          exampleQuestions.length > 1 ? 'pointer Gray_9e ThemeHoverColor3' : 'Gray_d'
                        }`}
                        onClick={() => {
                          if (exampleQuestions.length > 1) {
                            onChangeConfig({ exampleQuestions: exampleQuestions.filter((_, i) => i !== index) });
                          }
                        }}
                      />
                      <Icon
                        icon="add_circle_outline"
                        className={`Font20 mLeft10 ${
                          exampleQuestions.length < 4 ? 'pointer Gray_9e ThemeHoverColor3' : 'Gray_d'
                        }`}
                        onClick={() => {
                          if (exampleQuestions.length < 4) {
                            onChangeConfig({ exampleQuestions: exampleQuestions.concat(['']) });
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </FormItem>
          </React.Fragment>
        )}
        <div className="divider" />

        {status > 1 && (
          <div className="mBottom24">
            {renderGroupTitle('integrationSet')}
            {!_.includes(foldedItems, 'integrationSet') && (
              <React.Fragment>
                <FormItem>
                  <div className="labelText">{_l('方式一：页面链接')}</div>
                  <div className="linkBox">
                    <div className="flex overflow_ellipsis">{shareUrl}</div>
                    <Icon
                      icon="copy"
                      className="copyBtn"
                      onClick={() => {
                        copy(shareUrl);
                        alert(_l('复制成功'));
                      }}
                    />
                  </div>
                </FormItem>
                <FormItem>
                  <div className="labelText">{_l('方式二：iframe链接')}</div>
                  <div className="linkBox">
                    <div className="flex breakAll">{iframeUrl}</div>
                    <Icon
                      icon="copy"
                      className="copyBtn"
                      onClick={() => {
                        copy(iframeUrl);
                        alert(_l('复制成功'));
                      }}
                    />
                  </div>
                </FormItem>
              </React.Fragment>
            )}
          </div>
        )}
      </Wrapper>
    </ScrollView>
  );
}
