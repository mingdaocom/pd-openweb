import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import { checkValueByFilterRegex } from '../../../core/formUtils';
import {
  clearValue,
  dealAuthAccount,
  getParamsByConfigs,
  getShowValue,
  handleUpdateApi,
} from '../../../core/searchUtils';
import './index.less';

const SearchBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  max-width: ${props => props.maxWidth || '320px'};
  width: 100%;
  height: 36px;
  border: 1px solid var(--color-border-primary);
  border-radius: 3px;
  padding: 0 16px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  font-size: 13px;
  &:hover {
    background: var(--color-background-tertiary);
  }
  .successIcon {
    color: var(--color-success);
    font-size: 18px;
    vertical-align: text-bottom;
  }
`;

const Search = props => {
  const {
    advancedSetting = {},
    defaultSelectProps = {},
    type,
    enumDefault,
    disabled,
    dropdownClassName,
    value,
    onVisibleChange = () => {},
    hint = '',
    formData,
    dataSource,
    worksheetId,
    controlId,
    projectId,
    appId,
    enumDefault2,
    recordId,
    onChange,
    isCell,
  } = props;
  const {
    requestmap,
    itemsource,
    itemtitle,
    itemdesc,
    authaccount,
    responsemap,
    clicksearch,
    searchfirst,
    filterregex,
  } = advancedSetting;
  const min = advancedSetting.min || '0';

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [data, setData] = useState(null);

  const boxRef = useRef(null);
  const searchRef = useRef(null);
  const postListRef = useRef(null);
  const keywordsRef = useRef(keywords);

  useEffect(() => {
    keywordsRef.current = keywords;
  }, [keywords]);

  const realTimeSearch = _.debounce(() => handleSearch(), 500);

  const handleSearch = () => {
    setData(null);

    const requestMap = safeParse(requestmap || '[]');
    if (!dataSource) return alert(_l('模版为空或已删除'), 3);
    if (type === 50 && (!itemsource || !itemtitle)) return alert(_l('下拉框的必填映射项未配置(选项列表，选项名)'), 3);

    // 有配置api和请求参数
    if (postListRef.current) {
      postListRef.current.abort();
    }

    setLoading(true);
    setOpen(true);
    const paramsData = getParamsByConfigs(recordId, requestMap, formData, keywordsRef.current);

    let params = {
      data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
      projectId,
      workSheetId: worksheetId,
      controlId,
      apkId: appId,
      apiTemplateId: dataSource,
      authId: dealAuthAccount(authaccount, formData),
      actionType: enumDefault2 === 1 ? 13 : 8,
      pushUniqueId: md.global.Config.pushUniqueId,
    };

    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    postListRef.current = worksheetAjax.excuteApiQuery(params);

    postListRef.current.then(res => {
      if (res.code === 20008) {
        setIsSuccess(false);
        setLoading(false);
        setData(null);
        upgradeVersionDialog({
          projectId,
          okText: _l('立即充值'),
          hint: _l('信用点不足，请联系管理员充值'),
          explainText: <div></div>,
          onOk: () => {
            location.href = `/admin/valueaddservice/${projectId}`;
          },
        });
        return;
      }

      if (res.message) {
        alert(res.message, 3);
        setIsSuccess(false);
        setLoading(false);
        setData(null);
        return;
      }

      setIsSuccess(true);
      setLoading(false);
      setData(res.apiQueryData || {});

      // 按钮直接更新
      if (type === 49) {
        handleUpdate(res.apiQueryData);
      }
    });
  };

  const handleUpdate = (itemData = {}) => {
    handleUpdateApi(props, itemData, true, () => {
      setData(null);
      setOpen(false);
      setKeywords('');
    });
  };

  const handleSelect = item => {
    const responseMap = safeParse(responsemap || '[]');
    let rowData = {};

    const newValue = getOptions().filter((i, idx) => `${idx}` === item.key);
    responseMap.map(i => {
      if (!i.subid && _.isUndefined(data[i.cid])) {
        rowData[i.cid] = clearValue((newValue[0] || {})[i.id]);
      }
    });

    handleUpdate({ ...data, ...rowData });
  };

  const getOptions = useCallback(() => {
    return safeParse((data || {})[itemsource] || '[]');
  }, [itemsource, data]);

  const getMappingItem = i => {
    const responseMap = safeParse(responsemap || '[]');
    const curMap = _.find(responseMap, re => re.id === i && !re.pid && !re.subid);
    return curMap ? _.find(formData, c => c.controlId === curMap.cid) : '';
  };

  const renderList = item => {
    const itemDesc = safeParse(itemdesc || '[]');
    const itemDescValues = itemDesc
      .map(i => {
        const mappingItem = getMappingItem(i);
        return getShowValue(mappingItem, item[i]);
      })
      .filter(i => i);

    const titleValue = getShowValue(getMappingItem(itemtitle), item[itemtitle]);
    return (
      <React.Fragment>
        <div className={cx('itemTitleBox ellipsis', { Bold: itemDesc.length > 0 })}>{titleValue || _l('无标题')}</div>
        {itemDescValues.length ? (
          <span className={cx('Font12 Gray_75 LineHeight16')} style={{ whiteSpace: 'normal' }}>
            {itemDescValues.join(' | ')}
          </span>
        ) : null}
      </React.Fragment>
    );
  };

  const getSuffixIcon = () => {
    const canClick = _.get(keywords, 'length') >= parseInt(min);
    if (enumDefault === 2) {
      if (clicksearch === '1') {
        return <Icon icon="search Font14" />;
      }
      return (
        <div
          className={cx('searchIconBox', { disabled: disabled || !canClick })}
          onClick={e => {
            e.stopPropagation();
            if (!canClick) return alert(_l('最少输入%0个关键字', min), 3);
            handleSearch();
          }}
        >
          <i className="icon-search pointer Font18"></i>
        </div>
      );
    }

    return <Icon icon="arrow-down-border Font14" />;
  };

  useEffect(() => {
    if (_.get(defaultSelectProps, 'open')) {
      if (enumDefault !== 2 || searchfirst === '1') {
        handleSearch();
      }
      if (boxRef.current) {
        setTimeout(() => {
          try {
            boxRef.current.querySelector('.ant-select-selection-search-input').focus();
          } catch (err) {
            console.log(err);
          }
        }, 100);
      }
    }
  }, [defaultSelectProps.open]);

  if (type === 49) {
    return (
      <SearchBtn
        onClick={() => {
          if (loading) return;
          handleSearch();
        }}
        maxWidth={hint.length <= 2 ? '120px' : '320px'}
      >
        {loading ? (
          <LoadDiv size="small" />
        ) : (
          <span className="TxtCenter flex overflow_ellipsis">
            {isSuccess && <i className="icon-done successIcon"></i>}
            <span className="Bold"> {hint || _l('查询')}</span>
          </span>
        )}
      </SearchBtn>
    );
  }

  let optionData = getOptions();
  const suffixIcon = getSuffixIcon();
  // 按钮搜索下拉框
  const isSelectBtn = enumDefault === 2 && clicksearch !== '1';
  let selectProps = {};

  // 下拉框
  if (enumDefault === 1) {
    selectProps = {
      onSearch: keywords => setKeywords(keywords),
      filterOption: (inputValue, option) => {
        return `${option.label}`.indexOf(inputValue) > -1;
      },
      onDropdownVisibleChange: open => {
        setKeywords('');
        open ? handleSearch() : searchRef.current.blur();
        onVisibleChange(open);
      },
    };
  }

  // 搜索下拉框
  if (enumDefault === 2) {
    selectProps = {
      onSearch: keywords => {
        setKeywords(keywords);
        // 实时搜索
        if (clicksearch === '1') {
          if (keywords.length < parseInt(min)) return;
          if (filterregex && checkValueByFilterRegex(props, keywords, formData)) return;
          realTimeSearch();
        }
      },
      filterOption: false,
      onInputKeyDown: e => {
        // 按钮回车搜索
        if (e.keyCode === 13 && clicksearch !== '1') {
          handleSearch();
        }
      },
      onDropdownVisibleChange: open => {
        // 预加载
        if (searchfirst === '1' && open) {
          handleSearch();
        }
      },
    };
  }

  return (
    <div ref={boxRef}>
      <Select
        ref={searchRef}
        open={open}
        getPopupContainer={() => (isCell ? document.body : boxRef.current)}
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
        onSelect={(value, option) => handleSelect(option)}
        onChange={(value, option) => {
          // keywords判断是为了直接点击删除
          if (_.get(option, 'label') || !keywords.length) {
            onChange(_.get(option, 'label'));
            searchRef.current && searchRef.current.blur();
          }
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setData(null);
          setOpen(false);
          setKeywords('');
          onVisibleChange(false);
        }}
      >
        {optionData.map((item, index) => {
          const label = getShowValue(getMappingItem(itemtitle), item[itemtitle]);
          return (
            <Select.Option key={index} value={index} label={label}>
              {renderList(item)}
            </Select.Option>
          );
        })}
      </Select>
    </div>
  );
};

export default Search;
