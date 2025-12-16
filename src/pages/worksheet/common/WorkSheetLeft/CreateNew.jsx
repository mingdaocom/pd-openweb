import React, { Component, Fragment } from 'react';
import store from 'redux/configureStore';
import cx from 'classnames';
import _ from 'lodash';
import { func, string } from 'prop-types';
import styled from 'styled-components';
import { Dialog, Icon, Input, LoadDiv, Textarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import mingoApi from 'src/api/mingo';
import { openMingoCreateWorksheet } from 'src/components/Mingo/modules/CreateWorksheetBot';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';
import ExternalLink from './ExternalLink';

const CreateNewContent = styled.div`
  input,
  textarea {
    &::placeholder {
      color: #9e9e9e;
    }
  }
  .ming.Textarea {
    padding: 5px 12px;
    line-height: 24px;
  }
  .withdraw,
  .active {
    padding: 2px 5px;
    border-radius: 3px;
  }
  .withdraw:hover {
    background: #f5f5f5;
  }
  .active {
    cursor: pointer;
    color: #9709f2;
    &:hover {
      background: #9709f20f;
    }
  }
  .error {
    .ming.Textarea {
      border-color: red !important;
    }
    .TxtRight {
      color: red;
    }
  }
  .aiCreate,
  .importExcelCreate {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    cursor: pointer;
    &:hover {
      background: #f5f5f5;
    }
  }
  .aiCreate {
    .icon-auto_awesome {
      color: #9709f2;
    }
  }
  .importExcelCreate {
    .icon-new_excel {
      color: #268beb;
    }
  }
`;

const TagWrap = styled.div`
  display: flex;
  align-items: center;
  width: max-content;
  padding: 6px 12px;
  border-radius: 23px;
  border: 1px solid #e5e5e5;
  cursor: pointer;
  margin: 0 10px 10px 0;
  &:hover {
    background: #f5f5f5;
  }
  &.active {
    font-weight: bold;
    color: var(--app-primary-color);
    border-color: var(--app-primary-color);
  }
`;

const remarkMaxLength = 150;

const createSheetOrCustomPageConfig = {
  customPage: {
    headerText: _l('新建自定义页面'),
    placeholder: _l('例如: 首页、仪表盘'),
    text: _l('名称'),
  },
  worksheet: { headerText: _l('新建工作表'), placeholder: _l('例如: 订单、客户'), text: _l('名称') },
};

class CreateSheetOrPage extends Component {
  static propTypes = {
    type: string,
    onCreate: func,
    onCancel: func,
  };
  static defaultProps = {
    type: 'worksheet',
    onCreate: _.noop,
    onCancel: _.noop,
  };
  state = {
    value: '',
    remark: '',
    lastRemark: '',
    loading: false,
    sourceAi: false,
    customPageArgs: {},
  };
  handleCreateAi = () => {
    const { value, remark } = this.state;
    this.setState({ loading: true, remark: '' });
    mingoApi
      .generateAppOrWorksheetDescription({
        name: value,
        desc: remark,
        type: 2,
        langType: getCurrentLangCode(),
      })
      .then(data => {
        const { isSuccess, content, errorMsg } = data;
        if (!isSuccess) {
          alert(errorMsg, 3);
        }
        this.setState({ loading: false, sourceAi: true, remark: content.value });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  handleOk = () => {
    const { type, onCreate } = this.props;
    const { remark, customPageArgs, loading } = this.state;
    const name = this.state.value.trim().slice(0, 100);
    const { configuration = {}, urlTemplate } = customPageArgs;
    if (loading) {
      return;
    }
    if (!name) {
      alert(_l('请填写名称'), 3);
      return;
    }
    if (remark.length > remarkMaxLength) {
      alert(_l('描述文字超出上限'), 2);
      return;
    }
    const protocolReg = /^https?:\/\/.+$/;
    if (configuration.customPageType === '2' && !protocolReg.test(urlTemplate)) {
      alert(_l('请输入正确的url'), 3);
      return;
    }
    onCreate(type, {
      name,
      remark,
      ...customPageArgs,
    });
  };
  handleAiCreateSheet = () => {
    const { onCancel } = this.props;
    const { value, remark } = this.state;
    onCancel();
    openMingoCreateWorksheet(
      value.trim()
        ? {
            worksheetName: value,
            worksheetDescription: remark,
          }
        : {},
    );
  };
  renderState() {
    const { value, loading, sourceAi, remark, lastRemark } = this.state;
    if (loading) {
      return (
        <div className="flexRow alignItemsCenter">
          <LoadDiv className="mRight5" size="small" />
          {_l('AI 生成中...')}
        </div>
      );
    }
    if (remark && sourceAi && !loading) {
      return (
        <div
          className="flexRow alignItemsCenter withdraw Gray_9e pointer"
          onClick={() => {
            this.setState({
              sourceAi: false,
              remark: lastRemark || '',
            });
          }}
        >
          <Icon icon="back" className="Font17 mRight2" />
          {_l('撤销')}
        </div>
      );
    }

    if (!value) return null;

    return (
      <div
        className={cx('flexRow alignItemsCenter', { active: value, Gray_9e: !value })}
        onClick={value && this.handleCreateAi}
      >
        <span className="mRight4 bold">{_l('AI 生成')}</span>
        <Icon icon="auto_awesome" />
      </div>
    );
  }
  render() {
    const { hideHeader = false, type, onCancel, onImportExcel } = this.props;
    const { value, loading, remark } = this.state;
    const { headerText, text, placeholder } = createSheetOrCustomPageConfig[type];
    const isError = remark.length > remarkMaxLength;
    return (
      <Dialog visible title={headerText} width={640} okText={_l('新建')} onOk={this.handleOk} onCancel={onCancel}>
        <CreateNewContent>
          {type === 'worksheet' && (
            <Fragment>
              {!hideHeader && (
                <Fragment>
                  <div className="flexRow alignItemsCenter mTop4 mBottom24">
                    {!md.global.SysSettings.hideAIBasicFun && (
                      <div
                        className="flex aiCreate flexRow alignItemsCenter mRight10"
                        onClick={this.handleAiCreateSheet}
                      >
                        <Icon icon="auto_awesome" className="Font24" />
                        <div className="flexColumn mLeft10">
                          <span className="bold mBottom5 Font14">{_l('使用 AI 创建')}</span>
                          <span className="Gray_9e">{_l('描述业务需求，智能生成工作表')}</span>
                        </div>
                      </div>
                    )}
                    <div
                      className="flex importExcelCreate flexRow alignItemsCenter"
                      onClick={() => {
                        onImportExcel();
                      }}
                    >
                      <Icon icon="new_excel" className="Font24" />
                      <div className="flexColumn mLeft10">
                        <span className="bold mBottom5 Font14">{_l('从 Excel 导入创建')}</span>
                        <span className="Gray_9e">{_l('上传文件，自动生成工作表')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bold mBottom10 Font15">{_l('从空白开始创建')}</div>
                </Fragment>
              )}
              <div className="mBottom20">
                <div className="mBottom10">{text}</div>
                <Input
                  autoFocus
                  className="w100"
                  value={value}
                  onChange={value => this.setState({ value })}
                  placeholder={placeholder}
                />
              </div>
              <div className="mBottom10 flexRow alignItemsCenter justifyContentBetween">
                <div className="flexRow alignItemsCenter">
                  <span>{_l('描述')}</span>
                  <Tooltip
                    title={_l(
                      '用于定义工作表的用途和业务背景，便于 AI 正确理解并运用表中的信息。该描述不会直接展示给普通用户。',
                    )}
                  >
                    <Icon icon="info_outline" className="Gray_9e Font15 pointer mLeft5" />
                  </Tooltip>
                </div>
                {!md.global.SysSettings.hideAIBasicFun && this.renderState()}
              </div>
              <div className={cx('w100', { error: isError })}>
                <Textarea
                  className="w100"
                  minHeight={36}
                  disabled={loading}
                  placeholder={loading ? _l('AI 生成中...') : _l('例如：记录和管理订单信息的工作表')}
                  value={remark}
                  onChange={remark => this.setState({ remark, lastRemark: remark })}
                />
                <div className="TxtRight">{isError ? `${remark.length} / ${remarkMaxLength}` : ''}</div>
              </div>
            </Fragment>
          )}
          {type === 'customPage' && (
            <Fragment>
              <div className="flexRow alignItemsCenter">
                <div style={{ width: 75 }}>{text}</div>
                <Input
                  autoFocus
                  className="flex"
                  value={value}
                  onChange={value => this.setState({ value })}
                  placeholder={placeholder}
                />
              </div>
              <ExternalLink
                onChange={data => {
                  if (data.configuration.customPageType === '2') {
                    this.setState({ customPageArgs: data });
                  } else {
                    this.setState({ customPageArgs: {} });
                  }
                }}
              />
            </Fragment>
          )}
        </CreateNewContent>
      </Dialog>
    );
  }
}

class CreateChatbot extends Component {
  state = {
    name: _l('对话机器人'),
    remark: '',
    generateLoading: true,
    generateChatRobotInfoLoading: false,
    chatRobotInfos: [],
  };
  componentDidMount() {
    this.handleGenerate();
  }
  handleGenerate = (isReload = false) => {
    const { base } = store.getState().sheet;
    this.setState({
      generateLoading: true,
    });
    mingoApi
      .generateChatRobotInfo({
        appId: base.appId,
        type: 1,
        langType: window.getCurrentLangCode(),
        isReload,
      })
      .then(data => {
        this.setState({
          generateLoading: false,
          chatRobotInfos: data?.data || [],
        });
      })
      .catch(() => {
        this.setState({
          generateLoading: false,
          chatRobotInfos: [],
        });
      })
      .catch(() => {
        this.setState({
          generateLoading: false,
        });
      });
  };
  handleOk = () => {
    const { type, onCreate } = this.props;
    const { name, remark, generateChatRobotInfoLoading } = this.state;
    if (generateChatRobotInfoLoading) return;
    if (remark) {
      const { base } = store.getState().sheet;
      this.setState({
        generateChatRobotInfoLoading: true,
      });
      mingoApi
        .generateChatRobotInfo({
          appId: base.appId,
          type: 2,
          robotDescription: remark,
          langType: window.getCurrentLangCode(),
        })
        .then(data => {
          data.name = name;
          onCreate(type, {
            name,
            remark,
            robotInfo: data,
          });
        })
        .catch(() => {
          this.setState({
            generateChatRobotInfoLoading: false,
          });
        });
    } else {
      onCreate(type, {
        name,
        remark,
      });
    }
  };
  render() {
    const { onCancel } = this.props;
    const { generateChatRobotInfoLoading, name, remark, generateLoading, chatRobotInfos = [] } = this.state;
    return (
      <Dialog
        visible
        title={_l('你希望创建什么样的对话机器人？')}
        width={580}
        okText={generateChatRobotInfoLoading ? _l('生成中...') : _l('创建')}
        okDisabled={!remark}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        <div className="Gray_75">
          {_l(
            '尝试描述这个对话机器人的目标和功能，以及它为谁服务。例如:“订单统计助手，通过对话快速查询客户订单和明细，统计订单金额”',
          )}
        </div>
        <div className="bold mTop20 mBottom7">{_l('描述')}</div>
        <div className="Gray_75 mBottom12">{_l('AI 将根据你的描述自动生成名称、欢迎语、预置提问、提示词等配置')}</div>
        <Textarea
          autoFocus
          className="w100 Font13"
          disabled={generateLoading}
          value={remark}
          minHeight={120}
          onChange={remark => this.setState({ remark })}
        />
        {!!chatRobotInfos.length && (
          <div className={cx('flexRow alignItemsCenter mTop8 mBottom10', { Visibility: generateLoading })}>
            <div className="Gray_75">{_l('试一试')}</div>
            {/*
          <Tooltip title={_l('换一批')}>
            <Icon
              icon="refresh"
              className="Font16 Gray_9e pointer mLeft5 Hover_21"
              onClick={() => this.handleGenerate(true)}
            />
          </Tooltip>
          */}
          </div>
        )}
        {generateLoading ? (
          <div className="flexRow alignItemsCenter justifyContentCenter">
            <LoadingDots dotNumber={3} />
            <div className="mLeft10 Gray_75">{_l('AI 正在为您推荐，请稍候…')}</div>
          </div>
        ) : (
          <div className="flexRow" style={{ flexWrap: 'wrap' }}>
            {chatRobotInfos.map((item, index) => (
              <TagWrap
                key={index}
                className={cx({ active: item.summary === name })}
                onClick={() => {
                  this.setState({ name: item.summary, remark: item.description });
                }}
              >
                {item.summary}
              </TagWrap>
            ))}
          </div>
        )}
      </Dialog>
    );
  }
}

export default props => {
  const { type } = props;
  if (['customPage', 'worksheet'].includes(type)) {
    return <CreateSheetOrPage {...props} />;
  }
  return <CreateChatbot {...props} />;
};
