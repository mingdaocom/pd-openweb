import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, Icon } from 'ming-ui';
import { CustomActionWrap } from '../../style';
import cx from 'classnames';
import { enumWidgetType } from '../../../../../util';
import { DEFAULT_CONFIG } from '../../../../../config/widget';
import DynamicDefaultValue from '../../../DynamicDefaultValue';
import { HAS_DYNAMIC_TYPE } from '../../config';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../../util/setting';
import AddFields from '../AddFields';
import { DYNAMIC_FROM_MODE } from '../../../DynamicDefaultValue/config';

export default function SetValue(props) {
  const { actionData = {}, handleOk, allControls = [], updateQueryConfigs = () => {} } = props;
  const [{ actionItems, visible, customQueryConfig = [] }, setState] = useSetState({
    actionItems: actionData.actionItems || [],
    visible: true,
    customQueryConfig: props.customQueryConfig || [],
  });

  useEffect(() => {
    setState({
      actionItems: actionData.actionItems || [],
      customQueryConfig: props.customQueryConfig || [],
    });
  }, []);

  const selectControls = allControls.filter(i => {
    return _.includes(HAS_DYNAMIC_TYPE, i.type) && !_.find(actionItems, a => a.controlId === i.controlId);
  });

  const getDetail = controlId => {
    const currentControl = _.find(allControls, s => s.controlId === controlId) || {};
    const enumType = enumWidgetType[currentControl.type];
    const { icon } = DEFAULT_CONFIG[enumType] || {};
    return { icon, currentControl };
  };

  return (
    <Dialog
      width={560}
      visible={visible}
      okDisabled={_.isEmpty(actionItems)}
      title={_l('设置字段值')}
      onCancel={() => setState({ visible: false })}
      className="SearchWorksheetDialog"
      overlayClosable={false}
      onOk={() => {
        if (actionItems.some(a => _.isEmpty(safeParse(a.value, 'array')))) {
          alert(_l('请设置字段值'), 3);
          return;
        }
        handleOk({ ...actionData, actionItems });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        {!_.isEmpty(actionItems) && (
          <div className="setValueContent">
            <div className="setItem">
              <div className="itemFiledTitle Gray_70">{_l('字段')}</div>
              <div className="itemValueTitle Gray_70">{_l('值设为')}</div>
            </div>
            {actionItems.map((item, index) => {
              const { icon, currentControl } = getDetail(item.controlId);
              const isDelete = !_.get(currentControl, 'controlName');
              const queryId = item.type === '2' && _.get(safeParse(item.value), 'id');
              return (
                <div className="setItem">
                  <div className="itemFiled itemFiledTitle ">
                    {icon && <Icon className="mRight8 Font14 Gray_75" icon={icon} />}
                    <span className={cx('flex overflow_ellipsis', { Red: _.isEmpty(currentControl) })}>
                      {_.get(currentControl, 'controlName') || _l('已删除')}
                    </span>
                  </div>
                  {isDelete ? (
                    <input className="itemValue itemValueTitle errorBorder" disabled />
                  ) : (
                    <div className="itemValue itemValueTitle">
                      <DynamicDefaultValue
                        {...props}
                        data={handleAdvancedSettingChange(currentControl, {
                          [item.type === '1' ? 'defaultfunc' : item.type === '2' ? 'dynamicsrc' : 'defsource']:
                            item.value,
                          defaulttype: item.type,
                        })}
                        hideTitle={true}
                        fromCustomEvent={true}
                        from={DYNAMIC_FROM_MODE.CUSTOM_EVENT}
                        showEmpty={true}
                        {...(queryId ? { queryConfig: _.find(customQueryConfig, c => c.id === queryId) || {} } : {})}
                        updateQueryConfigs={newConfig => {
                          const index = _.findIndex(customQueryConfig, item => item.id === newConfig.id);
                          const newQueryConfigs =
                            index > -1
                              ? customQueryConfig.map(item => {
                                  return item.id === newConfig.id ? newConfig : item;
                                })
                              : customQueryConfig.concat([newConfig]);
                          setState({ customQueryConfig: newQueryConfigs });
                          updateQueryConfigs(newConfig);
                        }}
                        onChange={newData => {
                          const { defsource, defaulttype, defaultfunc, dynamicsrc } = getAdvanceSetting(newData);
                          const tempValue = {
                            ...item,
                            type: defaulttype,
                            value: defaulttype === '1' ? defaultfunc : defaulttype === '2' ? dynamicsrc : defsource,
                          };
                          setState({
                            actionItems: actionItems.map((i, idx) => (idx === index ? tempValue : i)),
                          });
                        }}
                      />
                    </div>
                  )}

                  <Icon
                    icon="delete1"
                    className="Font16 deleteBtn"
                    onClick={() => {
                      setState({ actionItems: actionItems.filter((i, idx) => idx !== index) });
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
        <AddFields
          handleClick={value => setState({ actionItems: actionItems.concat([{ controlId: value.controlId }]) })}
          selectControls={selectControls}
          disabled={!selectControls.length}
        />
      </CustomActionWrap>
    </Dialog>
  );
}
