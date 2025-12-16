export class SpeechSynthesizer {
  constructor(options = {}) {
    this.synth = window.speechSynthesis;
    this.voice = null;
    this.queue = [];
    this.speaking = false;
    this.bufferTimer = null;
    this.bufferDelay = options.bufferDelay || 200; // 缓冲延迟，默认200ms，可通过参数配置
    this.minChunkLength = 20; // 小于20字符的文本块会被缓冲

    // 默认朗读参数
    this.defaultOptions = {
      lang: 'zh-CN',
      pitch: 1,
      rate: 1,
      volume: 1,
      ...options,
    };

    this._loadVoices();
  }

  // 加载语音包
  _loadVoices() {
    try {
      if (this.synth) {
        this.synth.onvoiceschanged = () => {
          const voices = this.synth && this.synth.getVoices();
          this.voice = voices.find(v => v.lang === this.defaultOptions.lang) || voices[0];
        };
      }
    } catch (error) {
      console.error('loadVoices error', error);
    }
  }

  // 清除队列和当前播放
  clear() {
    this.queue = [];
    this.speaking = false;
    this.synth && this.synth.cancel();
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
  }

  // 播放一整段文字（非流式）
  speak(text, options = {}) {
    this.clear(); // 清除前面所有任务
    const utterance = this._createUtterance(text, options);
    this.synth && this.synth.speak(utterance);
  }

  // 播放流式文本，智能缓冲
  speakStream(textChunk, options = {}) {
    this.queue.push({ text: textChunk, options });

    // 如果文本块较大，立即处理
    if (textChunk.length >= this.minChunkLength) {
      this._flushBuffer();
      return;
    }

    // 如果没有在播放且队列不为空，立即开始
    if (!this.speaking) {
      this._flushBuffer();
      return;
    }

    // 小文本块使用缓冲策略
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
    }

    this.bufferTimer = setTimeout(() => {
      this._flushBuffer();
    }, this.bufferDelay);
  }

  // 立即播放缓冲区内容
  _flushBuffer() {
    if (this.bufferTimer) {
      clearTimeout(this.bufferTimer);
      this.bufferTimer = null;
    }
    this._processQueue();
  }

  // 强制播放当前队列（用于流结束时）
  finishStream() {
    this._flushBuffer();
  }

  // 创建语音单元
  _createUtterance(text, options = {}) {
    const { onEnd = () => {} } = options;
    const utter = new SpeechSynthesisUtterance(text);
    const merged = { ...this.defaultOptions, ...options };

    utter.voice = this.voice;
    utter.lang = merged.lang;
    utter.pitch = merged.pitch;
    utter.rate = merged.rate;
    utter.volume = merged.volume;

    utter.onend = () => {
      this.speaking = false;
      setTimeout(() => this._processQueue(), 20); // 减少间隔到20ms
      onEnd();
    };

    return utter;
  }

  // 处理播放队列，合并小块提高流畅度
  _processQueue() {
    if (this.speaking || this.queue.length === 0) return;

    // 合并队列中的内容来减少停顿
    const batchSize = Math.min(3, this.queue.length); // 最多合并3个文本块
    const batch = this.queue.splice(0, batchSize);
    const mergedText = batch.map(item => item.text).join('');
    const options = batch[0]?.options || {};

    const utterance = this._createUtterance(mergedText, options);
    this.speaking = true;
    this.synth && this.synth.speak(utterance);
  }

  // 合并队列内容为一个 utterance（保留此方法用于其他场景）
  mergeAndSpeakQueue() {
    if (this.speaking || this.queue.length === 0) return;
    const mergedText = this.queue.map(item => item.text).join('');
    const options = this.queue[0]?.options || {};
    this.queue = [];
    const utterance = this._createUtterance(mergedText, options);
    this.speaking = true;
    this.synth && this.synth.speak(utterance);
  }
}
