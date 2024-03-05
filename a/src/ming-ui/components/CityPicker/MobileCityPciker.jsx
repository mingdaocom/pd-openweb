import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { LoadDiv, Icon, Radio } from 'ming-ui';
import { Modal, List } from 'antd-mobile';
import '../less/MobileCityPicker.less';
import _ from 'lodash';

const LEVEL_TEXT = [_l('省份'), _l('城市'), _l('区县')];
const particularlyCity = ['110000', '120000', '310000', '500000', '810000', '820000'];

export default class MobileCityPicker extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    defaultValue: PropTypes.any,
    level: PropTypes.number,
    callback: PropTypes.func,
    onClear: PropTypes.func,
  };

  static defaultProps = {
    disabled: false,
    placeholder: _l('省/市/县'),
    defaultValue: '',
    level: 3,
    data: [],
    callback: () => {},
    onClear: () => {},
    getCitys: () => {},
    handleClick: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: false,
      loading: false,
      indexLevel: 1,
      keywords: '',
    };
  }

  onNext(item) {
    const { handleClick, level, callback, onClose, data, onClear } = this.props;
    const { indexLevel } = this.state;

    if (!_.isArray(data[0])) {
      callback([item], item.path.split('/').length);
      this.setState({ visible: false, indexLevel: 1 });
      onClose([item]);
      return;
    }

    handleClick(item, indexLevel);

    if (item.last || indexLevel === level) {
      this.setState({
        visible: false,
        indexLevel: 1,
      });
      onClear(false);
      return;
    }

    this.setState({
      indexLevel: indexLevel + 1,
    });
  }

  handleSearch() {
    const { keywords } = this.state;

    this.props.getCitys({ keywords });
  }

  renderSearch() {
    const { keywords } = this.state;

    return (
      <div className="searchWrapper">
        <Icon icon="h5_search" />
        <form
          action="#"
          className="flex"
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <input
            type="text"
            placeholder={_l('搜索')}
            className="Font14"
            value={keywords}
            onChange={e => {
              this.setState({ keywords: e.target.value });
            }}
            onKeyDown={event => {
              event.which === 13 && this.handleSearch();
            }}
          />
        </form>
        {keywords ? (
          <Icon
            icon="workflow_cancel"
            onClick={() => {
              this.setState(
                {
                  keywords: '',
                },
                this.handleSearch,
              );
            }}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const {
      disabled,
      children,
      placeholder,
      onClear,
      onClose = () => {},
      callback = () => {},
      showConfirmBtn,
      defaultValue,
      data = [],
      select = [],
      handleClick = () => {},
      level,
    } = this.props;
    const { visible, loading, indexLevel, keywords } = this.state;
    const last = _.last(select);
    const listData = data.length ? (_.isArray(data[0]) ? data[data.length - 1] : data) : [];

    return (
      <Fragment>
        <span className="Block" onClick={() => !disabled && this.setState({ visible: true }, this.props.getCitys)}>
          {children || (
            <input readOnly value={select.length === 0 ? defaultValue : last.path} placeholder={placeholder} />
          )}
        </span>

        <Modal
          className="mobileCityPicker"
          popup
          visible={visible}
          title={
            <Fragment>
              <div className="flexRow">
                <div
                  className="flex ThemeColor3 pLeft16 TxtLeft"
                  onClick={() => {
                    if (select.length === 0) {
                      onClear();
                      this.setState({ visible: false, indexLevel: 1 });
                    } else {
                      this.setState({ indexLevel: select.length > 2 ? 2 : 1 });
                      select.length > 2 ? handleClick(select[0], 1) : onClear(false);
                    }
                  }}
                >
                  {!!select.length ? _l('返回') : _l('清除')}
                </div>
                <div>{indexLevel ? LEVEL_TEXT[indexLevel - 1] : _l('选择地区')}</div>
                {showConfirmBtn ? (
                  <div
                    className="flex ThemeColor3 pRight16 TxtRight"
                    onClick={() => {
                      select.length && callback(select, indexLevel);
                      this.setState({ visible: false, indexLevel: 1 });
                      onClear(false);
                      select.length && this.props.onClose && this.props.onClose();
                    }}
                  >
                    {_l('确定')}
                  </div>
                ) : (
                  <div className="flex pLeft16"></div>
                )}
              </div>
              {this.renderSearch()}
            </Fragment>
          }
          onClose={() => {
            onClose();
            this.setState({ visible: false, indexLevel: 1 });
          }}
          animationType="slide-up"
        >
          <div style={{ height: 250, overflowY: 'auto' }}>
            {loading ? (
              <LoadDiv />
            ) : (
              <List>
                {data.length > 0 &&
                  listData.map(item => {
                    return (
                      <List.Item key={item.id} onClick={() => this.onNext({...item, last: level === 2 && particularlyCity.includes(item.id) ? true : item.last})}>
                        <div
                          className="mobileCityPickerListItem valignWrapper"
                          style={{
                            color: select.length && select[select.length - 1].id === item.id ? '#2196f3' : '#000',
                          }}
                        >
                          {showConfirmBtn ? (
                            <Radio
                              checked={(last || {}).id === item.id}
                              text={!_.isArray(data[0]) ? item.path : item.name}
                            />
                          ) : (
                            <span>{!_.isArray(data[0]) ? item.path : item.name}</span>
                          )}
                          {!item.last && level > indexLevel && _.isArray(data[0]) && (level === 2 ? !particularlyCity.includes(item.id) : true) && (
                            <Icon className="Font20 Gray_9e" icon="navigate_next" />
                          )}
                        </div>
                      </List.Item>
                    );
                  })}
              </List>
            )}
          </div>
        </Modal>
      </Fragment>
    );
  }
}
