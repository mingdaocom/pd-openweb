import React, { useState } from 'react';
import JsonView from 'react-json-view';
import styled from 'styled-components';
import { Dialog, Icon } from 'ming-ui';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';

const Wrapper = styled.div`
  display: flex;
  gap: 15px;
  .sectionItem {
    flex: 1;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    height: 500px;
    padding: 16px;
    overflow: auto;
  }
`;

export default function FiltersGenerate(props) {
  const { controls = [], projectId, appId } = props;
  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState([]);

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
                canEdit
                feOnly
                supportGroup
                filterColumnClassName="filterColumn"
                projectId={projectId}
                appId={appId}
                columns={controls}
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
            <div className="sectionItem">
              <JsonView src={filters} displayDataTypes={false} displayObjectSize={false} name={null} />
            </div>
          </Wrapper>
        </Dialog>
      )}
    </React.Fragment>
  );
}
