import { createWorker } from 'tesseract.js';

export interface OCRProgressCallback {
  (stage: 'reading' | 'extracting' | 'understanding' | 'planning', percent: number, message: string): void;
}

class OCRService {
  private worker: any = null;
  private isInitializing: boolean = false;

  private async getWorker() {
    if (this.worker) return this.worker;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise(r => setTimeout(r, 50));
      }
      if (this.worker) return this.worker;
    }

    this.isInitializing = true;
    try {
      // Create worker in English
      const worker = await createWorker('eng');
      this.worker = worker;
      return worker;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Run real on-device OCR on an image source (data URL, blob, or file).
   */
  public async recognize(imageSource: string | File | Blob, onProgress?: OCRProgressCallback): Promise<string> {
    onProgress?.('reading', 15, 'Reading image and preprocessing...');
    const worker = await this.getWorker();

    onProgress?.('extracting', 45, 'Extracting text with Tesseract WebAssembly OCR...');

    const ret = await worker.recognize(imageSource);
    const extractedText = (ret.data?.text || '').trim();

    onProgress?.('understanding', 80, 'Understanding tasks and temporal patterns...');
    await new Promise(r => setTimeout(r, 100));

    onProgress?.('planning', 100, 'Building action plan...');

    return extractedText;
  }

  /**
   * Generate clean demo sample images on a dynamic canvas for 1-click test without needing a physical document.
   */
  public generateSampleImage(type: 'whiteboard' | 'syllabus' | 'stickynote'): string {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    if (type === 'whiteboard') {
      // Whiteboard background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 600, 420);
      
      // Marker frame
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 400);

      // Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('CS401 - Project Deliverables', 40, 60);

      // Notes in marker colors
      ctx.font = '20px sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText('• DBMS assignment due Monday', 45, 120);

      ctx.fillStyle = '#2563eb';
      ctx.fillText('• Hackathon Presentation Wednesday 2 PM', 45, 180);

      ctx.fillStyle = '#059669';
      ctx.fillText('• Lab record submission Friday at 4 PM', 45, 240);

      ctx.fillStyle = '#d97706';
      ctx.fillText('• Update resume portfolio next week', 45, 300);

      ctx.font = 'italic 16px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('[Snap2Done AI Real-World Board Capture]', 45, 370);
    } else if (type === 'stickynote') {
      // Yellow sticky note
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(0, 0, 600, 420);

      ctx.fillStyle = '#713f12';
      ctx.font = 'bold 22px cursive, sans-serif';
      ctx.fillText('TODAY TODO:', 50, 70);

      ctx.font = '20px cursive, sans-serif';
      ctx.fillText('1. Prepare interview pitch questions', 50, 140);
      ctx.fillText('2. Finish DBMS schema design by 6pm', 50, 200);
      ctx.fillText('3. Review cloud deployment configs', 50, 260);
    } else {
      // Syllabus document
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 420);

      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px monospace';
      ctx.fillText('SEMESTER LAB MILESTONES:', 40, 60);

      ctx.font = '16px monospace';
      ctx.fillText('Assignment 1: Database normalization - Due Monday', 40, 120);
      ctx.fillText('Assignment 2: Final sprint presentation - Wednesday', 40, 170);
      ctx.fillText('Assignment 3: Verified lab record signoff - Friday', 40, 220);
    }

    return canvas.toDataURL('image/png');
  }

  public async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrService = new OCRService();
