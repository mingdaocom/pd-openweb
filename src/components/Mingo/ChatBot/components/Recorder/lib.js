export default function init() {
  'use strict';
  function i(e) {
    var t = 2 * e.length,
      t = new ArrayBuffer(t),
      i = new DataView(t);
    let s = 0;
    for (let t = 0; t < e.length; t++, s += 2) {
      var o = Math.max(-1, Math.min(1, e[t]));
      i.setInt16(s, o < 0 ? 32768 * o : 32767 * o, !0);
    }
    return i;
  }
  function s(t, e = 44100) {
    var i = new Float32Array(t),
      s = Math.round(i.length * (16e3 / e)),
      o = new Float32Array(s),
      n = (i.length - 1) / (s - 1);
    o[0] = i[0];
    for (let t = 1; t < s - 1; t++) {
      var r = t * n,
        a = Math.floor(r).toFixed(),
        c = Math.ceil(r).toFixed();
      o[t] = i[a] + (i[c] - i[a]) * (r - a);
    }
    return (o[s - 1] = i[i.length - 1]), o;
  }
  const o = `
class MyProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    this.audioData = [];
    this.sampleCount = 0;
    this.bitCount = 0;
    this.preTime = 0;
  }

  process(inputs) {
    // 去处理音频数据
    if (inputs[0][0]) {
      const output = ${s}(inputs[0][0], sampleRate);
      this.sampleCount += 1;
      const audioData = ${i}(output);
      this.bitCount += 1;
      const data = [...new Int8Array(audioData.buffer)];
      this.audioData = this.audioData.concat(data);
      if (new Date().getTime() - this.preTime > 100) {
        this.port.postMessage({
          audioData: new Int8Array(this.audioData),
          sampleCount: this.sampleCount,
          bitCount: this.bitCount
        });
        this.preTime = new Date().getTime();
        this.audioData = [];
      }
        return true;
      }
  }
}

registerProcessor('my-processor', MyProcessor);
`,
    n = 'WebRecorder';
  navigator.getUserMedia =
    navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  class r {
    constructor(t, e, i) {
      (this.audioData = []),
        (this.allAudioData = []),
        (this.stream = null),
        (this.audioContext = null),
        (this.requestId = t),
        (this.frameTime = []),
        (this.frameCount = 0),
        (this.sampleCount = 0),
        (this.bitCount = 0),
        (this.mediaStreamSource = null),
        (this.isLog = i),
        (this.params = e);
    }
    static isSupportMediaDevicesMedia() {
      return !!(navigator.getUserMedia || (navigator.mediaDevices && navigator.mediaDevices.getUserMedia));
    }
    static isSupportUserMediaMedia() {
      return !!navigator.getUserMedia;
    }
    static isSupportAudioContext() {
      return 'undefined' != typeof AudioContext || 'undefined' != typeof webkitAudioContext;
    }
    static isSupportMediaStreamSource(t, e) {
      return 'function' == typeof e.createMediaStreamSource;
    }
    static isSupportAudioWorklet(t) {
      return t.audioWorklet && 'function' == typeof t.audioWorklet.addModule && 'undefined' != typeof AudioWorkletNode;
    }
    static isSupportCreateScriptProcessor(t, e) {
      return 'function' == typeof e.createScriptProcessor;
    }
    start() {
      (this.frameTime = []),
        (this.frameCount = 0),
        (this.allAudioData = []),
        (this.audioData = []),
        (this.sampleCount = 0),
        (this.bitCount = 0),
        (this.getDataCount = 0),
        (this.audioContext = null),
        (this.mediaStreamSource = null),
        (this.stream = null),
        (this.preTime = 0);
      try {
        r.isSupportAudioContext()
          ? (this.audioContext = new (window.AudioContext || window.webkitAudioContext)())
          : (this.isLog && console.log(this.requestId, '浏览器不支持AudioContext', n),
            this.OnError('浏览器不支持AudioContext'));
      } catch (t) {
        this.isLog && console.log(this.requestId, '浏览器不支持webAudioApi相关接口', t, n),
          this.OnError('浏览器不支持webAudioApi相关接口');
      }
      this.getUserMedia(this.requestId, this.getAudioSuccess, this.getAudioFail);
    }
    stop() {
      (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) ||
        (this.audioContext && this.audioContext.suspend()),
        this.audioContext && this.audioContext.suspend(),
        this.isLog &&
          console.log(
            this.requestId,
            `webRecorder stop ${this.sampleCount}/${this.bitCount}/` + this.getDataCount,
            JSON.stringify(this.frameTime),
            n,
          ),
        this.OnStop(this.allAudioData);
    }
    destroyStream() {
      this.stream &&
        (this.stream.getTracks().map(t => {
          t.stop();
        }),
        (this.stream = null));
    }
    async getUserMedia(e, i, s) {
      let t = { echoCancellation: !0 };
      var o = {
        audio: (t = this.params && 'false' === String(this.params.echoCancellation) ? { echoCancellation: !1 } : t),
        video: !1,
      };
      r.isSupportMediaDevicesMedia()
        ? navigator.mediaDevices
            .getUserMedia(o)
            .then(t => {
              (this.stream = t), i.call(this, e, t);
            })
            .catch(t => {
              s.call(this, e, t);
            })
        : r.isSupportUserMediaMedia()
          ? navigator.getUserMedia(
              o,
              t => {
                (this.stream = t), i.call(this, e, t);
              },
              function (t) {
                s.call(this, e, t);
              },
            )
          : (navigator.userAgent.toLowerCase().match(/chrome/) && location.origin.indexOf('https://') < 0
              ? (this.isLog &&
                  console.log(
                    this.requestId,
                    'chrome下获取浏览器录音功能，因为安全性问题，需要在localhost或127.0.0.1或https下才能获取权限',
                    n,
                  ),
                this.OnError(
                  'chrome下获取浏览器录音功能，因为安全性问题，需要在localhost或127.0.0.1或https下才能获取权限',
                ))
              : (this.isLog && console.log(this.requestId, '无法获取浏览器录音功能，请升级浏览器或使用chrome', n),
                this.OnError('无法获取浏览器录音功能，请升级浏览器或使用chrome')),
            this.audioContext && this.audioContext.close());
    }
    async getAudioSuccess(t, e) {
      if (!this.audioContext) return !1;
      this.mediaStreamSource && (this.mediaStreamSource.disconnect(), (this.mediaStreamSource = null)),
        (this.audioTrack = e.getAudioTracks()[0]);
      e = new MediaStream();
      e.addTrack(this.audioTrack),
        (this.mediaStreamSource = this.audioContext.createMediaStreamSource(e)),
        r.isSupportMediaStreamSource(t, this.audioContext)
          ? r.isSupportAudioWorklet(this.audioContext)
            ? this.audioWorkletNodeDealAudioData(this.mediaStreamSource, t)
            : this.scriptNodeDealAudioData(this.mediaStreamSource, t)
          : (this.isLog && console.log(this.requestId, '不支持MediaStreamSource', n),
            this.OnError('不支持MediaStreamSource'));
    }
    getAudioFail(t, e) {
      e &&
        e.err &&
        'NotAllowedError' === e.err.name &&
        this.isLog &&
        console.log(t, '授权失败', JSON.stringify(e.err), n),
        this.isLog && console.log(this.requestId, 'getAudioFail', JSON.stringify(e), n),
        this.OnError(e),
        this.stop();
    }
    scriptNodeDealAudioData(t, e) {
      r.isSupportCreateScriptProcessor(e, this.audioContext)
        ? ((e = this.audioContext.createScriptProcessor(1024, 1, 1)),
          this.mediaStreamSource && this.mediaStreamSource.connect(e),
          e && e.connect(this.audioContext.destination),
          (e.onaudioprocess = t => {
            this.getDataCount += 1;
            var t = i(s(t.inputBuffer.getChannelData(0), this.audioContext.sampleRate));
            this.audioData.push(...new Int8Array(t.buffer)),
              this.allAudioData.push(...new Int8Array(t.buffer)),
              100 < new Date().getTime() - this.preTime &&
                (this.frameTime.push(Date.now() + '-' + this.frameCount),
                (this.frameCount += 1),
                (this.preTime = new Date().getTime()),
                (t = new Int8Array(this.audioData)),
                this.OnReceivedData(t),
                (this.audioData = []),
                (this.sampleCount += 1),
                (this.bitCount += 1));
          }))
        : this.isLog && console.log(this.requestId, '不支持createScriptProcessor', n);
    }
    async audioWorkletNodeDealAudioData(e, i) {
      try {
        var t = window.URL.createObjectURL(new Blob([o], { type: 'text/javascript' })),
          s =
            (await this.audioContext.audioWorklet.addModule(t),
            new AudioWorkletNode(this.audioContext, 'my-processor', {
              numberOfInputs: 1,
              numberOfOutputs: 1,
              channelCount: 1,
            }));
        (s.onprocessorerror = t => (this.scriptNodeDealAudioData(e, this.requestId), !1)),
          (s.port.onmessage = t => {
            this.frameTime.push(Date.now() + '-' + this.frameCount),
              this.OnReceivedData(t.data.audioData),
              (this.frameCount += 1),
              this.allAudioData.push(...t.data.audioData),
              (this.sampleCount = t.data.sampleCount),
              (this.bitCount = t.data.bitCount);
          }),
          (s.port.onmessageerror = t => (this.scriptNodeDealAudioData(e, i), !1)),
          e && e.connect(s).connect(this.audioContext.destination);
      } catch (t) {
        this.isLog && console.log(this.requestId, 'audioWorkletNodeDealAudioData catch error', JSON.stringify(t), n),
          this.OnError(t);
      }
    }
    OnReceivedData(t) {}
    OnError(t) {}
    OnStop(t) {}
  }
  'undefined' != typeof window && (window.WebRecorder = r);
  (a = Math),
    (g = (S = {}).lib = {}),
    (e = g.Base =
      {
        extend: function (t) {
          C.prototype = this;
          var e = new C();
          return (
            t && e.mixIn(t),
            e.hasOwnProperty('init') ||
              (e.init = function () {
                e.$super.init.apply(this, arguments);
              }),
            ((e.init.prototype = e).$super = this),
            e
          );
        },
        create: function () {
          var t = this.extend();
          return t.init.apply(t, arguments), t;
        },
        init: function () {},
        mixIn: function (t) {
          for (var e in t) t.hasOwnProperty(e) && (this[e] = t[e]);
          t.hasOwnProperty('toString') && (this.toString = t.toString);
        },
        clone: function () {
          return this.init.prototype.extend(this);
        },
      }),
    (c = g.WordArray =
      e.extend({
        init: function (t, e) {
          (t = this.words = t || []), (this.sigBytes = null != e ? e : 4 * t.length);
        },
        toString: function (t) {
          return (t || h).stringify(this);
        },
        concat: function (t) {
          var e = this.words,
            i = t.words,
            s = this.sigBytes;
          if (((t = t.sigBytes), this.clamp(), s % 4))
            for (var o = 0; o < t; o++)
              e[(s + o) >>> 2] |= ((i[o >>> 2] >>> (24 - (o % 4) * 8)) & 255) << (24 - ((s + o) % 4) * 8);
          else if (65535 < i.length) for (o = 0; o < t; o += 4) e[(s + o) >>> 2] = i[o >>> 2];
          else e.push.apply(e, i);
          return (this.sigBytes += t), this;
        },
        clamp: function () {
          var t = this.words,
            e = this.sigBytes;
          (t[e >>> 2] &= 4294967295 << (32 - (e % 4) * 8)), (t.length = a.ceil(e / 4));
        },
        clone: function () {
          var t = e.clone.call(this);
          return (t.words = this.words.slice(0)), t;
        },
        random: function (t) {
          for (var e = [], i = 0; i < t; i += 4) e.push((4294967296 * a.random()) | 0);
          return new c.init(e, t);
        },
      })),
    (w = S.enc = {}),
    (h = w.Hex =
      {
        stringify: function (t) {
          var e = t.words;
          t = t.sigBytes;
          for (var i = [], s = 0; s < t; s++) {
            var o = (e[s >>> 2] >>> (24 - (s % 4) * 8)) & 255;
            i.push((o >>> 4).toString(16)), i.push((15 & o).toString(16));
          }
          return i.join('');
        },
        parse: function (t) {
          for (var e = t.length, i = [], s = 0; s < e; s += 2)
            i[s >>> 3] |= parseInt(t.substr(s, 2), 16) << (24 - (s % 8) * 4);
          return new c.init(i, e / 2);
        },
      }),
    (u = w.Latin1 =
      {
        stringify: function (t) {
          var e = t.words;
          t = t.sigBytes;
          for (var i = [], s = 0; s < t; s++) i.push(String.fromCharCode((e[s >>> 2] >>> (24 - (s % 4) * 8)) & 255));
          return i.join('');
        },
        parse: function (t) {
          for (var e = t.length, i = [], s = 0; s < e; s++) i[s >>> 2] |= (255 & t.charCodeAt(s)) << (24 - (s % 4) * 8);
          return new c.init(i, e);
        },
      }),
    (d = w.Utf8 =
      {
        stringify: function (t) {
          try {
            return decodeURIComponent(escape(u.stringify(t)));
          } catch (t) {
            throw Error('Malformed UTF-8 data');
          }
        },
        parse: function (t) {
          return u.parse(unescape(encodeURIComponent(t)));
        },
      }),
    (t = g.BufferedBlockAlgorithm =
      e.extend({
        reset: function () {
          (this._data = new c.init()), (this._nDataBytes = 0);
        },
        _append: function (t) {
          'string' == typeof t && (t = d.parse(t)), this._data.concat(t), (this._nDataBytes += t.sigBytes);
        },
        _process: function (t) {
          var e = this._data,
            i = e.words,
            s = e.sigBytes,
            o = this.blockSize,
            n = s / (4 * o),
            n = t ? a.ceil(n) : a.max((0 | n) - this._minBufferSize, 0),
            s = a.min(4 * (t = n * o), s);
          if (t) {
            for (var r = 0; r < t; r += o) this._doProcessBlock(i, r);
            (r = i.splice(0, t)), (e.sigBytes -= s);
          }
          return new c.init(r, s);
        },
        clone: function () {
          var t = e.clone.call(this);
          return (t._data = this._data.clone()), t;
        },
        _minBufferSize: 0,
      })),
    (g.Hasher = t.extend({
      cfg: e.extend(),
      init: function (t) {
        (this.cfg = this.cfg.extend(t)), this.reset();
      },
      reset: function () {
        t.reset.call(this), this._doReset();
      },
      update: function (t) {
        return this._append(t), this._process(), this;
      },
      finalize: function (t) {
        return t && this._append(t), this._doFinalize();
      },
      blockSize: 16,
      _createHelper: function (i) {
        return function (t, e) {
          return new i.init(e).finalize(t);
        };
      },
      _createHmacHelper: function (i) {
        return function (t, e) {
          return new l.HMAC.init(i, e).finalize(t);
        };
      },
    })),
    (l = S.algo = {});
  var a,
    e,
    c,
    h,
    u,
    d,
    t,
    l,
    g,
    p,
    f,
    m,
    S,
    y,
    w = S;
  function C() {}
  (p = (S = (g = w).lib).WordArray),
    (f = S.Hasher),
    (m = []),
    (S = g.algo.SHA1 =
      f.extend({
        _doReset: function () {
          this._hash = new p.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
        },
        _doProcessBlock: function (t, e) {
          for (var i, s = this._hash.words, o = s[0], n = s[1], r = s[2], a = s[3], c = s[4], h = 0; h < 80; h++)
            (m[h] = h < 16 ? 0 | t[e + h] : ((i = m[h - 3] ^ m[h - 8] ^ m[h - 14] ^ m[h - 16]) << 1) | (i >>> 31)),
              (i = ((o << 5) | (o >>> 27)) + c + m[h]),
              (i =
                h < 20
                  ? i + (1518500249 + ((n & r) | (~n & a)))
                  : h < 40
                    ? i + (1859775393 + (n ^ r ^ a))
                    : h < 60
                      ? i + (((n & r) | (n & a) | (r & a)) - 1894007588)
                      : i + ((n ^ r ^ a) - 899497514)),
              (c = a),
              (a = r),
              (r = (n << 30) | (n >>> 2)),
              (n = o),
              (o = i);
          (s[0] = (s[0] + o) | 0),
            (s[1] = (s[1] + n) | 0),
            (s[2] = (s[2] + r) | 0),
            (s[3] = (s[3] + a) | 0),
            (s[4] = (s[4] + c) | 0);
        },
        _doFinalize: function () {
          var t = this._data,
            e = t.words,
            i = 8 * this._nDataBytes,
            s = 8 * t.sigBytes;
          return (
            (e[s >>> 5] |= 128 << (24 - (s % 32))),
            (e[14 + (((64 + s) >>> 9) << 4)] = Math.floor(i / 4294967296)),
            (e[15 + (((64 + s) >>> 9) << 4)] = i),
            (t.sigBytes = 4 * e.length),
            this._process(),
            this._hash
          );
        },
        clone: function () {
          var t = f.clone.call(this);
          return (t._hash = this._hash.clone()), t;
        },
      })),
    (g.SHA1 = f._createHelper(S)),
    (g.HmacSHA1 = f._createHmacHelper(S)),
    (y = w.enc.Utf8),
    (w.algo.HMAC = w.lib.Base.extend({
      init: function (t, e) {
        (t = this._hasher = new t.init()), 'string' == typeof e && (e = y.parse(e));
        var i = t.blockSize,
          s = 4 * i;
        (e = e.sigBytes > s ? t.finalize(e) : e).clamp();
        for (
          var t = (this._oKey = e.clone()), e = (this._iKey = e.clone()), o = t.words, n = e.words, r = 0;
          r < i;
          r++
        )
          (o[r] ^= 1549556828), (n[r] ^= 909522486);
        (t.sigBytes = e.sigBytes = s), this.reset();
      },
      reset: function () {
        var t = this._hasher;
        t.reset(), t.update(this._iKey);
      },
      update: function (t) {
        return this._hasher.update(t), this;
      },
      finalize: function (t) {
        var e = this._hasher;
        return (t = e.finalize(t)), e.reset(), e.finalize(this._oKey.clone().concat(t));
      },
    })),
    window && (window.CryptoJSTest = w);
  const x = ['appid', 'secretkey', 'signCallback', 'echoCancellation'];
  const O = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (t) {
      var e = (16 * Math.random()) | 0;
      return ('x' === t ? e : (3 & e) | 8).toString(16);
    });
  async function k(t, e) {
    if (!e.appid || !e.secretid)
      return t.isLog && console.log(t.requestId, '请确认是否填入账号信息', v), t.OnError('请确认是否填入账号信息'), !1;
    t = (function (t, i) {
      let s = '',
        e = 'asr.cloud.tencent.com/asr/v2/';
      t.appid && (e += t.appid);
      var o = Object.keys(i);
      o.sort();
      for (let t = 0, e = o.length; t < e; t++) s += `&${o[t]}=` + i[o[t]];
      return e + '?' + s.slice(1);
    })(
      e,
      await (async function (t) {
        let e = {};
        var i = new Date().getTime(),
          s = await new Promise((t, e) => {
            try {
              const i = new XMLHttpRequest();
              i.open('GET', 'https://asr.cloud.tencent.com/server_time', !0),
                i.send(),
                (i.onreadystatechange = function () {
                  4 === i.readyState && 200 === i.status && t(i.responseText);
                });
            } catch (t) {
              e(t);
            }
          }),
          o =
            ((e.secretid = t.secretid || ''),
            (e.engine_model_type = t.engine_model_type || '16k_zh'),
            (e.timestamp = parseInt(s) || Math.round(i / 1e3)),
            (e.expired = Math.round(i / 1e3) + 86400),
            (e.nonce = Math.round(i / 1e5)),
            (e.voice_id = O()),
            (e.voice_format = t.voice_format || 1),
            { ...t });
        for (let t = 0, e = x.length; t < e; t++) o.hasOwnProperty(x[t]) && delete o[x[t]];
        return (e = { ...o, ...e });
      })(e),
    );
    let i = '';
    return (
      (i = e.signCallback
        ? e.signCallback(t)
        : (function (t, e) {
            (e = window.CryptoJSTest.HmacSHA1(e, t)),
              (t = (function (e) {
                let i = '';
                for (let t = 0; t < e.length; t++) i += String.fromCharCode(e[t]);
                return i;
              })(
                (function (t) {
                  var e = t.words,
                    i = t.sigBytes,
                    s = new Uint8Array(i);
                  for (let t = 0; t < i; t++) s[t] = (e[t >>> 2] >>> (24 - (t % 4) * 8)) & 255;
                  return s;
                })(e),
              ));
            return window.btoa(t);
          })(e.secretkey, t)),
      `wss://${t}&signature=` + encodeURIComponent(i)
    );
  }
  const v = 'SpeechRecognizer';
  class R {
    constructor(t, e, i) {
      (this.socket = null),
        (this.isSignSuccess = !1),
        (this.isSentenceBegin = !1),
        (this.query = { ...t }),
        (this.isRecognizeComplete = !1),
        (this.requestId = e),
        (this.isLog = i),
        (this.sendCount = 0),
        (this.getMessageList = []);
    }
    stop() {
      this.socket && 1 === this.socket.readyState
        ? (this.socket.send(JSON.stringify({ type: 'end' })), (this.isRecognizeComplete = !0))
        : this.socket && 1 === this.socket.readyState && this.socket.close();
    }
    async start() {
      (this.socket = null), (this.getMessageList = []);
      var t = await k(this, this.query);
      if (t) {
        if ((this.isLog && console.log(this.requestId, 'get ws url', t, v), 'WebSocket' in window))
          this.socket = new WebSocket(t);
        else {
          if (!('MozWebSocket' in window))
            return (
              this.isLog && console.log(this.requestId, '浏览器不支持WebSocket', v),
              void this.OnError('浏览器不支持WebSocket')
            );
          this.socket = new MozWebSocket(t);
        }
        (this.socket.onopen = t => {
          this.isLog && console.log(this.requestId, '连接建立', t, v);
        }),
          (this.socket.onmessage = async t => {
            try {
              this.getMessageList.push(JSON.stringify(t));
              var e = JSON.parse(t.data);
              0 !== e.code
                ? (1 === this.socket.readyState && this.socket.close(),
                  this.isLog && console.log(this.requestId, JSON.stringify(e), v),
                  this.OnError(e))
                : (this.isSignSuccess || (this.OnRecognitionStart(e), (this.isSignSuccess = !0)),
                  1 === e.final
                    ? this.OnRecognitionComplete(e)
                    : (e.result &&
                        (0 === e.result.slice_type
                          ? (this.OnSentenceBegin(e), (this.isSentenceBegin = !0))
                          : 2 === e.result.slice_type
                            ? (this.isSentenceBegin || this.OnSentenceBegin(e), this.OnSentenceEnd(e))
                            : this.OnRecognitionResultChange(e)),
                      this.isLog && console.log(this.requestId, e, v)));
            } catch (t) {
              this.isLog && console.log(this.requestId, 'socket.onmessage catch error', JSON.stringify(t), v);
            }
          }),
          (this.socket.onerror = t => {
            this.isLog && console.log(this.requestId, 'socket error callback', t, v),
              this.socket.close(),
              this.OnError(t);
          }),
          (this.socket.onclose = t => {
            try {
              this.isRecognizeComplete ||
                (this.isLog && console.log(this.requestId, 'socket is close and error', JSON.stringify(t), v),
                this.OnError(t));
            } catch (t) {
              this.isLog &&
                console.log(this.requestId, 'socket is onclose catch' + this.sendCount, JSON.stringify(t), v);
            }
          });
      } else this.isLog && console.log(this.requestId, '鉴权失败', v), this.OnError('鉴权失败');
    }
    close() {
      this.socket && 1 === this.socket.readyState && this.socket.close(1e3);
    }
    write(t) {
      try {
        if (!this.socket || '1' !== String(this.socket.readyState))
          return (
            setTimeout(() => {
              this.socket && 1 === this.socket.readyState && this.socket.send(t);
            }, 40),
            !1
          );
        (this.sendCount += 1), this.socket.send(t);
      } catch (t) {
        this.isLog && console.log(this.requestId, '发送数据 error catch', t, v);
      }
    }
    OnRecognitionStart(t) {}
    OnSentenceBegin(t) {}
    OnRecognitionResultChange() {}
    OnSentenceEnd() {}
    OnRecognitionComplete() {}
    OnError() {}
  }
  'undefined' != typeof window && (window.SpeechRecognizer = R);
  class D {
    constructor(t, e) {
      (this.params = t),
        (this.recorder = null),
        (this.speechRecognizer = null),
        (this.isCanSendData = !1),
        (this.isNormalEndStop = !1),
        (this.audioData = []),
        (this.isLog = e),
        (this.requestId = null);
    }
    start() {
      try {
        this.isLog && console.log('start function is click'),
          (this.requestId = O()),
          (this.recorder = new r(this.requestId, this.params, this.isLog)),
          (this.recorder.OnReceivedData = t => {
            this.isCanSendData && this.speechRecognizer && this.speechRecognizer.write(t);
          }),
          (this.recorder.OnError = t => {
            this.speechRecognizer && this.speechRecognizer.close(), this.stop(), this.OnError(t);
          }),
          (this.recorder.OnStop = t => {
            this.speechRecognizer && this.speechRecognizer.stop(), this.OnRecorderStop(t);
          }),
          this.recorder.start(),
          this.speechRecognizer || (this.speechRecognizer = new R(this.params, this.requestId, this.isLog)),
          (this.speechRecognizer.OnRecognitionStart = t => {
            this.recorder
              ? (this.OnRecognitionStart(t), (this.isCanSendData = !0))
              : this.speechRecognizer && this.speechRecognizer.close();
          }),
          (this.speechRecognizer.OnSentenceBegin = t => {
            this.OnSentenceBegin(t);
          }),
          (this.speechRecognizer.OnRecognitionResultChange = t => {
            this.OnRecognitionResultChange(t);
          }),
          (this.speechRecognizer.OnSentenceEnd = t => {
            this.OnSentenceEnd(t);
          }),
          (this.speechRecognizer.OnRecognitionComplete = t => {
            this.OnRecognitionComplete(t), (this.isCanSendData = !1), (this.isNormalEndStop = !0);
          }),
          (this.speechRecognizer.OnError = t => {
            this.speechRecognizer && !this.isNormalEndStop && this.OnError(t),
              (this.speechRecognizer = null),
              this.recorder && this.recorder.stop(),
              (this.isCanSendData = !1);
          }),
          this.speechRecognizer.start();
      } catch (t) {
        console.log(t);
      }
    }
    stop() {
      this.isLog && console.log('stop function is click'), this.recorder && this.recorder.stop();
    }
    destroyStream() {
      this.isLog && console.log('destroyStream function is click', this.recorder),
        this.recorder && this.recorder.destroyStream();
    }
    OnRecognitionStart(t) {}
    OnSentenceBegin(t) {}
    OnRecognitionResultChange() {}
    OnSentenceEnd() {}
    OnRecognitionComplete() {}
    OnError() {}
    OnRecorderStop() {}
  }
  return 'undefined' != typeof window && (window.WebAudioSpeechRecognizer = D), D;
}
