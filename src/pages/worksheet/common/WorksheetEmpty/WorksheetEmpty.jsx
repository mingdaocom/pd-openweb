import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import { addWorkSheet } from 'src/pages/worksheet/redux/actions/sheetList.js';
import CreateNew from 'src/pages/worksheet/common/WorkSheetLeft/CreateNew';
import Input from 'ming-ui/components/Input';
import Button from 'ming-ui/components/Button';
import store from 'redux/configureStore';
import cx from 'classnames';
import alreadyDelete from 'src/pages/worksheet/assets/alreadyDelete.png';
import './WorksheetEmpty.less';

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
  handleCreateSheet() {
    const { appId, groupId } = this.props;
    const { flag } = this.state;
    const { iconColor, projectId } = store.getState().appPkg;
    const name = this.text.value.trim();

    if (name && flag) {
      this.setState({
        flag: false,
      });
      this.props.addWorkSheet(
        {
          appId,
          appSectionId: groupId,
          name: name.slice(0, 25),
          icon: '1_0_home',
          iconColor,
          projectId,
        },
        () => {
          this.setState({
            flag: true,
          });
        },
      );
    } else if (!name) {
      alert(_l('请填写工作表名称'));
    }
  }

  handleCreate = (type, name) => {
    const { onCreateItem } = this.props;

    if (!name) {
      alert(_l('请填写名称'));
      return;
    }
    onCreateItem({ type, name: name.slice(0, 25), icon: 'hr_workbench' });
    this.setState({ createType: '' });
  };

  renderCreate() {
    const { sheetCount } = this.props;
    const { createType } = this.state;
    const { appGroups = [] } = store.getState().appPkg;
    const isAdd = !(appGroups.length > 1 && !sheetCount);
    return (
      <div className="contentBox">
        <i className={cx('iconBox', { add: isAdd })} />
        <span className="Block TxtCenter Font20 Black">
          {isAdd ? _l('创建工作表，开始构建你的应用') : _l('当前分组没有应用项，创建或从其他分组移动应用项')}
        </span>
        {isAdd ? (
          <Fragment>
            <div className="mRight60">
              <span className="mRight24 Font15">{_l('工作表名称')}</span>
              <Input
                placeholder={_l('例如：订单、客户')}
                className="createSheetInput Font15"
                defaultValue=""
                manualRef={text => {
                  this.text = text;
                }}
                onKeyDown={event => {
                  if (event.which === 13) {
                    this.handleCreateSheet();
                  }
                }}
              />
            </div>
            <Button className="createSheetBtn" type="primary" onClick={this.handleCreateSheet.bind(this)}>
              {_l('创建工作表')}
            </Button>
          </Fragment>
        ) : (
          <div className="flexRow">
            <Button
              className="createItemBtn mRight16"
              type="link"
              onClick={() => {
                this.setState({ createType: 'worksheet' });
              }}
            >
              {_l('创建工作表')}
            </Button>
            <Button
              className="createItemBtn"
              type="link"
              onClick={() => {
                this.setState({ createType: 'customPage' });
              }}
            >
              {_l('创建自定义页面')}
            </Button>
          </div>
        )}
        {createType ? (
          <CreateNew
            type={createType}
            onCreate={this.handleCreate}
            onCancel={() => this.setState({ createType: '' })}
          />
        ) : null}
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
        <img className="Width110" src={alreadyDelete} />
        <span className="Block TxtCenter Gray_75 Font17 mTop30">{_l('应用项无权限或者已删除')}</span>
      </div>
    );
  }
  render() {
    const { isValidAppSectionId, isCharge } = this.props;
    return (
      <div className="worksheetEmpty noneData">
        {isCharge ? (isValidAppSectionId ? this.renderCreate() : this.renderAppSection()) : this.renderUnauthorized()}
      </div>
    );
  }
}

export default connect(
  state => ({
    isValidAppSectionId: state.sheetList.isValidAppSectionId,
  }),
  dispatch => ({
    addWorkSheet: bindActionCreators(addWorkSheet, dispatch),
  }),
)(WorksheetEmpty);
