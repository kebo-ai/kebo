'use client'
import { useState, type ChangeEvent, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useWindowSize } from 'react-use';
import { UAParser } from 'ua-parser-js';

// Importamos Confetti dinámicamente para evitar problemas de SSR
const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

// Tipos para las propiedades de conexión
interface ConnectionAPI {
  effectiveType?: string;
  downlink?: number;
  saveData?: boolean;
}

// Tipos para la memoria del dispositivo
interface DeviceMemory {
  deviceMemory?: number;
}

const collectMetadata = async () => {
  const parser = new UAParser(window.navigator.userAgent);
  const uaResult = parser.getResult();

  const screenInfo = {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    orientation: window.screen.orientation?.type || null,
  };

  const language = {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    languages: navigator.languages,
    preferred: navigator.language,
    encoding: document.characterSet,
  };

  const connection = navigator as Navigator & { connection?: ConnectionAPI };
  const memory = navigator as Navigator & DeviceMemory;

  const platform = {
    onLine: navigator.onLine,
    vendor: navigator.vendor,
    platform: navigator.platform,
    doNotTrack: navigator.doNotTrack,
    cookiesEnabled: navigator.cookieEnabled,
    connectionType: connection.connection?.effectiveType || null,
    connectionSpeed: connection.connection?.downlink || null,
    saveData: connection.connection?.saveData || null,
  };

  const timestamp = {
    utc: new Date().toUTCString(),
    local: new Date().toLocaleString(),
    timestamp: Date.now(),
    timezone: {
      offset: new Date().getTimezoneOffset(),
      dst: isDST(),
    }
  };

  const browser = {
    name: uaResult.browser.name,
    version: uaResult.browser.version,
    engine: uaResult.engine.name,
    engineVersion: uaResult.engine.version,
  };

  const os = {
    name: uaResult.os.name,
    version: uaResult.os.version,
    architecture: uaResult.cpu.architecture,
  };

  const device = {
    type: uaResult.device.type || 'desktop',
    model: uaResult.device.model,
    vendor: uaResult.device.vendor,
  };

  const capabilities = {
    touch: 'ontouchstart' in window,
    webGL: !!document.createElement('canvas').getContext('webgl'),
    memory: memory.deviceMemory || null,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    pdfViewer: navigator.pdfViewerEnabled,
    bluetooth: 'bluetooth' in navigator,
    usb: 'usb' in navigator,
    webRTC: 'RTCPeerConnection' in window,
    audio: 'AudioContext' in window,
    video: document.createElement('video').canPlayType !== undefined,
  };

  let countryInfo = null;
  try {
    const response = await fetch('https://ipapi.co/json/');
    countryInfo = await response.json();
  } catch {
    // Si hay error en la API, dejamos countryInfo como null
  }

  return {
    host: window.location.host,
    path: window.location.pathname,
    screen: screenInfo,
    language,
    platform,
    browser,
    os,
    device,
    referrer: {
      url: document.referrer,
      domain: document.referrer ? new URL(document.referrer).hostname : null,
    },
    timestamp,
    capabilities,
    countryInfo,
    queryParams: window.location.search,
    documentProps: {
      title: document.title,
      domain: window.location.hostname,
      url: window.location.href,
    },
    window: {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      screenLeft: window.screenLeft,
      screenTop: window.screenTop,
    },
  };
};

function isDST() {
  const jan = new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset();
  const jul = new Date(new Date().getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== new Date().getTimezoneOffset();
}

export default function WaitlistForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (status === 'success') {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!formData.email) return;
    
    try {
      setStatus('loading');
      
      const metadata = await collectMetadata();
      
      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          meta: metadata
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Si es error 409, significa que el email ya está registrado
        if (response.status === 409) {
          setStatus('error');
          setMessage(data.error);
          return;
        }
        throw new Error(data.error || 'Error en el registro');
      }

      // Si todo sale bien, mostramos la animación y limpiamos el formulario
      setStatus('success');
      setMessage('¡Gracias por registrarte! Te enviaremos un correo de confirmación.');
      setFormData({ name: '', email: '' });

    } catch (err: unknown) {
      console.error('Error:', err instanceof Error ? err.message : String(err));
      setStatus('error');
      setMessage('Hubo un error al registrarte. Por favor intenta de nuevo.');
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          colors={['#333333', '#666666', '#999999', '#dddddd']}
        />
      )}
      
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            name="name"
            placeholder="Nombre (opcional)"
            value={formData.name}
            onChange={handleChange}
            className="w-full sm:w-1/3 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
          />
          <div className="flex-1 flex">
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              required
              value={formData.email}
              onChange={handleChange}
              className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-gray-800 text-white rounded-r-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Enviando...</span>
                </span>
              ) : (
                'Unirse'
              )}
            </button>
          </div>
        </div>
        
        {status === 'error' && (
          <p className="text-red-600 text-sm mt-2">{message}</p>
        )}
        
        {status === 'success' && (
          <p className="text-green-600 text-sm mt-2">{message}</p>
        )}
      </form>
    </>
  );
} 