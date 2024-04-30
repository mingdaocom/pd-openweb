import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Support, Icon, Tooltip, CheckboxGroup, Checkbox, SvgIcon } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';

const UserInfoCon = styled.div`
  padding: 0 40px;
  overflow: auto;
  height: 100%;
  .worksheetInfoBox {
    height: 71px;
    border: 1px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 26px;
  }
  .editBtn {
    width: 66px;
    height: 31px;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #dddddd;
    text-align: center;
    line-height: 31px;
    margin-left: auto;
    cusor: pointer;
  }
  .checkbox-userinfo {
    width: fit-content;
    margin-bottom: 16px;
  }
`;

export default function UserExtendInfo(props) {
  const { data, onChangeStep, appId } = props;
  const { worksheetId, extendAttrs, userControlId, status } = data.appExtendAttr;
  const [checked, setChecked] = useState(extendAttrs || []);
  const openWorksheet = () => {
    homeAppAjax.getAppSimpleInfo({ workSheetId: worksheetId }).then(({ appId, appSectionId }) => {
      window.open(`/app/${appId}/${appSectionId}/${worksheetId}`);
    });
  };

  const saveFn = ext => {
    worksheetAjax
      .saveAppExtendAttr({
        appId: appId,
        worksheetId: worksheetId,
        userControlId: userControlId,
        extendAttrs: ext,
        status: status,
      })
      .then(res => {})
      .catch(err => alert(err));
  };

  const changeCheckedValue = (ck, value) => {
    let list = [];

    if (ck) {
      list = checked.filter(l => l !== value);
    } else {
      list = checked.concat(value);
    }

    setChecked(list);
    saveFn(list);
  };

  return (
    <UserInfoCon>
      <h3 className="mTop35 Font17 Bold">{_l('用户扩展信息表')}</h3>
      <div className="userExtendInfo-desc Gray_9e mTop13">
        {_l(
          '通过工作表管理应用成员额外的扩展信息字段，在角色权限、筛选器中可以使用用户的扩展信息字段来作为动态筛选条件',
        )}
        <Support className="help" type={3} href="https://help.mingdao.com/role/extended-info" text={_l('帮助')} />
      </div>
      <div className="worksheetInfoBox mTop16">
        <SvgIcon url={data.iconUrl} fill="#757575" className="mRight8" size={24} />
        {data.worksheetName || ''}
        <Icon icon="task-new-detail" className="mLeft8 Gray_75 pointer ThemeHoverColor3" onClick={openWorksheet} />
        <span className="editBtn pointer ThemeHoverColor3 ThemeHoverBorderColor3" onClick={() => onChangeStep(2)}>
          {_l('编辑')}
        </span>
      </div>
      <div className="mTop30 Font14 Bold">{_l('作为权限标签的扩展信息字段')}</div>
      <div className="desc Gray_75 mBottom25 mTop16">
        {_l(
          '仅支持关联记录类型字段（包括本表记录），最多可设置3个字段。当其他工作表的记录也关联了相同信息时，可以在角色中设置为用户拥有记录权限',
        )}
      </div>
      <div>
        {[
          data.optionalControls.find(o => o.id === 'currentworkshet'),
          ...data.optionalControls.filter(o => o.id !== 'currentworkshet'),
        ]
          .filter((l, index) => index < 1000)
          .map(item => {
            return (
              <Checkbox
                className="checkbox-userinfo"
                checked={checked.indexOf(item.id) > -1}
                onClick={changeCheckedValue}
                value={item.id}
                text={
                  item.id === 'currentworkshet' ? <span>{`${data.worksheetName} (${_l('本表')})`}</span> : item.name
                }
                disabled={checked.indexOf(item.id) < 0 && checked.length === 3}
              />
            );
          })}
      </div>
    </UserInfoCon>
  );
}
