import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import CustomFields from 'src/components/Form';
import { isRelateRecordTableControl } from 'src/utils/control';

export default class RowDetail extends React.Component {
  static propTypes = {
    widgetStyle: PropTypes.shape({}),
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

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (
        this.props.data &&
        (this.props.data.rowid !== prevProps.data.rowid ||
          (prevProps.isMobile && !_.isEqual(this.props.data, prevProps.data)))
      ) {
        this.setState({
          flag: Math.random(),
        });
      }
    }
  }

  formcon = React.createRef();
  customwidget = React.createRef();

  isVerified = () => {
    return this.handleSave(false, false, false, true);
  };

  handleSave = (nextContinue, isSwitchSave, ignoreAlert, isCopy = false, extraParams = {}) => {
    if (!this.customwidget.current) {
      return;
    }

    if ($(this.formcon.current).find('.Progress--circle').length > 0) {
      alert(_l('附件正在上传，请稍后'), 3);
      return;
    }

    const { data, onSave, onClose, openNextRecord, disabled } = this.props;
    const submitData = this.customwidget.current.getSubmitData({ ignoreAlert, ...extraParams });
    const updateControlIds = this.customwidget.current.dataFormat.getUpdateControlIds();
    const formdata = submitData.fullData;

    const hasSubmitError = !!submitData.error;

    if (hasSubmitError && !extraParams.ignoreHiddenRequired) {
      return false;
    } else {
      const row = [{}, ...formdata].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));
      !disabled &&
        onSave({ ...data, ...row, empty: false }, updateControlIds, {
          hasError: hasSubmitError,
          validateAll: true,
        });
      if (extraParams.ignoreHiddenRequired && hasSubmitError) {
        return false;
      } else if (isSwitchSave) {
        return row;
      } else if (nextContinue) {
        this.setState({ flag: Math.random() }, () => {
          if (this.formcon.current) {
            const $firstText = this.formcon.current.querySelector(
              '.customMobileFormContainer .customFormItem .customFormTextareaBox input.smallInput',
            );

            if ($firstText) {
              $firstText.click();
            }
          }
        });
        openNextRecord();
      }

      if (!isCopy && !nextContinue) onClose();
      return row;
    }
  };

  continueSubmit = extraParams => {
    this.handleSave(false, false, false, false, extraParams);
  };

  // DataFormat 不会把他表字段、公式、文本组合这类被动派生字段加入 updateControlIds。
  // H5 子表行详情需要像 PC 子表一样补齐这些 id，否则 row 已有新值但外层子表不会按字段变更处理。
  getAsyncUpdatedControlIds = updatedControlIds => {
    if (!this.customwidget.current) {
      return updatedControlIds;
    }

    const formData = this.customwidget.current.dataFormat.getDataSource();
    const affectedIds = new Set(updatedControlIds);
    const derivedControls = formData.filter(control => _.includes([30, 31, 32], control.type));
    let hasNewAffected = true;

    while (hasNewAffected) {
      hasNewAffected = false;
      derivedControls.forEach(control => {
        if (
          !affectedIds.has(control.controlId) &&
          [...affectedIds].some(controlId => _.includes(control.dataSource, controlId))
        ) {
          affectedIds.add(control.controlId);
          hasNewAffected = true;
        }
      });
    }

    return _.uniq([...affectedIds].concat(this.customwidget.current.dataFormat.getUpdateControlIds()));
  };

  handleChange = (formData, updatedControlIds, options = {}) => {
    if (!options.isAsyncChange || this.props.disabled) {
      return;
    }

    // 查询工作表默认值的异步回填需要同步到子表行数据
    const { data, onSave } = this.props;
    const asyncChanges = options.asyncChanges || {};

    if (this.customwidget.current && asyncChanges.controlId && !_.isUndefined(asyncChanges.value)) {
      // H5 这里拿到的 formData 可能还是旧快照，需用异步回调原值重放一次，才能级联计算他表字段等派生值。
      this.customwidget.current.dataFormat.updateDataSource({
        controlId: asyncChanges.controlId,
        value: asyncChanges.value,
      });
    }

    // 重放后从当前 DataFormat 读取最新数据，确保 row 包含 sourcevalue 触发后的派生字段值。
    const currentFormData = this.customwidget.current ? this.customwidget.current.dataFormat.getDataSource() : formData;
    // 被动派生字段不会进入 DataFormat 的变更字段集合，这里补齐给外层子表保存。
    const nextUpdatedControlIds = this.getAsyncUpdatedControlIds(updatedControlIds);
    const row = [{}, ...currentFormData].reduce((a = {}, b = {}) => Object.assign(a, { [b.controlId]: b.value }));

    onSave({ ...data, ...row, empty: false }, nextUpdatedControlIds);
  };

  handleClose = () => {
    const { onClose } = this.props;

    if ($(this.formcon.current).find('.Progress--circle').length > 0) {
      alert(_l('附件正在上传，请稍后'), 3);
      return;
    }

    onClose();
  };

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
      isMobile,
      isWorkflow,
      from,
      masterData,
      widgetStyle = {},
      rules,
      isDraft,
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
            count: data[`rq${c.controlId}`],
          }));
    const recordId = data.rowid && data.rowid.startsWith('temp') ? undefined : data.rowid;
    return (
      <RecordInfoContext.Provider
        value={{
          recordBaseInfo: {
            appId,
            worksheetId,
            recordId: data.rowid,
          },
        }}
      >
        <div ref={this.formcon}>
          <CustomFields
            ignoreLock={ignoreLock}
            worksheetId={worksheetId}
            disabled={disabled}
            searchConfig={searchConfig}
            sheetSwitchPermit={sheetSwitchPermit}
            columnNumber={1}
            from={from === 21 ? 21 : isMobile && isWorkflow ? 3 : recordId ? 3 : 2}
            isDraft={isDraft}
            isCreate={false}
            recordId={recordId}
            ref={this.customwidget}
            masterData={masterData}
            data={formdata
              .map(c => ({
                ...c,
                fieldPermission: isRelateRecordTableControl(c) ? '000' : c.fieldPermission,
                controlPermissions: isRelateRecordTableControl(c) ? '000' : c.controlPermissions,
                isSubList: true,
              }))
              .filter(c => !_.includes([34].concat(_.get(window, 'shareState.isPublicForm') ? [48] : []), c.type))}
            getMasterFormData={getMasterFormData}
            flag={flag}
            projectId={projectId}
            appId={appId}
            checkCellUnique={(...args) => handleUniqueValidate(...args, data.rowid)}
            onRulesLoad={onRulesLoad}
            ignoreSection
            widgetStyle={widgetStyle}
            rules={rules}
            continueSubmit={this.continueSubmit}
            onChange={this.handleChange}
          />
        </div>
      </RecordInfoContext.Provider>
    );
  }
}
