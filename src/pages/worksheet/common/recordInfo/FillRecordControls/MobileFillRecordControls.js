import React from 'react';
import { Button } from 'antd-mobile';
import update from 'immutability-helper';
import _, { get } from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import CustomFields from 'src/components/newCustomFields';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import { handleAPPScanCode } from 'src/pages/Mobile/components/RecordInfo/preScanCode';
import useWorksheetRowProvider from 'src/pages/worksheet/common/recordInfo/WorksheetRecordProvider';
import { isRelateRecordTableControl } from 'src/utils/control';

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
    .edit {
      color: #2196f3;
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
    this.hasDefaultRelateRecordTableControls = [];
    const controls = update(
      props.formData.concat((props.masterFormData || []).map(c => ({ ...c, fromMaster: true }))),
      {
        $apply: formData => {
          let hasDefaultControls = [];
          const formDataForDataFormat = formData.map(c => {
            const newControl = { ...c };
            const writeControl = _.find(props.writeControls, wc => newControl.controlId === wc.controlId);
            newControl.advancedSetting = { ...(newControl.advancedSetting || {}), defsource: '', defaultfunc: '' };
            if (writeControl && writeControl.defsource && writeControl.defsource !== '[]') {
              newControl.value = '';
              if (_.includes([9, 10, 11], newControl.type)) {
                newControl.value = newControl.default = safeParse(writeControl.defsource)[0].staticValue;
              } else {
                newControl.advancedSetting = {
                  ...(newControl.advancedSetting || {}),
                  defsource: writeControl.defsource,
                };
              }
              hasDefaultControls.push(newControl);
            }
            return newControl;
          });
          function controlIsReadOnly(c) {
            const writeControl = _.find(props.writeControls, wc => c.controlId === wc.controlId);
            return writeControl && writeControl.type === 1;
          }
          const defaultFormData = hasDefaultControls.length
            ? new DataFormat({
                forceSync: true,
                data: formDataForDataFormat
                  .filter(c => {
                    return _.find(
                      hasDefaultControls,
                      dc =>
                        dc.controlId === c.controlId ||
                        (_.get(dc, 'advancedSetting.defsource') || '').indexOf(c.controlId) > -1,
                    );
                  })
                  .map(c =>
                    c.type === 29 && c.enumDefault === 2 && get(c, 'advancedSetting.showtype') === '5'
                      ? { ...c, disabled: controlIsReadOnly(c) }
                      : c,
                  ),
                isCreate: true,
                from: 2,
                projectId,
                onAsyncChange: ({ controlId, value }) => {
                  const updatedControl = _.find(formData, { controlId });
                  if (
                    updatedControl &&
                    _.includes(
                      [
                        26, // 人员
                        27, // 部门
                        48, // 组织
                      ],
                      updatedControl.type,
                    )
                  ) {
                    setTimeout(() => {
                      this.setState(oldState => ({
                        formFlag: Math.random(),
                        formData: oldState.formData.map(c => (c.controlId === controlId ? { ...c, value } : c)),
                      }));
                    }, 500);
                  }
                },
              })
                .getDataSource()
                .filter(
                  c =>
                    _.includes(
                      props.writeControls.map(c => c.controlId),
                      c.controlId,
                    ) && !_.includes([30, 31, 37, 38], c.type),
                )
            : [];
          formData = formData
            .map(c => {
              const writeControl = _.find(props.writeControls, wc => c.controlId === wc.controlId);
              if (_.isUndefined(c.dataSource)) {
                return undefined;
              }
              // 自定义动作异化：标签页不能配置，所以默认都显示
              if (c.type === 52) return { ...c, controlPermissions: '111', fieldPermission: '111' };
              if (!writeControl || c.fromMaster) {
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
              if (c.type === 29 && c.enumDefault === 2 && c.advancedSetting.showtype === '5') {
                c.advancedSetting.allowdelete = '0';
              }
              c.controlPermissions =
                c.controlPermissions[0] + (writeControl.type === 1 ? '0' : '1') + c.controlPermissions[2];
              c.required = writeControl.type === 3;
              c.fieldPermission = '111';
              const defaultFormControl = _.find(defaultFormData, dfc => dfc.controlId === c.controlId);
              const needClear = get(safeParse(get(writeControl, 'defsource')), '0.cid') === 'empty';
              if (defaultFormControl && !needClear) {
                if (
                  c.type === 29 &&
                  c.enumDefault === 2 &&
                  c.advancedSetting.showtype === '5' &&
                  defaultFormControl.store
                ) {
                  try {
                    if (!_.isEmpty(defaultFormControl.store.getState().records)) {
                      c.storeFromDefault = defaultFormControl.store;
                      this.hasDefaultRelateRecordTableControls.push(defaultFormControl.controlId);
                    }
                  } catch (err) {}
                } else if (c.type === 29) {
                  const defaultRecords = _.filter(
                    safeParse(defaultFormControl.value, 'array'),
                    r => r.sid || r.sourcevalue,
                  );
                  if (!_.isEmpty(defaultRecords)) {
                    c.value = JSON.stringify(defaultRecords);
                    c.count = undefined;
                  }
                } else {
                  c.value = defaultFormControl.value;
                }
              }
              if (needClear) {
                if (isRelateRecordTableControl(c)) {
                  this.needRunFunctionsAfterDataReady.push(() => {
                    this.customwidget.current.dataFormat.data.forEach(item => {
                      if (item.controlId === c.controlId) {
                        item.store.dispatch({
                          type: 'DELETE_ALL',
                        });
                        item.store.dispatch({
                          type: 'UPDATE_TABLE_STATE',
                          value: { count: 0 },
                        });
                      }
                    });
                  });
                } else {
                  c.value = '';
                }
                c.advancedSetting.defsource = '';
              }
              return c;
            })
            .filter(c => !!c && (!props.isBatchOperate || !_.includes([34], c.type)));
          return formData;
        },
      },
    );
    this.handleAppScan(controls);
    this.state = {
      formData: controls,
      showError: false,
    };
  }
  cellObjs = {};
  customwidget = React.createRef();
  formcon = React.createRef();

  handleAppScan = controls => {
    const { hideDialog = () => {}, worksheetInfo } = this.props;
    handleAPPScanCode({
      controls,
      worksheetInfo,
      updateData: data => {
        this.customwidget.current.dataFormat.updateDataSource(data);
        this.customwidget.current.updateRenderData();
      },
      handleSubmit: () => {
        this.handleSave();
      },
      handleScanFinished: () => {},
      onCancel: hideDialog,
    });
  };

  handleSave = () => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  };
  onSave = async (error, { data, updateControlIds }) => {
    const { continueFill } = this.props;
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    const { onSubmit, writeControls, customButtonConfirm } = this.props;
    let hasError;
    const newData = data.filter(
      item => _.find(writeControls, writeControl => writeControl.controlId === item.controlId) && !item.fromMaster,
    );

    if (hasError) {
      alert(_l('请正确填写记录'), 3);
      this.setState({ submitLoading: false });
      return;
    }
    if (customButtonConfirm) {
      try {
        await customButtonConfirm();
      } catch (err) {
        this.setState({
          submitLoading: false,
        });
        return;
      }
    }
    if (!continueFill) {
      this.setState({ isSubmitting: true, submitLoading: false });
    }
    updateControlIds = _.uniq(updateControlIds.concat(writeControls.filter(c => c.defsource).map(c => c.controlId)));
    onSubmit(
      newData
        .filter(c => _.find(updateControlIds, controlId => controlId === c.controlId))
        .map(c =>
          formatControlToServer(c, {
            needFullUpdate: true,
            hasDefaultRelateRecordTableControls: this.hasDefaultRelateRecordTableControls,
          }),
        ),
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
    const { appId, recordId, worksheetId, projectId, hideDialog, title, continueFill, widgetStyle } = this.props;
    const { submitLoading, isSubmitting, formData, showError, formFlag } = this.state;

    return (
      <Con>
        <div className="flex customFieldsWrapper">
          {submitLoading && (
            <LoadMask style={continueFill ? { zIndex: 10 } : {}}>
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
              flag={formFlag}
              ref={this.customwidget}
              widgetStyle={widgetStyle}
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
          <Button className="flex mLeft6 mRight6 Font15 bold Gray_75" onClick={hideDialog}>
            <span>{_l('取消')}</span>
          </Button>
          <Button
            disabled={submitLoading || isSubmitting}
            className="flex mLeft6 mRight6 Font15 bold"
            color="primary"
            onClick={this.handleSave}
          >
            {_l('确定')}
          </Button>
        </div>
      </Con>
    );
  }
}

export default FillRecordControls;
