import React from 'react';
import { WingBlank, Button } from 'antd-mobile';
import styled from 'styled-components';
import update from 'immutability-helper';
import CustomFields from 'src/components/newCustomFields';
import { getSubListError } from 'worksheet/util';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import useWorksheetRowProvider from 'src/pages/worksheet/common/recordInfo/WorksheetRecordProvider';

const Con = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  height: 100%;
  .customFieldsWrapper {
    height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .customFieldsContainer {
    padding: 0 20px;
  }
  .btnsWrapper {
    padding: 7px 10px;
    border-top: 1px solid #f5f5f5;
    background-color: #fff;
    a {
      text-decoration: none;
    }
    .edit {
      color: #2196f3;
    }
    .am-button {
      height: 36px;
      line-height: 36px;
    }
    .am-button-primary:hover {
      color: #fff;
    }
    .am-button,
    .am-button::before,
    .am-button-active::before {
      border-radius: 50px;
    }
  }
`;

@useWorksheetRowProvider
class FillRecordControls extends React.Component {
  constructor(props) {
    super(props);
    const controls = update(props.formData, {
      $apply: formData =>
        formData
          .map(c => {
            const writeControl = _.find(props.writeControls, wc => c.controlId === wc.controlId);
            if (_.isUndefined(c.dataSource)) {
              return undefined;
            }
            if (!writeControl) {
              return {
                ...c,
                controlPermissions: '000',
              };
            }
            if (c.type === 29 && c.enumDefault === 2 && c.advancedSetting.showtype === '2') {
              return {
                ...c,
                value: '',
                controlPermissions: '000',
              };
            }

            // 备注控件只能是只读的  所以不需要转换
            if (c.type !== 10010) {
              c.controlPermissions =
                c.controlPermissions[0] + (writeControl.type === 1 ? '0' : '1') + c.controlPermissions[2];
              c.fieldPermission = '111';
              c.required = writeControl.type === 3;
            }

            return c;
          })
          .filter(c => !!c),
    });
    this.state = {
      updatedControlIds: [],
      formData: controls,
      showError: false,
    };
  }
  cellObjs = {};
  customwidget = React.createRef();
  formcon = React.createRef();
  handleSave = () => {
    const { onSubmit, writeControls } = this.props;
    const { formData, updatedControlIds, showError } = this.state;
    let { data, hasRuleError, hasError } = this.customwidget.current.getSubmitData();
    data = data.filter(item => _.find(writeControls, writeControl => writeControl.controlId === item.controlId));
    const subListControls = formData.filter(item => item.type === 34);
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value:
            control.value &&
            control.value.rows &&
            control.value.rows.length &&
            getSubListError(control.value, control.relationControls, control.showControls, 3),
        }))
        .filter(c => !_.isEmpty(c.value));
      if (errors.length) {
        hasError = true;
        errors.forEach(error => {
          const errorSublist = (this.cellObjs || {})[error.id];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: !_.isEmpty(error.value),
              cellErrors: error.value,
            });
          }
        });
      } else {
        subListControls.forEach(control => {
          const errorSublist = (this.cellObjs || {})[control.controlId];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: false,
              cellErrors: {},
            });
          }
        });
      }
      if (this.formcon.current.querySelector('.cellControlErrorTip')) {
        hasError = true;
      }
    }

    if (hasError && !showError) {
      this.setState({
        showError: true,
      });
    } else {
      if (hasError) {
        alert(_l('请正确填写记录'), 3);
        return;
      } else if (hasRuleError) {
        return;
      }
      onSubmit(
        formData
          .filter(c => _.find(updatedControlIds, controlId => controlId === c.controlId))
          .map(formatControlToServer),
        {
          ..._.pick(this.props, ['appId', 'projectId', 'worksheetId', 'viewId', 'recordId']),
        },
        this.customwidget.current,
      );
    }
  };
  render() {
    const { recordId, worksheetId, projectId, hideDialog, title } = this.props;
    const { formData, updatedControlIds, showError } = this.state;
    return (
      <Con>
        <div className="flex customFieldsWrapper">
          <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
            <div className="title Font18 Gray flex bold leftAlign ellipsis">{title}</div>
            <i className="icon icon-close Gray_9e Font20" onClick={hideDialog}></i>
          </div>
          <div ref={this.formcon}>
            <CustomFields
              isWorksheetQuery
              ref={this.customwidget}
              data={formData.map(c => ({ ...c, isCustomButtonFillRecord: true }))}
              recordId={recordId}
              from={6}
              projectId={projectId}
              worksheetId={worksheetId}
              showError={showError}
              registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
              onChange={(data, ids) => {
                this.setState({
                  formData: data,
                  updatedControlIds: _.unique(updatedControlIds.concat(ids)),
                });
              }}
            />
          </div>
        </div>
        <div className="btnsWrapper flexRow">
          <WingBlank className="flex" size="sm">
            <Button className="Font15 bold Gray_75" onClick={hideDialog}>
              <span>{_l('取消')}</span>
            </Button>
          </WingBlank>
          <WingBlank className="flex" size="sm">
            <Button className="Font15 bold" type="primary" onClick={this.handleSave}>
              {_l('确定')}
            </Button>
          </WingBlank>
        </div>
      </Con>
    );
  }
}

export default FillRecordControls;
