import React, { useCallback, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import update from 'immutability-helper';
import { v4 as uuidv4 } from 'uuid';
import { Icon } from 'ming-ui';
import { ConfigProvider, Button, Tooltip, Modal } from 'antd';
import BtnGroupSetting from './btnGroupSetting';
import BtnList from './btnList';
import BtnSetting from './btnSetting';
import { useSetState } from 'react-use';
import SideWrap from '../../SideWrap';
import { Header, EditWidgetContent } from '../../../styled';
import { GET_DEFAULT_BUTTON_LIST } from './config';
import { getThemeColors } from 'src/util';
import { dealUserId } from 'src/pages/widgetConfig/util/data.js';
import ButtonDisplay from './ButtonDisplay';
import _ from 'lodash';

const BtnWrap = styled.div`
  background-color: #eee;
  height: 100%;
  display: flex;

  .btnGroup {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
    padding: 10px 24px;
    overflow: auto;
  }
`;
const DefaultItem = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  background-color: #fff;
  margin-top: 15px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.16);
  }
  .btnWrap {
    margin: 8px 10px;
  }
`;

export default function Btn(props) {
  const { projectId, widget, onEdit, onClose } = props;

  const { button } = widget;

  const [btnSetting, setSetting] = useSetState(button);
  const { buttonList, explain, config } = btnSetting;

  const [activeIndex, setIndex] = useState(0);
  const [errorBtns, setErrorBtns] = useState([]);

  const [visible, setVisible] = useState(_.isEmpty(button));

  const setBtnSetting = config => {
    setSetting(update(btnSetting, { buttonList: { [activeIndex]: { $apply: item => ({ ...item, ...config }) } } }));
  };

  const addBtn = () => {
    const COLORS = getThemeColors(projectId);
    const lastButton = buttonList[buttonList.length - 1] || {};
    const colorIndex = COLORS.indexOf(lastButton.color);
    const defaultColor = '#2196f3';
    const color = colorIndex === -1 ? defaultColor : COLORS[colorIndex + 1] || COLORS[0];
    const { btnType } = btnSetting.config || {};
    const data = { name: _l('我是按钮'), color, id: uuidv4() };
    if (btnType === 2) {
      const icon = 'custom_actions';
      const iconUrl = `${md.global.FileStoreConfig.pubHost}customIcon/${icon}.svg`;
      data.config = {
        icon,
        iconUrl,
        isNewBtn: true,
      };
    }
    setIndex(buttonList.length);
    setSetting(update(btnSetting, { buttonList: { $push: [data] } }));
  };

  const handleDel = () => {
    if (buttonList.length <= 1) {
      alert(_l('仅剩一个按钮了，无法删除'), 3);
      return;
    }
    setSetting(update(btnSetting, { buttonList: { $splice: [[activeIndex, 1]] } }));
    setIndex(Math.max(activeIndex - 1, 0));
  };
  const handleCopy = () => {
    const data = _.cloneDeep(buttonList[activeIndex]);
    const config = _.get(data, 'config') || {};
    data.id = uuidv4();
    data.btnId = null;
    data.filterId = null;
    if (config.isFilter) {
      data.config = { ...config, isFilter: undefined };
    }
    setSetting(update(btnSetting, { buttonList: { $splice: [[activeIndex + 1, 0, data]] } }));
  };
  const handleSave = () => {
    // 验证业务流程是否有必填项
    const { buttonList } = btnSetting;
    const emptyParamBtns = [];
    buttonList.forEach((btn, index) => {
      const { inputs } = btn.config || {};
      const requiredInput = _.find(inputs, { required: true });
      if (requiredInput && _.isEmpty(requiredInput.value)) {
        emptyParamBtns.push(index);
      }
    });
    if (emptyParamBtns.length) {
      setErrorBtns(emptyParamBtns);
      alert(_l('业务流程有必填参数，请完善'), 3);
    } else {
      // 替换 inputs values
      buttonList.forEach(btn => {
        const { inputsIsEdit, inputs } = btn.config || {};
        if (inputsIsEdit) {
          inputs.forEach(input => {
            if ([26, 27, 48].includes(input.type)) {
              const { advancedSetting } = dealUserId({
                ...input,
                advancedSetting: { defsource: JSON.stringify(input.value),
                enumDefault: _.includes([26, 27, 48], input.type) ? 1 : inputData.enumDefault,
              } });
              input.value = JSON.parse(advancedSetting.defsource);
            }
          });
          delete btn.config.inputsIsEdit;
        }
      });
      onEdit({ button: btnSetting });
    }
  };

  return visible ? (
    <SideWrap headerText={_l('选择按钮样式')} onClose={onClose}>
      {GET_DEFAULT_BUTTON_LIST().map((item, i) => (
        <DefaultItem
          key={i}
          className="defaultItem"
          onClick={() => {
            item.buttonList.forEach(btn => {
              btn.id = uuidv4();
            });
            setSetting(item);
            setVisible(false);
          }}
        >
          <ButtonDisplay displayMode="" {...item} />
        </DefaultItem>
      ))}
    </SideWrap>
  ) : (
    <Modal
      maskStyle={{ zIndex: 999 }}
      wrapClassName="customPageButtonWrap"
      className="editWidgetDialogWrap"
      visible
      transitionName=""
      maskTransitionName=""
      width="100%"
      footer={null}
      centered={true}
      onCancel={onClose}
      closeIcon={<Icon icon="close Font24 ThemeHoverColor3" />}
    >
      <Header>
        <div className="typeName">{_l('按钮')}</div>
        <div className="flexRow valignWrapper">
          <ConfigProvider autoInsertSpaceInButton={false}>
            <Button block className="save" shape="round" type="primary" onClick={handleSave}>
              {_l('保存')}
            </Button>
          </ConfigProvider>
          <Tooltip title={_l('关闭')} placement="bottom">
            <Icon icon="close" className="Font24 pointer mLeft16 Gray_9e" onClick={onClose} />
          </Tooltip>
        </div>
      </Header>
      <EditWidgetContent>
        <BtnWrap>
          <div className="btnGroup">
            <BtnGroupSetting {...props} {...btnSetting} setSetting={setSetting} addBtn={addBtn} />
            <BtnList
              {...props}
              {...btnSetting}
              errorBtns={errorBtns}
              activeIndex={activeIndex}
              onClick={({ index }) => setIndex(index)}
            />
          </div>
          <BtnSetting
            {...props}
            explain={explain}
            activeIndex={activeIndex}
            btnSetting={buttonList[activeIndex]}
            btnConfig={config}
            setBtnSetting={setBtnSetting}
            setSetting={setSetting}
            onDel={handleDel}
            onCopy={handleCopy}
          />
        </BtnWrap>
      </EditWidgetContent>
    </Modal>
  );
}
