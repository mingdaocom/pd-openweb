import React, { Component } from 'react';
import { Icon, SvgIcon } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import './ViewConfig.less';
import _ from 'lodash';
import ViewConfigCon from './ViewConfig';

@withClickAway
export default class ViewConfig extends React.Component {
  constructor(props) {
    super(props);
    const { view } = props;
    this.state = {
      name: view.name,
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
    const { name } = this.state;
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
