import React, { useState, useEffect } from 'react';
import { Shield, Eye, Save, LogOut, CheckCircle, AlertCircle, Code, Calendar, Clock, Trash2, Plus, Radio } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// ⚠️ IMPORTANTE: REEMPLAZA ESTO CON LOS DATOS DE TU FIREBASE ⚠️
const firebaseConfig = {
  apiKey: "AIzaSyCPulVLpKjrOX4WkiVCqyPqREMlef1G67U",
  authDomain: "mundial-789c0.firebaseapp.com",
  projectId: "mundial-789c0",
  storageBucket: "mundial-789c0.firebasestorage.app",
  messagingSenderId: "884676359615",
  appId: "1:884676359615:web:0a28115b791b413b3bdd0a"
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

  // Estados del Video Embed
  const [embedCode, setEmbedCode] = useState('');
  const [draftCode, setDraftCode] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Estados del Calendario
  const [matches, setMatches] = useState([]);
  const [newMatch, setNewMatch] = useState({ 
    home: '', homeFlag: '', away: '', awayFlag: '', date: '', status: 'Próximamente' 
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Error al conectar con Firebase:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Escuchar Video y Calendario desde Firebase en tiempo real
  useEffect(() => {
    if (!firebaseUser) return;

    // 1. Conexión del Video
    const embedRef = doc(db, 'artifacts', appId, 'public', 'data', 'embedConfig', 'main');
    const unsubEmbed = onSnapshot(embedRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const cleanCode = forceRemoveSandbox(data.code || '');
        setEmbedCode(cleanCode);
        setDraftCode(cleanCode);
      }
    });

    // 2. Conexión del Calendario
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    const unsubSchedule = onSnapshot(scheduleRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data().matches) {
        // Ordenamos los partidos por fecha automáticamente
        const sortedMatches = snapshot.data().matches.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMatches(sortedMatches);
      } else {
        setMatches([]);
      }
    });

    return () => {
      unsubEmbed();
      unsubSchedule();
    };
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

  // Función para destruir atributos sandbox del video
  const forceRemoveSandbox = (code) => {
    if (!code) return '';
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = code;
      const iframes = tempDiv.getElementsByTagName('iframe');
      for (let i = 0; i < iframes.length; i++) {
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

  // --- Funciones del Gestor de Partidos ---
  const handleAddMatch = async (e) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    const updatedMatches = [...matches, { ...newMatch, id: Date.now().toString() }];
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    await setDoc(scheduleRef, { matches: updatedMatches });
    
    // Limpiar formulario tras guardar
    setNewMatch({ home: '', homeFlag: '', away: '', awayFlag: '', date: '', status: 'Próximamente' });
  };

  const handleDeleteMatch = async (id) => {
    if (!firebaseUser) return;
    const updatedMatches = matches.filter(m => m.id !== id);
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    await setDoc(scheduleRef, { matches: updatedMatches });
  };

  const handleUpdateMatchStatus = async (id, newStatus) => {
    if (!firebaseUser) return;
    const updatedMatches = matches.map(m => m.id === id ? { ...m, status: newStatus } : m);
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    await setDoc(scheduleRef, { matches: updatedMatches });
  };

  const renderPublicView = () => (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-950 min-h-[calc(100vh-64px)] w-full overflow-y-auto">
      
      {/* 1. Zona del Reproductor de Video */}
      <div className="w-full bg-black flex justify-center border-b border-gray-800 shadow-xl">
        <div className="w-full max-w-5xl aspect-video flex items-center justify-center bg-black relative">
          {embedCode ? (
            <div
              className="w-full h-full flex justify-center items-center overflow-hidden"
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

      {/* 2. Zona del Calendario de Partidos */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Calendario de Partidos
          </h2>
          <div className="self-start sm:self-auto text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1.5 rounded-full flex items-center">
            <Clock size={16} className="mr-2" />
            Hora de Guatemala
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-500">
            Aún no hay partidos programados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((match) => {
              const matchDate = new Date(match.date);
              const formattedDate = matchDate.toLocaleDateString('es-GT', { weekday: 'short', month: 'short', day: 'numeric' }).replace('.', '');
              const formattedTime = matchDate.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit', hour12: true });

              return (
                <div key={match.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {formattedDate}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      match.status === 'En Vivo' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse' 
                        : match.status === 'Finalizado'
                        ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                      {match.status === 'En Vivo' ? '🔴 EN VIVO' : match.status === 'Finalizado' ? 'FINALIZADO' : formattedTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto px-2">
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-4xl mb-2 drop-shadow-sm">{match.homeFlag}</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-center text-sm">{match.home}</span>
                    </div>
                    <div className="px-3 font-black text-gray-300 dark:text-gray-600 italic text-lg">VS</div>
                    <div className="flex flex-col items-center flex-1">
                      <span className="text-4xl mb-2 drop-shadow-sm">{match.awayFlag}</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-center text-sm">{match.away}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none" placeholder="Ej: admin" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none" placeholder="••••" required />
          </div>
          {loginError && (
            <div className="flex items-center text-red-500 bg-red-50 p-3 rounded-lg text-sm border border-red-100"><AlertCircle size={18} className="mr-2" />{loginError}</div>
          )}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl mt-2">Ingresar al Panel</button>
        </form>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabecera Admin */}
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <Shield className="mr-2 text-blue-500" size={24}/> Panel de Control Global
          </h2>
          <button onClick={() => setIsAdminLoggedIn(false)} className="flex items-center text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-medium text-sm">
            <LogOut size={16} className="mr-2" /> Salir
          </button>
        </div>

        {/* MÓDULO 1: GESTOR DE VIDEO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Code className="mr-2 text-blue-500" size={20}/> 1. Gestor de Transmisión en Vivo
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <textarea
                value={draftCode}
                onChange={(e) => setDraftCode(e.target.value)}
                className="w-full h-40 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-sm outline-none resize-none"
                placeholder='Pega aquí tu <iframe>'
              />
              <button onClick={handleSaveCode} disabled={saveStatus === 'saving'} className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center">
                <Save size={18} className="mr-2" /> Actualizar Video
              </button>
              <div className="mt-2 text-center h-6">
                {saveStatus === 'success' && <span className="text-green-600 text-sm font-medium">✅ Guardado correctamente</span>}
              </div>
            </div>
            <div className="bg-black rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden aspect-video">
               {embedCode ? <div dangerouslySetInnerHTML={{ __html: embedCode }} className="w-full h-full flex justify-center items-center" /> : <span className="text-gray-500 text-sm">Vista previa vacía</span>}
            </div>
          </div>
        </div>

        {/* MÓDULO 2: GESTOR DE CALENDARIO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20}/> 2. Gestor de Partidos
          </h3>
          
          {/* Formulario Agregar Partido */}
          <form onSubmit={handleAddMatch} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Añadir Nuevo Partido</p>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3 flex gap-2">
                <input type="text" placeholder="Bandera (🇺🇸)" value={newMatch.homeFlag} onChange={e=>setNewMatch({...newMatch, homeFlag: e.target.value})} className="w-16 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center" required/>
                <input type="text" placeholder="Local" value={newMatch.home} onChange={e=>setNewMatch({...newMatch, home: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" required/>
              </div>
              <div className="md:col-span-3 flex gap-2">
                <input type="text" placeholder="Bandera (🇲🇽)" value={newMatch.awayFlag} onChange={e=>setNewMatch({...newMatch, awayFlag: e.target.value})} className="w-16 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-center" required/>
                <input type="text" placeholder="Visita" value={newMatch.away} onChange={e=>setNewMatch({...newMatch, away: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" required/>
              </div>
              <div className="md:col-span-4">
                <input type="datetime-local" value={newMatch.date} onChange={e=>setNewMatch({...newMatch, date: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-white" required/>
              </div>
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                  <Plus size={18} className="mr-1" /> Añadir
                </button>
              </div>
            </div>
          </form>

          {/* Lista de Partidos Administrables */}
          <div className="space-y-3">
            {matches.map(match => {
              const matchDate = new Date(match.date);
              const formattedDate = `${matchDate.getDate()}/${matchDate.getMonth()+1} - ${matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
              
              return (
                <div key={match.id} className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-mono text-gray-500 w-24">{formattedDate}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {match.homeFlag} {match.home} <span className="text-gray-400 font-normal mx-2">vs</span> {match.awayFlag} {match.away}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleUpdateMatchStatus(match.id, 'En Vivo')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center border transition-colors ${match.status === 'En Vivo' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50'}`}
                    >
                      <Radio size={14} className="mr-1" /> {match.status === 'En Vivo' ? 'Transmitiendo' : 'Poner en Vivo'}
                    </button>
                    <button 
                      onClick={() => handleUpdateMatchStatus(match.id, 'Finalizado')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${match.status === 'Finalizado' ? 'bg-gray-200 border-gray-300 text-gray-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Finalizar
                    </button>
                    <button 
                      onClick={() => handleDeleteMatch(match.id)}
                      className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors ml-2"
                      title="Borrar partido"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
            {matches.length === 0 && <p className="text-center text-gray-500 text-sm py-4">No hay partidos agregados.</p>}
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
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">MundialGT Live</span>
            </div>

            <div className="flex space-x-1 sm:space-x-2 items-center">
              <button onClick={() => setView('public')} className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold flex items-center ${view === 'public' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Eye size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Público</span>
              </button>
              <button onClick={() => setView('admin')} className={`px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-sm font-semibold flex items-center ${view === 'admin' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Shield size={16} className="sm:mr-2" /> <span className="hidden sm:inline">Admin</span>
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