import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import WithoutFidldItem from './WithoutFidldItem';
import { isNumberControl } from 'src/pages/worksheet/common/Statistics/common';

export default class YAxis extends Component {
  constructor(props) {
    super(props);
  }
  handleVerification = (data, isAlert = false) => {
    if (isNumberControl(data.type)) {
      isAlert && alert('数值和公式字段不能分组', 2);
      return false;
    } else {
      return true;
    }
  };
  handleAddControl = data => {
    if (this.handleVerification(data, true)) {
      this.props.onChangeCurrentReport({
        splitId: data.controlId,
      });
    }
  };
  handleClear = () => {
    this.props.onChangeCurrentReport({
      splitId: '',
    });
  };
  renderAxis(item) {
    const { axisControls, splitId } = this.props;
    const axis = _.find(axisControls, { controlId: splitId });
    return (
      <div className="flexRow valignWrapper fidldItem">
        <span className="Gray flex ellipsis">{axis ? axis.controlName : _l('该控件不存在')}</span>
        <Icon className="Gray_9e Font18 pointer mLeft10" icon="close" onClick={this.handleClear} />
      </div>
    );
  }
  render() {
    const { name, splitId, yaxisList } = this.props;
    return yaxisList.length === 1 ? (
      <div className="fieldWrapper mBottom20">
        <div className="Bold mBottom12">{name}</div>
        {splitId ? (
          this.renderAxis()
        ) : (
          <WithoutFidldItem onVerification={this.handleVerification} onAddControl={this.handleAddControl} />
        )}
      </div>
    ) : null;
  }
}
