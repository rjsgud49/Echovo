// src/types/jspdf-font.d.ts (또는 types 디렉토리 만들어서)
import 'jspdf';

declare module 'jspdf' {
    interface jsPDF {
        addFileToVFS: (filename: string, filecontent: string) => void;
        addFont: (postScriptName: string, fontName: string, fontStyle: string) => void;
    }

    interface jsPDFAPI {
        addFileToVFS: (filename: string, filecontent: string) => void;
        addFont: (postScriptName: string, fontName: string, fontStyle: string) => void;
    }
}
