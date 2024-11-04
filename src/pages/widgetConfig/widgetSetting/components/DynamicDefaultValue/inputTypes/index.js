import TextInput from './TextInput';
import NumberInput from './NumberInput';
import PhoneInput from './PhoneInput';
import EmailInput from './EmailInput';
import DepartmentInput from './DepartmentInput';
import DateInput from './DateInput';
import UserInput from './UserInput';
import RelateSheet from './RelateSheet';
import ScoreInput from './ScoreInput';
import OptionInput from './OptionInput';
import AreaInput from './AreaInput';
import SubSheet from './SubSheet';
import SwitchInput from './SwitchInput';
import TimeInput from './TimeInput';
import RoleInput from './RoleInput';
import CascaderSheet from './CascaderSheet';
import RichInput from './RichInput';
import ArrayInput from './ArrayInput';
import ObjectInput from './ObjectInput';
import AttachmentInput from './AttachmentInput';
import LocationInput from './LocationInput';

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
