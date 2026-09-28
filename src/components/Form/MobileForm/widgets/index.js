import { lazy } from 'react';
import Area from './Area';
import BarCode from './BarCode';
import Check from './Check';
import CheckBox from './Checkbox';
import DateWidget from './Date';
import DateCalc from './DateCalc';
import DateRange from './DateRange';
import DepartmentSelect from './DepartmentSelect';
import Dropdown from './Dropdown';
import Email from './Email';
import FormulaFunc from './FormulaFunc';
import ID from './ID';
import MobilePhone from './MobilePhone';
import Number from './Number';
import OrgRole from './OrgRole';
import Radio from './Radio';
import Range from './Range';
import Readonly from './Readonly';
import Section from './Section';
import SplitLine from './SplitLine';
import Subtotal from './Subtotal';
import TelPhone from './TelPhone';
import Textarea from './Textarea';
import Time from './Time';
import UserSelect from './UserSelect';

const Attachment = lazy(() => import('./Attachment'));
const Cascader = lazy(() => import('./Cascader'));
const Embed = lazy(() => import('./Embed'));
const Location = lazy(() => import('./Location'));
const OCR = lazy(() => import('./OCR'));
const RelateRecord = lazy(() => import('./RelateRecord'));
const RelationSearch = lazy(() => import('./RelationSearch'));
const RichText = lazy(() => import('./RichText'));
const Search = lazy(() => import('./Search'));
const Signature = lazy(() => import('./Signature'));
const SubList = lazy(() => import('./SubList'));

export default {
  TEXTAREA: Textarea,
  EMAIL: Email,
  MOBILE_PHONE: MobilePhone,
  TEL_PHONE: TelPhone,
  NUMBER: Number,
  READONLY: Readonly,
  DATECALC: DateCalc,
  FormulaFunc: FormulaFunc,
  SUBTOTAL: Subtotal,
  DATE: DateWidget,
  Time: Time,
  DATE_RANGE: DateRange,
  AREA: Area,
  RADIO: Radio,
  DROP_DOWN: Dropdown,
  CHECKBOX: CheckBox,
  USER_SELECT: UserSelect,
  DEPARTMENT_SELECT: DepartmentSelect,
  OrgRole: OrgRole,
  RANGE: Range,
  RICH_TEXT: RichText,
  ID: ID,
  CHECK: Check,
  Embed: Embed,
  SIGNATURE: Signature,
  BarCode: BarCode,
  Section: Section,
  SplitLine: SplitLine,
  LOCATION: Location,
  OCR: OCR,
  ATTACHMENT: Attachment,
  Search: Search,
  Cascader: Cascader,
  RELATE_RECORD: RelateRecord,
  SUBLIST: SubList,
  RelationSearch: RelationSearch,
};
