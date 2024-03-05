import React, { Component, Fragment } from 'react';
import { Drawer } from 'antd';
import { UPGRADE_DETAIL_TYPE_LIST } from '../../../../config';
import { getCheckedInfo } from '../../../../util';
import UpgradeItemWrap from '../UpgradeItemWrap';
import _ from 'lodash';
export default class UpgradeDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandTypeList: UPGRADE_DETAIL_TYPE_LIST.map(item => item.type),
      checkedInfo: getCheckedInfo({
        parseParams: {
          addFields: [],
          updateFields: [],
          addView: [],
          updateView: [],
        },
        defaultCheckedAll: true,
      }),
    };
  }

  componentDidMount() {
    const { worksheetDetailData, currentWorksheet } = this.props;
    if (!_.isEmpty(worksheetDetailData)) {
      this.setState({
        ...worksheetDetailData[currentWorksheet.id],
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.worksheetDetailData, nextProps.worksheetDetailData)) {
      const { worksheetDetailData, currentWorksheet } = nextProps;
      if (!_.isEmpty(worksheetDetailData)) {
        this.setState({
          ...worksheetDetailData[currentWorksheet.id],
        });
      }
    }
  }

  handleExpandCollapse = item => {
    const { expandTypeList } = this.state;
    this.setState({
      expandTypeList: !_.includes(expandTypeList, item.type)
        ? expandTypeList.concat(item.type)
        : expandTypeList.filter(v => item.type !== v),
    });
  };

  render() {
    const { visible, onClose = () => {} } = this.props;
    const { expandTypeList, checkedInfo, data = {} } = this.state;

    return (
      <Drawer
        title={_l('更新详情')}
        placement="right"
        onClose={onClose}
        visible={visible}
        closable={false}
        maskClosable={false}
        headerStyle={{}}
        width={520}
        extra={<i className="icon-close Font20 Hand Gray_9e" onClick={onClose} />}
      >
        {UPGRADE_DETAIL_TYPE_LIST.map(item => {
          const { type } = item;
          const itemList = data[type] || [];
          const isExpand = _.includes(expandTypeList, item.type);
          if (_.isEmpty(itemList)) return null;
          return (
            <UpgradeItemWrap
              isWorksheetDetail={true}
              titleClassName="Font14"
              item={item}
              itemList={itemList}
              isExpand={isExpand}
              checkedInfo={checkedInfo}
              handleExpandCollapse={this.handleExpandCollapse}
              checkAllCurrentType={this.props.checkAllCurrentType}
              checkItem={this.props.checkItem}
            />
          );
        })}
      </Drawer>
    );
  }
}
