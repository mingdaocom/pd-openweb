import React, { useState, useEffect, useRef } from 'react';
import { WrapL } from './style';
import { useSetState } from 'react-use';
import { FilterItemTexts, FilterDialog } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { formatControls } from 'src/pages/integration/containers/TaskCon/TaskCanvas/util';

export default function Filter(props) {
  const { onUpdate, list, nodeList } = props;
  const [{ filterVisible, data, relateControls, filterInfo, filters }, setState] = useSetState({
    filterVisible: false,
    data: {},
    relateControls: [],
    filterInfo: {},
    filters: [],
  });
  useEffect(() => {
    const { list = [], node = {}, currentProjectId: projectId } = props;
    const preNode = list.find(o => o.y === node.y && o.y === node.x - 1);
    let relateControls = formatControls(
      _.get(preNode, ['nodeConfig', 'fields']) || [
        {
          id: '156',
          dependFieldIds: ['o30kpy'],
          name: 'sharmaine.cormier',
          dataType: 'ufo7fo',
          jdbcTypeId: 709,
          precision: 710,
          scale: 693,
          isPk: true,
          isNotNull: true,
          alias: 'jb1imz',
          isCheck: true,
          orderNo: 172,
          status: 'NORMAL',
          defaultValue: 'pfyr6q',
          comment: 'xs6oha',
        },
      ],
    );
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
      <div className="des mTop14 Gray_9e">
        {_l(
          '设置筛选条件后，只有满足条件的数据才能进入本节点。允许添加多个筛选过滤节点分支将数据写入不同的数据目的地。',
        )}
      </div>
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
          overlayClosable={false}
          relationControls={relateControls}
          title={'筛选'}
          filters={filters}
          allControls={filterInfo.allControls}
          globalSheetInfo={filterInfo.globalSheetInfo}
          onChange={({ filters }) => {
            // onChange({ navfilters: JSON.stringify(filters.map(handleCondition)) });
            setData({ items: filters });
            setState({ filterVisible: false });
          }}
          onClose={() => setState({ filterVisible: false })}
        />
      )}
      <FilterItemTexts
        data={data}
        filters={filters}
        loading={false}
        globalSheetInfo={filterInfo.globalSheetInfo}
        controls={relateControls}
        allControls={filterInfo.allControls}
        editFn={() => setState({ filterVisible: true })}
      />
    </WrapL>
  );
}
