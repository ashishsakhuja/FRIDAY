export class SpeechRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private silenceTimer: NodeJS.Timeout | null = null;
  private onSilenceDetected?: () => void;
  private onNoSpeechDetected?: () => void;

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
  }

  public startListening(onSilenceDetected?: () => void, onNoSpeechDetected?: () => void): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
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
        if (this.isListening) {
          // Only restart if we haven't had a no-speech error
          if (!hasSpoken) {
            // Restart listening automatically
            setTimeout(() => {
              if (this.isListening) {
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