import React, { Component, Fragment } from 'react';
import { Radio, Space, ConfigProvider, Modal, Button } from 'antd';
import { Icon } from 'ming-ui';
import SortColumns from 'src/pages/worksheet/components/SortColumns';
import { VIEW_DISPLAY_TYPE } from 'src/pages/worksheet/constants/enum';
import styled from 'styled-components';
import _ from 'lodash';

const ShowControlIdWrapper = styled.div`
  border-radius: 4px;
  padding: 5px 9px;
  border: 1px solid #DEDEDE;
  background-color: #EFEFEF;
`;

export default class OriginalData extends Component {
  constructor(props) {
    super(props);
    const { displaySetup } = props;
    this.state = {
      showControlVisible: false,
      showControlIds: displaySetup.showControlIds
    }
  }
  get columnsSorts() {
    const { displaySetup, viewId, worksheetInfo } = this.props;
    const { views, columns } = worksheetInfo;
    const view = _.find(views, { viewId }) || {};
    const { showControls = [] } = view;

    if (showControls.length) {
      return showControls.map(controlId => _.find(columns, { controlId })).filter(_ => _);
    } else {
      return columns.filter(item => {
        return ![10010, 22, 45, 47, 51].includes(item.type);
      }).sort((a, b) => {
        if (a.row === b.row) {
          return a.col - b.col;
        } else {
          return a.row - b.row;
        }
      });
    }
  }
  handleChangeViewDataType = (event) => {
    const { value } = event.target;
    this.props.onChangeStyle({
      viewDataType: value
    });
  }
  handleChange = (event) => {
    const { value } = event.target;
    if (value === 1) {
      this.props.onChangeDisplaySetup({
        showControlIds: []
      }, true);
    } else {
      this.setState({ showControlVisible: true });
    }
  }
  handleSaveShowControlIds = () => {
    this.props.onChangeDisplaySetup({
      showControlIds: this.state.showControlIds
    }, true);
    this.setState({
      showControlVisible: false,
    });
  }
  handleChangeColumn = ({ newShowControls, newControlSorts }) => {
    this.setState({
      showControlIds: newShowControls
    });
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
          <Button type="primary" onClick={this.handleSaveShowControlIds}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  renderShowControls() {
    const { showControlVisible, showControlIds } = this.state;
    const { displaySetup } = this.props;
    const { columnsSorts } = this;
    return (
      <Fragment>
        <div className="mBottom10 Font13">{_l('显示数据')}</div>
        <div className="mBottom16">
          <Radio.Group onChange={this.handleChange} value={displaySetup.showControlIds.length ? 2 : 1}>
            <Space direction="vertical">
              <Radio value={1} className="Font13">{_l('按照权限查看')}</Radio>
              <Radio value={2} className="Font13">{_l('所有数据')}</Radio>
            </Space>
          </Radio.Group>
          {!_.isEmpty(displaySetup.showControlIds) && (
            <ShowControlIdWrapper className="flexRow valignWrapper mTop10">
              <div className="flex">{_l('显示%0个字段', displaySetup.showControlIds.length)}</div>
              <Icon className="Gray_9e pointer" icon="edit" onClick={() => { this.setState({ showControlVisible: true }); }}/>
            </ShowControlIdWrapper>
          )}
        </div>
        <Modal
          title={_l('自定义显示字段')}
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
          <SortColumns
            layout={2}
            noShowCount={true}
            noempty={false}
            dragable={false}
            showControls={showControlIds}
            columns={columnsSorts}
            onChange={this.handleChangeColumn}
          />
        </Modal>
      </Fragment>
    );
  }
  render() {
    const { style, viewId, worksheetInfo } = this.props;
    const { views } = worksheetInfo;
    const view = _.find(views, { viewId });
    const disabled = view ? ![VIEW_DISPLAY_TYPE.sheet].includes(view.viewType.toString()) : true;
    const viewDataType = style.viewDataType || 1;
    return (
      <Fragment>
        <div className="flexColumn mBottom16">
          <Radio.Group onChange={this.handleChangeViewDataType} value={viewDataType}>
            <Space direction="vertical">
              <Radio value={1} className="Font13">{_l('在图表中分栏查看')}</Radio>
              <Radio value={2} className="Font13" disabled={disabled}>
                <span className="Gray">{_l('前往视图中查看')}</span>
              </Radio>
            </Space>
          </Radio.Group>
          <div className="Font12 mLeft25 mTop5 Gray_9e">{_l('需要在统计数据源中指定统计的视图（当前只支持表视图）')}</div>
        </div>
        {viewDataType === 1 && this.renderShowControls()}
      </Fragment>
    );
  }
}
