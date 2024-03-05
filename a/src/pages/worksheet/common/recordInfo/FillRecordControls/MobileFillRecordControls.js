import React from 'react';
import { WingBlank, Button } from 'antd-mobile';
import styled from 'styled-components';
import update from 'immutability-helper';
import CustomFields from 'src/components/newCustomFields';
import { LoadDiv } from 'ming-ui';
import { getSubListError, filterHidedSubList } from 'worksheet/util';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import useWorksheetRowProvider from 'src/pages/worksheet/common/recordInfo/WorksheetRecordProvider';
import _ from 'lodash';

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

const LoadMask = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 2;
`;
@useWorksheetRowProvider
class FillRecordControls extends React.Component {
  constructor(props) {
    super(props);
    const { projectId } = props;
    const controls = update(props.formData, {
      $apply: formData => {
        const formDataForDataFormat = formData.map(c => {
          const newControl = { ...c };
          const writeControl = _.find(props.writeControls, wc => newControl.controlId === wc.controlId);
          newControl.advancedSetting = { ...(newControl.advancedSetting || {}), defsource: '' };
          if (writeControl && writeControl.defsource && writeControl.defsource !== '[]') {
            newControl.value = '';
            if (_.includes([9, 10, 11], newControl.type)) {
              newControl.value = newControl.default = safeParse(writeControl.defsource)[0].staticValue;
            } else {
              newControl.advancedSetting = { ...(newControl.advancedSetting || {}), defsource: writeControl.defsource };
            }
          }
          return newControl;
        });
        const defaultFormData = new DataFormat({
          data: formDataForDataFormat,
          isCreate: true,
          from: 2,
          projectId,
        })
          .getDataSource()
          .filter(
            c =>
              _.includes(
                props.writeControls.map(c => c.controlId),
                c.controlId,
              ) && !_.includes([30, 31, 37, 38], c.type),
          );
        formData = formData
          .map(c => {
            const writeControl = _.find(props.writeControls, wc => c.controlId === wc.controlId);
            if (_.isUndefined(c.dataSource)) {
              return undefined;
            }
            // 自定义动作异化：标签页不能配置，所以默认都显示
            if (c.type === 52) return { ...c, controlPermissions: '111', fieldPermission: '111' };
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

            c.controlPermissions =
              c.controlPermissions[0] + (writeControl.type === 1 ? '0' : '1') + c.controlPermissions[2];
            c.required = writeControl.type === 3;
            c.fieldPermission = '111';
            const defultFormControl = _.find(defaultFormData, dfc => dfc.controlId === c.controlId);
            if (defultFormControl) {
              c.value = defultFormControl.value;
            }
            return c;
          })
          .filter(c => !!c && (!props.isBatchOperate || !_.includes([34], c.type)));
        return formData;
      },
    });
    this.state = {
      formData: controls,
      showError: false,
    };
  }
  cellObjs = {};
  customwidget = React.createRef();
  formcon = React.createRef();
  handleSave = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  };
  onSave = async (error, { data, updateControlIds }) => {
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    const { onSubmit, writeControls, customButtonConfirm } = this.props;
    let hasError;
    const newData = data.filter(item =>
      _.find(writeControls, writeControl => writeControl.controlId === item.controlId),
    );
    const subListControls = filterHidedSubList(data, 3);
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value:
            control.value &&
            control.value.rows &&
            control.value.rows.length &&
            getSubListError(
              {
                ...control.value,
                rules: _.get(this.cellObjs || {}, `${control.controlId}.cell.props.rules`),
              },
              _.get(this.cellObjs || {}, `${control.controlId}.cell.state.controls`) || control.relationControls,
              control.showControls,
              3,
            ),
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

    if (hasError) {
      alert(_l('请正确填写记录'), 3);
      this.setState({ submitLoading: false });
      return;
    }
    if (customButtonConfirm) {
      try {
        await customButtonConfirm();
        this.setState({
          submitLoading: false,
        });
      } catch (err) {
        this.setState({
          submitLoading: false,
        });
        return;
      }
    }
    this.setState({ isSubmitting: true, submitLoading: false });
    updateControlIds = _.uniq(updateControlIds.concat(writeControls.filter(c => c.defsource).map(c => c.controlId)));
    onSubmit(
      newData.filter(c => _.find(updateControlIds, controlId => controlId === c.controlId)).map(formatControlToServer),
      {
        ..._.pick(this.props, ['appId', 'projectId', 'worksheetId', 'viewId', 'recordId']),
      },
      this.customwidget.current,
      err => {
        if (err) {
          this.setState({ isSubmitting: false, submitLoading: false });
        }
      },
    );
  };
  render() {
    const { appId, recordId, worksheetId, projectId, hideDialog, title } = this.props;
    const { submitLoading, isSubmitting, formData, showError } = this.state;
    return (
      <Con>
        <div className="flex customFieldsWrapper">
          {submitLoading && (
            <LoadMask>
              <LoadDiv />
            </LoadMask>
          )}
          <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
            <div className="title Font18 Gray flex bold leftAlign ellipsis">{title}</div>
            <i className="icon icon-close Gray_9e Font20" onClick={hideDialog}></i>
          </div>
          <div ref={this.formcon}>
            <CustomFields
              isWorksheetQuery
              ignoreLock
              ref={this.customwidget}
              data={formData.map(c => ({ ...c, isCustomButtonFillRecord: true }))}
              recordId={recordId}
              from={3}
              projectId={projectId}
              appId={appId}
              worksheetId={worksheetId}
              showError={showError}
              registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
              onChange={data => {
                this.setState({
                  formData: data,
                });
              }}
              onSave={this.onSave}
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
            <Button
              disabled={submitLoading || isSubmitting}
              className="Font15 bold"
              type="primary"
              onClick={this.handleSave}
            >
              {_l('确定')}
            </Button>
          </WingBlank>
        </div>
      </Con>
    );
  }
}

export default FillRecordControls;
