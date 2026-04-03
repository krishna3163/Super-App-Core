'use client'

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, SwitchCamera, X, Circle, RotateCcw, Send } from 'lucide-react';
import { PermissionGate } from '../ui/PermissionGate';

interface CameraModuleProps {
  onCapture: (media: { url: string; type: 'image' | 'video' }) => void;
  onClose: () => void;
}

export function CameraModule({ onCapture, onClose }: CameraModuleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedMedia, setCapturedMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error starting camera:', err);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedMedia({ url: dataUrl, type: 'image' });
      }
    }
  };

  const startRecording = () => {
    if (stream) {
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      setRecordedChunks([]);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setCapturedMedia({ url, type: 'video' });
      };

      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleCapture = () => {
    if (capturedMedia) {
      onCapture(capturedMedia);
    }
  };

  const reset = () => {
    setCapturedMedia(null);
    setRecordedChunks([]);
    startCamera();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white">
      <PermissionGate permission="camera">
        {!capturedMedia ? (
          <div className="relative w-full h-full flex flex-col">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
              <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md">
                <X size={24} />
              </button>
              <button onClick={toggleCamera} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md">
                <SwitchCamera size={24} />
              </button>
            </div>

            {/* Controls */}
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6">
               <div className="flex items-center gap-8">
                  {/* Gallery Placeholder */}
                  <div className="w-12 h-12 bg-white/20 rounded-xl border-2 border-white/30 backdrop-blur-md overflow-hidden">
                    <img src="https://i.pravatar.cc/100" className="w-full h-full object-cover opacity-50" />
                  </div>

                  {/* Shutter Button */}
                  <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onTouchStart={startRecording}
                    onTouchEnd={stopRecording}
                    onClick={capturePhoto}
                    className={`relative w-24 h-24 rounded-full border-[6px] border-white flex items-center justify-center transition-all ${isRecording ? 'scale-125' : 'hover:scale-105'}`}
                  >
                    <div className={`rounded-full transition-all ${isRecording ? 'w-10 h-10 bg-red-600 rounded-lg' : 'w-16 h-16 bg-white/40'}`} />
                  </button>

                  {/* Filter Placeholder */}
                  <div className="w-12 h-12 bg-white/20 rounded-full border-2 border-white/30 backdrop-blur-md flex items-center justify-center">
                    <Sparkles size={24} className="text-yellow-400" />
                  </div>
               </div>
               <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Tap for photo • Hold for video</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {capturedMedia.type === 'image' ? (
              <img src={capturedMedia.url} className="w-full h-full object-cover" />
            ) : (
              <video src={capturedMedia.url} autoPlay loop className="w-full h-full object-cover" />
            )}
            
            {/* Actions */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
              <button onClick={reset} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md">
                <RotateCcw size={24} />
              </button>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center px-12">
               <button 
                  onClick={handleCapture}
                  className="bg-yellow-400 text-black px-10 py-5 rounded-[2.5rem] font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-2xl hover:bg-yellow-300 transition-all active:scale-95"
               >
                 Send To Friends <Send size={20} />
               </button>
            </div>
          </div>
        )}
      </PermissionGate>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function Sparkles({ size, className }: { size: number, className: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="m5 3 1 1"/>
            <path d="m19 19 1 1"/>
            <path d="m5 21 1-1"/>
            <path d="m19 3 1 1"/>
        </svg>
    )
}
