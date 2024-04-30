import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { List } from 'antd-mobile';
import { Icon, Radio } from 'ming-ui';
import { ModalWrap } from 'src/pages/Mobile/baseStyled.jsx';
import { MAX_OPTIONS_COUNT } from 'src/pages/widgetConfig/config';
import './less/MobileCheckbox.less';
import _ from 'lodash';

export default class MobileRadio extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    allowAdd: PropTypes.bool,
    callback: PropTypes.func,
    data: PropTypes.array,
    value: PropTypes.any,
    renderText: PropTypes.any,
  };

  static defaultProps = {
    disabled: false,
    allowAdd: false,
    callback: () => {},
    data: [],
    value: [],
  };

  state = {
    visible: false,
    keywords: '',
  };

  onChange(key) {
    const { callback } = this.props;
    this.setState({ visible: false, keywords: '' });
    callback(key);
  }

  render() {
    const { disabled, allowAdd, children, value, renderText, controlName, delOptions = [] } = this.props;
    let { data } = this.props;
    const { visible, keywords } = this.state;
    data = data.filter(item => !item.isDeleted && !item.hide);
    const canAddOption = data.length < MAX_OPTIONS_COUNT;

    return (
      <Fragment>
        <span onClick={() => !disabled && this.setState({ visible: true })}>
          {children ||
            data
              .filter(item => _.some(value, v => _.isEqual(v, item)))
              .map(item => {
                return <span className="ellipsis Font15">{item.value}</span>;
              })}
        </span>

        <ModalWrap
          popup
          visible={visible}
          animationType="slide-up"
          maskClosable={false}
          className="mobileCheckboxDialog"
        >
          <div className="flexColumn h100">
            <div className="flexRow valignWrapper mobileCheckboxBtnsWrapper">
              <div className="Hand ThemeColor bold Font15 mRight10" onClick={() => this.setState({ visible: false })}>
                {_l('关闭')}
              </div>
              <div className="Font15 Gray bold flex ellipsis TxtCenter">{controlName}</div>
              <div className="Font15 Visibility">{_l('确定')}</div>
            </div>
            <div className="mobileCheckboxSearchWrapper">
              <Icon icon="h5_search" />
              <input
                className="flex"
                type="search"
                placeholder={allowAdd ? _l('搜索或添加选项') : _l('搜索')}
                value={keywords}
                onChange={evt => this.setState({ keywords: evt.target.value })}
              />
              {keywords && <Icon icon="workflow_cancel" onClick={() => this.setState({ keywords: '' })} />}
            </div>
            <List className="flex" style={{ overflow: 'auto' }}>
              {!keywords.length && !!value.length && (
                <List.Item className="mLeft31" onClick={() => this.onChange('')}>
                  <span className="Font15 ThemeColor3">{_l('清除选择')}</span>
                </List.Item>
              )}

              {data
                .filter(item => item.value.indexOf(keywords) > -1)
                .map(item => (
                  <List.Item
                    key={item.key}
                    onClick={() => {
                      this.onChange(item.key);
                    }}
                  >
                    <div className="flexRow" style={{ alignItems: 'center' }}>
                      <Radio checked={_.some(value, v => _.isEqual(v, item))} />
                      <span className="ellipsis Font15 flex mRight15">
                        {renderText ? renderText(item) : item.value}
                      </span>
                    </div>
                  </List.Item>
                ))}

              {!!keywords.length && allowAdd && !data.find(item => item.value === keywords) && canAddOption && (
                <List.Item
                  onClick={() => {
                    if (!_.trim(keywords)) return;
                    const opt = _.find(delOptions, v => v.value === keywords);
                    if (opt) return alert(_l('不得与已有选项（包括回收站）重复'), 2);
                    this.onChange(`add_${keywords}`);
                  }}
                >
                  <span className="ellipsis ThemeColor3 Font15">{_l('添加新的选项：') + keywords}</span>
                </List.Item>
              )}
            </List>
          </div>
        </ModalWrap>
      </Fragment>
    );
  }
}
