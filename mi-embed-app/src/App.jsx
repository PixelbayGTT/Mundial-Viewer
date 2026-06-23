import React, { useState, useEffect } from 'react';
import { Shield, Eye, Save, LogOut, CheckCircle, AlertCircle, Code } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ⚠️ IMPORTANTE: REEMPLAZA ESTO CON LOS DATOS DE TU FIREBASE ⚠️
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "TUS_NUMEROS",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "mi-sitio-produccion";

export default function App() {
  const [view, setView] = useState('public');
  const [firebaseUser, setFirebaseUser] = useState(null);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [embedCode, setEmbedCode] = useState('');
  const [draftCode, setDraftCode] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const [botUrl, setBotUrl] = useState('');
  const [botStatus, setBotStatus] = useState('idle');
  const [botMessage, setBotMessage] = useState('');

  useEffect(() => {
    if (!firebaseUser) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'embedConfig', 'main');

    const unsubscribe = onSnapshot(docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          // Limpiamos también lo que viene de la base de datos por si quedó guardado sucio
          const cleanCode = forceRemoveSandbox(data.code || '');
          setEmbedCode(cleanCode);
          setDraftCode(cleanCode);
        }
      },
      (error) => {
        console.error("Error al obtener el código embed:", error);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginUsername === 'admin' && loginPassword === '1234') {
      setIsAdminLoggedIn(true);
      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  // ESTA ES LA FUNCIÓN CLAVE AHORA: Destruye los atributos sandbox
  const forceRemoveSandbox = (code) => {
    if (!code) return '';
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = code;
      const iframes = tempDiv.getElementsByTagName('iframe');
      for (let i = 0; i < iframes.length; i++) {
        // Nos aseguramos de eliminar absolutamente cualquier restricción
        iframes[i].removeAttribute('sandbox');
      }
      return tempDiv.innerHTML;
    } catch (e) {
      return code;
    }
  };

  const handleSaveCode = async () => {
    if (!firebaseUser) return;

    setSaveStatus('saving');
    try {
      // Limpiamos agresivamente el código antes de guardarlo en Firebase
      const cleanDraft = forceRemoveSandbox(draftCode);
      
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'embedConfig', 'main');
      await setDoc(docRef, { code: cleanDraft, updatedAt: new Date().toISOString() });
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error("Error al guardar:", error);
      setSaveStatus('error');
    }
  };

  const handleRunBot = async () => {
    if (!botUrl) {
      setBotMessage("Por favor, ingresa una URL válida.");
      setBotStatus('error');
      return;
    }

    setBotStatus('loading');
    setBotMessage('Analizando la página destino...');

    try {
      // Usamos un proxy (allorigins) para poder leer otras páginas web desde el navegador y saltar restricciones CORS
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(botUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) throw new Error('Error en la red');

      const data = await response.json();
      const html = data.contents;

      if (!html) throw new Error('Página vacía');

      // Buscamos todas las etiquetas <iframe> en el código fuente de la página secreta
      const iframes = html.match(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi);

      if (iframes && iframes.length > 0) {
        // Filtramos para quedarnos solo con los iframes que probablemente sean reproductores de video
        const videoIframes = iframes.filter(iframe => 
          iframe.toLowerCase().includes('embed') || iframe.toLowerCase().includes('allowfullscreen')
        );

        if (videoIframes.length > 0) {
          // Unimos todos los reproductores encontrados con un separador claro
          const allFoundCode = videoIframes.join('\n\n<!-- ⬆️ OPCIÓN 1 | ⬇️ OPCIÓN 2 -->\n\n');
          
          // Lo colocamos en el editor visualmente
          setDraftCode(allFoundCode);
          
          if (videoIframes.length === 1) {
            // Si solo hay uno, lo guardamos automáticamente en Firebase
            const cleanDraft = forceRemoveSandbox(allFoundCode);
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'embedConfig', 'main');
            await setDoc(docRef, { code: cleanDraft, updatedAt: new Date().toISOString() });
            
            setBotStatus('success');
            setBotMessage('¡Partido encontrado y publicado automáticamente!');
          } else {
            // Si hay varios (ej. Inglés y Español), no publicamos automáticamente.
            // Dejamos que el usuario borre el incorrecto y guarde manual.
            setBotStatus('success');
            setBotMessage(`¡Encontré ${videoIframes.length} reproductores! Revisa abajo, borra el de inglés y dale a "Aplicar Cambios".`);
          }
        } else {
          setBotStatus('error');
          setBotMessage('Se encontraron iframes, pero ninguno parece ser un reproductor de video.');
        }
      } else {
        setBotStatus('error');
        setBotMessage('No se encontró ningún reproductor de video en esa URL.');
      }
    } catch (error) {
      console.error("Error del bot:", error);
      setBotStatus('error');
      setBotMessage('Error de conexión. La página fuente bloqueó el análisis.');
    }
  };

  const renderPublicView = () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-black min-h-[calc(100vh-64px)] w-full overflow-hidden">
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center">
        {embedCode ? (
          <div
            className="w-full h-full flex justify-center items-center overflow-hidden bg-black"
            dangerouslySetInnerHTML={{ __html: embedCode }}
          />
        ) : (
          <div className="text-center text-gray-500 flex flex-col items-center p-6">
            <Code size={64} className="mb-4 opacity-50" />
            <p className="text-xl font-medium">Esperando transmisión...</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLogin = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 min-h-[calc(100vh-64px)]">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
            <Shield className="text-blue-600 dark:text-blue-400" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Acceso Administrador</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Gestiona el contenido del sitio web</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Usuario</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Ej: admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••"
              required
            />
          </div>

          {loginError && (
            <div className="flex items-center text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm border border-red-100 dark:border-red-800">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors focus:ring-4 focus:ring-blue-500/50 outline-none shadow-md mt-2"
          >
            Ingresar al Panel
          </button>
        </form>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
              <Code className="mr-2 text-blue-500" size={20}/>
              Gestor de Código Embed
            </h2>
          </div>
          <button
            onClick={() => setIsAdminLoggedIn(false)}
            className="flex items-center justify-center text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 transition-colors px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 bg-gray-100 dark:bg-gray-700 font-medium text-sm"
          >
            <LogOut size={16} className="mr-2" />
            Cerrar Sesión
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {}
          {/* Columna Izquierda: Bot Extractor + Editor */}
          <div className="flex flex-col gap-6 h-[500px]">
            
            {/* Nuevo Panel del Bot Automatizado */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-sm border border-blue-500 p-5 shrink-0">
              <div className="mb-3">
                <h3 className="text-lg font-bold text-white flex items-center">
                  🤖 Bot Auto-Extractor
                </h3>
                <p className="text-xs text-blue-100 mt-1">
                  Pega el link de la página externa. El bot detectará el iframe y actualizará la transmisión al instante.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={botUrl}
                  onChange={(e) => setBotUrl(e.target.value)}
                  placeholder="Link de la página web externa..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 bg-black/20 text-white placeholder-blue-200 focus:ring-2 focus:ring-white outline-none text-sm transition-all"
                />
                <button
                  onClick={handleRunBot}
                  disabled={botStatus === 'loading'}
                  className="px-5 py-2.5 bg-white text-blue-700 hover:bg-gray-100 disabled:opacity-70 font-bold rounded-xl transition-colors shadow-md text-sm whitespace-nowrap flex items-center justify-center"
                >
                  {botStatus === 'loading' ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : null}
                  Extraer Código
                </button>
              </div>

              {botMessage && (
                <div className={`mt-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  botStatus === 'success' ? 'bg-green-400/20 text-green-50 border border-green-400/30' :
                  botStatus === 'error' ? 'bg-red-400/20 text-red-50 border border-red-400/30' :
                  'bg-white/10 text-white border border-white/20'
                }`}>
                  {botMessage}
                </div>
              )}
            </div>

            {/* Editor Manual Reducido */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col flex-1 overflow-hidden">
              <div className="mb-4">
                <label className="block text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                  Editor Manual de Iframe
                </label>
              </div>

              <textarea
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value)}
                className="flex-1 w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder='Ejemplo:&#10;<iframe width="560" height="315" src="..." frameborder="0" allowfullscreen></iframe>'
              />

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex-1 w-full">
                  {saveStatus === 'success' && (
                    <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                      <CheckCircle size={16} className="mr-1.5" />
                      Actualizado en vivo
                    </span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="flex items-center text-red-600 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                      <AlertCircle size={16} className="mr-1.5" />
                      Error al guardar
                    </span>
                  )}
                  {saveStatus === 'saving' && (
                    <span className="flex items-center text-blue-600 text-sm font-medium px-3 py-1.5">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Guardando...
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSaveCode}
                  disabled={saveStatus === 'saving'}
                  className="w-full sm:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors focus:ring-4 focus:ring-blue-500/50 outline-none shadow-md"
                >
                  <Save size={18} className="mr-2" />
                  Guardar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col h-[500px]">
             <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <Eye size={18} className="mr-2 text-gray-500"/>
              Vista Previa Actual
            </h3>
            <div className="flex-1 bg-black rounded-xl border border-gray-200 dark:border-gray-700 p-0 flex items-center justify-center overflow-hidden relative">
               {embedCode ? (
                  <div dangerouslySetInnerHTML={{ __html: embedCode }} className="w-full h-full flex justify-center items-center" />
                ) : (
                  <div className="text-gray-400 dark:text-gray-600 text-sm flex flex-col items-center">
                    <Eye size={32} className="mb-2 opacity-50" />
                    El área está vacía
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-100 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-1.5 rounded-lg mr-3 shadow-sm">
                <Code size={20} />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">LivePlayer</span>
            </div>

            <div className="flex space-x-1 sm:space-x-2 items-center">
              <button
                onClick={() => setView('public')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold flex items-center transition-all ${
                  view === 'public'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 border border-transparent'
                }`}
              >
                <Eye size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Modo Público</span>
              </button>

              <button
                onClick={() => setView('admin')}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold flex items-center transition-all ${
                  view === 'admin'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800 border border-transparent'
                }`}
              >
                <Shield size={16} className="sm:mr-2" />
                <span className="hidden sm:inline">Administración</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {view === 'public' && renderPublicView()}
        {view === 'admin' && !isAdminLoggedIn && renderLogin()}
        {view === 'admin' && isAdminLoggedIn && renderAdminPanel()}
      </main>
    </div>
  );
}