import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { useDrop } from 'react-dnd-latest';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import {
  formatValuesOfOriginConditions,
  redefineComplexControl,
  getDefaultCondition,
} from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { isTimeControl } from 'statistics/common';
import worksheetAjax from 'src/api/worksheet';

const Remind = props => {
  const [collectProps, drop] = useDrop({
    accept: 'ChartDnd',
    drop(item) {
      props.onAddControl(item.data);
      return undefined;
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const opacity = collectProps.isOver ? 0.8 : 1;
  return (
    <div ref={drop} style={{ opacity }} role="Dustbin" className="Gray_bd centerAlign Font13 pTop10 pBottom10">
      {_l('从左侧拖拽添加字段')}
    </div>
  );
};

export default class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      oldConditions: props.filterItem
    };
  }
  componentDidMount() {}
  handleAddControl = data => {
    if (data.type === 10000000) {
      alert(_l('记录数量不能作为筛选条件'), 2);
      return;
    }
    const { columns } = this.props.worksheetInfo;
    const item = _.find(columns, { controlId: data.controlId });
    this.singleFilter.addCondition(_.find(columns, { controlId: data.controlId }));
  };
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
    worksheetAjax
      .getWorksheetFilterById({
        filterId: '',
        projectId,
        worksheetId: worksheetInfo.worksheetId,
        items: conditions,
      })
      .then(result => {
        const { items } = result;
        this.props.onChangeFilterItem(items, conditions);
      });
  };
  render() {
    const { currentReport, projectId, axisControls, worksheetInfo, filterItem, filterResigned = true } = this.props;
    return (
      <div className="mBottom20">
        <div className="Bold mBottom12 Font13">{_l('筛选')}</div>
        <div className="SingleFilterWrapper">
          <SingleFilter
            ref={singleFilter => {
              this.singleFilter = singleFilter;
            }}
            filterColumnClassName="sheetStatisticsFilterColumnOption"
            canEdit={true}
            appId={worksheetInfo.appId}
            filterResigned={filterResigned}
            projectId={projectId}
            columns={worksheetInfo.columns}
            conditions={filterItem}
            onConditionsChange={this.saveFilter}
          />
          <Remind onAddControl={this.handleAddControl} />
        </div>
      </div>
    );
  }
}
