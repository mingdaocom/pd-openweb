import React, { useEffect, useState } from 'react';
import JsonView from 'react-json-view';
import { Select } from 'antd';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import FilterConfig from 'worksheet/common/WorkSheetFilter/common/FilterConfig';
import { formatFilters } from '../../core/utils';

const Wrapper = styled.div`
  display: flex;
  gap: 15px;
  .sectionItem {
    flex: 1 1 0;
    min-width: 0;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    height: 500px;
    padding: 16px;
    overflow: auto;
  }
  .viewWrapper {
    flex: 1 1 0;
    min-width: 0;
    border: 1px solid #e0e0e0;
    .selectWrapper {
      padding: 6px 16px;
      margin-bottom: 10px;
      border-bottom: 1px solid #f3f3f3;
      border-radius: 4px;
    }
    .jsonViewWrapper {
      padding: 12px 16px 16px;
    }
    .string-value {
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
`;

export default function FiltersGenerate(props) {
  const { controls = [], projectId, appId, sheetSwitchPermit = [] } = props;
  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState([]);
  const [apiVersion, setApiVersion] = useState('apiV2');
  const [apiV3Filters, setApiV3Filters] = useState({});

  const formatConditionsValue = conditions => {
    const formatValue = conditions.map(item => {
      if (item.isGroup) {
        return {
          ...item,
          groupFilters: item.groupFilters.map(groupItem =>
            Object.fromEntries(Object.entries(groupItem).filter(([, v]) => v !== undefined)),
          ),
        };
      } else {
        return Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined));
      }
    });
    return formatValue;
  };

  useEffect(() => {
    if (apiVersion === 'apiV3') {
      setApiV3Filters(formatFilters(filters));
    }
  }, [filters, apiVersion]);

  return (
    <React.Fragment>
      <div className="filterBtn Hand Gray_75" onClick={() => setVisible(true)}>
        <Icon icon="worksheet_filter" className="mRight8 Font18" />
        <span className="Font14">{_l('筛选条件生成器')}</span>
      </div>

      {visible && (
        <Dialog
          visible={true}
          width={800}
          showFooter={false}
          title={<span className="Font20">{_l('筛选条件生成器')}</span>}
          description={_l('生成 API 可以直接用的筛选条件，可直接传入 filters 字段中')}
          onCancel={() => {
            setVisible(false);
            setFilters([]);
          }}
        >
          <Wrapper>
            <div className="sectionItem pTop0">
              <FilterConfig
                from={apiVersion}
                canEdit
                feOnly
                supportGroup
                showSystemControls
                filterColumnClassName="filterColumn"
                projectId={projectId}
                appId={appId}
                columns={controls}
                sheetSwitchPermit={sheetSwitchPermit}
                conditions={filters}
                filterResigned={false}
                onConditionsChange={(conditions = []) => {
                  const newFilters =
                    conditions.length === 1 && conditions[0].isGroup && !conditions[0].groupFilters.length
                      ? []
                      : formatConditionsValue(conditions);

                  setFilters(newFilters);
                }}
              />
            </div>
            <div className="viewWrapper">
              <div className="selectWrapper">
                <Select
                  value={apiVersion}
                  onChange={value => setApiVersion(value)}
                  style={{ width: 80, backgroundColor: '#F5F5F5' }}
                  bordered={false}
                  size="small"
                >
                  {[
                    { value: 'apiV2', label: 'API2.0' },
                    { value: 'apiV3', label: 'API3.0' },
                  ].map(item => (
                    <Select.Option className={apiVersion === item.value ? 'selectOptionActive' : ''} value={item.value}>
                      <span className="label">{item.label}</span>
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div className="jsonViewWrapper">
                <JsonView
                  src={apiVersion === 'apiV3' ? apiV3Filters : filters}
                  displayDataTypes={false}
                  displayObjectSize={false}
                  name={null}
                />
              </div>
            </div>
          </Wrapper>
        </Dialog>
      )}
    </React.Fragment>
  );
}
