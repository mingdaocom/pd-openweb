import Dialog from './Dialog';
import confirm from './Confirm';
import promise from './Promise';
import DialogBase from './DialogBase';

Dialog.confirm = confirm;
Dialog.promise = promise;
Dialog.DialogBase = DialogBase;

export default Dialog;
