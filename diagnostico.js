import React, { useState } from 'react';
import { CheckCircle, Instagram, Facebook, MessageCircle, FileText, Loader } from 'lucide-react';

const SurveyForm = () => {
  const [step, setStep] = useState('form');
  const [etiqueta, setEtiqueta] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    pregunta1: '',
    pregunta2: [],
    pregunta3: '',
    pregunta4: ''
  });

  // CONFIGURACIÓN - Reemplaza estos valores con los tuyos
  const GOOGLE_APPS_SCRIPT_URL = 'TU_URL_DE_GOOGLE_APPS_SCRIPT_AQUI';
  const BEACONS_API_KEY = 'TU_API_KEY_DE_BEACONS_AQUI';
  const BEACONS_LIST_ID = 'TU_LIST_ID_DE_BEACONS_AQUI';

  const handleCheckboxChange = (value) => {
    setFormData(prev => ({
      ...prev,
      pregunta2: prev.pregunta2.includes(value)
        ? prev.pregunta2.filter(v => v !== value)
        : [...prev.pregunta2, value]
    }));
  };

  const getEtiqueta = (respuesta) => {
    switch(respuesta) {
      case 'a': return 'CONFUNDIDO';
      case 'b': return 'SATURADO';
      case 'c': return 'PARALIZADO';
      default: return '';
    }
  };

  const getDocumentoURL = (etiqueta) => {
    // Personaliza estas URLs según tus documentos
    switch(etiqueta) {
      case 'CONFUNDIDO':
        return 'https://tusitio.com/guia-confundido';
      case 'SATURADO':
        return 'https://tusitio.com/guia-saturado';
      case 'PARALIZADO':
        return 'https://tusitio.com/guia-paralizado';
      default:
        return 'https://tusitio.com/guia-general';
    }
  };

  const getMensajePersonalizado = (etiqueta) => {
    switch(etiqueta) {
      case 'CONFUNDIDO':
        return {
          titulo: 'Tu perfil: CONFUNDIDO',
          descripcion: 'Necesitas claridad y un plan claro. Te recomendamos empezar con una estructura simple y validar tu idea antes de invertir tiempo.',
          emoji: '🧭'
        };
      case 'SATURADO':
        return {
          titulo: 'Tu perfil: SATURADO',
          descripcion: 'Tienes ideas pero necesitas organización. Prioriza una sola idea y crea un plan de acción semanal.',
          emoji: '📊'
        };
      case 'PARALIZADO':
        return {
          titulo: 'Tu perfil: PARALIZADO',
          descripcion: 'Es momento de replantearte tu estrategia. Analiza qué falló y ajusta tu enfoque con mentoría.',
          emoji: '🚀'
        };
      default:
        return {
          titulo: 'Tu perfil',
          descripcion: 'Hemos preparado una guía especial para ti.',
          emoji: '✨'
        };
    }
  };

  const enviarAGoogleSheets = async (datos) => {
    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos)
      });
      return true;
    } catch (error) {
      console.error('Error al enviar a Google Sheets:', error);
      return false;
    }
  };

  const sincronizarConBeacons = async (nombre, correo, etiqueta) => {
    try {
      const response = await fetch('https://api.beacons.ai/v1/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${BEACONS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: correo,
          first_name: nombre.split(' ')[0],
          last_name: nombre.split(' ').slice(1).join(' '),
          tags: [etiqueta],
          list_id: BEACONS_LIST_ID
        })
      });
      return response.ok;
    } catch (error) {
      console.error('Error al sincronizar con Beacons:', error);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.correo || !formData.pregunta1 || 
        formData.pregunta2.length === 0 || !formData.pregunta3 || !formData.pregunta4) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    const etiquetaUsuario = getEtiqueta(formData.pregunta1);
    setEtiqueta(etiquetaUsuario);

    const datosParaGuardar = {
      timestamp: new Date().toISOString(),
      nombre: formData.nombre,
      correo: formData.correo,
      etiqueta: etiquetaUsuario,
      pregunta1: formData.pregunta1 === 'a' ? 'No sé por dónde empezar' : 
                 formData.pregunta1 === 'b' ? 'Tengo ideas, pero sin estructura' : 
                 'Ya intenté y me frustré',
      pregunta2: formData.pregunta2.join(', '),
      pregunta3: formData.pregunta3,
      pregunta4: formData.pregunta4
    };

    console.log('Datos de la encuesta:', datosParaGuardar);

    // Enviar a Google Sheets
    await enviarAGoogleSheets(datosParaGuardar);

    // Sincronizar con Beacons
    await sincronizarConBeacons(formData.nombre, formData.correo, etiquetaUsuario);

    setLoading(false);
    setStep('thanks');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1e3a8a] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#fb923c] animate-spin mx-auto mb-4" />
          <p className="text-[#f0f9ff] text-lg">Procesando tu información...</p>
        </div>
      </div>
    );
  }

  if (step === 'thanks') {
    const mensaje = getMensajePersonalizado(etiqueta);
    const documentoURL = getDocumentoURL(etiqueta);

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1e3a8a] flex items-center justify-center p-4">
        <div className="bg-[#f0f9ff] rounded-2xl shadow-2xl p-8 max-w-md w-full border-2 border-[#fb923c]">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">{mensaje.emoji}</div>
            <CheckCircle className="w-16 h-16 text-[#fb923c] mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
              ¡Gracias por completar el diagnóstico!
            </h1>
          </div>

          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] rounded-xl p-6 mb-6 border-2 border-[#fb923c]">
            <h2 className="text-xl font-bold text-[#fb923c] mb-2">
              {mensaje.titulo}
            </h2>
            <p className="text-[#f0f9ff] mb-4">
              {mensaje.descripcion}
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#f0f9ff] to-white border-2 border-[#f97316] rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-center mb-3">
              <FileText className="w-6 h-6 text-[#f97316] mr-2" />
              <h3 className="font-bold text-[#0f172a]">Tu guía personalizada está lista</h3>
            </div>
            <p className="text-[#1e3a8a] text-sm mb-4">
              Accede a tu documento con los siguientes pasos recomendados:
            </p>
            <a 
              href={documentoURL}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white text-center font-semibold py-3 rounded-lg hover:from-[#f97316] hover:to-[#fb923c] transition-all shadow-lg transform hover:scale-105"
            >
              Ver mi guía ahora →
            </a>
          </div>

          <p className="text-[#1e3a8a] text-center mb-4 font-medium">
            En los próximos minutos recibirás más información en tu correo.
          </p>

          <div className="border-t-2 border-[#fb923c] pt-6">
            <p className="text-[#0f172a] font-semibold mb-4 text-center">Síguenos en nuestras redes:</p>
            <div className="flex justify-center gap-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                 className="bg-[#0f172a] text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="bg-blue-600 text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"
                 className="bg-[#fb923c] text-white p-3 rounded-full hover:scale-110 transition-transform shadow-lg">
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#1e3a8a] py-12 px-4">
      <div className="max-w-2xl mx-auto bg-[#f0f9ff] rounded-2xl shadow-2xl p-8 border-2 border-[#fb923c]">
        <h1 className="text-3xl font-bold text-[#0f172a] mb-2 text-center">
          Diagnóstico Personalizado
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-[#fb923c] to-[#f97316] mx-auto mb-4 rounded-full"></div>
        <p className="text-[#1e3a8a] text-center mb-8 font-medium">
          Completa este cuestionario para recibir tu guía personalizada
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-4 py-3 border-2 border-[#1e3a8a] rounded-lg focus:ring-2 focus:ring-[#fb923c] focus:border-[#fb923c] bg-white text-[#0f172a]"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-2">
              Correo electrónico *
            </label>
            <input
              type="email"
              value={formData.correo}
              onChange={(e) => setFormData({...formData, correo: e.target.value})}
              className="w-full px-4 py-3 border-2 border-[#1e3a8a] rounded-lg focus:ring-2 focus:ring-[#fb923c] focus:border-[#fb923c] bg-white text-[#0f172a]"
              placeholder="tu@email.com"
            />
          </div>

          <div className="border-t-2 border-[#fb923c] pt-6">
            <label className="block text-sm font-semibold text-[#0f172a] mb-3">
              1. ¿En qué punto estás hoy? *
            </label>
            <div className="space-y-2">
              {[
                { value: 'a', label: 'No sé por dónde empezar' },
                { value: 'b', label: 'Tengo ideas, pero sin estructura' },
                { value: 'c', label: 'Ya intenté y me frustré' }
              ].map((option) => (
                <label key={option.value} className="flex items-center p-3 border-2 border-[#1e3a8a] rounded-lg hover:bg-white hover:border-[#fb923c] cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="pregunta1"
                    value={option.value}
                    checked={formData.pregunta1 === option.value}
                    onChange={(e) => setFormData({...formData, pregunta1: e.target.value})}
                    className="w-4 h-4 text-[#fb923c]"
                  />
                  <span className="ml-3 text-[#0f172a] font-medium">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-3">
              2. ¿Qué te detiene más? (puedes seleccionar varias) *
            </label>
            <div className="space-y-2">
              {['Falta de claridad', 'Falta de tiempo', 'Miedo a fallar', 'Demasiada información'].map((option) => (
                <label key={option} className="flex items-center p-3 border-2 border-[#1e3a8a] rounded-lg hover:bg-white hover:border-[#fb923c] cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={formData.pregunta2.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                    className="w-4 h-4 text-[#fb923c] rounded"
                  />
                  <span className="ml-3 text-[#0f172a] font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-3">
              3. ¿Cuánto tiempo podrías dedicar semanalmente? *
            </label>
            <div className="space-y-2">
              {['1–3 h', '4–6 h', '7+ h'].map((option) => (
                <label key={option} className="flex items-center p-3 border-2 border-[#1e3a8a] rounded-lg hover:bg-white hover:border-[#fb923c] cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="pregunta3"
                    value={option}
                    checked={formData.pregunta3 === option}
                    onChange={(e) => setFormData({...formData, pregunta3: e.target.value})}
                    className="w-4 h-4 text-[#fb923c]"
                  />
                  <span className="ml-3 text-[#0f172a] font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0f172a] mb-3">
              4. ¿Qué te gustaría lograr en 2026? *
            </label>
            <div className="space-y-2">
              {['Ingresos extra', 'Negocio digital estable', 'Claridad y enfoque'].map((option) => (
                <label key={option} className="flex items-center p-3 border-2 border-[#1e3a8a] rounded-lg hover:bg-white hover:border-[#fb923c] cursor-pointer transition-all">
                  <input
                    type="radio"
                    name="pregunta4"
                    value={option}
                    checked={formData.pregunta4 === option}
                    onChange={(e) => setFormData({...formData, pregunta4: e.target.value})}
                    className="w-4 h-4 text-[#fb923c]"
                  />
                  <span className="ml-3 text-[#0f172a] font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white font-bold py-4 rounded-lg hover:from-[#f97316] hover:to-[#fb923c] transition-all transform hover:scale-105 shadow-xl"
          >
            Enviar diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
