import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Checkbox, Icon } from 'ming-ui';
import { Popup, List } from 'antd-mobile';
import { MAX_OPTIONS_COUNT } from 'src/pages/widgetConfig/config';
import './less/MobileCheckbox.less';
import _ from 'lodash';

export default class MobileCheckbox extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    allowAdd: PropTypes.bool,
    callback: PropTypes.func,
    data: PropTypes.array,
    checked: PropTypes.array,
    renderText: PropTypes.any,
  };

  static defaultProps = {
    disabled: false,
    allowAdd: false,
    callback: () => {},
    data: [],
    checked: [],
  };

  state = {
    visible: false,
    selectChecked: [],
    keywords: '',
  };

  onChange = key => {
    const { selectChecked } = this.state;

    if (_.includes(selectChecked, key)) {
      _.remove(selectChecked, o => o === key);
    } else {
      selectChecked.push(key);
    }

    this.setState({ selectChecked });
  };

  handleSelectAll = (options, isChecked) => {
    if (isChecked) {
      this.setState({ selectChecked: [] });
    } else {
      this.setState({ selectChecked: options.map(v => v.key) });
    }
  };

  render() {
    const {
      disabled,
      allowAdd,
      children,
      data,
      checked,
      callback,
      renderText,
      otherValue,
      controlName,
      delOptions = [],
      showselectall,
    } = this.props;
    const { visible, selectChecked, keywords } = this.state;
    let source = [].concat(data).filter(item => !item.isDeleted && !item.hide);
    const canAddOption = source.length < MAX_OPTIONS_COUNT;

    selectChecked.forEach(item => {
      if ((item || '').indexOf('add_') > -1) {
        source.push({ key: item, color: '#2196F3', value: item.split('add_')[1] });
      }
    });

    return (
      <Fragment>
        <span onClick={() => !disabled && this.setState({ visible: true, selectChecked: [].concat(checked) })}>
          {children ||
            source.map(item => {
              return (
                <Checkbox
                  className="flexRow alignItemsCenter"
                  key={item.key}
                  text={item.value}
                  value={item.key}
                  checked={_.includes(checked, item.key)}
                />
              );
            })}
        </span>

        <Popup visible={visible} className="mobileCheckboxDialog mobileModal minFull topRadius">
          <div className="flexColumn h100">
            <div className="flexRow valignWrapper mobileCheckboxBtnsWrapper pLeft15 pRight15">
              <div
                className="Hand Red bold Font15 mRight10"
                onClick={() => {
                  callback([]);
                  this.setState({ selectChecked: [], visible: false });
                }}
              >
                {_l('清除')}
              </div>
              <div className="Font15 Gray bold flex ellipsis TxtCenter">{controlName}</div>
              <div
                className="Hand ThemeColor bold Font15 mLeft10"
                onClick={() => {
                  this.setState({ visible: false });
                  callback(selectChecked);
                }}
              >
                {_l('确定')}
              </div>
            </div>
            <div className="mobileCheckboxSearchWrapper">
              <Icon icon="h5_search" className="Gray_75 Font14" />
              <form action="#" className="flex" onSubmit={event => event.preventDefault()}>
                <input
                  className="w100"
                  type="search"
                  placeholder={allowAdd ? _l('搜索或添加选项') : _l('搜索')}
                  value={keywords}
                  onChange={evt => this.setState({ keywords: evt.target.value })}
                />
              </form>
              {keywords && (
                <Icon
                  icon="workflow_cancel"
                  onClick={() => {
                    this.setState({ keywords: '' });
                  }}
                />
              )}
            </div>
            <List className="flex" style={{ overflow: 'auto' }}>
              {showselectall === '1' && (
                <List.Item
                  className="bold"
                  arrowIcon={false}
                  onClick={() => {
                    const options = !!keywords.length
                      ? source.filter(
                          item =>
                            `${item.value || ''}|${item.pinYin || ''}`.search(
                              new RegExp(keywords.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), 'i'),
                            ) !== -1,
                        )
                      : source;
                    this.handleSelectAll(options, selectChecked.length === options.length);
                  }}
                >
                  <span className="Font15 ThemeColor3">{_l('全选')}</span>
                </List.Item>
              )}

              {source
                .filter(
                  item =>
                    `${item.value || ''}|${item.pinYin || ''}`.search(
                      new RegExp(keywords.trim().replace(/([,.+?:()*\[\]^$|{}\\-])/g, '\\$1'), 'i'),
                    ) !== -1,
                )
                .map(item => (
                  <List.Item className="mobileCheckboxListItem" key={item.key} arrowIcon={false} onClick={() => this.onChange(item.key)}>
                    <Checkbox
                      className="flexRow alignItemsCenter"
                      text={renderText ? renderText(item) : item.value}
                      value={item.key}
                      checked={_.includes(selectChecked, item.key)}
                    />
                  </List.Item>
                ))}

              {!!keywords.length && allowAdd && !source.find(item => item.value === keywords) && canAddOption && (
                <List.Item
                  arrowIcon={false}
                  onClick={() => {
                    if (!_.trim(keywords)) return;
                    this.setState({ keywords: '' });
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
        </Popup>
      </Fragment>
    );
  }
}
