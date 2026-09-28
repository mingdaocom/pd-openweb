import React, { useRef, useState } from 'react';
import _ from 'lodash';
import { Input } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import DeleteOptionList from 'src/pages/AppSettings/components/AllOptionList/DeleteOptionList';
import { checkOptionsRepeat } from 'src/utils/domain/control/options';
import { getDefaultOptions } from 'src/utils/domain/control/options';
import { EditOptionModal, SettingItem } from '../../../styled';
import MoreOption from './MoreOption';
import Options from './Options';

export default function EditOptionList(props) {
  const { onOk, options = [], globalSheetInfo = {}, onCancel, ...rest } = props;
  const appId = props.appId || globalSheetInfo.appId;
  const optionsRef = useRef(null);
  const requestPending = useRef(false);
  const [name, setName] = useState(props.name);
  const [data, setData] = useState(_.isEmpty(options) ? getDefaultOptions() : options);
  const [colorful, setColorful] = useState(props.colorful);
  const [enableScore, setEnableScore] = useState(props.enableScore);
  const [quoteVisible, setQuoteVisible] = useState(false);

  const handleOk = () => {
    if (requestPending.current) return;

    if (!name) {
      alert(_l('选项集标题不能为空'), 3);
      return;
    }

    const nextData = { ...rest, name, colorful, enableScore, options: data };

    if (checkOptionsRepeat([{ ...nextData, type: 9 }])) {
      alert(_l('选项字段存在重复选项'), 3);
      return;
    }

    requestPending.current = true;
    return worksheetAjax
      .saveOptionsCollection({ appId, ...nextData })
      .then(({ code, data, msg }) => {
        if (code === 1) {
          onOk(_.isEmpty(data) ? nextData : data);
        } else {
          alert(msg);
        }
      })
      .finally(() => {
        requestPending.current = false;
      });
  };

  const getOptionCount = () => {
    return data.filter(item => !item.isDeleted).length;
  };

  const checkQuote = () => {
    setQuoteVisible(true);
  };

  return (
    <EditOptionModal
      open
      width={480}
      title={_.isEmpty(options) ? _l('新建选项集') : _l('编辑选项集')}
      okText={_l('保存')}
      mask={{ closable: false }}
      keyboard
      onCancel={onCancel}
      onOk={handleOk}
    >
      <SettingItem className="mTop0">
        <div className="settingItemTitle flexRow">
          <div className="flex">{_l('名称')}</div>
          {!_.isEmpty(options) && (
            <div className="colorPrimary bold Hand" onClick={checkQuote}>
              {_l('查看引用')}
            </div>
          )}
        </div>
        <Input value={name} placeholder={_l('选项集')} onChange={e => setName(e.target.value)} />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('选项（ %0 ）', getOptionCount())}</div>
        <div className="flexCenter" style={{ justifyContent: 'space-between' }}>
          <div className="flexCenter">
            <i
              style={{ color: colorful ? 'var(--color-success)' : 'var(--color-text-disabled)' }}
              className={`Font24 pointer icon-${colorful ? 'ic_toggle_on' : 'ic_toggle_off'}`}
              onClick={() => setColorful(colorful ? false : true)}
            ></i>
            <span style={{ marginLeft: '8px' }}>{_l('彩色')}</span>
          </div>
          <MoreOption
            options={data}
            colorful={colorful}
            globalSheetInfo={globalSheetInfo}
            addOption={callback => {
              if (optionsRef && optionsRef.current) {
                optionsRef.current.addOption(true);
                callback();
              }
            }}
            handleChange={obj => setData(obj.options)}
          />
        </div>
      </SettingItem>
      <Options
        className="optionsWrap"
        isDialog={true}
        mode="list"
        options={data}
        ref={optionsRef}
        colorful={colorful}
        enableScore={enableScore}
        showAssign={true}
        onChange={({ options, enableScore }) => {
          setData(options);
          if (typeof enableScore === 'boolean') {
            setEnableScore(enableScore);
          }
        }}
      />

      {quoteVisible && (
        <DeleteOptionList
          type="checkQuote"
          collectionId={props.collectionId}
          name={props.name}
          title={_l('查看引用')}
          onOk={() => setQuoteVisible(false)}
          onCancel={() => setQuoteVisible(false)}
        />
      )}
    </EditOptionModal>
  );
}
