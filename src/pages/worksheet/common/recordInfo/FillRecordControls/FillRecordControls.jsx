import React from 'react';
import cx from 'classnames';
import update from 'immutability-helper';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv, Modal } from 'ming-ui';
import CustomFields from 'src/components/Form';
import DataFormat from 'src/components/Form/core/DataFormat';
import { formatControlToServer } from 'src/components/Form/core/utils';
import { isRelateRecordTableControl } from 'src/utils/control';
import useWorksheetRowProvider from '../WorksheetRecordProvider';
import './FillRecordControls.less';

const LoadMask = styled.div`
  margin: -58px -24px;
  border-radius: 4px;
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
  static propTypes = {
    isBatchOperate: PropTypes.bool,
    visible: PropTypes.bool,
    title: PropTypes.string,
    recordId: PropTypes.string,
    className: PropTypes.string,
    worksheetId: PropTypes.string,
    projectId: PropTypes.string,
    continueFill: PropTypes.bool,
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    writeControls: PropTypes.arrayOf(PropTypes.shape({})),
    hideDialog: PropTypes.func,
    onSubmit: PropTypes.func,
    customButtonConfirm: PropTypes.func,
  };

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
                  } catch (err) {
                    console.log(err);
                  }
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
    this.state = {
      formData: controls,
      showError: false,
    };
    this.onSave = this.onSave.bind(this);
  }

  needRunFunctionsAfterDataReady = [];
  cellObjs = {};
  customwidget = React.createRef();
  formcon = React.createRef();

  handleSave() {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  }
  async onSave(error, { data, updateControlIds, handleRuleError, handleServiceError }) {
    const { continueFill } = this.props;
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    const { writeControls, onSubmit, customButtonConfirm } = this.props;
    let hasError;
    const newData = data.filter(
      item => _.find(writeControls, writeControl => writeControl.controlId === item.controlId) && !item.fromMaster,
    );
    if (hasError) {
      alert(_l('请正确填写记录'), 3);
      this.setState({
        submitLoading: false,
      });
      return;
    }
    if (customButtonConfirm) {
      try {
        await customButtonConfirm();
      } catch (err) {
        console.log(err);
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
      (err, res) => {
        if (err) {
          this.setState({ isSubmitting: false, submitLoading: false });
        }
        if (res && res.resultCode === 22) {
          this.customwidget.current.dataFormat.callStore('setUniqueError', { badData: res.badData });
        }
        if (res && res.resultCode === 31) {
          handleServiceError(res.badData);
        }
        if (res && res.resultCode === 32) {
          handleRuleError(res.badData);
        }
      },
    );
  }

  render() {
    const {
      isCharge,
      widgetStyle = {},
      recordId,
      visible,
      className,
      title,
      worksheetId,
      projectId,
      hideDialog,
      continueFill,
      viewId,
      sheetSwitchPermit,
      isDraft,
      isBatchRecordLock,
    } = this.props;
    const { submitLoading, formData, showError, formFlag, isSubmitting } = this.state;

    return (
      <Modal
        allowScale
        // type="fixed"
        className={cx('fillRecordControls', className)}
        width={900}
        onCancel={() => {
          hideDialog();
        }}
        okDisabled={submitLoading || isSubmitting}
        onOk={this.handleSave.bind(this)}
        visible={visible}
      >
        <div className="newRecordTitle ellipsis Font19 mBottom10">{title}</div>
        {isBatchRecordLock && (
          <div className="Gray_9e mBottom10">
            {_l('未填写时不会清空字段值。一次最多处理1000条未锁定且有编辑权限的记录。')}
          </div>
        )}
        {submitLoading && (
          <LoadMask style={continueFill ? { zIndex: 10 } : {}}>
            <LoadDiv />
          </LoadMask>
        )}
        <div className="formCon" ref={this.formcon}>
          <CustomFields
            parentName="fillRecordControls"
            isCharge={isCharge}
            widgetStyle={
              _.includes(['3', '4'], widgetStyle.tabposition) ? { ...widgetStyle, tabposition: '' } : widgetStyle
            }
            isWorksheetQuery
            ignoreLock
            flag={formFlag}
            ref={this.customwidget}
            popupContainer={document.body}
            data={formData.map(c => ({ ...c, isCustomButtonFillRecord: true }))}
            recordId={recordId}
            viewId={viewId}
            disableRules={!recordId}
            from={3}
            appId={this.props.appId}
            projectId={projectId}
            worksheetId={worksheetId}
            sheetSwitchPermit={sheetSwitchPermit}
            showError={showError}
            isDraft={isDraft}
            registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
            disabledFunctions={['controlRefresh']}
            onChange={data => {
              this.setState({
                formData: data,
              });
            }}
            onSave={(...args) => {
              setTimeout(() => this.onSave(...args), window.cellTextIsBlurring ? 1000 : 0);
            }}
            onFormDataReady={() => {
              try {
                this.needRunFunctionsAfterDataReady.forEach(fn => fn());
              } catch (err) {
                console.log(err);
              }
            }}
          />
        </div>
      </Modal>
    );
  }
}

export default FillRecordControls;
