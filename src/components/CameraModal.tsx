import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Check } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onCapture: (base64: string, mimeType: string) => void;
  onClose: () => void;
}

export function CameraModal({ isOpen, onCapture, onClose }: CameraModalProps) {
  if (!isOpen) return null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
      }
    }
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage, 'image/jpeg');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Camera</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X size={18} />
          </button>
        </div>

        <div className="relative bg-black w-full aspect-[3/4] flex items-center justify-center overflow-hidden">
          {!capturedImage ? (
             <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
             <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-6 flex justify-center items-center gap-6">
          {!capturedImage ? (
            <button onClick={takePhoto} className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:bg-blue-700 transition">
              <Camera size={24} className="text-white" />
            </button>
          ) : (
            <>
              <button onClick={retakePhoto} className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">
                Retake
              </button>
              <button onClick={confirmPhoto} className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center gap-2">
                <Check size={18} /> Use Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
