import { useState, useEffect, useRef } from 'react';

export function useAudioLevel(isActive: boolean) {
  const [volume, setVolume] = useState(0);
  const [isLowVolume, setIsLowVolume] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<any>(null);

  const stopAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    setVolume(0);
    setIsLowVolume(false);
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      const filter = audioContext.createBiquadFilter(); // Create a BiquadFilterNode for noise reduction

      // Configure the high-pass filter to reduce low-frequency background noise
      filter.type = 'highpass';
      filter.frequency.value = 100; // Cut off frequencies below 100 Hz (adjust as needed)
      filter.Q.value = 1; // Quality factor

      analyser.fftSize = 256;
      source.connect(filter); // Connect source to filter
      filter.connect(analyser); // Connect filter to analyser

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const update = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        // Normalize 0-255 to 0-1 with a slight sensitivity boost
        const normalizedVolume = Math.min(average / 100, 1);
        setVolume(normalizedVolume);

        // Low volume detection (threshold 0.05)
        if (normalizedVolume < 0.05) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              setIsLowVolume(true);
            }, 3000); // 3 seconds of silence/low volume
          }
        } else {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
          setIsLowVolume(false);
        }

        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.error("Error accessing mic for visualization:", err);
    }
  };

  useEffect(() => {
    if (isActive) startAudio();
    else stopAudio();
    return stopAudio;
  }, [isActive]);

  return { volume, isLowVolume };
}