import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Dialog } from 'ming-ui';
import FilterConfig from 'worksheet/common/WorkSheetFilter/common/FilterConfig';
import { FilterItemTexts } from 'src/pages/widgetConfig/widgetSetting/components/FilterData';
import { filterData } from 'src/pages/FormSet/components/columnRules/config';
import { isTimeControl } from 'statistics/common';
import worksheetApi from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import _ from 'lodash';
import moment from 'moment';

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldConditions: props.filterItem,
      newConditions: undefined,
      visible: false
    }
  }
  saveFilter = (conditions = []) => {
    const { oldConditions } = this.state;
    if (_.isEqual(oldConditions, conditions)) {
      return
    }
    this.setState({ oldConditions: conditions });
    conditions = conditions.map(item => {
      const isTime = isTimeControl(item.dataType);
      const isMoment = moment.isMoment(item.value);
      if (isTime && isMoment) {
        return {
          ...item,
          value: item.value.format('YYYY-MM-DD')
        }
      } else {
        return item;
      }
    });
    const { projectId, worksheetInfo } = this.props;
    worksheetApi
      .getWorksheetFilterById({
        filterId: '',
        projectId,
        worksheetId: worksheetInfo.worksheetId,
        items: formatValuesOfOriginConditions(conditions),
      })
      .then(result => {
        const { items } = result;
        this.props.onChangeFilterItem(items, formatValuesOfOriginConditions(conditions));
      });
  };
  render() {
    const { filter, projectId, axisControls, worksheetInfo, filterItem, filterResigned = true } = this.props;
    const { visible } = this.state;
    const filterItemTexts = filterData(worksheetInfo.columns, filterItem);
    return (
      <div className="mBottom20">
        <div className="Bold mBottom12 Font13">{_l('筛选')}</div>
        {filterItem.length ? (
          <FilterItemTexts
            className="WhiteBG"
            loading={false}
            filterItemTexts={filterItemTexts}
            onClear={() => {
              this.setState({
                newConditions: []
              });
              this.saveFilter([]);
            }}
            editFn={() => this.setState({ visible: true })}
          />
        ) : (
          <div className="filterWrapper flexRow alignItemsCenter Gray_bd Font13 Hover_21" onClick={() => this.setState({ visible: true })}>
            {_l('添加筛选字段')}
          </div>
        )}
        <Dialog
          visible={visible}
          title={_l('筛选')}
          okText={_l('确定')}
          cancelText={_l('取消')}
          onCancel={() => this.setState({ visible: false })}
          onOk={() => {
            this.setState({ visible: false });
            if (_.isUndefined(this.state.newConditions)) {
              return;
            }
            this.saveFilter(this.state.newConditions);
          }}
        >
          <FilterConfig
            canEdit
            feOnly
            showSystemControls
            supportGroup
            projectId={projectId}
            appId={worksheetInfo.appId}
            viewId={filter.viewId}
            columns={worksheetInfo.columns}
            sheetSwitchPermit={worksheetInfo.switches}
            conditions={filterItem}
            filterResigned={false}
            onConditionsChange={conditions => {
              this.setState({
                newConditions: conditions.filter(n => n.isGroup ? n.groupFilters.length : true)
              });
            }}
          />
        </Dialog>
      </div>
    );
  }
}
