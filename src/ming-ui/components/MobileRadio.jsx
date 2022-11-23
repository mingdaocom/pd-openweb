import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Modal, List, Button } from 'antd-mobile';
import { Icon, Radio } from 'ming-ui';
import './less/MobileCheckbox.less';

export default class MobileRadio extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    allowAdd: PropTypes.bool,
    callback: PropTypes.func,
    data: PropTypes.array,
    value: PropTypes.array,
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
    const { disabled, allowAdd, children, data, value, renderText } = this.props;
    const { visible, keywords } = this.state;

    return (
      <Fragment>
        <span onClick={() => !disabled && this.setState({ visible: true })}>
          {children ||
            data
              .filter(item => _.includes(value, item.key))
              .map(item => {
                return <span className="ellipsis Font15">{item.value}</span>;
              })}
        </span>

        <Modal visible={visible} animationType="slide-up" maskClosable={false} className="mobileCheckboxDialog">
          <div className="flexColumn" style={{ height: document.documentElement.clientHeight }}>
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
                <List.Item onClick={() => this.onChange('')}>
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
                      <Radio checked={_.includes(value, item.key)} />
                      <span className="ellipsis Font15 flex mRight15">
                        {renderText ? renderText(item) : item.value}
                      </span>
                    </div>
                  </List.Item>
                ))}

              {!!keywords.length && allowAdd && !data.find(item => item.value === keywords) && (
                <List.Item onClick={() => this.onChange(`add_${keywords}`)}>
                  <span className="ellipsis ThemeColor3 Font15">{_l('添加新的选项：') + keywords}</span>
                </List.Item>
              )}
            </List>
            <div className="flexRow valignWrapper mobileCheckboxBtnsWrapper">
              <Button
                type="link"
                className="mLeft10 mRight10 flex Font14 bold Gray_75"
                onClick={() => this.setState({ visible: false })}
              >
                {_l('取消')}
              </Button>
            </div>
          </div>
        </Modal>
      </Fragment>
    );
  }
}
