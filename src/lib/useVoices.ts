import { useEffect, useState } from 'react';
import { listVoices } from './audio';

/** Voices load asynchronously (especially on iOS), so re-read on `voiceschanged`. */
export function useVoices() {
  const [voices, setVoices] = useState(listVoices);
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const update = () => setVoices(listVoices());
    update();
    speechSynthesis.addEventListener('voiceschanged', update);
    return () => speechSynthesis.removeEventListener('voiceschanged', update);
  }, []);
  return voices;
}
