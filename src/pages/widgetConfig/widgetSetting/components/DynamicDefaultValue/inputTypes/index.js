import AreaInput from './AreaInput';
import ArrayInput from './ArrayInput';
import AttachmentInput from './AttachmentInput';
import CascaderSheet from './CascaderSheet';
import DateInput from './DateInput';
import DepartmentInput from './DepartmentInput';
import EmailInput from './EmailInput';
import LocationInput from './LocationInput';
import NumberInput from './NumberInput';
import ObjectInput from './ObjectInput';
import OptionInput from './OptionInput';
import PhoneInput from './PhoneInput';
import RelateSheet from './RelateSheet';
import RichInput from './RichInput';
import RoleInput from './RoleInput';
import ScoreInput from './ScoreInput';
import SubSheet from './SubSheet';
import SwitchInput from './SwitchInput';
import TextInput from './TextInput';
import TimeInput from './TimeInput';
import UserInput from './UserInput';

export const TYPE_TO_COMP = {
  text: TextInput,
  number: NumberInput,
  phone: PhoneInput,
  email: EmailInput,
  cred: EmailInput,
  department: DepartmentInput,
  date: DateInput,
  user: UserInput,
  relateSheet: RelateSheet,
  score: ScoreInput,
  option: OptionInput,
  area: AreaInput,
  subList: SubSheet,
  switch: SwitchInput,
  time: TimeInput,
  role: RoleInput,
  cascader: CascaderSheet,
  richtext: RichInput,
  array: ArrayInput,
  array_object: ObjectInput,
  attachment: AttachmentInput,
  location: LocationInput,
};
