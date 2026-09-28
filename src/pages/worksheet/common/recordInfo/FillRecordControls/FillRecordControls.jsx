import React from 'react';
import cx from 'classnames';
import update from 'immutability-helper';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import CustomFields from 'src/components/Form';
import DataFormat from 'src/components/Form/core/DataFormat';
import { formatControlToServer } from 'src/components/Form/core/utils';
import { FlexCenter } from 'src/pages/worksheet/components/Basics';
import { isRelateRecordTableControl } from 'src/utils/domain/control/type';
import withWorksheetRowProvider from '../WorksheetRecordProvider';
import './FillRecordControls.less';

const MODAL_STYLES = { header: { marginBottom: 0 } };

// 批量选择记录触发时没有单条 recordId，子表和关联记录表格形态都要按行维护各自记录的关联关系，
// 在批量填写里既填不准也存不下，直接从弹层字段里剔除
function isControlUnsupportedInBatchFill(control) {
  return control.type === 34 || (control.type === 29 && isRelateRecordTableControl(control));
}

// 看字段权限第一位（可见位）而不是第二位（可编辑位）：按钮配成只读的字段拿到 '10x'，本来就要显示出来
// 供查看，不能因为不可编辑就连带藏掉；只有没配进 writeControls 的、来自主记录的才是 '000' 不显示。
// 标签页只是布局容器（上面被异化成 '111' 常驻显示），本身不算一个字段
function hasVisibleControl(formData) {
  return _.some(formData, c => c.type !== 52 && _.get(c, 'controlPermissions[0]') === '1');
}

const Empty = styled(FlexCenter)`
  height: 260px;
  flex-direction: column;
`;

const EmptyCircle = styled(FlexCenter)`
  width: 130px;
  height: 130px;
  border-radius: 130px;
  background: var(--color-background-secondary);
  font-size: 80px;
  color: var(--color-text-disabled);
`;

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
let FillRecordControls = class FillRecordControls extends React.Component {
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
    customButton: PropTypes.shape({}),
  };

  constructor(props) {
    super(props);
    const { projectId } = props;
    this.hasDefaultRelateRecordTableControls = [];
    const controls = update(
      (props.formData || []).concat((props.masterFormData || []).map(c => ({ ...c, fromMaster: true }))),
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
                  const updatedControl = _.find(formData, {
                    controlId,
                  });

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
              } // 自定义动作异化：标签页不能配置，所以默认都显示

              if (c.type === 52 && !c.fromMaster) return { ...c, controlPermissions: '111', fieldPermission: '111' };

              if (!writeControl || c.fromMaster) {
                return { ...c, controlPermissions: '000' };
              }

              if (c.type === 29 && c.enumDefault === 2 && c.advancedSetting.showtype === '2') {
                return { ...c, value: '', controlPermissions: '000' };
              }

              const defaultFormControl = _.find(defaultFormData, dfc => dfc.controlId === c.controlId);

              // 关联表格只在两种场景禁用删除记录：一是批量操作等没有 recordId 的新建态，此时行头菜单的
              // 单条删除没有别处拦截（Operate 的 !!recordId 只挡批量删除入口）；二是控件配了默认值，
              // 表格复用 DataFormat 算默认值时建的临时 store，记录是预选进来的。
              // 已有记录且未配默认值时与记录详情页一致，保留删除能力。
              if (
                c.type === 29 &&
                c.enumDefault === 2 &&
                c.advancedSetting.showtype === '5' &&
                (!props.recordId || get(defaultFormControl, 'store'))
              ) {
                c.advancedSetting.allowdelete = '0';
              }

              // 前端拼接的系统字段等控件不一定带 controlPermissions，与 controlState 一致按 '111' 兜底，
              // 否则这里直接取下标会让整个自定义动作弹层白屏
              const originControlPermissions = c.controlPermissions || '111';

              c.controlPermissions =
                originControlPermissions[0] + (writeControl.type === 1 ? '0' : '1') + originControlPermissions[2];
              c.required = writeControl.type === 3;
              c.fieldPermission = '111';

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
                          value: {
                            count: 0,
                          },
                        });
                      }
                    });
                  });
                } else {
                  // 关联记录查询时服务端会按源记录默认剔除「已关联的记录」，清空前先留住原关联的 rowid，
                  // 作为关联下拉的放行名单（_system_excluderowids）传给服务端，
                  // 否则字段被清空后，这些原本已选的记录在下拉可选列表里反而找不到
                  if (c.type === 29) {
                    const keepRowIds = safeParse(c.value, 'array')
                      .map(r => r.sid)
                      .filter(Boolean);

                    if (keepRowIds.length) {
                      c.keepShowRowIds = keepRowIds;
                    }
                  }

                  c.value = '';
                }

                c.advancedSetting.defsource = '';
              }

              return c;
            })
            .filter(c => !!c && (!props.isBatchOperate || !isControlUnsupportedInBatchFill(c)));
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

    if (!this.customwidget.current) {
      return;
    }

    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  }

  async onSave(error, { data, updateControlIds, handleRuleError, handleServiceError }) {
    const { continueFill } = this.props;

    if (error) {
      this.setState({
        submitLoading: false,
      });
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
      this.setState({
        isSubmitting: true,
        submitLoading: false,
      });
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
      { ..._.pick(this.props, ['appId', 'projectId', 'worksheetId', 'viewId', 'recordId']) },
      this.customwidget.current,
      (err, res) => {
        if (err) {
          this.setState({
            isSubmitting: false,
            submitLoading: false,
          });
        }

        if (res && res.resultCode === 22) {
          this.customwidget.current.dataFormat.callStore('setUniqueError', {
            badData: res.badData,
          });
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
      customButton,
    } = this.props;
    const { submitLoading, formData, showError, formFlag, isSubmitting } = this.state;
    const hasFields = hasVisibleControl(formData);
    return (
      <Modal
        allowScale
        className={cx('fillRecordControls', className)}
        title={<div className="Font19">{title}</div>}
        width={900}
        styles={MODAL_STYLES}
        onCancel={() => {
          hideDialog();
        }}
        confirmLoading={submitLoading || isSubmitting}
        okDisabled={!hasFields}
        onOk={this.handleSave.bind(this)}
        open={visible}
      >
        {!hasFields && (
          <Empty>
            <EmptyCircle>
              <i className="icon-workflow_write" />
            </EmptyCircle>
            <span className="textTertiary Font13 mTop20">{_l('无可填写字段')}</span>
          </Empty>
        )}
        {hasFields && isBatchRecordLock && (
          <div className="textTertiary mBottom10">
            {_l('未填写时不会清空字段值。一次最多处理1000条未锁定且有编辑权限的记录。')}
          </div>
        )}
        {submitLoading && (
          <LoadMask
            style={
              continueFill
                ? {
                    zIndex: 10,
                  }
                : {}
            }
          >
            <LoadDiv />
          </LoadMask>
        )}
        {hasFields && (
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
              controlProps={{ customButton }}
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
              registerCell={({ item, cell }) =>
                (this.cellObjs[item.controlId] = {
                  item,
                  cell,
                })
              }
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
        )}
      </Modal>
    );
  }
};
FillRecordControls = withWorksheetRowProvider(FillRecordControls);
export default FillRecordControls;
