import React, { Fragment, Component } from 'react';
import alreadyDelete from './assets/alreadyDelete.png';
import withoutPermission from './assets/withoutPermission.png';

export default class WorksheetUnNormal extends Component {
  constructor(props) {
    super(props);
  }
  renderSheetEmptyState() {
    return (
      <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
        <img className="img" src={alreadyDelete} />
        <div className="text mTop10">
          {_l('应用项无权限或者已删除')}
        </div>
      </div>
    );
  }
  renderViewEmptyState() {
    const { resultCode } = this.props;
    if (resultCode === 4) {
      return (
        <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
          <img className="img" src={alreadyDelete} />
          <div className="text mTop10">
            {_l('视图已删除')}
          </div>
        </div>
      );
    }
    if (resultCode === 7) {
      return (
        <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
          <img className="img" src={withoutPermission} />
          <div className="text mTop10">
            {_l('视图无权限')}
          </div>
        </div>
      );
    }
    return (
      <div className="withoutRows flexColumn alignItemsCenter justifyContentCenter">
        <img className="img" src={alreadyDelete} />
        <div className="text mTop10">
          {_l('视图未找到')}
        </div>
      </div>
    );
  }
  render() {
    const { type } = this.props;
    return (
      <Fragment>
        {type === 'sheet' && this.renderSheetEmptyState()}
        {type === 'view' && this.renderViewEmptyState()}
      </Fragment>
    );
  }
}
