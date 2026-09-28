import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Input, Radio, Select } from 'ming-ui/antd-components';
import homeAppApi from 'src/api/homeApp';
import { CREATE_TYPE, CREATE_TYPE_RADIO_LIST, DATABASE_TYPE } from '../../../constant';
import SelectDataObjForm from '../SelectDataObjForm';

const SyncWithDealWrapper = styled.div`
  margin: 0 auto;
  width: 643px;

  .arrowIcon {
    margin: 32px 0;
    text-align: center;
    color: var(--color-primary);
  }

  .sheetNameInput {
    width: 100%;
  }
`;

export default function SyncWithDeal(props) {
  const { source, dest, onClose } = props;
  const [sheetNameData, setSheetNameData] = useSetState({
    sheetCreateType: CREATE_TYPE.NEW,
    sheetName: '',
    sheetNameValue: '',
    optionList: [],
  });
  const [sourceDataObj, setSourceDataObj] = useSetState({});
  const [destDataObj, setDestDataObj] = useSetState({});
  const [sourceSheetList, setSourceSheetList] = useState([]);
  const isSourceAppType = source.type === DATABASE_TYPE.APPLICATION_WORKSHEET;
  const isDestAppType = dest.type === DATABASE_TYPE.APPLICATION_WORKSHEET;

  useEffect(() => {
    if (isSourceAppType) {
      homeAppApi.getWorksheetsByAppId({ appId: source.id }).then(res => {
        if (res) {
          const sheetOptionList = res.map(item => {
            return { label: item.workSheetName, value: item.workSheetId };
          });
          setSourceSheetList(sheetOptionList);
        }
      });
    }
  }, []);

  const onCreateTypeChange = sheetCreateType => {
    if (sheetCreateType === CREATE_TYPE.SELECT_EXIST) {
      homeAppApi.getWorksheetsByAppId({ appId: dest.id }).then(res => {
        if (res) {
          const optionList = res.map(item => {
            return { label: item.workSheetName, value: item.workSheetId };
          });
          setSheetNameData({ sheetCreateType, optionList });
        }
      });
    } else {
      setSheetNameData({ sheetCreateType });
    }
  };

  return (
    <SyncWithDealWrapper>
      <div className="tabNav mTop24 mBottom24" onClick={onClose}>
        <span>{_l('同步时需要对数据进行处理')}</span>
      </div>

      <div className="titleItem mBottom24">
        <div className="iconWrapper">
          <svg className="icon svg-icon" aria-hidden="true">
            <use xlinkHref={`#icon${_.get(source, 'type.className')}`} />
          </svg>
        </div>
        <span>{source.name}</span>
      </div>

      {isSourceAppType ? (
        <div>
          <p className="mBottom8">{_l('工作表')}</p>
          <Select
            className="selectItem"
            allowClear={true}
            showSearch={true}
            placeholder={_l('请选择')}
            notFoundContent={_l('暂无数据')}
            options={sourceSheetList}
            value={''}
            onChange={() => {}}
          />
        </div>
      ) : (
        <SelectDataObjForm dataSource={source} dataObj={sourceDataObj} setDataObj={setSourceDataObj} {...props} />
      )}

      <div className="arrowIcon">
        <Icon icon="arrow_down" className="Font18" />
      </div>

      <div className="titleItem mBottom24">
        <div className="iconWrapper">
          <svg className="icon svg-icon" aria-hidden="true">
            <use xlinkHref={`#icon${_.get(dest, 'type.className')}`} />
          </svg>
        </div>
        <span>{dest.name}</span>
      </div>

      {isDestAppType ? (
        <div>
          <p className="mBottom16">{_l('工作表')}</p>
          <Radio.Group
            className="mBottom24"
            options={(CREATE_TYPE_RADIO_LIST || []).map(({ text, ...option }) => ({ ...option, label: text }))}
            value={sheetNameData.sheetCreateType}
            onChange={event => onCreateTypeChange(event.target.value)}
          />
          {sheetNameData.sheetCreateType === CREATE_TYPE.NEW ? (
            <div className="sheetNameInput">
              <Input
                className="mBottom24 w100"
                radius
                variant="filled"
                value={sheetNameData.sheetName}
                onChange={event => setSheetNameData({ sheetName: event.target.value })}
              />
            </div>
          ) : (
            <Select
              className="selectItem mBottom24"
              showSearch={true}
              placeholder={_l('请选择')}
              notFoundContent={_l('暂无数据')}
              value={sheetNameData.sheetNameValue}
              options={sheetNameData.optionList}
              onChange={sheetNameValue => setSheetNameData({ sheetNameValue })}
            />
          )}
        </div>
      ) : (
        <SelectDataObjForm dataSource={dest} dataObj={destDataObj} setDataObj={setDestDataObj} {...props} />
      )}
    </SyncWithDealWrapper>
  );
}
