/**
 * VOICE NOTE RECORDER SERVICE
 * Ghi âm lời nhắn ngắn (5s - 10s) chất lượng cao bằng Opus Codec.
 * Dung lượng siêu nhẹ (~15KB / 5s) an toàn tuyệt đối với Firestore Spark Plan & IndexedDB.
 */

export class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.startTime = null;
  }

  static isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window.MediaRecorder !== 'undefined'
    );
  }

  static getBestMimeType() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg'
    ];
    for (const type of candidates) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  }

  async start() {
    this.audioChunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    const mimeType = VoiceRecorder.getBestMimeType();
    const options = {
      audioBitsPerSecond: 24000 // 24 kbps Opus - Siêu nét, tốn chỉ ~3KB/giây
    };
    if (mimeType) {
      options.mimeType = mimeType;
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);
    this.startTime = Date.now();

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(100);
  }

  stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('Recorder not initialized'));
      }

      this.mediaRecorder.onstop = () => {
        try {
          const duration = Math.min(
            15,
            Math.max(1, Math.round((Date.now() - (this.startTime || Date.now())) / 1000))
          );
          const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });

          // Tắt micro giải phóng tài nguyên
          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
          }

          // Chuyển sang Base64 Data URL để lưu Firestore & IndexedDB
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              audioUrl: reader.result,
              duration: duration,
              sizeBytes: audioBlob.size
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(audioBlob);
        } catch (err) {
          reject(err);
        }
      };

      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
    });
  }

  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}
