import React, { useState, useEffect, Fragment } from 'react';
import styled from 'styled-components';
import { LoadDiv, SvgIcon } from 'ming-ui';
import { Tooltip } from 'antd';
import { dialogSelectIntegrationApi } from 'ming-ui/functions';
import worksheetAjax from 'src/api/worksheet';
import { SettingItem } from '../../../styled';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import { dealRequestControls } from '../../../util/data';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import SearchParams from './SearchParams';
import SearchMapping from './SearchMapping';
import SearchMappingFilter from './SearchMappingFilter';
import _ from 'lodash';

const SearchMode = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  ${({ isDelete }) => (isDelete ? 'border: 1px solid #F51744;background: #FFF2F4;color: #F51744;' : '')}
  &:hover {
    border-color: #ccc;
  }
  .apiWrap {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    .iconWrap {
      width: 38px;
      height: 38px;
      margin-right: 10px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      position: relative;
      svg {
        vertical-align: middle !important;
      }
      img,
      .defaultIcon {
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        left: -6px;
        top: -4px;
      }
      img {
        border: 1px solid #fff;
      }
      .defaultIcon {
        background: #fff;
        color: #9e9e9e;
        font-size: 12px;
        text-align: center;
        line-height: 16px;
        border: 1px solid #efefef;
      }
    }
    .iconDesc {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }
  }
`;

function BasicInfo(props) {
  const { data = {}, apiInfo = {}, onClick, globalSheetInfo = {} } = props;
  return (
    <SearchMode onClick={onClick} isDelete={data.dataSource && _.isEmpty(apiInfo)}>
      {data.dataSource ? (
        <div className="apiWrap">
          {_.isEmpty(apiInfo) ? (
            _l('模版已删除')
          ) : (
            <Fragment>
              <div
                className="iconWrap"
                style={{ backgroundColor: getRgbaByColor(apiInfo.iconColor || '#757575', '0.08') }}
              >
                <SvgIcon url={apiInfo.iconName} fill={apiInfo.iconColor} size={28} />
                <Tooltip placement="bottom" title={apiInfo.linkName}>
                  {apiInfo.iconUrl ? (
                    <img src={apiInfo.iconUrl} />
                  ) : (
                    <div className="defaultIcon">
                      <i className="icon-connect" />
                    </div>
                  )}
                </Tooltip>
              </div>
              <div className="iconDesc">
                <span className="flexCenter">
                  <span className="Bold ellipsis">{apiInfo.name}</span>{' '}
                  <i
                    className="icon-launch Gray_9e mLeft5 ThemeHoverColor3 Hand"
                    onClick={e => {
                      e.stopPropagation();
                      window.open(`/integrationApi/${data.dataSource}`);
                    }}
                  />
                </span>
                {apiInfo.explain && (
                  <Tooltip placement="bottom" title={apiInfo.explain}>
                    <span className="Font12 Gray_a ellipsis">{apiInfo.explain}</span>
                  </Tooltip>
                )}
              </div>
            </Fragment>
          )}
        </div>
      ) : (
        <span className="Gray_9e">{_l('请选择')}</span>
      )}
      <i className="icon-arrow-down-border Font14 Gray_9e mLeft8" />
    </SearchMode>
  );
}

export default function ApiSearchConfig(props) {
  const { data = {}, globalSheetInfo = {}, onChange, status: { saveIndex } = {}, fromCustomFilter } = props;
  const requestmap = getAdvanceSetting(data, 'requestmap') || [];
  const responsemap = getAdvanceSetting(data, 'responsemap') || [];
  const [loading, setLoading] = useState(false);
  const [apiInfo, setApiInfo] = useState({});
  const [requestControls, setRequestControls] = useState([]);
  const [responseControls, setResponseControls] = useState([]);
  const [originResponseControls, setOriginResponseControls] = useState([]);

  useEffect(() => {
    if (!data.dataSource) return;
    setLoading(true);

    worksheetAjax.getApiControlDetail({ apiTemplateId: data.dataSource }).then(res => {
      const { basicInfo = {}, requestControls = [], responseControls = [] } = res || {};
      if (_.isFunction(props.setControls)) {
        props.setControls(requestControls);
      }
      setApiInfo(basicInfo);
      dealResult(requestControls, responseControls, basicInfo);
      setOriginResponseControls(responseControls);
      setLoading(false);
    });
  }, [data.dataSource]);

  useEffect(() => {
    if (!data.dataSource) {
      setApiInfo({});
      setRequestControls([]);
      setResponseControls([]);
    }
  }, [data.controlId]);

  useEffect(() => {
    if (saveIndex > 0) {
      const { allControls = [], data = {} } = props;
      const curControl = _.find(allControls, i => i.controlId === data.controlId);
      curControl && onChange(curControl);
    }
  }, [saveIndex]);

  // 输入参数 | 输出参数
  const dealResult = (requestControls = [], responseControls = [], basicInfo) => {
    setRequestControls(dealRequestControls(requestControls, true));
    setResponseControls(dealRequestControls(responseControls));

    // 过滤无效配置
    const filterRequestMap = requestmap.filter(item => _.find(requestControls, i => i.controlId === item.id));
    const newResponseMap = responsemap.filter(item => _.find(responseControls, i => i.controlId === item.id));

    // 初始化输入参数配置
    const dealControls = dealRequestControls(requestControls);
    const newMaps = dealControls.map(item => {
      return {
        type: item.type,
        id: item.controlId,
        defsource:
          _.get(
            _.find(filterRequestMap, i => i.id === item.controlId),
            'defsource',
          ) || '',
        pid: item.dataSource,
      };
    });

    const params = {
      requestmap: _.isEmpty(newMaps) ? '' : JSON.stringify(newMaps),
      responsemap: _.isEmpty(newResponseMap) ? '' : JSON.stringify(newResponseMap),
    };

    if (!_.isEmpty(params)) {
      onChange(handleAdvancedSettingChange(data, params));
    }
  };

  // 选择已集成的api
  const integrationApi = () => {
    dialogSelectIntegrationApi({
      projectId: globalSheetInfo.projectId,
      appId: globalSheetInfo.appId,
      onOk: id => {
        if (id && id !== data.dataSource) {
          onChange({
            ...handleAdvancedSettingChange(data, {
              requestmap: '',
              responsemap: '',
              itemsource: '',
              itemtitle: '',
              itemdesc: '',
            }),
            dataSource: id,
          });
        }
      },
    });
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('调用已集成API')}</div>
        {loading ? (
          <LoadDiv className="mTop20 flexCenter" size="small" />
        ) : (
          <BasicInfo data={data} apiInfo={apiInfo} onClick={integrationApi} globalSheetInfo={globalSheetInfo} />
        )}
      </SettingItem>

      {/**输入参数 */}

      {requestControls.length > 0 && (
        <SettingItem className="withSplitLine">
          <div className="settingItemTitle">{_l('输入参数')}</div>
          <SearchParams requestControls={requestControls} {...props} />
        </SettingItem>
      )}

      {/** 返回数据映射 */}
      {fromCustomFilter ? (
        <SearchMappingFilter originResponseControls={originResponseControls} {...props} />
      ) : (
        <SearchMapping {...props} originResponseControls={originResponseControls} responseControls={responseControls} />
      )}
    </Fragment>
  );
}
