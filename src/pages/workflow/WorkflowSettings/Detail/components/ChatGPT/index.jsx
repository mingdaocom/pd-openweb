import React, { Fragment, useEffect, useState } from 'react';
import Remarkable from 'remarkable';
import { escapeHtml, replaceEntities } from 'remarkable/lib/common/utils';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import cx from 'classnames';
import { createParser } from 'eventsource-parser';
import _ from 'lodash';
import styled from 'styled-components';
import filterXss from 'xss';
import { Checkbox, Dialog, ScrollView, Textarea } from 'ming-ui';
import codeAjax from 'src/api/code';
import sseAjax from 'src/api/sse';
import 'src/pages/kc/common/AttachmentsPreview/codeViewer/codeViewer.less';

const Null = styled.div`
  > div {
    opacity: 0;
  }
  .icon-ai1 {
    font-size: 80px;
  }
  .exampleBox {
    width: 480px;
    min-height: 48px;
    border: 1px solid #eaeaea;
    border-radius: 10px;
    padding: 0 14px;
  }
  .animation {
    animation: fadeInUp 0.3s ease-in-out forwards;
  }
`;

const Footer = styled.div`
  textarea {
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.2);
    border-radius: 24px !important;
    border-width: 0 48px 0 8px !important;
    border-color: transparent !important;
    line-height: 1.15 !important;
  }
  .clearBtn {
    width: 48px;
    height: 48px;
    margin-right: 8px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #1677ff;
    font-size: 26px;
    color: #fff;
  }
  .sendBtn {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    &.active {
      .icon-airplane {
        color: #1677ff;
      }
    }
    &:hover {
      background: #f5f5f5;
      .icon-airplane {
        color: #1677ff;
      }
    }
    .icon-airplane {
      color: #ddd;
    }
  }
  .stopBtn {
    position: absolute;
    top: -48px;
    left: 50%;
    transform: translateX(-50%);
    border: 1px solid #eaeaea;
    height: 32px;
    border-radius: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    padding: 0 16px;
    color: #757575;
    &:hover {
      border-color: #1677ff;
      color: #1677ff;
    }
  }
`;

const Avatar = styled.div`
  min-width: 36px;
  width: 36px;
  height: 36px;
  margin-right: 8px;
  border-radius: 50%;
  font-size: 24px;
  color: #fff;
  background: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

const ListContent = styled.div`
  padding: 6px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  max-width: 100%;
  display: inline-block;
  min-height: 36px;
  .chatGPTElement {
    p {
      margin-bottom: 0;
    }
  }
  .markdown-body {
    padding: 0 !important;
    font-size: 14px;
    h1 {
      font-size: 16px !important;
      padding-bottom: 0 !important;
      border: none !important;
      line-height: normal !important;
      font-weight: normal !important;
    }
    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      background: transparent;
    }
    span {
      white-space: pre-wrap !important;
      word-break: break-all !important;
    }
    > pre {
      border-radius: 8px !important;
    }
  }
`;

const UseBtn = styled.span`
  cursor: pointer;
  padding: 0 16px;
  border-radius: 5px;
  display: inline-flex;
  height: 32px;
  align-items: center;
  &:hover {
    background: #f5f5f5;
  }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 10px;
  height: 16px;
  background: #151515;
  animation: fadeIn 0.6s ease-in-out infinite;
  margin-top: 3px;
  vertical-align: top;
`;

const NullContent = ({ codeType }) => {
  return (
    <Null className="flexColumn alignItemsCenter justifyContentCenter flex h100">
      <div className="TxtCenter animation">
        <div>
          <i className="icon-ai1" />
        </div>
        <div className="mTop15 bold Font20">{_l('您好！我是 AI 代码生成助手')}</div>
        <div className="mTop10">
          {_l('请描述您要实现的功能，我将为您生成 %0 代码', codeType === 1 ? 'Javascript' : 'Python')}
        </div>
      </div>
      <div className="mTop40 animation" style={{ animationDelay: '0.2s' }}>
        <div>{_l('问题举例：')}</div>
        <div className="exampleBox mTop15 flexRow alignItemsCenter">
          {_l('输入开始日期和结束日期，请帮我把它们之间的日期输出为数组')}
        </div>
        <div className="exampleBox mTop15 flexRow alignItemsCenter">
          {_l('处理掉输入的字符串中开头和结尾的所有换行符号')}
        </div>
        <div className="Gray_75 mTop15">{_l('如果遇到问题，您可以将代码报错信息发送给我，我会为您提供修改建议。')}</div>
      </div>
    </Null>
  );
};

export default ({ processId, nodeId, codeType = 1, onSave = () => {}, onClose = () => {} }) => {
  const [keywords, setKeywords] = useState('');
  const [list, setList] = useState([]);
  const [controller, setController] = useState(null);
  const [clearParams, setClearParams] = useState(true);
  const generateCode = async () => {
    if (!list.length || !controller) return;

    let gptResponseContent = '';
    const parser = createParser(event => {
      if (event.type === 'event') {
        if (event.data === '[DONE]') {
          const newList = [].concat(list);

          newList[list.length - 1].content = gptResponseContent;
          setList(newList);
          setController(null);
          saveGenerateCodeRecord(newList);
          return;
        }

        const source = safeParse(event.data);

        if (source.choices && source.choices.length) {
          gptResponseContent += source.choices[0].delta.content || '';
          $('.chatGPTElement:last .markdown-body').html(getMarkdownContent(gptResponseContent));
          $('.chatGPTDialog .scroll-viewport').scrollTop(10000000);
        }
      }
    });

    const requestData = {
      codeType,
      lang: 0,
      messageList: _.takeRight(
        list.filter(item => item.content),
        11,
      ).map(({ role, content }) => {
        return {
          role,
          content,
        };
      }),
    };

    const resp = await sseAjax.generateCodeBlock(requestData, {
      abortController: controller,
      isReadableStream: true,
    });

    const reader = resp.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const result = new TextDecoder().decode(value);

        if ((safeParse(result) || {}).error) {
          alert(result, 2);
          break;
        }

        parser.feed(result);
      }
    } finally {
      setController(null);
      reader.releaseLock();
    }
  };
  const getMarkdownContent = text => {
    const md = new Remarkable({
      highlight(str) {
        return highlight(str, languages.js);
      },
    });

    md.renderer.rules.link_open = function (tokens, idx) {
      const title = tokens[idx].title ? ' title="' + escapeHtml(replaceEntities(tokens[idx].title)) + '"' : '';
      return '<a target="_blank" href="' + escapeHtml(tokens[idx].href) + '"' + title + '>';
    };

    return filterXss(md.render(text));
  };
  const saveGenerateCodeRecord = list => {
    codeAjax.saveGenerateCodeRecord({ workflowId: processId, nodeId, messageList: list });
  };

  useEffect(() => {
    codeAjax.getGenerateCodeRecord({ workflowId: processId, nodeId }).then(result => {
      if (result) {
        setList(result.messageList);
      }
    });
  }, []);

  useEffect(() => {
    generateCode();
  }, [controller]);

  return (
    <Dialog
      type="fixed"
      title={_l('AI 生成代码')}
      visible
      width={800}
      footer={null}
      overlayClosable={false}
      onCancel={onClose}
    >
      <div className="flexColumn h100">
        <ScrollView className="flex chatGPTDialog">
          {!list.length ? (
            <NullContent codeType={codeType} />
          ) : (
            list.map((item, index) => {
              const code =
                codeType === 1
                  ? ((item.content.match(/```javascript[\s\S]*?```/) || [])[0] || '').replace(
                      /(```javascript\n)|\n```/g,
                      '',
                    )
                  : ((item.content.match(/```python[\s\S]*?```/) || [])[0] || '').replace(/(```python\n)|\n```/g, '');

              return (
                <div className="flexRow mBottom25" key={index}>
                  <Avatar>
                    {item.role === 'user' ? <img src={md.global.Account.avatar} /> : <i className="icon-ai1" />}
                  </Avatar>
                  <div className="flex">
                    <ListContent
                      className={cx(
                        'chatGPTElement',
                        {
                          'ThemeBorderColor3 ThemeBGColor3 White Font14': item.role === 'user',
                        },
                        { w100: item.role !== 'user' },
                      )}
                    >
                      {item.role === 'user' ? (
                        item.content
                      ) : (
                        <Fragment>
                          <div
                            className="markdown-body"
                            dangerouslySetInnerHTML={{ __html: getMarkdownContent(item.content) }}
                          />
                          {code && (
                            <div className="mTop8 mBottom5 flexRow alignItemsCenter">
                              <Checkbox
                                className="InlineBlock"
                                text={_l('使用时清空现有input参数与代码块')}
                                checked={clearParams}
                                onClick={checked => setClearParams(!checked)}
                              />
                              <div className="flex" />
                              <UseBtn
                                className="ThemeColor3 mLeft20"
                                onClick={() => {
                                  const inputData = {};

                                  if (codeType === 1) {
                                    (code.match(/input\..*?[),;\n ]/g) || []).forEach(key => {
                                      inputData[key.replace(/(input.)|([),;\n ])/g, '')] = '';
                                    });
                                  } else {
                                    (code.match(/input\[.*\]/g) || []).forEach(key => {
                                      inputData[key.replace(/(input\[")|("\])/g, '')] = '';
                                    });
                                  }

                                  onSave({ clearParams, code, inputData });
                                }}
                              >
                                {_l('使用')}
                              </UseBtn>
                            </div>
                          )}
                          {!item.content && index === list.length - 1 && controller && <Cursor />}
                        </Fragment>
                      )}
                    </ListContent>
                  </div>
                </div>
              );
            })
          )}
        </ScrollView>
        <Footer className="mTop10 flexRow relative">
          {!!list.length && (
            <div
              className="clearBtn tip-top"
              data-tip={_l('重新开始')}
              onClick={() => {
                saveGenerateCodeRecord([]);
                setList([]);
              }}
            >
              <i className="icon-cleaning_services" />
            </div>
          )}
          {controller && (
            <div
              className="stopBtn"
              onClick={() => {
                controller.abort();
                setController(null);
              }}
            >
              <i className="icon-wc-stop mRight5" />
              {_l('停止')}
            </div>
          )}
          <Textarea
            className="flex"
            minHeight={0}
            style={{ paddingTop: 16, paddingBottom: 16 }}
            maxHeight={240}
            placeholder={_l('请输入…')}
            value={keywords}
            onChange={setKeywords}
            onKeyDown={event => {
              if (!event.shiftKey && event.keyCode === 13 && !controller) {
                if (event.target.value.trim().replace(/\r\n/, '')) {
                  setController(new AbortController());
                  setList(
                    list.concat([
                      { role: 'user', content: keywords.trim() },
                      { role: 'assistant', content: '' },
                    ]),
                  );
                }

                setTimeout(() => {
                  setKeywords('');
                }, 0);
              }
            }}
          />
          <div
            className={cx('sendBtn', { active: keywords.trim() })}
            onClick={() => {
              if (!keywords.trim() || controller) {
                return;
              }
              setKeywords('');
              setController(new AbortController());
              setList(
                list.concat([
                  { role: 'user', content: keywords.trim() },
                  { role: 'assistant', content: '' },
                ]),
              );
            }}
          >
            <i className="icon-airplane" />
          </div>
        </Footer>
      </div>
    </Dialog>
  );
};
