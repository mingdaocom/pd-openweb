import React, { memo, useMemo, useRef, useState } from 'react';
import { InputNumber, Select, Slider } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import {
  DEFAULT_MIN_RELEVANCE,
  DEFAULT_RRF_K,
  DEFAULT_TOP_K,
  MIN_RELEVANCE_RANGE,
  SEARCH_MODE,
  SELECT_SEARCH_DOC_TYPES,
  SELECT_SEARCH_MODES,
  TOP_K_RANGE,
} from '../../../../../../core/config';
import { useAutoFocus } from '../../../../../../core/hooks';
import './index.less';

const SideBar = props => {
  const { knowledgeDetail, onSearch } = props;
  const { knowledgeCollections } = knowledgeDetail;

  const inputRef = useRef(null);
  useAutoFocus(inputRef);

  const worksheetOptions = useMemo(
    () =>
      knowledgeCollections
        .filter(item => item.worksheet?.workSheetName && item.worksheet?.workSheetId)
        .map(item => ({
          label: item.worksheet.workSheetName,
          value: item.worksheet.workSheetId,
        })),
    [knowledgeCollections],
  );

  const [searchConfig, setSearchConfig] = useState({
    query: '',
    worksheetIds: [],
    searchTypes: [],
    // 检索模式
    searchMode: SEARCH_MODE.HYBRID,
    // 召回数量
    topK: DEFAULT_TOP_K,
    // 最低相关度
    minRelevance: DEFAULT_MIN_RELEVANCE,
    // RRF融合参数
    rrfK: DEFAULT_RRF_K,
  });

  const handleSearch = () => {
    const { query, worksheetIds, searchTypes, searchMode, topK, minRelevance, rrfK } = searchConfig;

    const formatQuery = query.trim();

    if (!formatQuery) {
      alert(_l('请输入检索内容'), 3);
      return;
    }

    const filter = {};

    if (worksheetIds?.length) {
      filter.worksheetIds = worksheetIds;
    }

    if (searchTypes?.length) {
      filter.types = searchTypes;
    }

    const params = {
      knowledgeIds: [knowledgeDetail.id],
      query: formatQuery,
      searchMode,
      topK,
      ...(Object.keys(filter).length ? { filter } : {}),
    };

    switch (searchMode) {
      case SEARCH_MODE.VECTOR:
        params.minRelevance = minRelevance;
        break;

      case SEARCH_MODE.HYBRID:
        params.rrfK = rrfK;
        break;
      default:
        break;
    }

    onSearch(params);
  };

  return (
    <div className="SideBarContainer">
      {/* 检索内容 */}
      <div className="filterTitle">{_l('检索内容')}</div>
      <textarea
        ref={inputRef}
        className="knowledgeTextarea filterDesc"
        placeholder={_l('输入检索内容')}
        value={searchConfig.query}
        maxLength={500}
        onChange={e =>
          setSearchConfig(prev => ({
            ...prev,
            query: e.target.value,
          }))
        }
      />
      <div className="searchBtn" onClick={handleSearch}>
        <Icon icon="search" />
        {_l('检索')}
      </div>

      {/* 检索范围 */}
      <div className="filterTitle">{_l('检索范围')}</div>

      <div className="filterSubTitle">{_l('工作表')}</div>
      <Select
        className="filterSelect"
        mode="multiple"
        maxTagCount="responsive"
        options={worksheetOptions}
        allowClear
        value={searchConfig.worksheetIds}
        onChange={value =>
          setSearchConfig(prev => ({
            ...prev,
            worksheetIds: value,
          }))
        }
        placeholder={_l('全部')}
      />

      <div className="filterSubTitle">{_l('类型')}</div>
      <Select
        className="filterSelect"
        mode="multiple"
        maxTagCount="responsive"
        options={SELECT_SEARCH_DOC_TYPES}
        allowClear
        value={searchConfig.searchTypes}
        onChange={value =>
          setSearchConfig(prev => ({
            ...prev,
            searchTypes: value,
          }))
        }
        placeholder={_l('全部')}
      />

      {/* 检索方式 */}
      <div className="filterTitle mTop10">{_l('检索策略')}</div>
      <div className="modeList">
        {SELECT_SEARCH_MODES.map(item => (
          <div
            className={cx('modeItem', { active: searchConfig.searchMode === item.value })}
            key={item.value}
            onClick={() =>
              setSearchConfig(prev => ({
                ...prev,
                searchMode: item.value,
              }))
            }
          >
            {item.label}
          </div>
        ))}
      </div>
      <div className="sliderBox">
        <div className="sliderItem">
          <div className="sliderItemInput">
            <div className="label">{_l('最大召回数（TOP K）')}</div>
            <InputNumber
              min={TOP_K_RANGE.min}
              max={TOP_K_RANGE.max}
              step={TOP_K_RANGE.step}
              value={searchConfig.topK}
              onChange={value =>
                setSearchConfig(prev => ({
                  ...prev,
                  topK: value || TOP_K_RANGE.min,
                }))
              }
            />
          </div>
          <Slider
            value={searchConfig.topK}
            onChange={value =>
              setSearchConfig(prev => ({
                ...prev,
                topK: value,
              }))
            }
            min={TOP_K_RANGE.min}
            max={TOP_K_RANGE.max}
            step={TOP_K_RANGE.step}
          />
        </div>
        {searchConfig.searchMode === SEARCH_MODE.VECTOR && (
          <div className="sliderItem">
            <div className="sliderItemInput">
              <div className="label">{_l('相关度阈值')}</div>
              <InputNumber
                min={MIN_RELEVANCE_RANGE.min}
                max={MIN_RELEVANCE_RANGE.max}
                step={MIN_RELEVANCE_RANGE.step}
                value={searchConfig.minRelevance}
                onChange={value =>
                  setSearchConfig(prev => ({
                    ...prev,
                    minRelevance: value || MIN_RELEVANCE_RANGE.min,
                  }))
                }
              />
            </div>
            <Slider
              value={searchConfig.minRelevance}
              onChange={value =>
                setSearchConfig(prev => ({
                  ...prev,
                  minRelevance: value,
                }))
              }
              min={MIN_RELEVANCE_RANGE.min}
              max={MIN_RELEVANCE_RANGE.max}
              step={MIN_RELEVANCE_RANGE.step}
            />
          </div>
        )}
        {/* {searchConfig.searchMode === SEARCH_MODE.HYBRID && (
          <div className="sliderItem">
            <div className="sliderItemInput">
              <div className="label">
                {_l('RRF 融合参数')}
                <Tooltip title={_l('RRF 融合参数')}>
                  <Icon icon="info_outline" />
                </Tooltip>
              </div>
              <InputNumber
                min={RRF_K_RANGE.min}
                max={RRF_K_RANGE.max}
                step={RRF_K_RANGE.step}
                value={searchConfig.rrfK}
                onChange={value =>
                  setSearchConfig(prev => ({
                    ...prev,
                    rrfK: value,
                  }))
                }
              />
            </div>
            <Slider
              value={searchConfig.rrfK}
              onChange={value =>
                setSearchConfig(prev => ({
                  ...prev,
                  rrfK: value,
                }))
              }
              min={RRF_K_RANGE.min}
              max={RRF_K_RANGE.max}
              step={RRF_K_RANGE.step}
            />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default memo(SideBar);
