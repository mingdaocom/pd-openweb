import React from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import CustomFields from 'src/components/newCustomFields';

export default class RowDetail extends React.Component {
  static propTypes = {
    ignoreLock: PropTypes.bool,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    projectId: PropTypes.string,
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    data: PropTypes.shape({}),
    getMasterFormData: PropTypes.func,
    handleUniqueValidate: PropTypes.func,
    onSave: PropTypes.func,
    onClose: PropTypes.func,
  };

  static defaultProps = {
    controls: [],
    getMasterFormData: () => {},
    onSave: () => {},
    onClose: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      flag: Math.random(),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data.rowid !== this.props.data.rowid) {
      this.setState({
        flag: Math.random(),
      });
    }
  }

  formcon = React.createRef();
  customwidget = React.createRef();

  @autobind
  handleChange() {
    const { data, isMobile, onSave } = this.props;
    if (!this.customwidget.current || isMobile) {
      return;
    }
    const submitData = this.customwidget.current.getSubmitData({ silent: true });
    const updateControlIds = this.customwidget.current.dataFormat.getUpdateControlIds();
    const formdata = submitData.data;
    const row = [{}, ...formdata].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
    onSave({ ...data, ...row, empty: false }, updateControlIds);
  }

  @autobind
  handleSave(nextContinue) {
    if (!this.customwidget.current) {
      return;
    }
    const { data, onSave, onClose } = this.props;
    const submitData = this.customwidget.current.getSubmitData();
    const updateControlIds = this.customwidget.current.dataFormat.getUpdateControlIds();
    const formdata = submitData.data;

    if (submitData.error) {
      return false;
    } else {
      const row = [{}, ...formdata].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
      onSave({ ...data, ...row, empty: false }, updateControlIds);
      if (nextContinue) {
        this.setState({ flag: Math.random() }, () => {
          if (this.formcon.current) {
            const $firstText = this.formcon.current.querySelector(
              '.customFieldsContainer .customFormItem .customFormTextareaBox input.smallInput',
            );
            if ($firstText) {
              $firstText.click();
            }
          }
        });
      } else {
        onClose();
      }
    }
  }

  @autobind
  handleClose() {
    const { onClose } = this.props;
    if ($(this.formcon.current).find('.Progress--circle').length > 0) {
      alert(_l('附件正在上传，请稍后'), 3);
      return;
    }
    onClose();
  }

  render() {
    const {
      ignoreLock,
      disabled,
      worksheetId,
      projectId,
      controls,
      data,
      getMasterFormData,
      handleUniqueValidate,
      appId,
      onRulesLoad,
      searchConfig,
      sheetSwitchPermit,
    } = this.props;
    const { flag } = this.state;
    const formdata = _.isEmpty(data)
      ? controls
      : controls
          .filter(c => !_.includes(['ownerid', 'caid', 'ctime', 'utime'], c.controlId))
          .map(c => ({
            ...c,
            value:
              _.includes([19, 23, 24], c.type) && _.isObject(data[c.controlId])
                ? data[c.controlId].text
                : data[c.controlId],
          }));
    return (
      <div ref={this.formcon}>
        <CustomFields
          ignoreLock={ignoreLock}
          ignoreHideControl
          worksheetId={worksheetId}
          disabled={disabled}
          searchConfig={searchConfig}
          sheetSwitchPermit={sheetSwitchPermit}
          columnNumber={1}
          from={2}
          isCreate={false}
          recordId={data.rowid && data.rowid.startsWith('temp') ? undefined : data.rowid}
          ref={this.customwidget}
          data={formdata.map(c => ({ ...c, isSubList: true })).filter(c => c.type !== 34)}
          getMasterFormData={getMasterFormData}
          flag={flag}
          projectId={projectId}
          appId={appId}
          checkCellUnique={(...args) => handleUniqueValidate(...args, data.rowid)}
          onChange={this.handleChange}
          onRulesLoad={onRulesLoad}
        />
      </div>
    );
  }
}
