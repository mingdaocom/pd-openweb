import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Support, Icon, Tooltip, CheckboxGroup, Checkbox } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import worksheetAjax from 'src/api/worksheet';
import homeAppAjax from 'src/api/homeApp';

const UserInfoCon = styled.div`
  .worksheetInfoBox {
    width: 640px;
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
  .desc {
    width: 640px;
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
      .fail(err => alert(err));
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
      <h3 className="mTop35 Font14 Bold">{_l('用户扩展信息表')}</h3>
      <div className="worksheetInfoBox mTop16">
        <SvgIcon url={data.iconUrl} fill="#757575" className="mRight8" size={24} />
        {data.worksheetName || ''}
        <Icon icon="task-new-detail" className="mLeft8 Gray_75 pointer ThemeHoverColor3" onClick={openWorksheet} />
        <span className="editBtn pointer ThemeHoverColor3" onClick={() => onChangeStep(2)}>
          {_l('编辑')}
        </span>
      </div>
      <div className="mTop30 Font14 Bold">{_l('选择用户扩展信息字段作为用户权限标签')}</div>
      <div className="desc Gray_75 mBottom25 mTop16">
        {_l(
          '选择用户扩展信息表中作为用户权限标签字段（仅支持关联记录字段），可启用的字段上限为3个，每个标签字段的有效值上限为1000个，超过时默认取前1000个，当其他工作表记录也关联了此标签字段时，可以在角色权限、或筛选器中过滤出当前用户对应标签的记录',
        )}
        <Support className="help" type={3} href="https://help.mingdao.com/zh/user4.html" text={_l('帮助')} />
      </div>
      <div>
        {data.optionalControls
          .filter((l, index) => index < 1000)
          .map(item => {
            return (
              <Checkbox
                className="checkbox-userinfo"
                checked={checked.indexOf(item.id) > -1}
                onClick={changeCheckedValue}
                value={item.id}
                text={item.name}
                disabled={checked.indexOf(item.id) < 0 && checked.length === 3}
              />
            );
          })}
      </div>
    </UserInfoCon>
  );
}
