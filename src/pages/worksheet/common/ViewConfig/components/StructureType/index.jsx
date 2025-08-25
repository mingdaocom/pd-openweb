import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import styled from 'styled-components';
import { HIERARCHY_VIEW_TYPE } from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import './index.less';

const HierarchyViewConfigWrap = styled.div`
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: stretch;
  & > div {
    flex-shrink: 0;
    min-width: 0;
    width: 120px;
    min-width: 120px;
    max-width: 120px;
    margin-bottom: 20px;
  }
`;
function StructureType(props) {
  const { base, saveView, isRelateMultiSheetHierarchyView, clearFilters = () => {} } = props;
  const { viewId } = base;
  const [view, setView] = useState();
  useEffect(() => {
    const view = props.views.find(o => viewId === o.viewId) || {};
    setView(view);
  }, [props]);

  return (
    <React.Fragment>
      <div className="title Font13 bold mBottom18">{_l('显示方式')}</div>
      <div className="settingContent">
        <HierarchyViewConfigWrap className="flexRow alignItemsCenter">
          {HIERARCHY_VIEW_TYPE.filter(o => !isRelateMultiSheetHierarchyView || o.value !== '3').map((item, i) => {
            return (
              <div className="Relative flex" key={'StructureTypeItem' + i}>
                <div
                  className={`hierachyViewCard mBottom8 Font48 Hand ${item.key} ${
                    (_.get(view, 'advancedSetting.hierarchyViewType') || '0') === item.value ? 'active' : ''
                  }`}
                  onClick={() => {
                    if ((_.get(view, 'advancedSetting.hierarchyViewType') || '0') === item.value) {
                      return;
                    }
                    clearFilters();
                    saveView(viewId, {
                      advancedSetting: {
                        hierarchyViewType: item.value,
                        ...(item.value === '3' ? { topshow: '', topfilters: '' } : {}),
                      },
                      editAttrs: ['advancedSetting'],
                      editAdKeys:
                        item.value === '3' ? ['hierarchyViewType', 'topshow', 'topfilters'] : ['hierarchyViewType'],
                    });
                  }}
                ></div>
                <div className="TxtCenter">{item.text}</div>
              </div>
            );
          })}
        </HierarchyViewConfigWrap>
      </div>
    </React.Fragment>
  );
}
export default connect(
  state => _.pick(state.sheet, ['base', 'views']),
  dispatch => bindActionCreators({ ...baseAction }, dispatch),
)(StructureType);
