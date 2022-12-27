import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { LoadDiv } from 'ming-ui';
import { Modal, List, Tabs } from 'antd-mobile';
import Controller from 'src/api/fixedData';
import './less/MobileCityPicker.less';
import _ from 'lodash';

const particularlyCity = ['110000', '120000', '310000', '500000', '810000', '820000'];
const overseas = ['910000'];

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
    callback: () => {},
    onClear: () => {},
  };

  constructor(props) {
    super(props);

    this.state = {
      value: props.defaultValue,
      visible: false,
      loading: false,
      citys: [],
      selectCitys: [],
      indexLevel: 1,
    };
  }

  componentDidMount() {
    this.loadProvince();
  }

  loadProvince() {
    this.setState({ loading: true });

    Controller.loadProvince().then(result => {
      this.setState({
        citys: result.provinces,
        loading: false,
      });
    });
  }

  loadCityCountyById(id) {
    this.setState({ loading: true });

    Controller.loadCityCountyById({ id }).then(result => {
      this.setState({
        citys: result.citys,
        loading: false,
      });
    });
  }

  onTabClick(index) {
    const { callback } = this.props;
    const { selectCitys } = this.state;

    if (particularlyCity.includes(selectCitys[0].id)) {
      const city = selectCitys[0];
      callback([city]);

      this.setState({
        selectCitys: [city],
        citys: [city],
        indexLevel: index + 1,
      });

      index === 0 ? this.loadProvince() : null;
    } else {
      selectCitys.splice(index + 1);
      callback(selectCitys);

      this.setState({
        selectCitys,
        indexLevel: index + 1,
      });

      index === 0 ? this.loadProvince() : this.loadCityCountyById(selectCitys[0].id);
    }
  }

  onNext(item) {
    const { level, callback } = this.props;
    const { indexLevel, selectCitys } = this.state;

    if (selectCitys[indexLevel - 1]) {
      selectCitys.pop();
    }

    const newSelectCitys = [...selectCitys, item];

    callback(newSelectCitys);

    if (particularlyCity.includes(item.id) && newSelectCitys.length === 2) {
      callback([item]);
    } else {
      callback(_.uniqBy(newSelectCitys).length !== newSelectCitys.length ? _.uniqBy(newSelectCitys) : newSelectCitys);
    }

    if (particularlyCity.includes(item.id)) {
      if (newSelectCitys.length === 1 && level !== 1) {
        this.setState({
          selectCitys: newSelectCitys,
          citys: [item],
          indexLevel: newSelectCitys.length + 1,
        });
        return;
      }
    }

    if (overseas.includes(item.id)) {
      this.setState({
        selectCitys: newSelectCitys,
        visible: false,
      });
      this.props.onClose && this.props.onClose();
      return;
    }

    if (newSelectCitys.length === level) {
      this.setState({
        selectCitys: newSelectCitys,
        visible: false,
        indexLevel: level,
      });
      this.props.onClose && this.props.onClose();
      return;
    }

    this.setState({
      selectCitys: newSelectCitys,
      indexLevel: newSelectCitys.length + 1,
    });

    this.loadCityCountyById(item.id);
  }

  render() {
    const { disabled, children, placeholder, onClear, onClose = () => {} } = this.props;
    const { value, visible, loading, citys, indexLevel, selectCitys } = this.state;
    const tabs = [
      { title: _l('省份') },
      { title: indexLevel >= 2 ? _l('城市') : '' },
      { title: indexLevel === 3 ? _l('区县') : '' },
    ];

    return (
      <Fragment>
        <span onClick={() => !disabled && this.setState({ visible: true })}>
          {children || <input readOnly value={value} placeholder={placeholder} />}
        </span>

        <Modal
          className="mobileCityPicker"
          popup
          visible={visible}
          title={
            <div className="flexRow">
              <div
                className="flex ThemeColor3 pLeft16 TxtLeft"
                onClick={() => {
                  onClear();
                  this.setState({ visible: false });
                }}
              >
                {_l('清除')}
              </div>
              <div>{_l('选择地区')}</div>
              <div className="flex pLeft16"></div>
            </div>
          }
          onClose={() => {
            onClose();
            this.setState({ visible: false });
          }}
          animationType="slide-up"
        >
          <Tabs
            tabs={tabs}
            page={indexLevel - 1}
            onTabClick={(tab, index) => {
              if (index <= selectCitys.length - 1) {
                this.onTabClick(index);
              }
            }}
          />
          <div style={{ height: 250, overflowY: 'auto' }}>
            {loading ? (
              <LoadDiv />
            ) : (
              <List>
                {citys.map(item => (
                  <List.Item key={item.id} onClick={() => this.onNext(item)}>
                    <div
                      style={{
                        color:
                          selectCitys.length && selectCitys[selectCitys.length - 1].id === item.id ? '#2196f3' : '#000',
                      }}
                    >
                      {item.name}
                    </div>
                  </List.Item>
                ))}
              </List>
            )}
          </div>
        </Modal>
      </Fragment>
    );
  }
}
