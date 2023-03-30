import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Modal, LoadDiv } from 'ming-ui';
import styled from 'styled-components';
import update from 'immutability-helper';
import DataFormat from 'src/components/newCustomFields/tools/DataFormat';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { getSubListError, filterHidedSubList } from 'worksheet/util';
import CustomFields from 'src/components/newCustomFields';
import useWorksheetRowProvider from '../WorksheetRecordProvider';
import './FillRecordControls.less';
import _ from 'lodash';

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
    formData: PropTypes.arrayOf(PropTypes.shape({})),
    writeControls: PropTypes.arrayOf(PropTypes.shape({})),
    hideDialog: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  constructor(props) {
    super(props);
    const { projectId } = props;
    const controls = update(props.formData.concat(props.masterFormData || []), {
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
              newControl.advancedSetting = { ...(newControl.advancedSetting || {}), defsource: writeControl.defsource };
            }
            hasDefaultControls.push(newControl);
          }
          return newControl;
        });
        const defaultFormData = hasDefaultControls.length
          ? new DataFormat({
              data: formDataForDataFormat.filter(c => {
                return _.find(
                  hasDefaultControls,
                  dc =>
                    dc.controlId === c.controlId ||
                    (_.get(dc, 'advancedSetting.defsource') || '').indexOf(c.controlId) > -1,
                );
              }),
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
                  this.setState(oldState => ({
                    formFlag: Math.random(),
                    formData: oldState.formData.map(c => (c.controlId === controlId ? { ...c, value } : c)),
                  }));
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

  handleSave() {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    this.setState({ submitLoading: true });
    this.customwidget.current.submitFormData();
  }
  onSave(error, { data, updateControlIds }) {
    if (error) {
      this.setState({ submitLoading: false });
      return;
    }
    const { writeControls, onSubmit } = this.props;
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
                rules: _.get(this.cellObjs || {}, `${control.controlId}.cell.worksheettable.current.table.rules`),
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
      this.setState({
        submitLoading: false,
      });
      return;
    }
    this.setState({ isSubmitting: true, submitLoading: false });
    updateControlIds = _.uniq(updateControlIds.concat(writeControls.filter(c => c.defsource).map(c => c.controlId)));
    onSubmit(
      newData.filter(c => _.find(updateControlIds, controlId => controlId === c.controlId)).map(formatControlToServer),
      {
        ..._.pick(this.props, ['appId', 'projectId', 'worksheetId', 'viewId', 'recordId']),
      },
      this.customwidget.current,
    );
  }

  render() {
    const { widgetStyle, recordId, visible, className, title, worksheetId, projectId, hideDialog } = this.props;
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
        {submitLoading && (
          <LoadMask>
            <LoadDiv />
          </LoadMask>
        )}
        <div ref={this.formcon}>
          <CustomFields
            widgetStyle={widgetStyle}
            isWorksheetQuery
            ignoreLock
            flag={formFlag}
            ref={this.customwidget}
            popupContainer={document.body}
            data={formData.map(c => ({ ...c, isCustomButtonFillRecord: true }))}
            recordId={recordId}
            disableRules={!recordId}
            from={3}
            appId={this.props.appId}
            projectId={projectId}
            worksheetId={worksheetId}
            showError={showError}
            registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
            onChange={data => {
              this.setState({
                formData: data,
              });
            }}
            onSave={this.onSave.bind(this)}
          />
        </div>
      </Modal>
    );
  }
}

export default FillRecordControls;
