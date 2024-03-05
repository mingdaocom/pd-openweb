import React, { Fragment, Component } from 'react';
import { Flex, WhiteSpace } from 'antd-mobile';
import alreadyDelete from './assets/alreadyDelete.png';
import withoutPermission from './assets/withoutPermission.png';

export default class WorksheetUnNormal extends Component {
  constructor(props) {
    super(props);
  }
  renderSheetEmptyState() {
    return (
      <Flex className="withoutRows" direction="column" justify="center" align="center">
        <img className="img" src={alreadyDelete} />
        <WhiteSpace size="md" />
        <div className="text">
          {_l('应用项无权限或者已删除')}
        </div>
      </Flex>
    );
  }
  renderViewEmptyState() {
    const { resultCode } = this.props;
    if (resultCode === 4) {
      return (
        <Flex className="withoutRows" direction="column" justify="center" align="center">
          <img className="img" src={alreadyDelete} />
          <WhiteSpace size="md" />
          <div className="text">
            {_l('视图已删除')}
          </div>
        </Flex>
      );
    }
    if (resultCode === 7) {
      return (
        <Flex className="withoutRows" direction="column" justify="center" align="center">
          <img className="img" src={withoutPermission} />
          <WhiteSpace size="md" />
          <div className="text">
            {_l('视图无权限')}
          </div>
        </Flex>
      );
    }
    return (
      <Flex className="withoutRows" direction="column" justify="center" align="center">
        <img className="img" src={alreadyDelete} />
        <WhiteSpace size="md" />
        <div className="text">
          {_l('视图未找到')}
        </div>
      </Flex>
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
