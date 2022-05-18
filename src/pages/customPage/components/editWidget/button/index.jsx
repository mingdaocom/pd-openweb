import React, { useCallback, useState } from 'react';
import { string } from 'prop-types';
import styled from 'styled-components';
import update from 'immutability-helper';
import Dialog from 'rc-dialog';
import 'rc-dialog/assets/index.css';
import { Icon, Button } from 'ming-ui';
import BtnGroupSetting from './btnGroupSetting';
import BtnList from './btnList';
import BtnSetting from './btnSetting';
import { useSetState } from 'react-use';
import SideWrap from '../../SideWrap';
import { Header, EditWidgetContent } from '../../../styled';
import { DEFAULT_BUTTON_LIST } from './config';
import ButtonDisplay from './ButtonDisplay';

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
  border-radius: 3px;
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
  const { widget, onEdit, onClose } = props;

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
    const { btnType } = btnSetting.config || {};
    const data = { name: _l('我是按钮'), color: '#2196f3' };
    if (btnType === 2) {
      const icon = 'custom_actions';
      const iconUrl = `${md.global.FileStoreConfig.pubHost}/customIcon/${icon}.svg`;
      data.config = {
        icon,
        iconUrl,
        isNewBtn: true
      }
    }
    setSetting(update(btnSetting, { buttonList: { $push: [data] } }));
  };

  const handleDel = () => {
    if (buttonList.length <= 1) {
      alert(_l('仅剩一个按钮了，无法删除'));
      return;
    }
    setSetting(update(btnSetting, { buttonList: { $splice: [[activeIndex, 1]] } }));
    setIndex(Math.max(activeIndex - 1, 0));
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
      onEdit({ button: btnSetting });
    }
  };
  const onSortEnd = btnList => {
    setSetting(update(btnSetting, { buttonList: { $set: btnList } }));
  };

  return visible ? (
    <SideWrap headerText={_l('选择按钮样式')} onClose={onClose}>
      {DEFAULT_BUTTON_LIST.map((item, i) => (
        <DefaultItem
          key={i}
          className="defaultItem"
          onClick={() => {
            setSetting(item);
            setVisible(false);
          }}>
          <ButtonDisplay displayMode="" {...item} />
        </DefaultItem>
      ))}
    </SideWrap>
  ) : (
    <Dialog
      maskStyle={{ zIndex: 999 }}
      wrapClassName="customPageButtonWrap"
      className="editWidgetDialogWrap"
      visible
      onClose={onClose}
      closeIcon={<Icon icon="close Font24 ThemeHoverColor3" />}>
      <Header>
        <div className="typeName">{_l('按钮')}</div>
        <Button className="saveBtn" onClick={handleSave}>{_l('保存')}</Button>
      </Header>
      <EditWidgetContent>
        <BtnWrap>
          <div className="btnGroup">
            <BtnGroupSetting {...props} {...btnSetting} setSetting={setSetting} addBtn={addBtn} />
            <BtnList
              {...props}
              {...btnSetting}
              errorBtns={errorBtns}
              onSortEnd={onSortEnd}
              activeIndex={activeIndex}
              onClick={({ index }) => setIndex(index)}
            />
          </div>
          <BtnSetting
            {...props}
            explain={explain}
            btnSetting={buttonList[activeIndex]}
            btnConfig={config}
            setBtnSetting={setBtnSetting}
            setSetting={setSetting}
            onDel={handleDel}
          />
        </BtnWrap>
      </EditWidgetContent>
    </Dialog>
  );
}
