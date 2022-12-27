import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import { Modal } from 'antd-mobile';
import { LoadDiv, Icon, Radio } from 'ming-ui';
import './index.less';
import _ from 'lodash';

export default class MobileSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: '',
      currentChecked: props.value,
    };
  }
  componentDidMount() {
    if (this.props.enumDefault === 2) {
      this.searchInput && this.searchInput.focus();
    }
  }
  render() {
    const { enumDefault, controlName, value, loading, optionData, advancedSetting = {}, disabled, hint } = this.props;
    const { keywords, currentChecked = '', visible, mobileSearchResult = [] } = this.state;
    const { itemtitle = '', clicksearch, searchfirst, min = '0' } = advancedSetting;
    let mobileOptionData = keywords && enumDefault === 1 ? mobileSearchResult : optionData;
    if (disabled) {
      return <div className="customFormControlBox customFormButton flexRow controlDisabled">{value}</div>;
    }
    return (
      <Fragment>
        <Select
          className="w100 customAntSelect mobileCustomApiSelect"
          dropdownRender={null}
          onClick={() => {
            this.setState({ visible: true });
            if ((enumDefault === 2 && searchfirst === '1') || enumDefault === 1) {
              this.props.handleSearch(keywords);
            }
          }}
          value={value}
          placeholder={hint || _l('请选择')}
          suffixIcon={<Icon icon="arrow-right-border Font14" />}
          onChange={value => {
            // keywords判断是为了直接点击删除
            if (value || !keywords.length) {
              this.props.onChange(value);
            }
          }}
          notFoundContent={null}
        />

        <Modal
          popup
          visible={visible}
          animationType="slide-up"
          className="searchListModals"
          title={
            <div className="flexRow">
              <div
                className="ThemeColor3 TxtLeft pRight16 Font15"
                onClick={() => {
                  this.setState({ visible: false, keywords: '' });
                }}
              >
                {_l('取消')}
              </div>
              <div className="flex ellipsis">{controlName}</div>
              <div
                className="ThemeColor3 pLeft16 TxtRight Font15"
                onClick={() => {
                  this.setState({ visible: false, currentChecked: '', keywords: '' });
                  this.props.onChange();
                }}
              >
                {_l('移除')}
              </div>
            </div>
          }
        >
          {
            <Fragment>
              {enumDefault === 2 && clicksearch === '0' ? (
                <div className="searchBox GrayBGF8 selectSearchBox">
                  <input
                    ref={node => (this.searchInput = node)}
                    type="text"
                    className="cursorText flex Gray"
                    placeholder={hint || _l('请选择')}
                    onChange={e => {
                      const value = e.target.value.trim();
                      this.setState({ keywords: value });
                    }}
                    value={keywords}
                  />
                  <div
                    className="searchBtn"
                    onClick={() => {
                      if (keywords.length < parseInt(min)) return;
                      this.props.handleSearch(keywords);
                    }}
                  >
                    <Icon icon="search" className="Font18 Gray_75" />
                  </div>
                </div>
              ) : (
                <div className="searchBox GrayBGF8">
                  <Icon icon="search" className="searchIcon Font20 Gray_75" />
                  <input
                    type="text"
                    className="cursorText Gray"
                    placeholder={hint || _l('请选择')}
                    ref={node => (this.searchInput = node)}
                    onChange={e => {
                      const value = e.target.value.trim();
                      if (clicksearch === '1') {
                        this.setState({ keywords: value });
                        this.props.realTimeSearch(value);
                      } else {
                        let searchResult = optionData.filter(item => `${item[itemtitle]}`.indexOf(value) > -1);
                        this.setState({ keywords: value, mobileSearchResult: searchResult });
                      }
                    }}
                    value={keywords}
                  />
                </div>
              )}
              {loading ? (
                <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
                  <LoadDiv />
                </div>
              ) : keywords && enumDefault === 1 && _.isEmpty(mobileSearchResult) ? (
                <div className="w100 h100 flexColumn alignItemsCenter justifyContentCenter">
                  <Icon icon="h5_search" className="Font50" />
                  <div className="Gray_bd Font17 Bold mTop40">{_l('没有搜索结果')}</div>
                </div>
              ) : (
                <div className="flex searchResult">
                  {mobileOptionData.map((item, i) => {
                    const labelNode = this.props.renderList(item);
                    return (
                      <div
                        key={i}
                        className="flexRow searchItem alignItemsCenter"
                        onClick={() => {
                          this.setState({ visible: false, currentChecked: item[itemtitle] });
                          this.props.onChange(item[itemtitle]);
                          this.props.handleSelect({ key: String(i), value: item[itemtitle], label: item[itemtitle] });
                        }}
                      >
                        <Radio checked={item[itemtitle] === currentChecked} />
                        <div className="flex TxtLeft overflowHidden itemContent"> {labelNode}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Fragment>
          }
        </Modal>
      </Fragment>
    );
  }
}
