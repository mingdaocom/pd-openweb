/*
 var video=new VideoPlayer(param)
 VideoPlayer
 提供方法
 onStop --停止播放的时候
 onPause --暂停播放的时候

 stop --停止播放
 pause --暂停播放
 play --开始播放
 getAllTime --获取总的时长
 getCurrentTime --获取当前播放时长
 */
/*
 var video=new VideoPlayer(param)
 VideoPlayer
 提供方法
 onStop --停止播放的时候
 onPause --暂停播放的时候

 stop --停止播放
 pause --暂停播放
 play --开始播放
 getAllTime --获取总的时长
 getCurrentTime --获取当前播放时长
 */
function MP3Player(_options) {
  const _this = this;
  this.options = $.extend(
    {
      mp3_url: '',
      wav_url: '',
      onStop() {},
      onPause() {},
    },
    _options,
  );
  if ($('#' + this.options.id).length == 0) {
    this.object = '';
    if (typeof Worker === 'undefined') {
      this.object +=
        '<OBJECT name="' +
        this.options.mp3_url +
        '" classid="CLSID:6BF52A52-394A-11d3-B153-00C04F79FAA6" height="0" width="0" border="0">';
      this.object += '<param name="URL" value="' + this.options.mp3_url + '">';
      this.object += '<PARAM NAME="playCount" VALUE="1">';
      this.object += '<param name="autoStart" value="0">';
      this.object += '<PARAM NAME="fullScreen" VALUE="0">';
      this.object += '<PARAM NAME="enableContextMenu" VALUE="0">';
      this.object += '<PARAM NAME="volume" VALUE="100">';
      this.object += '</OBJECT>';
    } else {
      this.object += '<audio name="' + this.options.mp3_url + '">';
      this.object += '<source src="' + this.options.mp3_url + '">';
      this.object += '<source src="' + this.options.wav_url + '">';
      this.object += '</audio>';
    }
    $('body').append(this.object);
    this.video = $("[name='" + this.options.mp3_url + "']")[0];

    if (typeof Worker === 'undefined') {
      this.video.addEventListener('PlayStatusChange', state => {
        switch (state) {
          case 1:
            _this.options.onStop();
            break;
          case 2:
            _this.options.onPause();
            break;
        }
      });
    } else {
      this.video.addEventListener('ended', () => {
        _this.options.onStop();
      });
      this.video.addEventListener('pause', () => {
        _this.options.onPause();
      });
    }
  } else {
    this.video = $('#' + this.options.mp3_url);
  }
  this.play = function () {
    if (typeof Worker === 'undefined') {
      this.video.controls.play();
    } else {
      this.video.play();
    }
  };
  this.stop = function () {
    if (typeof Worker === 'undefined') {
      this.video.controls.stop();
    } else {
      this.video.pause();
      if (this.video.currentTime > 0) {
        this.video.currentTime = 0;
      }
      this.options.onStop();
    }
  };
  this.pause = function () {
    if (typeof Worker === 'undefined') {
      this.video.controls.pause();
    } else {
      this.video.pause();
    }
  };
  this.getAllTime = function () {
    if (typeof Worker === 'undefined') {
      const media = this.video.currentMedia;
      if (media) {
        return media.duration;
      }
      return 0;
    } else {
      return this.video.duration;
    }
  };
  this.getCurrentTime = function () {
    if (typeof Worker === 'undefined') {
      const media = this.video.currentMedia;
      if (media) {
        return media.currentTime;
      }
      return 0;
    } else {
      return this.video.currentTime;
    }
  };
}
export default MP3Player;
window.MP3Player = MP3Player;
