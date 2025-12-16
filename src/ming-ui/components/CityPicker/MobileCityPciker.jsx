import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon, LoadDiv, PopupWrapper, Radio } from 'ming-ui';
import '../less/MobileCityPicker.less';

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
    placeholder: _l('选择地区'),
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

    this.handleClose = this.handleClose.bind(this);
    this.handleBack = this.handleBack.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.debounceSearch = _.debounce(keywords => {
      this.props.getCitys({ keywords });
    }, 500);
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

  handleChange(e) {
    const keywords = e.target.value;
    this.setState({ keywords });
    this.debounceSearch(keywords);
  }

  handleClose() {
    const { onClose } = this.props;
    onClose();
    this.setState({ visible: false, indexLevel: 1 });
  }

  handleBack() {
    const { onClear, select, handleClick } = this.props;

    this.setState({ indexLevel: select.length > 2 ? 2 : 1 });
    select.length > 2 ? handleClick(select[0], 1) : onClear(false);
  }

  handleClear() {
    const { onClear } = this.props;
    onClear();
    this.setState({ visible: false, indexLevel: 1 });
  }

  handleSave() {
    const { select, onClear, onClose, callback } = this.props;
    const { indexLevel } = this.state;
    select.length && callback && callback(select, indexLevel);
    this.setState({ visible: false, indexLevel: 1 });
    onClear(false);
    select.length && onClose && onClose();
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
            type="search"
            placeholder={_l('搜索')}
            className="Font14"
            value={keywords}
            onChange={e => this.handleChange(e)}
            onKeyDown={event => {
              event.which === 13 && this.handleSearch();
            }}
            onBlur={() => this.handleSearch()}
          />
        </form>
        {keywords ? (
          <Icon
            icon="workflow_cancel"
            onClick={() => {
              this.setState({ keywords: '' }, this.handleSearch);
            }}
          />
        ) : null}
      </div>
    );
  }

  render() {
    const { disabled, children, placeholder, showConfirmBtn, defaultValue, data = [], select = [], level } = this.props;
    const { visible, loading, indexLevel } = this.state;
    const last = _.last(select);
    const listData = data.length ? (_.isArray(data[0]) ? data[data.length - 1] : data) : [];

    return (
      <Fragment>
        <span className="Block" onClick={() => !disabled && this.setState({ visible: true }, this.props.getCitys)}>
          {children || (
            <input readOnly value={select.length === 0 ? defaultValue : last.path} placeholder={placeholder} />
          )}
        </span>
        <PopupWrapper
          bodyClassName="heightPopupBody40"
          visible={visible}
          title={_l('选择地区')}
          confirmDisable={!select.length}
          clearDisable={!defaultValue}
          onClose={this.handleClose}
          onBack={select.length > 0 && this.handleBack}
          onClear={this.handleClear}
          onConfirm={this.handleSave}
        >
          <div className="mobileCityPicker flexColumn">
            {this.renderSearch()}
            <div className="cityPickerContentBox flex">
              {loading ? (
                <LoadDiv />
              ) : (
                <div className="popupListBox">
                  {data.length > 0 && listData.length > 0 ? (
                    listData.map(item => {
                      return (
                        <div
                          className="popupListItem"
                          key={item.id}
                          onClick={() =>
                            this.onNext({
                              ...item,
                              last: level === 2 && particularlyCity.includes(item.id) ? true : item.last,
                            })
                          }
                        >
                          <div
                            style={{
                              color: select.length && select[select.length - 1].id === item.id ? '#1677ff' : '#151515',
                            }}
                          >
                            {showConfirmBtn && <Radio checked={(last || {}).id === item.id} />}
                          </div>
                          <div className="popupListItemContentBox">
                            <div
                              className="popupListItemContent"
                              style={{
                                color:
                                  select.length && select[select.length - 1].id === item.id ? '#1677ff' : '#151515',
                              }}
                            >
                              {!_.isArray(data[0]) ? item.path : item.name}
                            </div>
                            {!item.last &&
                              level > indexLevel &&
                              _.isArray(data[0]) &&
                              (level === 2 ? !particularlyCity.includes(item.id) : true) && (
                                <Icon className="Font20 Gray_9e" icon="navigate_next" />
                              )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="pTop30 pBottom30 TxtCenter Gray_9e Font15">{_l('无地区数据，请联系管理员')}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </PopupWrapper>
      </Fragment>
    );
  }
}
