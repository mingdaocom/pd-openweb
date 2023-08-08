import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Select } from 'antd';
import { LoadDiv, Icon } from 'ming-ui';
import { browserIsMobile, upgradeVersionDialog } from 'src/util';
import MobileSearch from './MobileSearch';
import { getParamsByConfigs, getShowValue, clearValue } from './util';
import worksheetAjax from 'src/api/worksheet';
import { v4 as uuidv4 } from 'uuid';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

const SearchBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  max-width: ${props => (props.isMobile ? '100%' : props.maxWidth || '320px')};
  width: 100%;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 3px;
  padding: 0 16px;
  background: #fff;
  color: #333;
  font-size: 13px;
  &:hover {
    background: ${props => (props.isMobile ? '#fff' : '#f5f5f5')};
  }
  .successIcon {
    color: #4caf50;
    font-size: 18px;
    vertical-align: text-bottom;
  }
  .mobileLoading {
    .MdLoader-path {
      stroke: #bebebe;
    }
  }
`;

export default class Widgets extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isSuccess: false,
      open: false,
      keywords: '',
      data: null,
    };
  }

  componentDidMount() {
    if (_.get(this.props, 'defaultSelectProps.open')) {
      if (this.props.enumDefault !== 2 || _.get(this.props, 'advancedSetting.searchfirst') === '1') {
        this.handleSearch();
      }
      if (this.box) {
        setTimeout(() => {
          try {
            this.box.querySelector('.ant-select-selection-search-input').focus();
          } catch (err) {
            console.log(err);
          }
        }, 100);
      }
    }
  }

  realTimeSearch = _.debounce(() => this.handleSearch(), 500);

  handleSearch = () => {
    const {
      advancedSetting: { requestmap, itemsource, itemtitle } = {},
      dataSource,
      formData,
      worksheetId,
      controlId,
      projectId,
      appId,
      type,
      getControlRef,
    } = this.props;
    const { keywords } = this.state;

    this.setState({ data: null });

    const requestMap = safeParse(requestmap || '[]');
    if (!dataSource) return alert(_l('模版为空或已删除'), 3);
    if (type === 50 && (!itemsource || !itemtitle)) return alert(_l('下拉框的必填映射项未配置(选项列表，选项名)'), 3);
    // 有配置api和请求参数
    if (this.postList) {
      this.postList.abort();
    }

    this.setState({ loading: true, open: true });
    const paramsData = getParamsByConfigs(requestMap, formData, keywords, getControlRef);

    let params = {
      data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
      projectId,
      workSheetId: worksheetId,
      controlId,
      apkId: appId,
      apiTemplateId: dataSource,
    };

    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    this.postList = worksheetAjax.excuteApiQuery(params);

    this.postList.then(res => {
      if (res.code === 20008) {
        this.setState({ isSuccess: false, loading: false, data: null });
        upgradeVersionDialog({
          projectId,
          okText: _l('立即充值'),
          hint: _l('余额不足，请联系管理员充值'),
          explainText: <div></div>,
          onOk: () => {
            location.href = `/admin/valueaddservice/${projectId}`;
          },
        });
        return;
      }

      if (res.message) {
        alert(res.message, 3);
        this.setState({ isSuccess: false, loading: false, data: null });
        return;
      }

      this.setState({ isSuccess: true, loading: false, data: res.apiQueryData || {} }, () => {
        // 按钮直接更新
        if (type === 49) {
          this.handleUpdate(res.apiQueryData);
        }
      });
    });
  };

  handleUpdate = (itemData = {}) => {
    const { advancedSetting: { responsemap } = {}, formData } = this.props;
    const responseMap = safeParse(responsemap || '[]');
    responseMap.map(item => {
      const control = _.find(formData, i => i.controlId === item.cid);
      if (control && !_.isUndefined(itemData[item.cid])) {
        // 子表直接赋值
        if (control.type === 34 && _.includes([10000007, 10000008], item.type)) {
          this.props.onChange(
            {
              action: 'clearAndSet',
              rows: safeParse(itemData[item.cid] || '[]').map(i => {
                return {
                  ...i,
                  rowid: `temprowid-${uuidv4()}`,
                  allowedit: true,
                  addTime: new Date().getTime(),
                };
              }),
            },
            control.controlId,
          );
        } else if (!item.subid) {
          // 普通数组特殊处理
          const itemVal =
            item.type === 10000007 && itemData[item.cid] && _.isArray(safeParse(itemData[item.cid]))
              ? safeParse(itemData[item.cid]).join(',')
              : itemData[item.cid];
          this.props.onChange(itemVal, control.controlId, false);
        }
        this.setState({ data: null, open: false, keywords: '' });
      }
    });
  };

  handleSelect = item => {
    const { advancedSetting: { responsemap } = {} } = this.props;
    const data = this.state.data || {};
    const responseMap = safeParse(responsemap || '[]');
    let rowData = {};

    const newValue = this.getOptions().filter((i, idx) => `${idx}` === item.key);
    responseMap.map(i => {
      if (!i.subid && _.isUndefined(data[i.cid])) {
        rowData[i.cid] = clearValue((newValue[0] || {})[i.id]);
      }
    });

    this.handleUpdate({ ...data, ...rowData });
  };

  getOptions = () => {
    const { advancedSetting: { itemsource } = {} } = this.props;
    const data = this.state.data || {};
    return safeParse(data[itemsource] || '[]');
  };

  getMappingItem = i => {
    const { advancedSetting: { responsemap } = {}, formData = [] } = this.props;
    const responseMap = safeParse(responsemap || '[]');
    const curMap = _.find(responseMap, re => re.id === i && !re.pid && !re.subid);
    return curMap ? _.find(formData, c => c.controlId === curMap.cid) : '';
  };

  renderList = item => {
    const {
      advancedSetting: { itemtitle, itemdesc },
    } = this.props;
    const itemDesc = safeParse(itemdesc || '[]');
    const itemDescValues = itemDesc
      .map(i => {
        const mappingItem = this.getMappingItem(i);
        return getShowValue(mappingItem, item[i]);
      })
      .filter(i => i);

    const titleValue = getShowValue(this.getMappingItem(itemtitle), item[itemtitle]);
    const isMobile = browserIsMobile();
    return (
      <Fragment>
        <div className={cx('ellipsis', { Gray: isMobile, Bold: itemDesc.length > 0 })}>
          {titleValue || _l('无标题')}
        </div>
        {itemDescValues.length ? (
          <span className={cx('Font12 Gray_75 LineHeight16')} style={{ whiteSpace: 'normal' }}>
            {itemDescValues.join(' | ')}
          </span>
        ) : null}
      </Fragment>
    );
  };

  getSuffixIcon = () => {
    const { enumDefault, disabled, advancedSetting: { clicksearch, min = '0' } = {} } = this.props;
    const canClick = this.state.keywords.length >= parseInt(min);
    if (enumDefault === 2) {
      if (clicksearch === '1') {
        return <Icon icon="search1 Font14" />;
      }
      return (
        <div
          className={cx('searchIconBox', { disabled: disabled || !canClick })}
          onClick={e => {
            e.stopPropagation();
            if (!canClick) return alert(_l('最少输入%0个关键字', min), 3);
            this.handleSearch();
          }}
        >
          <i className="icon-search1 pointer Font18"></i>
        </div>
      );
    }

    return <Icon icon="arrow-down-border Font14" />;
  };

  render() {
    const {
      isCell,
      advancedSetting = {},
      defaultSelectProps = {},
      type,
      enumDefault,
      disabled,
      dropdownClassName,
      value,
      onVisibleChange = () => {},
      controlName,
      hint = '',
    } = this.props;
    const { itemtitle = '', clicksearch, searchfirst, min = '0' } = advancedSetting;
    const { loading, isSuccess, keywords, data, open } = this.state;

    let isMobile = browserIsMobile();

    if (type === 49) {
      return (
        <SearchBtn
          onClick={() => {
            if (loading) return;
            this.handleSearch();
          }}
          isMobile={isMobile}
          maxWidth={hint.length <= 2 ? '120px' : '320px'}
        >
          {loading ? (
            <LoadDiv size="small" className={cx({ mobileLoading: isMobile })} />
          ) : (
            <span className="TxtCenter flex overflow_ellipsis">
              {isSuccess && <i className="icon-done successIcon"></i>}
              <span className="Bold"> {hint || _l('查询')}</span>
            </span>
          )}
        </SearchBtn>
      );
    }

    let optionData = this.getOptions();
    const suffixIcon = this.getSuffixIcon();
    // 按钮搜索下拉框
    const isSelectBtn = enumDefault === 2 && clicksearch !== '1';
    let selectProps = {};

    // 下拉框
    if (enumDefault === 1) {
      selectProps = {
        onSearch: keywords => this.setState({ keywords }),
        filterOption: (inputValue, option) => {
          return `${option.label}`.indexOf(inputValue) > -1;
        },
        onDropdownVisibleChange: open => {
          this.setState({ keywords: '' });
          open ? this.handleSearch() : this.search.blur();
          onVisibleChange(open);
        },
      };
    }

    // 搜索下拉框
    if (enumDefault === 2) {
      selectProps = {
        onSearch: keywords =>
          this.setState({ keywords }, () => {
            // 实时搜索
            if (clicksearch === '1') {
              if (this.state.keywords.length < parseInt(min)) return;
              this.realTimeSearch();
            }
          }),
        filterOption: false,
        onInputKeyDown: e => {
          // 按钮回车搜索
          if (e.keyCode === 13 && clicksearch !== '1') {
            this.handleSearch();
          }
        },
        onDropdownVisibleChange: open => {
          // 预加载
          if (searchfirst === '1' && open) {
            this.handleSearch();
          }
        },
      };
    }
    if (isMobile) {
      return (
        <MobileSearch
          value={value}
          hint={hint}
          loading={loading}
          enumDefault={enumDefault}
          onChange={this.props.onChange}
          controlName={controlName}
          advancedSetting={advancedSetting}
          optionData={optionData}
          handleSearch={keywords => {
            this.setState({ keywords }, this.handleSearch);
          }}
          renderList={this.renderList}
          realTimeSearch={keywords => {
            this.setState({ keywords }, () => {
              if (this.state.keywords.length < parseInt(min)) return;
              this.realTimeSearch();
            });
          }}
          disabled={disabled}
          handleSelect={this.handleSelect}
          clearData={() => {
            this.setState({ data: [] });
          }}
        />
      );
    }
    return (
      <div ref={con => (this.box = con)}>
        <Select
          ref={search => {
            this.search = search;
          }}
          open={open}
          getPopupContainer={() => (isCell ? document.body : this.box)}
          dropdownClassName={dropdownClassName}
          className={cx('w100 customAntSelect', { customApiSelect: isSelectBtn, customSelectIcon: enumDefault === 2 })}
          disabled={disabled}
          allowClear={value}
          listHeight={320}
          optionLabelProp="label"
          searchValue={keywords}
          value={value}
          placeholder={hint || _l('请选择')}
          showSearch={true}
          suffixIcon={suffixIcon}
          {...{ ...defaultSelectProps, ...selectProps }}
          notFoundContent={
            // 搜索框不打开时
            loading ? (
              <LoadDiv className="flexCenter" size="small" />
            ) : data ? (
              <span className="Gray_9e">{_l('没有返回结果')}</span>
            ) : null
          }
          onSelect={(value, option) => this.handleSelect(option)}
          onChange={(value, option) => {
            // keywords判断是为了直接点击删除
            if (_.get(option, 'label') || !keywords.length) {
              this.props.onChange(_.get(option, 'label'));
            }
          }}
          onFocus={() => this.setState({ open: true })}
          onBlur={() => {
            this.setState({ data: null, open: false, keywords: '' });
            onVisibleChange(false);
          }}
        >
          {optionData.map((item, index) => {
            const label = getShowValue(this.getMappingItem(itemtitle), item[itemtitle]);
            return (
              <Select.Option key={index} value={index} label={label}>
                {this.renderList(item)}
              </Select.Option>
            );
          })}
        </Select>
      </div>
    );
  }
}
