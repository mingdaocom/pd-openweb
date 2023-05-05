import React, { useState, useEffect, useRef } from 'react';
import { Modal, RadioGroup } from 'ming-ui';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import SvgIcon from 'src/components/SvgIcon';
import SelectIcon from 'src/pages/AppHomepage/components/SelectIcon';
import { string, number, func, bool } from 'prop-types';

const RadioGroupComp = styled(RadioGroup)`
  .ming.Radio {
    flex: 1;
  }
`;

const IconInputCon = styled.div`
  display: flex;
  padding: 8px 0 8px 12px;
  height: 36px;
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 4px;
  &.focus {
    border-color: #2196f3;
  }
  input {
    flex: 1;
    border: none;
  }
  .changeIconBtn {
    cursor: pointer;
    padding: 0 10px;
    border-left: 1px solid #ddd;
    font-size: 0px;
  }
`;

function IconInput(props) {
  const { projectId, icon, name, setIcon, setName } = props;
  const inputRef = useRef();
  const [selectVisible, setSelectVisible] = useState();
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  return (
    <IconInputCon>
      <input
        ref={inputRef}
        type="text"
        value={name}
        placeholder={_l('例：产品管理')}
        onChange={e => setName(e.target.value.slice(0, 32))}
      />
      <Trigger
        action={['click']}
        popupVisible={selectVisible}
        popupAlign={{
          points: ['tr', 'br'],
          offset: [0, 10],
        }}
        popup={
          <SelectIcon
            hideCustom
            className="Relative"
            colorList={[]}
            hideInput
            projectId={projectId}
            icon={icon}
            name={icon}
            iconColor="#757575"
            onModify={newIcon => {
              setIcon(newIcon.icon);
              if (newIcon.closeTrigger !== false) setSelectVisible(false);
            }}
          />
        }
        onPopupVisibleChange={setSelectVisible}
      >
        <span>
          <SvgIcon
            className="changeIconBtn"
            size={18}
            url={`${md.global.FileStoreConfig.pubHost.replace(/\/$/, '')}/customIcon/${icon}.svg`}
            fill="#757575"
          />
        </span>
      </Trigger>
    </IconInputCon>
  );
}

IconInput.propTypes = {
  projectId: string,
  name: string,
  icon: string,
  setName: func,
  setIcon: func,
};

export default function EditGroup(props) {
  const { isAdmin, type = 'add', projectId, onChange = () => {}, onCancel = () => {} } = props;
  const [groupType, setGroupType] = useState(props.groupType || 0);
  const [name, setName] = useState(props.name);
  const [icon, setIcon] = useState(props.icon || '8_4_folder');
  return (
    <Modal
      visible
      width={480}
      bodyStyle={{ padding: '16px 24px' }}
      onOk={() => {
        if (!(name || '').trim()) {
          alert(_l('请填写名称'), 3);
          return;
        }
        onChange({
          name,
          groupType,
          icon,
        });
      }}
      onCancel={onCancel}
    >
      <div className="Font17 Bold">{type === 'add' ? _l('添加分组') : _l('编辑分组')}</div>
      <div className="Font14 mTop20 mBottom8">{_l('名称')}</div>
      <IconInput projectId={projectId} icon={icon} setIcon={setIcon} name={name} setName={setName} />
      <div className="Font14 mTop24 mBottom8">{_l('使用范围')}</div>
      <RadioGroupComp
        className="mBottom20"
        // disabled={disabled}
        data={[
          { text: _l('个人'), value: 0 },
          { text: _l('组织'), value: 1, disabled: !isAdmin },
        ]}
        checkedValue={Number(groupType)}
        onChange={setGroupType}
        size="small"
      />
    </Modal>
  );
}

EditGroup.propTypes = {
  isAdmin: bool,
  projectId: string,
  type: string,
  name: string,
  groupType: number,
  icon: string,
  onChange: func,
  onCancel: func,
};
