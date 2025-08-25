import React from 'react';
import _ from 'lodash';
import { shape } from 'prop-types';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { getType } from '../utils';
import Areas from './Areas';
import Cascader from './Cascader';
import CheckboxComp from './CheckboxComp';
import DateTime from './DateTime';
import Departments from './Departments';
import Number from './Number';
import Options from './Options';
import OrgRole from './OrgRole';
import RelateRecord from './RelateRecord';
import Text from './Text';
import Time from './Time';
import UnNormal from './UnNormal';
import Users from './Users';

const Comps = {};

function mapToComp(keys, Comp) {
  keys.forEach(key => (Comps[key] = Comp));
}

export const TextTypes = [
  WIDGETS_TO_API_TYPE_ENUM.TEXT, // 文本
  WIDGETS_TO_API_TYPE_ENUM.TELEPHONE, // 电话号码
  WIDGETS_TO_API_TYPE_ENUM.MOBILE_PHONE, // 手机号码
  WIDGETS_TO_API_TYPE_ENUM.EMAIL, // 邮件地址
  WIDGETS_TO_API_TYPE_ENUM.CRED, // 证件
  WIDGETS_TO_API_TYPE_ENUM.CONCATENATE, // 文本组合
  WIDGETS_TO_API_TYPE_ENUM.AUTO_ID, // 自动编号
];

mapToComp(TextTypes, Text);

export const NumberTypes = [
  WIDGETS_TO_API_TYPE_ENUM.NUMBER, // 数值
  WIDGETS_TO_API_TYPE_ENUM.MONEY, // 金额
  WIDGETS_TO_API_TYPE_ENUM.FORMULA_NUMBER, // 公式
];

mapToComp(NumberTypes, Number);

export const RelateRecordTypes = [
  WIDGETS_TO_API_TYPE_ENUM.RELATE_SHEET, // 关联
];
mapToComp(RelateRecordTypes, RelateRecord);

export const CascaderTypes = [
  WIDGETS_TO_API_TYPE_ENUM.CASCADER, // 级联
];
mapToComp(CascaderTypes, Cascader);

export const OptionsTypes = [
  WIDGETS_TO_API_TYPE_ENUM.FLAT_MENU, // 单选
  WIDGETS_TO_API_TYPE_ENUM.MULTI_SELECT, // 多选
  WIDGETS_TO_API_TYPE_ENUM.DROP_DOWN, // 下拉
];

mapToComp(OptionsTypes, Options);

export const CheckboxCompTypes = [
  WIDGETS_TO_API_TYPE_ENUM.SWITCH, // 检查框
];

mapToComp(CheckboxCompTypes, CheckboxComp);

export const DateTimeTypes = [
  WIDGETS_TO_API_TYPE_ENUM.DATE, // 日期
  WIDGETS_TO_API_TYPE_ENUM.DATE_TIME, // 日期时间
];
mapToComp(DateTimeTypes, DateTime);

export const TimeTypes = [
  WIDGETS_TO_API_TYPE_ENUM.TIME, //  时间
];
mapToComp(TimeTypes, Time);

export const UsersTypes = [
  WIDGETS_TO_API_TYPE_ENUM.USER_PICKER, // 成员
];
mapToComp(UsersTypes, Users);

export const DepartmentsTypes = [
  WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, // 部门
];
mapToComp(DepartmentsTypes, Departments);

export const RogRoleTypes = [
  WIDGETS_TO_API_TYPE_ENUM.ORG_ROLE, // 组织角色
];
mapToComp(RogRoleTypes, OrgRole);

export const AreasTypes = [
  WIDGETS_TO_API_TYPE_ENUM.AREA_PROVINCE, // 地区 省
  WIDGETS_TO_API_TYPE_ENUM.AREA_CITY, // 地区 省-市
  WIDGETS_TO_API_TYPE_ENUM.AREA_COUNTY, // 地区 省-市-县
];
mapToComp(AreasTypes, Areas);

mapToComp([-10000], UnNormal); // 异常状态
export default function Input(props) {
  const { advancedSetting = {} } = props;
  const { allowitem } = advancedSetting;
  const isMultiple = String(allowitem) === '2';
  const type = getType(props.control);
  const Condition = Comps[type];

  return Condition ? (
    <Condition {...props} isMultiple={isMultiple} value={_.isUndefined(props.value) ? '' : props.value} />
  ) : (
    <span />
  );
}

Input.propTypes = {
  control: shape({}),
};
