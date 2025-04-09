import React, { Component, Fragment } from 'react';
import { Icon, SvgIcon, Tooltip, Support } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import './ViewConfig.less';
import _ from 'lodash';
import ViewConfigCon from './ViewConfig';

@withClickAway
export default class ViewConfig extends React.Component {
  constructor(props) {
    super(props);
    const { view, worksheetId } = props;
    this.state = {
      name: view.name,
      isManageView: view.viewId === worksheetId,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { view } = nextProps;
    if (nextProps.viewId !== this.props.viewId) {
      this.state = {
        name: view.name,
      };
    }
  }

  componentWillUnmount() {
    if (this.inputEl && document.activeElement === this.inputEl) {
      const value = this.inputEl.value.trim();
      if (value && this.props.view.name !== value) {
        this.handleNameSave();
      }
    }
  }

  handleNameSave() {
    const { name } = this.state;
    const { worksheetId, view, appId } = this.props;
    this.props.updateCurrentView({
      ...view,
      name,
      appId,
      worksheetId,
      editAttrs: ['name'],
    });
  }

  handleFocus = () => {
    if (this.inputEl) {
      this.inputEl.setSelectionRange(0, this.inputEl.value.length);
    }
  };

  renderTitle() {
    const { name, isManageView } = this.state;
    const { view } = this.props;
    const { icon, color } = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[view.viewType]) || {};
    const isCustomize = ['customize'].includes(VIEW_DISPLAY_TYPE[view.viewType]);

    return (
      <div className="viewTitle">
        {isCustomize ? (
          <SvgIcon
            url={_.get(view, 'pluginInfo.iconUrl') || 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg'}
            fill={_.get(view, 'pluginInfo.iconColor') || '#445A65'}
            size={18}
          />
        ) : (
          <Icon className="mRight5 Font20" style={{ color }} icon={icon} />
        )}
        {isManageView ? (
          <Fragment>
            <span className="Font16 flex pLeft11">
              {_l('数据管理')}
              <Tooltip
                text={_l(
                  '管理所有工作表数据。所有字段可见、可编辑；所有打印模版、自定义动作均可用；开启所有功能开关。',
                )}
              >
                <Icon icon="novice-circle" className="mLeft6 Font16 Gray_9e Hover_21" />
              </Tooltip>
            </span>
            <Support
              className="mRight16"
              type={3}
              href="https://help.mingdao.com/view/operations"
              text={_l('帮助')}
            />
          </Fragment>
        ) : (
          <input
            value={name}
            ref={inputEl => {
              this.inputEl = inputEl;
            }}
            onChange={event => {
              this.setState({
                name: event.target.value,
              });
            }}
            onFocus={this.handleFocus}
            onBlur={event => {
              const value = event.target.value.trim();
              if (!value) {
                this.setState({
                  name: view.name,
                });
              }
              if (value && view.name !== value) {
                this.handleNameSave();
              }
            }}
            onKeyDown={event => {
              const value = event.target.value.trim();
              if (event.which === 13 && value && view.name !== value) {
                this.handleNameSave();
                $(this.inputEl).blur();
              }
            }}
            className="Font16"
          />
        )}
        <Icon icon="close" className="Gray_9d Font20 pointer" onClick={this.props.onClose} />
      </div>
    );
  }
  render() {
    return (
      <div className="worksheetViewConfig">
        <div>
          {this.renderTitle()}
          <ViewConfigCon {...this.props} />
        </div>
      </div>
    );
  }
}
