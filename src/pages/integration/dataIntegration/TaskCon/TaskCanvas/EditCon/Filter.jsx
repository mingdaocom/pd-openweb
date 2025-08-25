import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import { formatControls } from 'src/pages/integration/dataIntegration/TaskCon/TaskCanvas/util';
import { FilterDialog, FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { WrapL } from './style';

export default function Filter(props) {
  const { onUpdate } = props;
  const [{ filterVisible, data, relateControls, filterInfo, filters }, setState] = useSetState({
    filterVisible: false,
    data: {},
    relateControls: [],
    filterInfo: {},
    filters: [],
  });
  useEffect(() => {
    const { list = [], node = {}, currentProjectId: projectId } = props;
    const preNode = list.filter(o => o.pathIds.length > 0 && o.pathIds[0].toDt.nodeId === node.nodeId)[0];
    let relateControls = formatControls(_.get(preNode, ['nodeConfig', 'fields']) || [], preNode.nodeType).filter(
      o => o.isCheck,
    ); //过滤掉未勾选的字段
    setState({
      relateControls: relateControls,
      filterInfo: {
        relateControls: relateControls,
        allControls: [],
        globalSheetInfo: {
          projectId,
        },
        columns: [],
        viewControl: '',
      },
      filters: _.get(node, ['nodeConfig', 'config', 'items']) || [],
    });
  }, [props]);
  const setData = options => {
    onUpdate({
      ...props.node,
      nodeConfig: {
        ...(_.get(props.node, ['nodeConfig']) || {}),
        config: {
          ...(_.get(props.node, ['nodeConfig', 'config']) || {}),
          ...options,
        },
      },
    });
  };
  return (
    <WrapL>
      <div className="title Bold">{_l('筛选')}</div>
      <div className="des mTop15 Gray_9e">{_l('设置筛选条件后，只有满足条件的数据才能进入本节点。')}</div>
      {filters.length <= 0 && (
        <div
          className="addFilter Bold mTop16 Hand TxtCenter"
          onClick={() => {
            setState({
              filterVisible: true,
            });
          }}
        >
          <i className="icon icon-add_circle_outline  mRight5" />
          {_l('添加筛选条件')}
        </div>
      )}
      {filterVisible && (
        <FilterDialog
          allowEmpty
          data={data}
          fromCondition="subTotal" //只能设置指定时间，套用原有设置
          overlayClosable={false}
          relationControls={relateControls}
          title={'筛选'}
          filters={filters}
          allControls={filterInfo.allControls}
          globalSheetInfo={filterInfo.globalSheetInfo}
          onChange={({ filters }) => {
            let items = filters.map(o => {
              if (o.isGroup) {
                return {
                  ...o,
                  groupFilters: o.groupFilters.map(it => {
                    return {
                      ...it,
                      fieldName: (relateControls.find(a => a.id === it.controlId && a.alias === it.name) || {}).name,
                    };
                  }),
                };
              } else {
                return {
                  ...o,
                  fieldName: (relateControls.find(a => a.id === o.controlId && a.alias === o.name) || {}).name,
                };
              }
            });
            setData({
              items,
            });
            setState({ filterVisible: false });
          }}
          onClose={() => setState({ filterVisible: false })}
          hideSupport
          supportGroup
        />
      )}
      <div className="mTop16">
        <FilterItemTexts
          data={data}
          filters={filters}
          loading={false}
          globalSheetInfo={filterInfo.globalSheetInfo}
          controls={relateControls}
          allControls={filterInfo.allControls}
          editFn={() => setState({ filterVisible: true })}
        />
      </div>
    </WrapL>
  );
}
