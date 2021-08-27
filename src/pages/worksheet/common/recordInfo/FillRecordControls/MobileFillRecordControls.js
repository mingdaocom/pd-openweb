import React from 'react';
import { WingBlank, Button } from 'antd-mobile';
import update from 'immutability-helper';
import CustomFields from 'src/components/newCustomFields';
import { formatControlToServer } from 'src/components/newCustomFields/tools/utils';
import useWorksheetRowProvider from 'src/pages/worksheet/common/recordInfo/WorksheetRecordProvider';

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

  customwidget = React.createRef();
  handleSave = () => {
    const { onSubmit } = this.props;
    const { formData, updatedControlIds, showError } = this.state;
    const customwidgetData = this.customwidget.current.getSubmitData();
    const { hasRuleError, hasError } = customwidgetData;

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
      <div className="fillRecordControlsModal">
        <div className="flexRow valignWrapper pTop15 pLeft20 pRight20 pBottom8">
          <div className="title Font18 Gray flex bold leftAlign ellipsis">{title}</div>
          <i className="icon icon-close Gray_9e Font20" onClick={hideDialog}></i>
        </div>
        <div className="flex customFieldsWrapper">
          <CustomFields
            ref={this.customwidget}
            data={formData}
            recordId={recordId}
            from={6}
            projectId={projectId}
            worksheetId={worksheetId}
            showError={showError}
            onChange={(data, ids) => {
              this.setState({
                formData: data,
                updatedControlIds: _.unique(updatedControlIds.concat(ids)),
              });
            }}
          />
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
      </div>
    );
  }
}

export default FillRecordControls;
