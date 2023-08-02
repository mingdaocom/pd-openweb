import React, { Component, Fragment } from 'react';
import { Checkbox, Radio, Space, Modal, ConfigProvider, Button } from 'antd';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import SortColumns from 'src/pages/worksheet/components/SortColumns';
import { isOptionControl } from 'statistics/common';
import _ from 'lodash';

const ShowControlIdWrapper = styled.div`
  border-radius: 4px;
  padding: 5px 9px;
  border: 1px solid #DEDEDE;
  background-color: #EFEFEF;
`;

export default class Accumulate extends Component {
  constructor(props) {
    super(props);
    const { displaySetup } = this.props.currentReport;
    this.state = {
      showControlVisible: false,
      showOptionIds: displaySetup.showOptionIds
    }
  }
  handleChangeDisplaySetup = (data, isRequest = false) => {
    const { displaySetup } = this.props.currentReport;
    this.props.changeCurrentReport({
      displaySetup: {
        ...displaySetup,
        ...data,
      }
    }, isRequest);
  }
  handleChange = (event) => {
    const { value } = event.target;
    if (value === 1) {
      this.handleChangeDisplaySetup({
        showOptionIds: []
      }, true);
    } else {
      this.setState({ showControlVisible: true });
    }
  }
  handleChangeColumn = ({ newShowControls, newControlSorts }) => {
    this.setState({
      showOptionIds: newShowControls
    });
  }
  handleSaveShowOptionIds = () => {
    const { showOptionIds } = this.state;
    if (_.isEmpty(showOptionIds)) {
      alert(_l('请选择显示项'), 2);
      return;
    }
    this.handleChangeDisplaySetup({
      showOptionIds
    }, true);
    this.setState({ showControlVisible: false });
  }
  renderFooter() {
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.setState({
                showControlVisible: false,
              });
            }}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSaveShowOptionIds}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { allControls, reportData, currentReport } = this.props;
    const { showControlVisible, showOptionIds } = this.state;
    const { xaxes, displaySetup } = currentReport;
    const control = _.find(allControls, { controlId: xaxes.controlId }) || {};
    const { options = [] } = control;
    const optionList = options.filter(item => !item.isDeleted).map(item => {
      return {
        controlId: item.key,
        controlName: item.value,
        type: xaxes.controlType
      }
    });
    return (
      <div className="mBottom20">
        <div className="mBottom8 Font13">{_l('累计')}</div>
        <div className="flexRow valignWrapper">
          <Checkbox
            className="flexRow"
            checked={displaySetup.isAccumulate}
            onChange={() => {
              this.handleChangeDisplaySetup({
                isAccumulate: !displaySetup.isAccumulate
              });
            }}
          >
            {_l('每层累计之后所有的值')}
          </Checkbox>
        </div>
        {displaySetup.isAccumulate && isOptionControl(xaxes.controlType) && (
          <div className="mBottom16 mLeft20">
            <Radio.Group onChange={this.handleChange} value={displaySetup.showOptionIds.length ? 2 : 1}>
              <Space direction="vertical" className="mTop10">
                <Radio value={1} className="Font13">{_l('全部')}</Radio>
                <Radio value={2} className="Font13">
                  <div className="flexRow valignWrapper">
                    <div>{_l('自定义显示项')}</div>
                  </div>
                </Radio>
              </Space>
            </Radio.Group>
            {!_.isEmpty(displaySetup.showOptionIds) && (
              <ShowControlIdWrapper className="flexRow valignWrapper mTop10">
                <div className="flex">{_l('显示%0项字段', displaySetup.showOptionIds.length)}</div>
                <Icon className="Gray_9e pointer" icon="edit" onClick={() => { this.setState({ showControlVisible: true }); }}/>
              </ShowControlIdWrapper>
            )}
          </div>
        )}
        <Modal
          title={_l('自定义显示项')}
          width={580}
          className="chartModal"
          visible={showControlVisible}
          centered={true}
          destroyOnClose={true}
          closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
          footer={this.renderFooter()}
          onCancel={() => {
            this.setState({
              showControlVisible: false,
            });
          }}
        >
          <div className="Font15 Gray_75">{_l('设置漏斗图中显示的项，未显示项仅在图形中隐藏，仍会向上累计')}</div>
          <SortColumns
            layout={2}
            noShowCount={true}
            noempty={false}
            dragable={false}
            showControls={showOptionIds}
            columns={optionList}
            placeholder={_l('搜索选项')}
            onChange={this.handleChangeColumn}
          />
        </Modal>
      </div>
    );
  }
}