import React, { useState, useRef, useCallback, memo, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { upgradeVersionDialog } from 'src/components/upgradeVersion';
import PopupSearch from './PopupSearch';
import { getParamsByConfigs, getShowValue, clearValue, handleUpdateApi } from '../../../core/searchUtils';
import worksheetAjax from 'src/api/worksheet';
import _ from 'lodash';
import cx from 'classnames';

const SearchBox = props => {
  const { advancedSetting = {}, formData, type, hint, enumDefault, value, controlName, disabled, formDisabled } = props;
  const { itemsource, itemtitle, itemdesc, responsemap, min = '0' } = advancedSetting;
  const postList = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [keywords, setKeywords] = useState(null);
  const [data, setData] = useState({});

  const handleUpdate = (itemData = {}) => {
    handleUpdateApi(props, itemData, true, () => {
      setData({});
      setKeywords('');
    });
  };

  const handleSearch = (props, keywords) => {
    const {
      advancedSetting: { requestmap, itemsource, itemtitle, authaccount } = {},
      dataSource,
      formData,
      worksheetId,
      controlId,
      projectId,
      appId,
      type,
      enumDefault2,
    } = props;
    setData({});

    const requestMap = safeParse(requestmap || '[]');
    if (!dataSource) return alert(_l('模版为空或已删除'), 3);
    if (type === 50 && (!itemsource || !itemtitle)) return alert(_l('下拉框的必填映射项未配置(选项列表，选项名)'), 3);
    // 有配置api和请求参数
    if (postList.current) {
      postList.current.abort();
    }

    setLoading(true);
    const paramsData = getParamsByConfigs(requestMap, formData, keywords);

    let params = {
      data: !requestMap.length || _.isEmpty(paramsData) ? '' : paramsData,
      projectId,
      workSheetId: worksheetId,
      controlId,
      apkId: appId,
      apiTemplateId: dataSource,
      authId: authaccount,
      actionType: enumDefault2 === 1 ? 13 : 8,
    };

    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }

    postList.current = worksheetAjax.excuteApiQuery(params);

    postList.current.then(res => {
      if (res.code === 20008) {
        setIsSuccess(false);
        setLoading(false);
        setData({});
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
        setIsSuccess(false);
        setLoading(false);
        setData({});
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

  const realTimeSearch = useCallback(_.debounce(handleSearch, 500), []);

  const getOptions = () => {
    return safeParse(data[itemsource] || '[]');
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

  const getMappingItem = i => {
    const responseMap = safeParse(responsemap || '[]');
    const curMap = _.find(responseMap, re => re.id === i && !re.pid && !re.subid);
    return curMap ? _.find(formData, c => c.controlId === curMap.cid) : '';
  };

  const renderListItem = item => {
    const itemDesc = safeParse(itemdesc || '[]');
    const itemDescValues = itemDesc
      .map(i => {
        const mappingItem = getMappingItem(i);
        return getShowValue(mappingItem, item[i]);
      })
      .filter(i => i);

    const titleValue = getShowValue(getMappingItem(itemtitle), item[itemtitle]);
    return (
      <Fragment>
        <div className={cx('ellipsis Gray Font15', { Bold: itemDesc.length > 0 })}>{titleValue || _l('无标题')}</div>
        {itemDescValues.length ? <span className={cx('Font12 Gray_75')}>{itemDescValues.join(' | ')}</span> : null}
      </Fragment>
    );
  };

  if (type === 49) {
    return (
      <div
        className="customFormControlBox customFormButton"
        onClick={() => {
          if (loading) return;
          handleSearch(props, keywords);
        }}
      >
        {loading ? (
          <Icon icon="loading_button" className="loading" />
        ) : (
          <Fragment>
            {isSuccess && <Icon icon="done" className="success" />}
            <span>{hint || _l('查询')}</span>
          </Fragment>
        )}
      </div>
    );
  }

  return (
    <PopupSearch
      value={value}
      hint={hint}
      loading={loading}
      enumDefault={enumDefault}
      onChange={props.onChange}
      controlName={controlName}
      advancedSetting={advancedSetting}
      optionData={getOptions()}
      handleSearch={key => {
        setKeywords(key);
        handleSearch(props, key);
      }}
      renderListItem={renderListItem}
      realTimeSearch={key => {
        setKeywords(key);
        if (key.length < parseInt(min)) return;
        realTimeSearch(props, key);
      }}
      disabled={disabled}
      formDisabled={formDisabled}
      handleSelect={handleSelect}
      clearData={() => setData({})}
    />
  );
};

export default memo(SearchBox);
