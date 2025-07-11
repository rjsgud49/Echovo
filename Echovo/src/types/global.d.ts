// 👇 SpeechRecognition 타입 선언 보강
declare global {
    interface Window {
        webkitSpeechRecognition: typeof SpeechRecognition;
        SpeechRecognition: typeof SpeechRecognition;
    }

    interface SpeechRecognition extends EventTarget {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        maxAlternatives: number;
        start(): void;
        stop(): void;
        abort(): void;

        onaudioend?: (this: SpeechRecognition, ev: Event) => void;
        onaudiostart?: (this: SpeechRecognition, ev: Event) => void;
        onend?: (this: SpeechRecognition, ev: Event) => void;
        onerror?: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void;
        onnomatch?: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => void;
        onresult?: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => void;
        onsoundend?: (this: SpeechRecognition, ev: Event) => void;
        onsoundstart?: (this: SpeechRecognition, ev: Event) => void;
        onspeechend?: (this: SpeechRecognition, ev: Event) => void;
        onspeechstart?: (this: SpeechRecognition, ev: Event) => void;
        onstart?: (this: SpeechRecognition, ev: Event) => void;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        error: string;
        message: string;
    }

    
}

export { };
