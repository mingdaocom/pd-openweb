import Action from './Action';
import AIGC from './AIGC';
import Api from './Api';
import ApiPackage from './ApiPackage';
import Approval from './Approval';
import ApprovalProcess from './ApprovalProcess';
import Authentication from './Authentication';
import Branch from './Branch';
import CC from './CC';
import Code from './Code';
import Delay from './Delay';
import Email from './Email';
import File from './File';
import FindSystem from './FindSystem';
import Formula from './Formula';
import GetMoreRecord from './GetMoreRecord';
import JSONParse from './JSONParse';
import Link from './Link';
import LoopProcess from './LoopProcess';
import Message from './Message';
import PBC from './PBC';
import Plugin from './Plugin';
import Push from './Push';
import Return from './Return';
import Search from './Search';
import Snapshot from './Snapshot';
import Start from './Start';
import SubProcess from './SubProcess';
import Template from './Template';
import WebHook from './WebHook';
import Write from './Write';

export default {
  0: Start,
  1: Branch,
  3: Write,
  4: Approval,
  5: CC,
  6: Action,
  7: Search,
  8: WebHook,
  9: Formula,
  10: Message,
  11: Email,
  12: Delay,
  13: GetMoreRecord,
  14: Code,
  15: Link,
  16: SubProcess,
  17: Push,
  18: File,
  19: Template,
  20: PBC,
  21: JSONParse,
  22: Authentication,
  23: Start,
  24: ApiPackage,
  25: Api,
  26: ApprovalProcess,
  27: CC,
  28: Snapshot,
  29: LoopProcess,
  30: Return,
  31: AIGC,
  32: Plugin,
  1000: FindSystem,
  1001: FindSystem,
};
