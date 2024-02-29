import React, { createRef, useState, useEffect, useRef, Fragment } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, Dropdown, TagTextarea, Support } from 'ming-ui';
import { devTapList } from 'src/pages/worksheet/common/ViewConfig/components/DebugConfig/config.js';
import _ from 'lodash';
import cx from 'classnames';
import copy from 'copy-to-clipboard';
import Input from 'ming-ui/components/Input';
import { emitter } from 'src/util';
import tailwindIcon from './tailwind.svg';

const Wrap = styled.div`
  li {
    .leftLine {
      width: 1px;
      height: 100%;
      position: absolute;
      background: #eaeaea;
      left: 12px;
      top: 24px;
      z-index: -1;
    }
    .tabCon {
      width: 24px;
      height: 24px;
      background: #f0f0f0;
      color: #757575;
      border-radius: 50%;
      text-align: center;
      line-height: 24px;
      margin-top: 14px;
      &.hs {
        background: #e3f2fd;
        color: #2196f3;
      }
      &.cur {
        background: #2196f3;
        color: #fff;
      }
    }
    .line {
      width: 100%;
      height: 1px;
      background: #eaeaea;
    }
  }
  .con {
    h5 {
      margin: 0;
    }
  }
  .nextStep {
    &:hover {
      color: #1565c0;
    }
  }
  .btn {
    padding: 0 20px;
    height: 36px;
    line-height: 36px;
    border-radius: 3px 3px 3px 3px;
    background: #2196f3;
    color: #fff;
    &.canClear {
      background: #ffffff;
      color: #757575;
      border: 1px solid #dddddd;
    }
  }
  .viewColdeTagTextarea {
    max-width: 400px;
    .CodeMirror {
      min-height: 100px;
      max-width: 400px;
    }
  }
  .ming.Input {
    border: 1px solid #ddd;
    &:hover {
      border-color: #bbb;
    }
    &:focus {
      border-color: #2196f3;
    }
  }
  .tagInputarea .tagInputareaIuput:not(.active) {
    border: 1px solid #ddd !important;
  }
`;
const OPTIONS = [
  {
    text: _l('React 基础示例模板'),
    template: 'React',
    value: 1,
    iconTxt: 'react',
    color: '#61DAFB',
  },
  // {
  //   text: _l('Typescript 基础示例模板'),
  //   template: 'TypeScript',
  //   value: 2,
  //   iconTxt: 'TS',
  // color:'#0288D1'
  // },
  {
    text: _l('JavaScript 基础示例模板'),
    template: 'JavaScript',
    value: 3,
    iconTxt: 'JS',
    color: '#FFCA28',
  },
  {
    text: _l('React + Tailwind CSS 模板'),
    template: 'React-Tailwind',
    value: 4,
    svg: tailwindIcon,
    width: 18,
    tip: _l('该模板 mdye-cli 依赖版本 >= beta-0.0.23'),
  },
];
export default function DebugConfig(params) {
  const tagtextarea = useRef(null);
  const { worksheetId, view = {}, onChangeView } = params;
  const { viewId } = view;
  const [
    { stepState, cur, editHref, templateType, customViewDebugUrl, localStorageCustomViewDebugUrl, configuration },
    setState,
  ] = useSetState({
    stepState: 0,
    cur: 0,
    editHref: false,
    templateType: 1,
    customViewDebugUrl: window.localStorage.getItem(`customViewDebugUrl_${viewId}`),
    localStorageCustomViewDebugUrl: window.localStorage.getItem(`customViewDebugUrl_${viewId}`),
    configuration: '',
  });
  useEffect(() => {
    const { view } = params;
    const { pluginInfo = {} } = view;
    const { stepState = 0, templateType = 1, configuration } = pluginInfo;
    setState({
      stepState,
      templateType,
      cur: editHref ? cur : stepState,
      configuration: _.isEmpty(configuration) ? '' : JSON.stringify(configuration),
    });
  }, [params]);
  const handleCopy = content => {
    copy(content);
    alert(_l('复制成功'));
  };
  const renderText = (content, renderTxt) => {
    return (
      <div className="textCopyCon flexRow alignItemsCenter mTop16 Hand" onClick={() => handleCopy(content)}>
        <div className="flex">{renderTxt ? renderTxt() : content}</div>
        <Icon className="Hand mLeft10 Font18" icon={'content-copy'} />
      </div>
    );
  };
  const renderTemplateTip = () => {
    const selectedTemplate = OPTIONS.find(o => o.value === (templateType || 1));
    return selectedTemplate && selectedTemplate.tip && <div className="Gray_75 mTop5">{selectedTemplate.tip}</div>;
  };
  const renderHeader = (o, i) => {
    return (
      <React.Fragment>
        <h5 className={cx('Bold Font14 pTop16', {})}>{o.title}</h5>
        {cur !== 0 && i === 0 && (
          <Fragment>
            <div className="mTop7">
              {_l('已选择%0', OPTIONS.find(it => it.value === (templateType || 1)).text)}
              <span
                className="editHref ThemeColor3 mLeft25 Hand"
                onClick={e => {
                  setState({
                    editHref: true,
                    cur: 0,
                  });
                  e.stopPropagation();
                }}
              >
                {_l('修改')}
              </span>
            </div>
            {renderTemplateTip()}
          </Fragment>
        )}
      </React.Fragment>
    );
  };
  const renderNextStep = i => {
    return (
      <div className="nextStep mTop20">
        <span
          className="ThemeColor3 Hand ThemeHoverColor2 Bold"
          onClick={e => {
            setState({
              cur: i + 1,
              editHref: false,
            });
            onChangeView(
              {
                stepState: i + 1,
              },
              true,
            );
            e.stopPropagation();
          }}
        >
          {_l('下一步')}
        </span>
      </div>
    );
  };
  const saveConfig = () => {
    let value = {};
    if (!!_.get(tagtextarea, 'current.props.defaultValue')) {
      try {
        value = JSON.parse(_.get(tagtextarea, 'current.props.defaultValue'));
      } catch (error) {
        return alert(_l('请输入正确的格式'), 3);
      }
      if (!(_.isObject(value) && !_.isArray(value))) {
        return alert(_l('请输入正确的格式'), 3);
      }
    }
    onChangeView(
      {
        configuration: value,
      },
      true,
    );
  };
  const renderContent = i => {
    let serverHost;
    if (window.__api_server__.main !== 'https://www.mingdao.com/api/') {
      if (window.__api_server__.main[0] === '/') {
        serverHost = location.origin + window.__api_server__.main;
      } else {
        serverHost = window.__api_server__.main;
      }
    }
    switch (i) {
      case 0:
        return (
          <React.Fragment>
            <Dropdown
              className="editHrefDrop w100 mTop16"
              border
              value={templateType || 1}
              data={OPTIONS}
              renderTitle={() => {
                let item = OPTIONS.find(o => o.value === (templateType || 1));
                return (
                  <div className={cx('itemText flexRow alignItemsCenter')}>
                    {item.svg ? (
                      <img className="Icon" src={item.svg} width={item.width} />
                    ) : (
                      <Icon className="Hand Font18" icon={item.iconTxt} style={{ color: item.color }} />
                    )}
                    <span className="mLeft5"> {item.text}</span>
                  </div>
                );
              }}
              renderItem={item => {
                return (
                  <div className={cx('itemText flexRow alignItemsCenter')}>
                    {item.svg ? (
                      <img className="Icon" src={item.svg} width={item.width} />
                    ) : (
                      <Icon className="Hand Font18" icon={item.iconTxt} style={{ color: item.color }} />
                    )}
                    <span className="mLeft15"> {item.text}</span>
                  </div>
                );
              }}
              onChange={value => {
                if (value === templateType) {
                  return;
                }
                onChangeView(
                  {
                    templateType: value,
                  },
                  true,
                );
                setState({
                  editHref: true,
                  cur: 0,
                });
              }}
            />
            {renderTemplateTip()}
            {renderNextStep(i)}
          </React.Fragment>
        );

      case 1:
        return (
          <React.Fragment>
            <div className="mTop20">
              {_l('开发前，你需要在本地计算机上安装插件开发专用的终端命令行工具(CLI)，用于创建插件开发环境。')}
            </div>
            <div className="mTop15">{_l('如果你已安装本工具，可以跳过此步骤。')}</div>
            <div className="Gray_75 mTop28 Bold">{_l('前提条件')}</div>
            <div className="mTop4">{_l('已安装 16.20 或更高版本的 Node.js。')}</div>
            <div className="Gray_75 mTop28 Bold">{_l('第1步')}</div>
            <div className="mTop4">{_l('打开你计算机上的「终端(Mac OS)」或 「命令行(Windows)」。')}</div>
            <div className="Gray_75 mTop28 Bold">{_l('第2步')}</div>
            <div className="mTop4">{_l('输入以下命令安装命令行工具（Mac 需在命令前加 sudo）：')}</div>
            {renderText('npm install -g mdye-cli')}
            <div className="Gray_75 mTop28 Bold">{_l('第3步')}</div>
            <div className="mTop4">{_l('输入以下命令验证是否安装成功（正常显示版本号即为成功）：')}</div>
            {renderText('mdye --version')}
            {renderNextStep(i)}
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <div className="mTop20">{_l('安装完命令行工具 mdye-cli 后，即可按以下步骤初始化插件本地项目。')}</div>
            <div className="Gray_75 mTop28 Bold">{_l('第1步')}</div>
            <div className="mTop4">{_l('在终端命令行输入以下命令创建插件本地项目：')}</div>
            {renderText(
              `mdye init view --id ${worksheetId + '-' + viewId} --template ${
                (OPTIONS.find(o => o.value === (templateType || 1)) || {}).template
              }${serverHost ? ` --host ${serverHost}` : ''}${
                md.global.Config.IsLocal ? ` --webui ${md.global.Config.WebUrl}` : ''
              }`,
            )}
            <div className="Gray_75 mTop28 Bold">{_l('第2步')}</div>
            <div className="mTop4">
              {_l(
                '项目创建成功后，输入以下命令进入插件项目文件夹。如果在终端里重新定义了文件夹名称，请使用您输入的名称：',
              )}
            </div>
            {renderText(`cd mdye_view_${viewId}`)}
            <div className="Gray_75 mTop28 Bold">{_l('第3步')}</div>
            <div className="mTop4">{_l('安装项目依赖：')}</div>
            {renderText('npm i')}
            <div className="Gray_75 mTop28 Bold">{_l('第4步')}</div>
            <div className="mTop4">{_l('启动项目开发环境：')}</div>
            {renderText('mdye start')}
            {renderNextStep(i)}
          </React.Fragment>
        );
      case 3:
        return (
          <React.Fragment>
            <div className="mTop20">
              {_l('请填写本地项目启动后的项目URL进入线上调试')}
              <Support
                className="InlineBlock ThemeColor3 mLeft5 Hand"
                type={3}
                href="https://help.mingdao.com/extensions/developer/view"
                text={_l('查看开发文档')}
              />
            </div>
            <div className="flexRow mTop10">
              <Input
                className="flex"
                value={customViewDebugUrl}
                disabled={localStorageCustomViewDebugUrl}
                onChange={customViewDebugUrl => {
                  setState({
                    customViewDebugUrl,
                  });
                }}
              />
              <div
                className={cx('btn mLeft12', { canClear: localStorageCustomViewDebugUrl })}
                onClick={() => {
                  const debugUrl = (customViewDebugUrl || '').trim();
                  if (!/^https?:\/\/.*\/bundle\.js$/.test(debugUrl)) {
                    alert(_l('请输入本地命令行显示的脚本地址'), 3);
                    return;
                  }
                  if (!localStorageCustomViewDebugUrl) {
                    safeLocalStorageSetItem(`customViewDebugUrl_${viewId}`, debugUrl);
                    setState({
                      localStorageCustomViewDebugUrl: debugUrl,
                    });
                  } else {
                    localStorage.removeItem(`customViewDebugUrl_${viewId}`);
                    setState({
                      customViewDebugUrl: '',
                      localStorageCustomViewDebugUrl: '',
                    });
                  }
                  emitter.emit('CUSTOM_WIDGET_VIEW_DEBUG_URL_UPDATE');
                }}
              >
                {localStorageCustomViewDebugUrl ? _l('清除') : _l('加载')}
              </div>
            </div>
            <div className="mTop20">{_l('环境参数')}</div>
            <div className="Gray_9e">{_l('配置插件运行时所需要的参数，采用JSON格式')}</div>
            <TagTextarea
              className={cx('flex mTop10 viewColdeTagTextarea')}
              defaultValue={configuration}
              codeMirrorMode="javascript"
              getRef={tag => (tagtextarea.current = tag)}
              // lineNumbers
              height={0}
              onChange={(err, value, obj) => {
                // console.log(err, value, obj);
                if (!err) {
                  setState({
                    configuration: value,
                  });
                }
              }}
              onBlur={e => {
                saveConfig();
              }}
            />
          </React.Fragment>
        );
    }
  };
  return (
    <Wrap className="mTop24">
      <ul>
        {devTapList.map((o, i) => {
          return (
            <li className="Relative flexRow">
              {i < 3 && <div className="leftLine"></div>}
              <div className={cx('tabCon Bold', { hs: stepState >= i, cur: cur === i })}>
                {stepState < i || cur === i ? i + 1 : <Icon className="Font14" icon={'done'} />}
              </div>
              <div
                className={cx('con flex mLeft10', { Hand: stepState >= i && cur !== i })}
                onClick={() => {
                  if (stepState < i) {
                    setState({
                      stepState: i,
                    });
                    onChangeView(
                      {
                        stepState: i,
                      },
                      true,
                    );
                  }
                  if (cur !== i) {
                    setState({
                      cur: i,
                      editHref: i === 0,
                    });
                  }
                }}
              >
                {renderHeader(o, i)}
                {cur === i && renderContent(i)}
                {i < 3 && <div className="line mTop20"></div>}
              </div>
            </li>
          );
        })}
      </ul>
    </Wrap>
  );
}
