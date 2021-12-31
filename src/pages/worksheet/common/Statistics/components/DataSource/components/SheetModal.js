import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import { ConfigProvider, Select, Modal, Button } from 'antd';
import { Icon } from 'ming-ui';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet';

export default class SheetModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewId: props.filter.viewId,
      newWorksheetId: null,
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      viewId: nextProps.filter.viewId,
    });
  }
  handleSave = () => {
    const { viewId, newWorksheetId } = this.state;
    this.props.onChangeFilter(newWorksheetId, viewId);
    this.props.onChangeDialogVisible(false);
  };
  renderContent() {
    const { worksheetInfo, filter, appId, projectId, sourceType } = this.props;
    const { viewId } = this.state;
    return (
      <div>
        {sourceType && (
          <Fragment>
            <div className="mBottom10">{_l('工作表')}</div>
            <SelectWorksheet
              worksheetType={0}
              from="customPage"
              projectId={projectId}
              appId={appId}
              value={worksheetInfo.worksheetId}
              currentWorksheetId={worksheetInfo.worksheetId}
              onChange={(appId, worksheetId) => {
                if (worksheetId !== worksheetInfo.worksheetId) {
                  this.setState({ newWorksheetId: worksheetId });
                }
              }}
            />
          </Fragment>
        )}
        <div className={cx('mBottom10', { mTop25: sourceType })}>{_l('视图')}</div>
        <Select
          className="chartSelect w100"
          value={viewId || null}
          suffixIcon={<Icon icon="expand_more" className="Gray_9e Font20" />}
          onChange={viewId => {
            this.setState({ viewId });
          }}
        >
          <Select.Option className="selectOptionWrapper" value={null}>
            {_l('无（所有记录）')}
          </Select.Option>
          {worksheetInfo.views.map(item => (
            <Select.Option className="selectOptionWrapper" key={item.viewId} value={item.viewId}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </div>
    );
  }
  renderFooter() {
    return (
      <div className="mTop15 mBottom20 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button
            type="link"
            onClick={() => {
              this.props.onChangeDialogVisible(false);
            }}
          >
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSave}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  render() {
    const { dialogVisible } = this.props;
    return (
      <Modal
        title={_l('工作表')}
        width={560}
        className="chartModal chartSheetModal"
        visible={dialogVisible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderFooter()}
        onCancel={() => {
          this.props.onChangeDialogVisible(false);
        }}
      >
        {this.renderContent()}
      </Modal>
    );
  }
}
