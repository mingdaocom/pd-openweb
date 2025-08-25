import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import store from 'redux/configureStore';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Button, Icon } from 'ming-ui';
import abnormal from 'src/pages/worksheet/assets/abnormal.png';
import CreateNew from 'src/pages/worksheet/common/WorkSheetLeft/CreateNew';
import DialogImportExcelCreate from 'src/pages/worksheet/components/DialogImportExcelCreate';
import { addWorkSheet, createAppItem, getSheetList } from 'src/pages/worksheet/redux/actions/sheetList.js';
import './WorksheetEmpty.less';

const createWorksheetList = [
  { type: 'blank', icon: 'plus', createType: 'worksheet', name: _l('从空白创建') },
  { type: 'importExcel', icon: 'new_excel', createType: 'importExcel', name: _l('从Excel创建') },
];

class WorksheetEmpty extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      createType: '',
      flag: true,
    };
  }
  handleCreate = (type, args) => {
    const { appId, groupId, createAppItem } = this.props;
    createAppItem({
      appId,
      groupId,
      type,
      icon: type === 0 ? '1_worksheet' : '1_0_home',
      ...args,
    });
    this.setState({ createType: '' });
  };

  renderCreate() {
    const { sheetList, appId, groupId, isCharge } = this.props;
    const { createType, visible, dialogImportExcel } = this.state;
    const { appGroups = [], projectId } = store.getState().appPkg;
    const sheetCount = sheetList.length;
    const isAdd = !(appGroups.length > 1 && !sheetCount);

    if (!isCharge) {
      return (
        <div className="contentBox">
          <i className="iconBox" />
          <span className="Block TxtCenter Font20 Black">{_l('当前分组没有应用项')}</span>
        </div>
      );
    }

    return (
      <div className="contentBox">
        <i className={cx('iconBox', { add: isAdd })} />
        <span className="Block TxtCenter Font20 Black">
          {isAdd ? _l('创建工作表，开始构建你的应用') : _l('当前分组没有应用项，创建或从其他分组移动应用项')}
        </span>
        {isAdd ? (
          <div className="flexRow createOperate">
            <Button
              type="primary"
              className="mRight20 fw500"
              onClick={() => {
                this.setState({ createType: 'worksheet' });
              }}
            >
              {_l('从空白创建')}
            </Button>
            <Button
              className="excelCreateBtn bold"
              onClick={() => {
                this.setState({ dialogImportExcel: true });
              }}
            >
              {_l('从Excel创建')}
            </Button>
          </div>
        ) : (
          <div className="flexRow createOperate">
            <div className="createBtn createWorksheet Hand Relative flexRow">
              <span
                className="flex w117  hover14"
                onClick={() => {
                  this.setState({ visible: false, createType: 'worksheet' });
                }}
              >
                {_l('创建工作表')}
              </span>
              <div className="line"></div>
              <Trigger
                popupVisible={visible}
                onPopupVisibleChange={visible => this.setState({ visible })}
                popupPlacement="bottom"
                popupAlign={{ points: ['tl', 'bl'], offset: [-116, 0] }}
                action={['click']}
                popup={
                  <div className="createlist">
                    {createWorksheetList.map(item => (
                      <div
                        className="createWorksheetItem Hand"
                        onClick={() => {
                          if (item.createType === 'importExcel') {
                            this.setState({ visible: false, dialogImportExcel: true });
                          } else {
                            this.setState({ visible: false, createType: 'worksheet' });
                          }
                        }}
                      >
                        <Icon icon={item.icon} className="mRight8" /> {item.name}
                      </div>
                    ))}
                  </div>
                }
              >
                <span style={{ width: 42 }} className="hover14">
                  <Icon
                    icon="arrow-down"
                    className="createMoreIcon"
                    onClick={e => {
                      e.stopPropagation();
                      this.setState({ visible: true });
                    }}
                  />
                </span>
              </Trigger>
            </div>
            <div
              className="createBtn createCustom Hand"
              onClick={() => {
                this.setState({ createType: 'customPage' });
              }}
            >
              {_l('创建自定义页面')}
            </div>
          </div>
        )}
        {createType ? (
          <CreateNew
            type={createType}
            onCreate={this.handleCreate}
            onCancel={() => this.setState({ createType: '' })}
          />
        ) : null}
        {dialogImportExcel && (
          <DialogImportExcelCreate
            appId={appId}
            projectId={projectId}
            refreshPage={() =>
              this.props.getSheetList({
                appId,
                appSectionId: groupId,
              })
            }
            groupId={groupId}
            onCancel={() => this.setState({ dialogImportExcel: false })}
            createType="worksheet"
          />
        )}
      </div>
    );
  }
  renderAppSection() {
    return (
      <div className="contentBox">
        <i className="iconFailureAppSection" />
        <span className="Block TxtCenter Gray_75 Font17 mTop30">{_l('找不到分组')}</span>
      </div>
    );
  }
  renderUnauthorized() {
    return (
      <div className="contentBox">
        <img className="Width110" src={abnormal} />
        <span className="Block TxtCenter Gray_75 Font17 mTop30">{_l('地址无法访问')}</span>
        <span className="Block TxtCenter Gray_75 Font17">{_l('被取消了查看权限或已删除')}</span>
      </div>
    );
  }
  render() {
    const { isValidAppSectionId } = this.props;
    return (
      <div className="worksheetEmpty noneData">
        {isValidAppSectionId ? this.renderCreate() : this.renderAppSection()}
      </div>
    );
  }
}

export default connect(
  state => ({
    isValidAppSectionId: state.sheetList.isValidAppSectionId,
    worksheetId: state.sheet.base.worksheetId,
    sheetList: state.sheetList.data,
    isCharge: state.sheet.isCharge,
  }),
  dispatch => ({
    addWorkSheet: bindActionCreators(addWorkSheet, dispatch),
    getSheetList: bindActionCreators(getSheetList, dispatch),
    createAppItem: bindActionCreators(createAppItem, dispatch),
  }),
)(WorksheetEmpty);
