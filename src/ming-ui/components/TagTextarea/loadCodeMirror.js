let codeMirrorPromise;
const modePromises = {};

const MODE_LOADERS = {
  javascript: () => import('codemirror/mode/javascript/javascript'),
  xml: () => import('codemirror/mode/xml/xml'),
};

function loadMode(mode) {
  if (!mode || !MODE_LOADERS[mode]) return Promise.resolve();

  if (!modePromises[mode]) {
    modePromises[mode] = MODE_LOADERS[mode]();
  }

  return modePromises[mode];
}

export default function loadCodeMirror(mode) {
  if (!codeMirrorPromise) {
    codeMirrorPromise = Promise.all([
      import('codemirror'),
      import('codemirror/addon/display/placeholder'),
      import('codemirror/lib/codemirror.css'),
    ]).then(([module]) => module.default || module);
  }

  return Promise.all([codeMirrorPromise, loadMode(mode)]).then(([CodeMirror]) => CodeMirror);
}
