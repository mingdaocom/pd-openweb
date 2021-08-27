import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Dialog } from 'ming-ui';
import update from 'immutability-helper';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils.js';
import { getSubListError } from 'worksheet/util';
import CustomFields from 'src/components/newCustomFields';
import useWorksheetRowProvider from '../WorksheetRecordProvider';
import './FillRecordControls.less';

@useWorksheetRowProvider
class FillRecordControls extends React.Component {
  static propTypes = {
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

  render() {
    const {
      recordId,
      writeControls,
      visible,
      className,
      title,
      worksheetId,
      projectId,
      hideDialog,
      onSubmit,
    } = this.props;
    const { formData, updatedControlIds, showError, isSubmitting } = this.state;
    return (
      <Dialog
        className={cx('fillRecordControls', className)}
        overlayClosable={false}
        anim={false}
        width={900}
        onCancel={() => {
          hideDialog();
        }}
        okDisabled={isSubmitting}
        onOk={() => {
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
                  getSubListError(control.value, control.relationControls, control.showControls),
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
            this.setState({ isSubmitting: true });
            onSubmit(
              data
                .filter(c => _.find(updatedControlIds, controlId => controlId === c.controlId))
                .map(formatControlToServer),
              {
                ..._.pick(this.props, ['appId', 'projectId', 'worksheetId', 'viewId', 'recordId']),
              },
              this.customwidget.current,
            );
          }
        }}
        visible={visible}
      >
        <div className="newRecordTitle ellipsis Font19 mBottom10">{title}</div>
        <div ref={this.formcon}>
          <CustomFields
            ref={this.customwidget}
            popupContainer={document.body}
            data={formData}
            recordId={recordId}
            from={3}
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
      </Dialog>
    );
  }
}

export default FillRecordControls;
