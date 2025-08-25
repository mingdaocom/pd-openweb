import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Drawer } from 'antd';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { SvgIcon, Textarea } from 'ming-ui';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import { updateProcess } from '../../redux/actions';
import { DetailFooter } from '../Detail/components';
import './index.less';

const PluginIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 3px;
  color: #fff;
  font-size: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  > div {
    height: 22px;
  }
`;

class WorkflowInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.flowInfo.name,
      explain: props.flowInfo.explain || '',
      iconColor: props.flowInfo.iconColor || '#1677ff',
      iconName: props.flowInfo.iconName || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({
        name: nextProps.flowInfo.name,
        explain: nextProps.flowInfo.explain || '',
        iconColor: nextProps.flowInfo.iconColor || '#1677ff',
        iconName: nextProps.flowInfo.iconName || '',
      });
    }
  }

  /**
   * 确定按钮点击事件
   */
  onOk = () => {
    const { flowInfo, onClose, isPlugin } = this.props;
    let { name, explain, iconColor, iconName } = this.state;

    name = name.trim();
    explain = explain.trim();

    if (!name) {
      alert(isPlugin ? _l('请输入插件名称') : _l('请输入工作流名称'), 2);
      this.name.focus();
      return;
    }

    this.props.dispatch(
      updateProcess(flowInfo.companyId, flowInfo.id, {
        name,
        explain,
        iconColor,
        iconName: (iconName.match(/.*\/(.*)?\.svg/) || [])[1],
      }),
    );
    onClose();
  };

  render() {
    const { flowInfo, visible, isPlugin, onClose } = this.props;
    const { explain, name, iconColor, iconName } = this.state;

    return (
      <Drawer placement="right" visible={visible} closable={false} mask={false} bodyStyle={{ padding: 0 }} width={800}>
        <div className="workflowInfo flexColumn h100">
          <div className="Font17 bold flexRow alignItemsCenter pLeft24 pRight24" style={{ height: 55 }}>
            <div className="flex">{_l('基本信息')}</div>
            <i className="icon-delete Font18 mLeft10" onClick={onClose} />
          </div>
          <div className="flex mLeft24 mRight24">
            <div className="bold">{_l('名称')}</div>
            <div className="mTop10">
              <input
                type="text"
                ref={name => (this.name = name)}
                className="ThemeHoverBorderColor3 ThemeBorderColor3"
                maxLength={30}
                autoFocus
                value={name}
                onChange={e => this.setState({ name: e.target.value })}
              />
            </div>
            {isPlugin && (
              <div className="mTop15">
                <div className="bold">{_l('图标和颜色')}</div>

                <Trigger
                  action={['click']}
                  popup={
                    <SelectIcon
                      hideInput
                      iconColor={iconColor}
                      icon={(iconName.match(/.*\/(.*)?\.svg/) || [])[1]}
                      projectId={flowInfo.companyId}
                      onModify={options => {
                        this.setState({
                          iconColor: options.iconColor || iconColor,
                          iconName: options.iconUrl || iconName,
                        });
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
                  <PluginIcon className="mTop10 pointer" style={{ background: iconColor }}>
                    {iconName ? <SvgIcon url={iconName} fill="#fff" size={22} /> : <i className="icon-workflow" />}
                  </PluginIcon>
                </Trigger>
              </div>
            )}
            <div className="mTop15 bold mBottom10">{_l('说明')}</div>
            <Textarea
              minHeight={100}
              maxHeight={300}
              maxLength={10000}
              name="explain"
              value={explain}
              onChange={explain => this.setState({ explain })}
            />
          </div>
          <DetailFooter {...this.props} isCorrect={!!name.trim()} onSave={this.onOk} closeDetail={onClose} />
        </div>
      </Drawer>
    );
  }
}

export default connect(state => state.workflow)(WorkflowInfo);
