import React, { Component } from 'react';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { UPGRADE_DETAIL_TYPE_LIST } from '../../../../config';
import UpgradeItemWrap from '../UpgradeItemWrap';

const TabWrap = styled.div`
  background: #f0f0f0;
  padding: 3px 2px;
  width: max-content;
  border-radius: 3px;
  margin-bottom: 10px;
  .tabItem {
    padding: 2px 15px;
    font-size: 15px;
    font-weight: bold;
    border-radius: 3px;
    color: #757575;
    &.active {
      color: #2196f3;
      background: #ffffff;
      border: 1px solid #f5f5f5;
    }
  }
`;

export default class UpgradeDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expandTypeList: UPGRADE_DETAIL_TYPE_LIST.map(item => item.type),
      tabType: 'fields',
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

  render() {
    const { visible, modelType, onClose = () => {} } = this.props;
    const { data = {}, tabType } = this.state;
    const { controls = [], views = [] } = data;

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
        <TabWrap className="flexRow">
          {[
            { tabType: 'fields', tabName: _l('字段') },
            { tabType: 'view', tabName: _l('视图') },
          ].map(item => (
            <div
              key={item.tabType}
              className={cx('tabItem Hand', { active: tabType === item.tabType })}
              onClick={() => this.setState({ tabType: item.tabType })}
            >
              {item.tabName}
            </div>
          ))}
        </TabWrap>

        {tabType === 'fields' && (
          <UpgradeItemWrap
            modelType={modelType}
            isWorksheetDetail={true}
            titleClassName="Font14"
            item={{}}
            itemList={controls}
            isExpand={true}
          />
        )}
        {tabType === 'view' && (
          <UpgradeItemWrap
            modelType={modelType}
            isWorksheetDetail={true}
            titleClassName="Font14"
            item={{}}
            itemList={views}
            isExpand={true}
          />
        )}
      </Drawer>
    );
  }
}
