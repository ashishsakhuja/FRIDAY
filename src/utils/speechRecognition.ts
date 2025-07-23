export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private isWakeWordListening = false;
  private _isRecognitionActive = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private onSilenceDetected?: () => void;
  private onNoSpeechDetected?: () => void;
  private onWakeWordDetected?: () => void;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';

    // Track recognition state
    this.recognition.onstart = () => {
      this._isRecognitionActive = true;
    };

    this.recognition.onend = () => {
      this._isRecognitionActive = false;
    };

    this.recognition.onerror = () => {
      this._isRecognitionActive = false;
    };
  }

  public startWakeWordListening(onWakeWordDetected: () => void): void {
    if (!this.recognition || this.isListening || this._isRecognitionActive) return;

    this.onWakeWordDetected = onWakeWordDetected;
    this.isWakeWordListening = true;

    this.recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        if (event.results[i].isFinal) {
          // Check for wake words
          if (transcript.includes('hey friday') || 
              transcript.includes('hey friday') || 
              transcript.includes('friday') ||
              transcript.includes('wake up friday')) {
            this.isWakeWordListening = false;
            this.recognition?.stop();
            if (this.onWakeWordDetected) {
              this.onWakeWordDetected();
            }
            return;
          }
        }
      }
    };

    this.recognition.onerror = (event) => {
      this._isRecognitionActive = false;
      if (event.error === 'no-speech' && this.isWakeWordListening) {
        // Restart wake word listening after a brief pause
        setTimeout(() => {
          if (this.isWakeWordListening && !this._isRecognitionActive) {
            this.recognition?.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      this._isRecognitionActive = false;
      if (this.isWakeWordListening) {
        // Restart wake word listening
        setTimeout(() => {
          if (this.isWakeWordListening && !this._isRecognitionActive) {
            this.recognition?.start();
          }
        }, 500);
      }
    };

    this.recognition.start();
  }

  public stopWakeWordListening(): void {
    this.isWakeWordListening = false;
    if (this.recognition && !this.isListening) {
      this.recognition.stop();
    }
  }

  public startListening(onSilenceDetected?: () => void, onNoSpeechDetected?: () => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening || this._isRecognitionActive) {
        reject(new Error('Already listening'));
        return;
      }

      // Stop wake word listening when starting active listening
      if (this.isWakeWordListening) {
        this.stopWakeWordListening();
      }

      this.onSilenceDetected = onSilenceDetected;
      this.onNoSpeechDetected = onNoSpeechDetected;
      let finalTranscript = '';
      let hasSpoken = false;

      this.recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            hasSpoken = true;
            this.resetSilenceTimer(resolve, finalTranscript);
          }
        }
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        this._isRecognitionActive = false;
        this.clearSilenceTimer();
        
        // Handle no-speech error gracefully
        if (event.error === 'no-speech') {
          if (this.onNoSpeechDetected) {
            this.onNoSpeechDetected();
          }
          resolve(''); // Return empty string instead of rejecting
        } else {
          reject(new Error(`Speech recognition error: ${event.error}`));
        }
      };

      this.recognition.onend = () => {
        this._isRecognitionActive = false;
        if (this.isListening) {
          // Only restart if we haven't had a no-speech error
          if (!hasSpoken) {
            // Restart listening automatically
            setTimeout(() => {
              if (this.isListening && !this._isRecognitionActive) {
                this.recognition?.start();
              }
            }, 100);
          }
        }
      };

      this.isListening = true;
      this.recognition.start();
    });
  }

  private resetSilenceTimer(resolve: (value: string) => void, transcript: string) {
    this.clearSilenceTimer();
    this.silenceTimer = setTimeout(() => {
      this.isListening = false;
      this.recognition?.stop();
      resolve(transcript.trim());
    }, 2000); // 2 seconds of silence after speech
  }

  private clearSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
  public stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      this.clearSilenceTimer();
    }
  }

  public getIsWakeWordListening(): boolean {
    return this.isWakeWordListening;
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}