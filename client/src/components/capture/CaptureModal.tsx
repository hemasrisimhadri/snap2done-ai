import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Mic, Type, X, RefreshCw, Check, Sparkles, AlertCircle, FileText, Image as ImageIcon, Volume2, ShieldCheck, Edit3 } from 'lucide-react';
import { ocrService } from '../../services/ocr/ocrService';
import { voiceSpeechService, VoiceState } from '../../services/voice/speechService';
import { extractTasksFromText } from '../../services/ai/localNLP';
import { localAI } from '../../services/ai/localAIModel';
import { deviceService } from '../../services/device/deviceService';
import { Task, TaskSource } from '../../types';

interface CaptureModalProps {
  isOpen: boolean;
  initialMode?: 'camera' | 'voice' | 'text';
  onClose: () => void;
  onTasksSaved: (tasks: Task[], rawText: string, type: 'camera' | 'voice' | 'text') => void;
}

export const CaptureModal: React.FC<CaptureModalProps> = ({
  isOpen,
  initialMode = 'camera',
  onClose,
  onTasksSaved
}) => {
  const [mode, setMode] = useState<'camera' | 'voice' | 'text'>(initialMode);

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Voice State
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const voiceControllerRef = useRef<{ stop: () => void } | null>(null);

  // Text State
  const [textInput, setTextInput] = useState<string>('');

  // Processing & OCR State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingPercent, setProcessingPercent] = useState<number>(0);

  // Review Extracted Tasks State
  const [extractedTasks, setExtractedTasks] = useState<Task[]>([]);
  const [rawExtractedText, setRawExtractedText] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen && mode === 'camera' && !capturedImage && !isReviewing) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
      stopVoice();
    };
  }, [isOpen, mode, capturedImage, isReviewing]);

  // ---------------- CAMERA HANDLING ----------------
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await deviceService.getCameraStream();
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setCameraError(err.message || 'Camera permission required.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      deviceService.vibrate(50);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Preset sample image loader for 1-click test without camera requirement
  const loadDemoSampleImage = (type: 'whiteboard' | 'syllabus' | 'stickynote') => {
    stopCamera();
    const dataUrl = ocrService.generateSampleImage(type);
    setCapturedImage(dataUrl);
    deviceService.vibrate(30);
  };

  // Run Real Tesseract OCR
  const analyzeCapturedImage = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);
    setProcessingStage('Reading image...');
    setProcessingPercent(20);

    try {
      const text = await ocrService.recognize(capturedImage, (stage, pct, msg) => {
        setProcessingStage(msg);
        setProcessingPercent(pct);
      });

      setRawExtractedText(text);

      // Local AI text extraction
      await localAI.analyzeText(text);
      const tasks = extractTasksFromText(text, 'camera');

      setExtractedTasks(tasks);
      setIsReviewing(true);
      deviceService.vibrate([40, 60, 40]);
    } catch (err: any) {
      alert('OCR Processing error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- VOICE HANDLING ----------------
  const startVoiceRecording = () => {
    setVoiceState('listening');
    setVoiceTranscript('');
    deviceService.vibrate(40);

    voiceControllerRef.current = voiceSpeechService.startListening(
      (transcript, isFinal) => {
        setVoiceTranscript(transcript);
        if (isFinal) {
          processVoiceTranscript(transcript);
        }
      },
      (err) => {
        setVoiceState('error');
        alert(err);
      },
      () => {
        if (voiceState === 'listening') {
          setVoiceState('ready');
        }
      }
    );
  };

  const stopVoice = () => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.stop();
      voiceControllerRef.current = null;
    }
  };

  const processVoiceTranscript = async (transcript: string) => {
    if (!transcript.trim()) return;

    setVoiceState('understanding');
    setIsProcessing(true);
    setProcessingStage('Understanding speech with on-device NLP...');

    try {
      await localAI.analyzeText(transcript);
      const tasks = extractTasksFromText(transcript, 'voice');

      setRawExtractedText(transcript);
      setExtractedTasks(tasks);
      setVoiceState('success');
      setIsReviewing(true);
      deviceService.vibrate([50, 50]);
    } catch (err: any) {
      setVoiceState('ready');
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- TEXT HANDLING ----------------
  const processTextInput = async () => {
    if (!textInput.trim()) return;

    setIsProcessing(true);
    setProcessingStage('Extracting tasks with on-device NLP...');
    setProcessingPercent(60);

    try {
      await localAI.analyzeText(textInput);
      const tasks = extractTasksFromText(textInput, 'text');

      setRawExtractedText(textInput);
      setExtractedTasks(tasks);
      setIsReviewing(true);
      deviceService.vibrate(30);
    } catch (err: any) {
      alert('Extraction failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- SAVE TASKS ----------------
  const handleConfirmSave = () => {
    if (extractedTasks.length === 0) {
      alert('Please add at least one task.');
      return;
    }
    onTasksSaved(extractedTasks, rawExtractedText, mode);
    deviceService.vibrate([40, 100, 40]);
    handleResetAndClose();
  };

  const handleResetAndClose = () => {
    stopCamera();
    stopVoice();
    setCapturedImage(null);
    setExtractedTasks([]);
    setRawExtractedText('');
    setTextInput('');
    setIsReviewing(false);
    setIsProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#0f1422] border border-surface-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-border/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-500/15 text-brand-400">
              {mode === 'camera' ? <Camera className="w-5 h-5" /> : mode === 'voice' ? <Mic className="w-5 h-5" /> : <Type className="w-5 h-5" />}
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                {isReviewing ? 'Review & Edit AI Tasks' : mode === 'camera' ? 'Camera OCR Capture' : mode === 'voice' ? 'Voice AI Capture' : 'Quick Text Capture'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isReviewing ? 'Verify on-device priority and deadlines' : 'Powered by on-device local AI'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (only when not reviewing) */}
        {!isReviewing && !isProcessing && (
          <div className="flex p-2 bg-slate-900/80 border-b border-surface-border gap-1">
            <button
              onClick={() => { setMode('camera'); setCapturedImage(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'camera' ? 'bg-brand-500 text-black shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => { setMode('voice'); stopCamera(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'voice' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
            <button
              onClick={() => { setMode('text'); stopCamera(); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'text' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* PROCESSING STATE WITH PROGRESS BAR */}
          {isProcessing && (
            <div className="py-12 px-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400 animate-spin">
                <RefreshCw className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white">{processingStage}</h3>
                <p className="text-xs text-slate-400">Processing on-device with WebAssembly & Local NLP...</p>
              </div>
              {/* Progress bar */}
              <div className="w-full max-w-xs mx-auto bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                <div
                  className="bg-brand-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${processingPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* REVIEW EXTRACTED TASKS VIEW */}
          {!isProcessing && isReviewing && (
            <div className="space-y-4">
              {/* AI Privacy & Source Summary */}
              <div className="p-3 rounded-xl bg-brand-950/40 border border-brand-500/30 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-brand-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>AI Processed Locally ({extractedTasks.length} tasks extracted)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Source: {mode.toUpperCase()}</span>
              </div>

              {/* Raw Extracted Snippet Preview */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300">Raw Extracted Text:</span>
                <p className="font-mono text-slate-300 italic whitespace-pre-wrap">{rawExtractedText}</p>
              </div>

              {/* Editable Tasks List */}
              <div className="space-y-3">
                {extractedTasks.map((task, idx) => (
                  <div key={task.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-surface-border space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => {
                          const updated = [...extractedTasks];
                          updated[idx] = { ...updated[idx], title: e.target.value };
                          setExtractedTasks(updated);
                        }}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-white w-full focus:outline-none focus:border-brand-500"
                        placeholder="Task title"
                      />
                      <button
                        onClick={() => {
                          setExtractedTasks(extractedTasks.filter((_, i) => i !== idx));
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 p-1 rounded"
                        title="Remove task"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Priority selector */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Priority</label>
                        <select
                          value={task.priority}
                          onChange={(e) => {
                            const updated = [...extractedTasks];
                            updated[idx] = { ...updated[idx], priority: e.target.value as any };
                            setExtractedTasks(updated);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="high">🔥 HIGH</option>
                          <option value="medium">🟡 MEDIUM</option>
                          <option value="low">🟢 LOW</option>
                        </select>
                      </div>

                      {/* Category selector */}
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
                        <select
                          value={task.category}
                          onChange={(e) => {
                            const updated = [...extractedTasks];
                            updated[idx] = { ...updated[idx], category: e.target.value as any };
                            setExtractedTasks(updated);
                          }}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
                        >
                          <option value="Study">Study</option>
                          <option value="Work">Work</option>
                          <option value="Urgent">Urgent</option>
                          <option value="Personal">Personal</option>
                          <option value="Health">Health</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </div>
                    </div>

                    {/* Deadline Display */}
                    <div className="text-[11px] text-slate-300 flex items-center justify-between">
                      <span>⏰ Deadline: <strong className="text-brand-300">{task.deadlineDisplay || 'Flexible'}</strong></span>
                      <span>⏱ Est: <strong className="text-slate-200">{task.estimatedDuration}m</strong></span>
                    </div>

                    {/* AI Reasoning */}
                    <p className="text-[10px] text-amber-300/80 italic bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                      💡 {task.priorityReason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. CAMERA MODE */}
          {!isProcessing && !isReviewing && mode === 'camera' && (
            <div className="space-y-4">
              {/* Camera Preview Area */}
              <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {/* Viewfinder Target Guidelines */}
                    <div className="absolute inset-8 border-2 border-brand-500/50 rounded-xl pointer-events-none flex items-center justify-center">
                      <span className="text-[11px] text-brand-300 bg-black/60 px-2 py-1 rounded">
                        Align Whiteboard or Notes
                      </span>
                    </div>
                  </>
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured preview"
                    className="w-full h-full object-contain bg-slate-950"
                  />
                )}

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                    <p className="text-xs text-slate-200 font-medium">{cameraError}</p>
                    <p className="text-[11px] text-slate-400">Use preset samples below to test OCR instantly.</p>
                  </div>
                )}
              </div>

              {/* Shutter / Controls */}
              <div className="flex items-center justify-center gap-3">
                {!capturedImage ? (
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 text-black font-bold text-sm shadow-lg shadow-brand-500/30 hover:bg-brand-400 active:scale-95 transition-all"
                  >
                    <Camera className="w-4 h-4 stroke-[2.4]" />
                    <span>Capture Photo</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={retakePhoto}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                    <button
                      onClick={analyzeCapturedImage}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black font-bold text-xs shadow-lg shadow-brand-500/30 hover:opacity-95 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Use Photo & Run OCR</span>
                    </button>
                  </>
                )}
              </div>

              {/* Demo Sample Presets for Hackathon Testing */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Quick Hackathon Sample Presets (Instant OCR):
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => loadDemoSampleImage('whiteboard')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 font-medium"
                  >
                    Whiteboard Notes
                  </button>
                  <button
                    onClick={() => loadDemoSampleImage('stickynote')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 font-medium"
                  >
                    Sticky Note
                  </button>
                  <button
                    onClick={() => loadDemoSampleImage('syllabus')}
                    className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-slate-200 font-medium"
                  >
                    Lab Syllabus
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. VOICE MODE */}
          {!isProcessing && !isReviewing && mode === 'voice' && (
            <div className="py-6 px-2 text-center space-y-6">
              {/* Mic Pulse Graphic */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                {voiceState === 'listening' && (
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                )}
                <button
                  onClick={voiceState === 'listening' ? stopVoice : startVoiceRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                    voiceState === 'listening'
                      ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse'
                      : 'bg-blue-500 text-white shadow-blue-500/40 hover:bg-blue-400'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
              </div>

              {/* State & Transcript */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-400">
                  {voiceState === 'listening' ? 'Listening to speech...' : 'Tap Mic to Speak'}
                </span>
                <p className="text-xs text-slate-400 min-h-[40px] px-4 italic">
                  {voiceTranscript ? `"${voiceTranscript}"` : 'Example: "I need to finish my DBMS assignment tomorrow at 10 AM."'}
                </p>
              </div>

              {/* Preset Voice Phrases for 1-click test */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2 text-left">
                <span className="text-[11px] font-semibold text-slate-400 block">
                  Or Test Preset Voice Phrases:
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      const sample = 'I need to finish my DBMS assignment tomorrow at 10 AM.';
                      setVoiceTranscript(sample);
                      processVoiceTranscript(sample);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
                  >
                    "I need to finish my DBMS assignment tomorrow at 10 AM."
                  </button>
                  <button
                    onClick={() => {
                      const sample = 'Prepare hackathon presentation for Wednesday 2 PM and submit lab record Friday.';
                      setVoiceTranscript(sample);
                      processVoiceTranscript(sample);
                    }}
                    className="w-full text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700"
                  >
                    "Prepare hackathon presentation for Wednesday 2 PM and submit lab record Friday."
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. TEXT MODE */}
          {!isProcessing && !isReviewing && mode === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Paste or type raw thoughts, notes, or messages:
                </label>
                <textarea
                  rows={4}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="e.g. Finish resume before Friday and prepare interview questions tomorrow."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>

              {/* Example Prompts */}
              <div className="flex gap-2 flex-wrap text-[11px]">
                <button
                  onClick={() => setTextInput('Finish resume before Friday and prepare interview questions tomorrow.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30"
                >
                  "Finish resume before Friday and prepare interview questions tomorrow."
                </button>
                <button
                  onClick={() => setTextInput('DBMS assignment due Monday. Presentation Wednesday. Lab record Friday.')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-300 border border-brand-500/30"
                >
                  "DBMS assignment due Monday. Presentation Wednesday. Lab record Friday."
                </button>
              </div>

              <button
                onClick={processTextInput}
                disabled={!textInput.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-purple-500/25 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Let AI Organize This</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer (When reviewing) */}
        {isReviewing && (
          <div className="p-4 border-t border-surface-border bg-slate-950/80 flex items-center justify-between gap-3">
            <button
              onClick={() => setIsReviewing(false)}
              className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700"
            >
              Back
            </button>
            <button
              onClick={handleConfirmSave}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-400 text-black font-bold text-xs shadow-lg shadow-brand-500/30 hover:opacity-95 active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[2.4]" />
              <span>Save {extractedTasks.length} Tasks to Storage</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
