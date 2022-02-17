import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Dialog, Input, Icon, Checkbox } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import { editPublicQuery } from 'src/api/publicWorksheet';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';

const Item = styled.div`
  margin-bottom: 20px;
  .Dropdown {
    width: 260px;
    .Menu {
      width: 100%;
    }
  }
  .MenuBox .Menu {
    width: auto;
  }
`;

const Title = styled.div`
  font-weight: 500;
  .required {
    color: #f44336;
    margin-top: -10px;
  }
`;

const Desp = styled.div`
  margin: 10px 0 15px;
  color: #9e9e9e;
`;

const TagCon = styled.ul`
  display: flex;
  flex-wrap: wrap;
  li {
    align-items: center;
    box-sizing: border-box;
    margin: 3px 6px 3px 0;
    border-radius: 3px;
    height: 24px;
    padding: 6px 5px 6px 10px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    &.error {
      background-color: #fef3f2;
      border-color: #e8dbd9;
      color: #b53026;
    }
    .tag {
      margin-right: 5px;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .delTag {
      color: rgba(0, 0, 0, 0.3);
      &:hover {
        color: rgba(0, 0, 0, 0.5);
      }
    }
  }
`;

const AVAILABLE_TYPES = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT,
  WIDGETS_TO_API_TYPE_ENUM.NUMBER,
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE,
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE,
  WIDGETS_TO_API_TYPE_ENUM.EMAIL,
  WIDGETS_TO_API_TYPE_ENUM.CRED,
];

export default function QueryConfigDialog(props) {
  const [tempQueryInfo, setTempQueryInfo] = useState({});
  const { queryInfo = {}, onClose, onSuccess } = props;
  const { title, queryControlIds = [], viewId, worksheet, exported } = { ...queryInfo, ...tempQueryInfo };
  return (
    <Dialog
      title={_l('设置查询链接')}
      style={{ width: '560px' }}
      overlayClosable={false}
      visible
      okDisabled={_.isEmpty(queryControlIds) || !viewId}
      onOk={() => {
        const params = {
          worksheetId: worksheet.worksheetId,
          ...{ ..._.pick(queryInfo, ['viewId', 'queryControlIds', 'title', 'exported']), ...tempQueryInfo },
        };
        if (!params.title) {
          params.title = _l('查询%0', queryInfo.worksheetName);
        }
        editPublicQuery(params).then(() => {
          alert(_l('设置成功'));
          onSuccess({ ...queryInfo, ...params });
          onClose();
        });
      }}
      onCancel={onClose}
    >
      <Item>
        <Title>
          {_l('查询视图')} <span className="required">*</span>
        </Title>
        <Desp>{_l('对所选视图下数据进行查询')}</Desp>
        <Dropdown
          value={viewId}
          data={worksheet.views.map(view => ({
            text: view.name,
            value: view.viewId,
          }))}
          border
          placeholder={_l('请选择视图')}
          onChange={value => setTempQueryInfo({ ...tempQueryInfo, viewId: value })}
        />
      </Item>
      <Item>
        <Title>
          {_l('查询条件')} <span className="required">*</span>
        </Title>
        <Desp>
          {_l(
            '选择作为查询条件的字段。如设置多个条件，则所有条件都为必填。只支持文本类型字段进行查询，如：学号、身份证号、手机号、订单编号',
          )}
        </Desp>
        <Dropdown
          className="queryConfigControlsDropdown w100"
          selectClose={false}
          data={worksheet.template.controls
            .filter(c => !_.find(queryControlIds, cid => cid === c.controlId) && _.includes(AVAILABLE_TYPES, c.type))
            .map(control => {
              return {
                text: <span>{control.controlName}</span>,
                searchText: control.controlName,
                value: control.controlId,
              };
            })}
          value={queryControlIds.length || undefined}
          border
          isAppendToBody
          placeholder={_l('请选择查询条件字段')}
          maxHeight={280}
          onChange={value => {
            setTempQueryInfo({
              ...tempQueryInfo,
              queryControlIds: _.uniqBy(queryControlIds.concat(value)),
            });
          }}
          renderTitle={() =>
            !!queryControlIds.length && (
              <TagCon>
                {queryControlIds.map(id => {
                  const control = _.find(worksheet.template.controls, item => item.controlId === id);
                  return (
                    <li key={id} className={cx('tagItem flexRow', { error: !control })}>
                      <span className="tag">{control ? control.controlName : _l('字段已删除')}</span>
                      <span
                        className="delTag"
                        onClick={e => {
                          e.stopPropagation();
                          setTempQueryInfo({
                            ...tempQueryInfo,
                            queryControlIds: queryControlIds.filter(cid => cid !== id),
                          });
                        }}
                      >
                        <Icon icon="close" className="pointer" />
                      </span>
                    </li>
                  );
                })}
              </TagCon>
            )
          }
        />
      </Item>
      <Item>
        <Title>{_l('页面标题')}</Title>
        <Desp>{_l('如：查询成绩单')}</Desp>
        <Input
          className="w100"
          value={title}
          onChange={value => setTempQueryInfo({ ...tempQueryInfo, title: value })}
        />
      </Item>
      <Item>
        <Title>{_l('设置')}</Title>
        <Desp></Desp>
        <Checkbox
          text={_l('允许导出数据')}
          checked={exported}
          onClick={() => setTempQueryInfo({ ...tempQueryInfo, exported: !exported })}
        />
      </Item>
    </Dialog>
  );
}

QueryConfigDialog.propTypes = {
  queryInfo: PropTypes.shape({}),
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};
