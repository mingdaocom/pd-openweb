export function getCodeForSave({ editorCode, stateCode }) {
  return editorCode === undefined ? stateCode : editorCode;
}

export function shouldSyncCodeMirrorContent({ codeChanged, fullCodeChanged, changedFromEditor }) {
  return fullCodeChanged || (codeChanged && !changedFromEditor);
}
