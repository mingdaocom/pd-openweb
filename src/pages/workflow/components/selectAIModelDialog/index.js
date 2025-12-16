import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Dialog, FunctionWrap, LoadDiv, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import aIService from 'src/api/aIService';

const DialogWrapper = styled(Dialog)`
  .mui-dialog-header {
    border-bottom: 1px solid #ddd;
  }
  .mui-dialog-body {
    padding: 0 !important;
    flex-basis: 500px !important;
    display: flex;
  }
  .mui-dialog-footer {
    border-top: 1px solid #ddd;
    padding-top: 16px !important;
    padding-bottom: 16px !important;
  }
  .emptyContent {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .emptyIcon {
      width: 126px;
      height: 126px;
      margin-bottom: 15px;
      background-color: #f5f5f5;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      i {
        font-size: 64px;
        color: #bdbdbd;
      }
    }
  }
`;

const NavBox = styled.div`
  width: 200px;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100%;
  input {
    border: none;
    height: 22px;
  }
  .listItem {
    height: 40px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    &.active {
      font-weight: bold;
      background-color: rgba(33, 150, 243, 0.08);
      color: #2196f3;
    }
  }
  .listItemIcon {
    img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }
  }
`;

const ModelList = styled.ul`
  width: 100%;
  li {
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 10px 0 16px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    &.active {
      background-color: rgba(33, 150, 243, 0.06);
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #2196f3;
      margin-left: 2px;
    }
    img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
    }
  }
`;

const ContentBox = styled.div`
  min-width: 0;
  &.blue {
    background: rgba(33, 150, 243, 0.04);
  }
  .number {
    margin-right: 3px;
    color: #9709f2;
  }
  .listItem {
    height: 24px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    border-radius: 12px;
    border: 1px solid #bdbdbd;
    font-size: 12px;
    margin-right: 8px;
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #2196f3;
      margin-left: 2px;
    }
  }
`;

const PERFORMANCE_ENUM = {
  1: _l('高'),
  2: _l('中'),
  3: _l('低'),
};

// 内置模型描述配置（以模型名称 name 作为唯一标识）
const MODEL_DESCRIPTIONS = {
  // OpenAI 模型
  'GPT-5': _l('高度通用，理解能力强，适合长对话及复杂推理任务，支持丰富的图像与工具交互。'),
  'GPT-5-mini': _l('性价比高，适合快速响应的通用任务，处理高并发时表现优异。'),
  'GPT-5-nano': _l('超低延迟，适合小任务和边缘场景'),
  'GPT-4.1': _l('稳健的通用模型，支持复杂工具操作和图像分析，适合多种高复杂度任务。'),
  'GPT-4.1-mini': _l('轻量级通用多模态模型，适合对速度与稳定性有高要求的日常任务。'),
  'GPT-4o': _l('支持文本、图像的多模态模型，适用于复杂推理和长对话任务。'),
  'GPT-4o-mini': _l('高性价比的多模态模型，适合日常任务和轻度推理，响应速度快。'),
  O3: _l('中型推理模型，支持多模态输入，适合一般推理任务和中等规模的数据处理。'),
  'O4-mini': _l('小型推理优化版，适合成本敏感的多模态任务，适用于轻量级推理场景。'),
  // Qwen 模型
  'QWen-Turbo': _l('设计用于处理高并发任务，适合流量较大或需要快速响应的场景。'),
  'QWen-Plus': _l('专为文本生成任务设计，支持高效的工具调用，适合文本处理和对话场景。'),
  'QWen-Max': _l('中高阶文本生成模型，中文能力强，适用于复杂文本生成任务。'),
};

class SelectAIModelDialog extends Component {
  static propTypes = {
    showAutoModel: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };
  static defaultProps = {
    showAutoModel: false,
    onOk: () => {},
    onCancel: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      list: null,
      keyword: '',
      selectVendor: '',
      selectModel: '',
    };
  }

  componentDidMount() {
    const { showAutoModel } = this.props;

    aIService.getAllowDeveloperWithModes().then(res => {
      this.setState({ list: res, selectVendor: showAutoModel ? '' : res[0].developer.id });
    });
  }

  renderModelList() {
    const { list, selectVendor, selectModel } = this.state;
    const { models } = list.find(o => o.developer.id === selectVendor);

    return (
      <ScrollView className="h100" style={{ width: 320 }}>
        <div className="Gray_75 pLeft16 mTop18 mBottom10 Font13">{_l('选择模型')}</div>
        <ModelList>
          {models.map((item, index) => {
            return (
              <li
                className={cx({ active: item.id === selectModel })}
                key={index}
                onClick={() => this.setState({ selectModel: item.id })}
              >
                <Tooltip title={item.alias} placement="topLeft">
                  <div className="Font13 ellipsis flex">{item.alias}</div>
                </Tooltip>

                <Tooltip title={_l('性能：') + PERFORMANCE_ENUM[item.performance]}>
                  <div className="flexRow alignItemsCenter">
                    {Array.from({ length: 4 - item.performance }, (_, i) => (
                      <div key={i} className="dot" />
                    ))}
                  </div>
                </Tooltip>
              </li>
            );
          })}
        </ModelList>
      </ScrollView>
    );
  }

  renderContent() {
    const { list, selectVendor, selectModel } = this.state;

    if (!selectVendor) {
      return (
        <ContentBox className="flex flexColumn alignItemsCenter justifyContentCenter">
          <i className="icon-AI_Agent Font50 ThemeColor3"></i>
          <div className="Gray_75 mTop30 Font13">{_l('系统会根据任务需求智能匹配最佳模型')}</div>
          <div className="Gray_75 Font13">{_l('适合大多数用户')}</div>
        </ContentBox>
      );
    }

    if (!list.find(o => o.developer.id === selectVendor).models.length) {
      return (
        <ContentBox className="flex flexColumn alignItemsCenter justifyContentCenter">
          <i className="icon-article Font50 Gray_bd"></i>
          <div className="Gray_9e mTop30 Font13">{_l('该服务商下暂无可用模型')}</div>
        </ContentBox>
      );
    }

    if (!selectModel) {
      return (
        <ContentBox className="flex flexColumn alignItemsCenter justifyContentCenter GrayBG">
          <i className="icon-article Font50 Gray_bd"></i>
          <div className="Gray_9e mTop30 Font13">{_l('选择一个模型查看详情')}</div>
        </ContentBox>
      );
    }

    const model = list.find(o => o.developer.id === selectVendor).models.find(o => o.id === selectModel);

    return (
      <ContentBox className="flex pLeft16 pRight16 blue">
        <div className="Font14 bold mTop15">{model.alias}</div>
        <div className="Gray_75 Font12 mTop10">
          {MODEL_DESCRIPTIONS[model.name] || model.description.map((o, index) => <div key={index}>{o}</div>)}
        </div>

        {model.price?.outputToken > 0 && (
          <Fragment>
            <div className="Gray_75 bold Font12 mTop15">{_l('信用点')}</div>
            <div className="mTop10 flexRow Font12">
              <div>1K tokens</div>
              <div className="flex" />
              <div className="bold">
                <span className="number Font17 bold">{model.price.outputToken}</span>
                {_l('信用点')}
              </div>
            </div>
          </Fragment>
        )}

        <div className="Gray_75 bold Font12 mTop15">{_l('能力')}</div>
        <div className="mTop10 flexRow">
          {_.includes(model.caps, 3) && (
            <div className="listItem">
              <i className="icon-text_bold2 Font14 mRight3 Gray_75" />
              {_l('文本输入')}
            </div>
          )}
          {_.includes(model.caps, 1) && (
            <div className="listItem">
              <i className="icon-image Font14 mRight3 Gray_75" />
              {_l('图片输入')}
            </div>
          )}
          {_.includes(model.caps, 2) && (
            <div className="listItem">
              <i className="icon-design-services Font14 mRight3 Gray_75" />
              {_l('工具调用')}
            </div>
          )}
        </div>

        <div className="Gray_75 bold Font12 mTop15">{_l('性能')}</div>
        <div className="mTop10 flexRow">
          <div className="listItem">
            <span className="mRight5">{PERFORMANCE_ENUM[model.performance]}</span>

            {Array.from({ length: 4 - model.performance }, (_, i) => (
              <span key={i} className="dot" />
            ))}
          </div>
        </div>
      </ContentBox>
    );
  }

  renderModelIcon(developer) {
    const ICONS = {
      1: {
        icon: 'icon-chatgpt',
        color: '#000',
      },
      2: {
        icon: 'icon-Qwen',
        color: '#615ced',
      },
      3: {
        icon: 'icon-deepseek',
        color: '#4d6bfe',
      },
      100: {
        icon: 'icon-construction',
        color: '#2196f3',
      },
    };

    return developer.type === 100 && developer.icon ? (
      <img src={developer.icon} />
    ) : (
      <i className={cx('Font20', ICONS[developer.type].icon)} style={{ color: ICONS[developer.type].color }} />
    );
  }

  render() {
    const { showAutoModel, onOk, onClose } = this.props;
    const { list, selectVendor, selectModel } = this.state;

    return (
      <DialogWrapper
        width={960}
        title={_l('选择一个模型')}
        visible
        onOk={() => {
          if (selectModel) {
            onOk(list.find(o => o.developer.id === selectVendor).models.find(o => o.id === selectModel));
          } else {
            onOk();
          }
          onClose();
        }}
        onCancel={onClose}
      >
        {list === null && <LoadDiv className="mTop15" />}
        {list && list.length === 0 && (
          <div className="emptyContent Font17 Gray_9e">
            <div className="emptyIcon">
              <i className="icon-AI_Agent"></i>
            </div>
            <div>{_l('暂无可用模型')}</div>
          </div>
        )}
        {list && list.length > 0 && (
          <Fragment>
            <NavBox>
              {/* <div className="flexRow pLeft20 pRight20 alignItemsCenter mTop15">
                <i className="icon-search Gray_9e Font20" />
                <input
                  className="flex mLeft5 Font13"
                  type="text"
                  placeholder={_l('搜索')}
                  onChange={e => this.setState({ keyword: e.target.value })}
                />
              </div> */}
              <ScrollView className="flex mTop10">
                {showAutoModel && (
                  <div
                    className={cx('listItem', { active: !selectVendor })}
                    onClick={() => this.setState({ selectVendor: '', selectModel: '' })}
                  >
                    <div className="listItemIcon">
                      <i className="icon-AI_Agent Font20 ThemeColor3" />
                    </div>
                    <div className="flex mLeft10 ellipsis Font14">{_l('自动选择模型')}</div>
                  </div>
                )}

                {list.map((item, index) => (
                  <div
                    className={cx('listItem', { active: selectVendor === item.developer.id })}
                    key={index}
                    onClick={() => this.setState({ selectVendor: item.developer.id, selectModel: '' })}
                  >
                    <div className="listItemIcon">{this.renderModelIcon(item.developer)}</div>
                    <div className="flex mLeft10 ellipsis Font14">{item.developer.name}</div>
                  </div>
                ))}
              </ScrollView>
            </NavBox>
            {selectVendor && !!list.find(o => o.developer.id === selectVendor).models.length && this.renderModelList()}
            {this.renderContent()}
          </Fragment>
        )}
      </DialogWrapper>
    );
  }
}

export default props => FunctionWrap(SelectAIModelDialog, { ...props });
