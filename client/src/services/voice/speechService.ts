// Web Speech API interface declarations
interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

export type VoiceState = 'ready' | 'listening' | 'understanding' | 'success' | 'error';

class VoiceSpeechService {
  private recognition: any = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.isSupported = true;
      }
    }
  }

  public getSupported(): boolean {
    return this.isSupported;
  }

  public startListening(
    onTranscript: (text: string, isFinal: boolean) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): { stop: () => void } {
    if (!this.recognition) {
      onError('Web Speech API is not supported in this browser. You can type or use preset voice templates.');
      return { stop: () => {} };
    }

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      onTranscript(activeText, !!finalTranscript);
    };

    this.recognition.onerror = (event: any) => {
      let msg = 'Speech recognition error: ' + (event.error || 'unknown');
      if (event.error === 'not-allowed') {
        msg = 'Microphone permission denied. Please allow microphone access in browser settings.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please try speaking again.';
      }
      onError(msg);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      onError('Unable to start speech recognition: ' + err.message);
    }

    return {
      stop: () => {
        try {
          this.recognition?.stop();
        } catch {
          // ignore
        }
      }
    };
  }
}

export const voiceSpeechService = new VoiceSpeechService();
