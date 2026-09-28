export function getMobileComposerState({ focused, text, isRecording, canSendWhenEmpty, hasAttachments, sendDisabled }) {
  const hasText = !!(text || '').trim();

  return {
    expanded: !!(focused || hasText || isRecording || canSendWhenEmpty || hasAttachments),
    showSend: !isRecording && !sendDisabled,
  };
}

export function getMobileComposerClassName(options) {
  const { isRecording, isLoading } = options;
  const { expanded, showSend } = getMobileComposerState(options);

  return [
    expanded && 'mobileMingoPromptInput--expanded',
    showSend && 'mobileMingoPromptInput--sendable',
    isRecording && 'mobileMingoPromptInput--recording',
    isLoading && 'mobileMingoPromptInput--loading',
  ]
    .filter(Boolean)
    .join(' ');
}
