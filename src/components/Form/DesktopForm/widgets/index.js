import { lazy } from 'react';
import Area from './Area';
import BarCode from './BarCode';
import Check from './Check';
import Checkbox from './Checkbox';
import DateWidgets from './Date';
import DateCalc from './DateCalc';
import DateRange from './DateRange';
import DepartmentSelect from './DepartmentSelect';
import Dropdown from './Dropdown';
import Email from './Email';
import FormulaFunc from './FormulaFunc';
import ID from './ID';
import MobilePhone from './MobilePhone';
import NumberWidgets from './Number';
import OrgRole from './OrgRole';
import Radio from './Radio';
import RangeWidgets from './Range';
import Readonly from './Readonly';
import Relation from './Relation';
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
  RADIO: Radio,
  CHECKBOX: Checkbox,
  DROP_DOWN: Dropdown,
  DATE: DateWidgets,
  DATE_RANGE: DateRange,
  AREA: Area,
  READONLY: Readonly,
  EMAIL: Email,
  ID: ID,
  TEL_PHONE: TelPhone,
  MOBILE_PHONE: MobilePhone,
  TEXTAREA: Textarea,
  NUMBER: NumberWidgets,
  CHECK: Check,
  ATTACHMENT: Attachment,
  USER_SELECT: UserSelect,
  DEPARTMENT_SELECT: DepartmentSelect,
  RANGE: RangeWidgets,
  RELATION: Relation,
  RELATE_RECORD: RelateRecord,
  SUBLIST: SubList,
  DATECALC: DateCalc,
  RICH_TEXT: RichText,
  SIGNATURE: Signature,
  LOCATION: Location,
  Cascader: Cascader,
  OCR: OCR,
  SUBTOTAL: Subtotal,
  Embed: Embed,
  Time: Time,
  BarCode: BarCode,
  OrgRole: OrgRole,
  Search: Search,
  RelationSearch: RelationSearch,
  Section: Section,
  SplitLine: SplitLine,
  FormulaFunc: FormulaFunc,
};
