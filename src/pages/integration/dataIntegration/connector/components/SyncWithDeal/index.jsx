import React, { useEffect, useState } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Icon, RadioGroup, Input } from 'ming-ui';
import _ from 'lodash';
import { Select } from 'antd';
import { CREATE_TYPE, DATABASE_TYPE, CREATE_TYPE_RADIO_LIST } from '../../../constant';
import SelectDataObjForm from '../SelectDataObjForm';
import homeAppApi from 'src/api/homeApp';

const SyncWithDealWrapper = styled.div`
  margin: 0 auto;
  width: 643px;

  .arrowIcon {
    margin: 32px 0;
    text-align: center;
    color: #2196f3;
  }

  .sheetNameInput {
    width: 100%;
    .Input {
      background: #f7f7f7;
      border: 1px solid #f7f7f7 !important;
      border-radius: 4px;
      padding: 8px 12px 6px;
      font-size: 13px;

      :hover {
        border-color: #f2f2f2 !important;
        background: #f2f2f2;
      }
      :focus {
        border-color: #2196f3 !important;
        background: #fff;
      }
    }
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
          <RadioGroup
            className="mBottom24"
            data={CREATE_TYPE_RADIO_LIST}
            checkedValue={sheetNameData.sheetCreateType}
            onChange={sheetCreateType => onCreateTypeChange(sheetCreateType)}
          />
          {sheetNameData.sheetCreateType === CREATE_TYPE.NEW ? (
            <div className="sheetNameInput">
              <Input
                className="mBottom24 w100"
                value={sheetNameData.sheetName}
                onChange={sheetName => setSheetNameData({ sheetName })}
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
