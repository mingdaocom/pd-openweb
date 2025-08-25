import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, Icon } from 'ming-ui';
import { getErrorControls } from 'src/pages/FormSet/components/columnRules/config.js';
import { DEFAULT_CONFIG } from '../../../../../config/widget';
import { enumWidgetType } from '../../../../../util';
import { getAdvanceSetting } from '../../../../../util/setting';
import DynamicDefaultValue from '../../../DynamicDefaultValue';
import { CustomActionWrap } from '../../style';
import AddFields from '../AddFields';

export default function PromptError(props) {
  const { actionData = {}, handleOk, allControls = [] } = props;
  const [{ actionItems, visible }, setState] = useSetState({
    actionItems: actionData.actionItems || [],
    visible: true,
  });

  useEffect(() => {
    setState({
      actionItems: actionData.actionItems || [],
    });
  }, []);

  const getDetail = controlId => {
    const currentControl = _.find(allControls, s => s.controlId === controlId) || {};
    const enumType = enumWidgetType[currentControl.type];
    const { icon } = DEFAULT_CONFIG[enumType];
    return { icon, currentControl };
  };

  const isDisabled = _.isEmpty(actionItems) || actionItems.some(a => _.isEmpty(safeParse(a.value)));

  const filterErrorControls = getErrorControls(allControls);
  const selectControls = filterErrorControls.filter(i => !_.find(actionItems, a => a.controlId === i.controlId));

  return (
    <Dialog
      width={560}
      visible={visible}
      okDisabled={isDisabled}
      className="SearchWorksheetDialog"
      title={_l('提示错误')}
      onCancel={() => setState({ visible: false })}
      overlayClosable={false}
      onOk={() => {
        handleOk({ ...actionData, actionItems });
        setState({ visible: false });
      }}
    >
      <CustomActionWrap>
        {!_.isEmpty(actionItems) && (
          <div className="setValueContent">
            <div className="setItem">
              <div className="itemFiledTitle Gray_70">{_l('字段')}</div>
              <div className="itemValueTitle Gray_70">
                {_l('错误提示')}
                <span className="Red">*</span>
              </div>
            </div>
            {actionItems.map((item, index) => {
              const { icon, currentControl } = getDetail(item.controlId);
              const isDelete = _.isEmpty(currentControl);
              return (
                <div className="setItem">
                  <div className="itemFiled itemFiledTitle ">
                    {icon && <Icon className="mRight8 Font14 Gray_75" icon={icon} />}
                    <span className={cx('flex overflow_ellipsis', { Red: isDelete })}>
                      {_.get(currentControl, 'controlName') || _l('已删除')}
                    </span>
                  </div>
                  <div className="itemValue itemValueTitle">
                    {isDelete ? null : (
                      <DynamicDefaultValue
                        {...props}
                        data={{
                          type: 2,
                          advancedSetting: { defsource: item.value, defaulttype: '' },
                        }}
                        hideTitle={true}
                        hideSearchAndFun={true}
                        propFiledVisible={true}
                        onChange={newData => {
                          const { defsource } = getAdvanceSetting(newData);
                          const tempValue = {
                            ...item,
                            type: '',
                            value: defsource,
                          };
                          setState({
                            actionItems: actionItems.map((i, idx) => (idx === index ? tempValue : i)),
                          });
                        }}
                      />
                    )}
                  </div>
                  <Icon
                    icon="trash"
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
