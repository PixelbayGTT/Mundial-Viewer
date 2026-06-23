import React, { useState, useEffect } from 'react';
import { Shield, Eye, Save, LogOut, CheckCircle, AlertCircle, Code, Calendar, Clock, Trash2, Plus, Radio, Search, Lock } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
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

const RAW_API_DATA = {
  "matches": [
    {"id":"wc2026-537327","kickoff":{"utc":"2026-06-11T19:00:00Z"},"homeTeam":{"name":"Mexico","crestUrl":"https://crests.football-data.org/769.svg"},"awayTeam":{"name":"South Africa","crestUrl":"https://crests.football-data.org/9396.svg"}},
    {"id":"wc2026-537328","kickoff":{"utc":"2026-06-12T02:00:00Z"},"homeTeam":{"name":"South Korea","crestUrl":"https://crests.football-data.org/772.png"},"awayTeam":{"name":"Czechia","crestUrl":"https://crests.football-data.org/798.svg"}},
    {"id":"wc2026-537333","kickoff":{"utc":"2026-06-12T19:00:00Z"},"homeTeam":{"name":"Canada","crestUrl":"https://crests.football-data.org/canada.svg"},"awayTeam":{"name":"Bosnia-Herzegovina","crestUrl":"https://crests.football-data.org/bosnia.svg"}},
    {"id":"wc2026-537345","kickoff":{"utc":"2026-06-13T01:00:00Z"},"homeTeam":{"name":"United States","crestUrl":"https://crests.football-data.org/usa.svg"},"awayTeam":{"name":"Paraguay","crestUrl":"https://crests.football-data.org/761.svg"}},
    {"id":"wc2026-537334","kickoff":{"utc":"2026-06-13T19:00:00Z"},"homeTeam":{"name":"Qatar","crestUrl":"https://crests.football-data.org/8030.svg"},"awayTeam":{"name":"Switzerland","crestUrl":"https://crests.football-data.org/788.svg"}},
    {"id":"wc2026-537339","kickoff":{"utc":"2026-06-13T22:00:00Z"},"homeTeam":{"name":"Brazil","crestUrl":"https://crests.football-data.org/764.svg"},"awayTeam":{"name":"Morocco","crestUrl":"https://crests.football-data.org/morocco.svg"}},
    {"id":"wc2026-537340","kickoff":{"utc":"2026-06-14T01:00:00Z"},"homeTeam":{"name":"Haiti","crestUrl":"https://crests.football-data.org/haiti.svg"},"awayTeam":{"name":"Scotland","crestUrl":"https://crests.football-data.org/814.svg"}},
    {"id":"wc2026-537346","kickoff":{"utc":"2026-06-14T04:00:00Z"},"homeTeam":{"name":"Australia","crestUrl":"https://crests.football-data.org/779.svg"},"awayTeam":{"name":"Turkey","crestUrl":"https://crests.football-data.org/803.svg"}},
    {"id":"wc2026-537351","kickoff":{"utc":"2026-06-14T17:00:00Z"},"homeTeam":{"name":"Germany","crestUrl":"https://crests.football-data.org/759.svg"},"awayTeam":{"name":"Curaçao","crestUrl":"https://crests.football-data.org/curacao.svg"}},
    {"id":"wc2026-537357","kickoff":{"utc":"2026-06-14T20:00:00Z"},"homeTeam":{"name":"Netherlands","crestUrl":"https://crests.football-data.org/8601.svg"},"awayTeam":{"name":"Japan","crestUrl":"https://crests.football-data.org/766.svg"}},
    {"id":"wc2026-537352","kickoff":{"utc":"2026-06-14T23:00:00Z"},"homeTeam":{"name":"Ivory Coast","crestUrl":"https://crests.football-data.org/787.svg"},"awayTeam":{"name":"Ecuador","crestUrl":"https://crests.football-data.org/791.svg"}},
    {"id":"wc2026-537358","kickoff":{"utc":"2026-06-15T02:00:00Z"},"homeTeam":{"name":"Sweden","crestUrl":"https://crests.football-data.org/792.svg"},"awayTeam":{"name":"Tunisia","crestUrl":"https://crests.football-data.org/tunisia.svg"}},
    {"id":"wc2026-537369","kickoff":{"utc":"2026-06-15T16:00:00Z"},"homeTeam":{"name":"Spain","crestUrl":"https://crests.football-data.org/760.svg"},"awayTeam":{"name":"Cape Verde Islands","crestUrl":"https://crests.football-data.org/cape_verde.svg"}},
    {"id":"wc2026-537363","kickoff":{"utc":"2026-06-15T19:00:00Z"},"homeTeam":{"name":"Belgium","crestUrl":"https://crests.football-data.org/805.svg"},"awayTeam":{"name":"Egypt","crestUrl":"https://crests.football-data.org/825.svg"}},
    {"id":"wc2026-537370","kickoff":{"utc":"2026-06-15T22:00:00Z"},"homeTeam":{"name":"Saudi Arabia","crestUrl":"https://crests.football-data.org/saudi_arabia.svg"},"awayTeam":{"name":"Uruguay","crestUrl":"https://crests.football-data.org/758.svg"}},
    {"id":"wc2026-537364","kickoff":{"utc":"2026-06-16T01:00:00Z"},"homeTeam":{"name":"Iran","crestUrl":"https://crests.football-data.org/iran.svg"},"awayTeam":{"name":"New Zealand","crestUrl":"https://crests.football-data.org/783.svg"}},
    {"id":"wc2026-537391","kickoff":{"utc":"2026-06-16T19:00:00Z"},"homeTeam":{"name":"France","crestUrl":"https://crests.football-data.org/773.svg"},"awayTeam":{"name":"Senegal","crestUrl":"https://crests.football-data.org/senegal.svg"}},
    {"id":"wc2026-537392","kickoff":{"utc":"2026-06-16T22:00:00Z"},"homeTeam":{"name":"Iraq","crestUrl":"https://crests.football-data.org/iraq.svg"},"awayTeam":{"name":"Norway","crestUrl":"https://crests.football-data.org/813.svg"}},
    {"id":"wc2026-537397","kickoff":{"utc":"2026-06-17T01:00:00Z"},"homeTeam":{"name":"Argentina","crestUrl":"https://crests.football-data.org/762.png"},"awayTeam":{"name":"Algeria","crestUrl":"https://crests.football-data.org/algeria.svg"}},
    {"id":"wc2026-537398","kickoff":{"utc":"2026-06-17T04:00:00Z"},"homeTeam":{"name":"Austria","crestUrl":"https://crests.football-data.org/816.svg"},"awayTeam":{"name":"Jordan","crestUrl":"https://crests.football-data.org/8049.png"}},
    {"id":"wc2026-537403","kickoff":{"utc":"2026-06-17T17:00:00Z"},"homeTeam":{"name":"Portugal","crestUrl":"https://crests.football-data.org/765.svg"},"awayTeam":{"name":"Congo DR","crestUrl":"https://crests.football-data.org/congo_dr.svg"}},
    {"id":"wc2026-537409","kickoff":{"utc":"2026-06-17T20:00:00Z"},"homeTeam":{"name":"England","crestUrl":"https://crests.football-data.org/770.svg"},"awayTeam":{"name":"Croatia","crestUrl":"https://crests.football-data.org/799.svg"}},
    {"id":"wc2026-537410","kickoff":{"utc":"2026-06-17T23:00:00Z"},"homeTeam":{"name":"Ghana","crestUrl":"https://crests.football-data.org/ghana.svg"},"awayTeam":{"name":"Panama","crestUrl":"https://crests.football-data.org/panama.svg"}},
    {"id":"wc2026-537404","kickoff":{"utc":"2026-06-18T02:00:00Z"},"homeTeam":{"name":"Uzbekistan","crestUrl":"https://crests.football-data.org/8070.png"},"awayTeam":{"name":"Colombia","crestUrl":"https://crests.football-data.org/818.svg"}},
    {"id":"wc2026-537329","kickoff":{"utc":"2026-06-18T16:00:00Z"},"homeTeam":{"name":"Czechia","crestUrl":"https://crests.football-data.org/798.svg"},"awayTeam":{"name":"South Africa","crestUrl":"https://crests.football-data.org/9396.svg"}},
    {"id":"wc2026-537335","kickoff":{"utc":"2026-06-18T19:00:00Z"},"homeTeam":{"name":"Switzerland","crestUrl":"https://crests.football-data.org/788.svg"},"awayTeam":{"name":"Bosnia-Herzegovina","crestUrl":"https://crests.football-data.org/bosnia.svg"}},
    {"id":"wc2026-537336","kickoff":{"utc":"2026-06-18T22:00:00Z"},"homeTeam":{"name":"Canada","crestUrl":"https://crests.football-data.org/canada.svg"},"awayTeam":{"name":"Qatar","crestUrl":"https://crests.football-data.org/8030.svg"}},
    {"id":"wc2026-537330","kickoff":{"utc":"2026-06-19T01:00:00Z"},"homeTeam":{"name":"Mexico","crestUrl":"https://crests.football-data.org/769.svg"},"awayTeam":{"name":"South Korea","crestUrl":"https://crests.football-data.org/772.png"}},
    {"id":"wc2026-537348","kickoff":{"utc":"2026-06-19T19:00:00Z"},"homeTeam":{"name":"United States","crestUrl":"https://crests.football-data.org/usa.svg"},"awayTeam":{"name":"Australia","crestUrl":"https://crests.football-data.org/779.svg"}},
    {"id":"wc2026-537342","kickoff":{"utc":"2026-06-19T22:00:00Z"},"homeTeam":{"name":"Scotland","crestUrl":"https://crests.football-data.org/814.svg"},"awayTeam":{"name":"Morocco","crestUrl":"https://crests.football-data.org/morocco.svg"}},
    {"id":"wc2026-537341","kickoff":{"utc":"2026-06-20T00:30:00Z"},"homeTeam":{"name":"Brazil","crestUrl":"https://crests.football-data.org/764.svg"},"awayTeam":{"name":"Haiti","crestUrl":"https://crests.football-data.org/haiti.svg"}},
    {"id":"wc2026-537347","kickoff":{"utc":"2026-06-20T03:00:00Z"},"homeTeam":{"name":"Turkey","crestUrl":"https://crests.football-data.org/803.svg"},"awayTeam":{"name":"Paraguay","crestUrl":"https://crests.football-data.org/761.svg"}},
    {"id":"wc2026-537359","kickoff":{"utc":"2026-06-20T17:00:00Z"},"homeTeam":{"name":"Netherlands","crestUrl":"https://crests.football-data.org/8601.svg"},"awayTeam":{"name":"Sweden","crestUrl":"https://crests.football-data.org/792.svg"}},
    {"id":"wc2026-537353","kickoff":{"utc":"2026-06-20T20:00:00Z"},"homeTeam":{"name":"Germany","crestUrl":"https://crests.football-data.org/759.svg"},"awayTeam":{"name":"Ivory Coast","crestUrl":"https://crests.football-data.org/787.svg"}},
    {"id":"wc2026-537354","kickoff":{"utc":"2026-06-21T00:00:00Z"},"homeTeam":{"name":"Ecuador","crestUrl":"https://crests.football-data.org/791.svg"},"awayTeam":{"name":"Curaçao","crestUrl":"https://crests.football-data.org/curacao.svg"}},
    {"id":"wc2026-537360","kickoff":{"utc":"2026-06-21T04:00:00Z"},"homeTeam":{"name":"Tunisia","crestUrl":"https://crests.football-data.org/tunisia.svg"},"awayTeam":{"name":"Japan","crestUrl":"https://crests.football-data.org/766.svg"}},
    {"id":"wc2026-537371","kickoff":{"utc":"2026-06-21T16:00:00Z"},"homeTeam":{"name":"Spain","crestUrl":"https://crests.football-data.org/760.svg"},"awayTeam":{"name":"Saudi Arabia","crestUrl":"https://crests.football-data.org/saudi_arabia.svg"}},
    {"id":"wc2026-537365","kickoff":{"utc":"2026-06-21T19:00:00Z"},"homeTeam":{"name":"Belgium","crestUrl":"https://crests.football-data.org/805.svg"},"awayTeam":{"name":"Iran","crestUrl":"https://crests.football-data.org/iran.svg"}},
    {"id":"wc2026-537372","kickoff":{"utc":"2026-06-21T22:00:00Z"},"homeTeam":{"name":"Uruguay","crestUrl":"https://crests.football-data.org/758.svg"},"awayTeam":{"name":"Cape Verde Islands","crestUrl":"https://crests.football-data.org/cape_verde.svg"}},
    {"id":"wc2026-537366","kickoff":{"utc":"2026-06-22T01:00:00Z"},"homeTeam":{"name":"New Zealand","crestUrl":"https://crests.football-data.org/783.svg"},"awayTeam":{"name":"Egypt","crestUrl":"https://crests.football-data.org/825.svg"}},
    {"id":"wc2026-537399","kickoff":{"utc":"2026-06-22T17:00:00Z"},"homeTeam":{"name":"Argentina","crestUrl":"https://crests.football-data.org/762.png"},"awayTeam":{"name":"Austria","crestUrl":"https://crests.football-data.org/816.svg"}},
    {"id":"wc2026-537393","kickoff":{"utc":"2026-06-22T21:00:00Z"},"homeTeam":{"name":"France","crestUrl":"https://crests.football-data.org/773.svg"},"awayTeam":{"name":"Iraq","crestUrl":"https://crests.football-data.org/iraq.svg"}},
    {"id":"wc2026-537394","kickoff":{"utc":"2026-06-23T00:00:00Z"},"homeTeam":{"name":"Norway","crestUrl":"https://crests.football-data.org/813.svg"},"awayTeam":{"name":"Senegal","crestUrl":"https://crests.football-data.org/senegal.svg"}},
    {"id":"wc2026-537400","kickoff":{"utc":"2026-06-23T03:00:00Z"},"homeTeam":{"name":"Jordan","crestUrl":"https://crests.football-data.org/8049.png"},"awayTeam":{"name":"Algeria","crestUrl":"https://crests.football-data.org/algeria.svg"}},
    {"id":"wc2026-537405","kickoff":{"utc":"2026-06-23T17:00:00Z"},"homeTeam":{"name":"Portugal","crestUrl":"https://crests.football-data.org/765.svg"},"awayTeam":{"name":"Uzbekistan","crestUrl":"https://crests.football-data.org/8070.png"}},
    {"id":"wc2026-537411","kickoff":{"utc":"2026-06-23T20:00:00Z"},"homeTeam":{"name":"England","crestUrl":"https://crests.football-data.org/770.svg"},"awayTeam":{"name":"Ghana","crestUrl":"https://crests.football-data.org/ghana.svg"}},
    {"id":"wc2026-537412","kickoff":{"utc":"2026-06-23T23:00:00Z"},"homeTeam":{"name":"Panama","crestUrl":"https://crests.football-data.org/panama.svg"},"awayTeam":{"name":"Croatia","crestUrl":"https://crests.football-data.org/799.svg"}},
    {"id":"wc2026-537406","kickoff":{"utc":"2026-06-24T02:00:00Z"},"homeTeam":{"name":"Colombia","crestUrl":"https://crests.football-data.org/818.svg"},"awayTeam":{"name":"Congo DR","crestUrl":"https://crests.football-data.org/congo_dr.svg"}},
    {"id":"wc2026-537337","kickoff":{"utc":"2026-06-24T19:00:00Z"},"homeTeam":{"name":"Switzerland","crestUrl":"https://crests.football-data.org/788.svg"},"awayTeam":{"name":"Canada","crestUrl":"https://crests.football-data.org/canada.svg"}},
    {"id":"wc2026-537338","kickoff":{"utc":"2026-06-24T19:00:00Z"},"homeTeam":{"name":"Bosnia-Herzegovina","crestUrl":"https://crests.football-data.org/bosnia.svg"},"awayTeam":{"name":"Qatar","crestUrl":"https://crests.football-data.org/8030.svg"}},
    {"id":"wc2026-537344","kickoff":{"utc":"2026-06-24T22:00:00Z"},"homeTeam":{"name":"Morocco","crestUrl":"https://crests.football-data.org/morocco.svg"},"awayTeam":{"name":"Haiti","crestUrl":"https://crests.football-data.org/haiti.svg"}},
    {"id":"wc2026-537343","kickoff":{"utc":"2026-06-24T22:00:00Z"},"homeTeam":{"name":"Scotland","crestUrl":"https://crests.football-data.org/814.svg"},"awayTeam":{"name":"Brazil","crestUrl":"https://crests.football-data.org/764.svg"}},
    {"id":"wc2026-537331","kickoff":{"utc":"2026-06-25T01:00:00Z"},"homeTeam":{"name":"Czechia","crestUrl":"https://crests.football-data.org/798.svg"},"awayTeam":{"name":"Mexico","crestUrl":"https://crests.football-data.org/769.svg"}},
    {"id":"wc2026-537332","kickoff":{"utc":"2026-06-25T01:00:00Z"},"homeTeam":{"name":"South Africa","crestUrl":"https://crests.football-data.org/9396.svg"},"awayTeam":{"name":"South Korea","crestUrl":"https://crests.football-data.org/772.png"}},
    {"id":"wc2026-537355","kickoff":{"utc":"2026-06-25T20:00:00Z"},"homeTeam":{"name":"Ecuador","crestUrl":"https://crests.football-data.org/791.svg"},"awayTeam":{"name":"Germany","crestUrl":"https://crests.football-data.org/759.svg"}},
    {"id":"wc2026-537356","kickoff":{"utc":"2026-06-25T20:00:00Z"},"homeTeam":{"name":"Curaçao","crestUrl":"https://crests.football-data.org/curacao.svg"},"awayTeam":{"name":"Ivory Coast","crestUrl":"https://crests.football-data.org/787.svg"}},
    {"id":"wc2026-537361","kickoff":{"utc":"2026-06-25T23:00:00Z"},"homeTeam":{"name":"Tunisia","crestUrl":"https://crests.football-data.org/tunisia.svg"},"awayTeam":{"name":"Netherlands","crestUrl":"https://crests.football-data.org/8601.svg"}},
    {"id":"wc2026-537362","kickoff":{"utc":"2026-06-25T23:00:00Z"},"homeTeam":{"name":"Japan","crestUrl":"https://crests.football-data.org/766.svg"},"awayTeam":{"name":"Sweden","crestUrl":"https://crests.football-data.org/792.svg"}},
    {"id":"wc2026-537349","kickoff":{"utc":"2026-06-26T02:00:00Z"},"homeTeam":{"name":"Turkey","crestUrl":"https://crests.football-data.org/803.svg"},"awayTeam":{"name":"United States","crestUrl":"https://crests.football-data.org/usa.svg"}},
    {"id":"wc2026-537350","kickoff":{"utc":"2026-06-26T02:00:00Z"},"homeTeam":{"name":"Paraguay","crestUrl":"https://crests.football-data.org/761.svg"},"awayTeam":{"name":"Australia","crestUrl":"https://crests.football-data.org/779.svg"}},
    {"id":"wc2026-537395","kickoff":{"utc":"2026-06-26T19:00:00Z"},"homeTeam":{"name":"Norway","crestUrl":"https://crests.football-data.org/813.svg"},"awayTeam":{"name":"France","crestUrl":"https://crests.football-data.org/773.svg"}},
    {"id":"wc2026-537396","kickoff":{"utc":"2026-06-26T19:00:00Z"},"homeTeam":{"name":"Senegal","crestUrl":"https://crests.football-data.org/senegal.svg"},"awayTeam":{"name":"Iraq","crestUrl":"https://crests.football-data.org/iraq.svg"}},
    {"id":"wc2026-537373","kickoff":{"utc":"2026-06-27T00:00:00Z"},"homeTeam":{"name":"Uruguay","crestUrl":"https://crests.football-data.org/758.svg"},"awayTeam":{"name":"Spain","crestUrl":"https://crests.football-data.org/760.svg"}},
    {"id":"wc2026-537374","kickoff":{"utc":"2026-06-27T00:00:00Z"},"homeTeam":{"name":"Cape Verde Islands","crestUrl":"https://crests.football-data.org/cape_verde.svg"},"awayTeam":{"name":"Saudi Arabia","crestUrl":"https://crests.football-data.org/saudi_arabia.svg"}},
    {"id":"wc2026-537367","kickoff":{"utc":"2026-06-27T03:00:00Z"},"homeTeam":{"name":"New Zealand","crestUrl":"https://crests.football-data.org/783.svg"},"awayTeam":{"name":"Belgium","crestUrl":"https://crests.football-data.org/805.svg"}},
    {"id":"wc2026-537368","kickoff":{"utc":"2026-06-27T03:00:00Z"},"homeTeam":{"name":"Egypt","crestUrl":"https://crests.football-data.org/825.svg"},"awayTeam":{"name":"Iran","crestUrl":"https://crests.football-data.org/iran.svg"}},
    {"id":"wc2026-537413","kickoff":{"utc":"2026-06-27T21:00:00Z"},"homeTeam":{"name":"Panama","crestUrl":"https://crests.football-data.org/panama.svg"},"awayTeam":{"name":"England","crestUrl":"https://crests.football-data.org/770.svg"}},
    {"id":"wc2026-537414","kickoff":{"utc":"2026-06-27T21:00:00Z"},"homeTeam":{"name":"Croatia","crestUrl":"https://crests.football-data.org/799.svg"},"awayTeam":{"name":"Ghana","crestUrl":"https://crests.football-data.org/ghana.svg"}},
    {"id":"wc2026-537407","kickoff":{"utc":"2026-06-27T23:30:00Z"},"homeTeam":{"name":"Colombia","crestUrl":"https://crests.football-data.org/818.svg"},"awayTeam":{"name":"Portugal","crestUrl":"https://crests.football-data.org/765.svg"}},
    {"id":"wc2026-537408","kickoff":{"utc":"2026-06-27T23:30:00Z"},"homeTeam":{"name":"Congo DR","crestUrl":"https://crests.football-data.org/congo_dr.svg"},"awayTeam":{"name":"Uzbekistan","crestUrl":"https://crests.football-data.org/8070.png"}},
    {"id":"wc2026-537401","kickoff":{"utc":"2026-06-28T02:00:00Z"},"homeTeam":{"name":"Jordan","crestUrl":"https://crests.football-data.org/8049.png"},"awayTeam":{"name":"Argentina","crestUrl":"https://crests.football-data.org/762.png"}},
    {"id":"wc2026-537402","kickoff":{"utc":"2026-06-28T02:00:00Z"},"homeTeam":{"name":"Algeria","crestUrl":"https://crests.football-data.org/algeria.svg"},"awayTeam":{"name":"Austria","crestUrl":"https://crests.football-data.org/816.svg"}}
  ]
};

// Helper para convertir fecha UTC a la hora local para el input type="datetime-local"
const getLocalDatetime = (utcString) => {
  if (!utcString) return "";
  const d = new Date(utcString);
  // Ajuste automático según la zona horaria del dispositivo que usa el Admin
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

// Generamos la base de datos limpia para el selector
const matchDatabase = RAW_API_DATA.matches.map(match => ({
  id: match.id,
  home: match.homeTeam.name || "TBD",
  homeFlag: match.homeTeam.crestUrl || "🏳️",
  away: match.awayTeam.name || "TBD",
  awayFlag: match.awayTeam.crestUrl || "🏴",
  defaultTime: getLocalDatetime(match.kickoff?.utc)
}));

export default function App() {
  const [view, setView] = useState('public');
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Login de Usuarios Públicos
  const [publicEmail, setPublicEmail] = useState('');
  const [publicPassword, setPublicPassword] = useState('');
  const [publicLoginError, setPublicLoginError] = useState('');

  // Login de Administrador
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [embedCode, setEmbedCode] = useState('');
  const [draftCode, setDraftCode] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const [matches, setMatches] = useState([]);
  const [newMatch, setNewMatch] = useState({ 
    home: '', homeFlag: '', away: '', awayFlag: '', date: '', status: 'Próximamente' 
  });

  useEffect(() => {
    // Escucha automáticamente si el usuario ya inició sesión
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Si no hay usuario logueado, pero es el admin desde el panel duro, o es un user de firebase
    const embedRef = doc(db, 'artifacts', appId, 'public', 'data', 'embedConfig', 'main');
    const unsubEmbed = onSnapshot(embedRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const cleanCode = forceRemoveSandbox(data.code || '');
        setEmbedCode(cleanCode);
        setDraftCode(cleanCode);
      }
    });

    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    const unsubSchedule = onSnapshot(scheduleRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data().matches) {
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
  }, []); // Quitamos la dependencia estricta de firebaseUser para que escuche de todos modos si Firebase rules lo permiten

  const handlePublicLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, publicEmail, publicPassword);
      setPublicLoginError('');
      setPublicEmail('');
      setPublicPassword('');
    } catch (error) {
      console.error(error);
      setPublicLoginError('El usuario o la contraseña son incorrectos.');
    }
  };

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

  const handleAddMatch = async (e) => {
    e.preventDefault();
    const updatedMatches = [...matches, { ...newMatch, id: Date.now().toString() }];
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    await setDoc(scheduleRef, { matches: updatedMatches });
    setNewMatch({ home: '', homeFlag: '', away: '', awayFlag: '', date: '', status: 'Próximamente' });
  };

  const handleDeleteMatch = async (id) => {
    const updatedMatches = matches.filter(m => m.id !== id);
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    await setDoc(scheduleRef, { matches: updatedMatches });
  };

  const handleUpdateMatchStatus = async (id, newStatus) => {
    const updatedMatches = matches.map(m => m.id === id ? { ...m, status: newStatus } : m);
    const scheduleRef = doc(db, 'artifacts', appId, 'public', 'data', 'schedule', 'main');
    await setDoc(scheduleRef, { matches: updatedMatches });
  };

  // Helper para mostrar Banderas o Emojis
  const renderFlag = (flagUrl, sizeClass = "w-12 h-12 md:w-16 md:h-16") => {
    if (!flagUrl) return <span className="text-4xl">🏳️</span>;
    if (flagUrl.startsWith('http')) {
      return <img src={flagUrl} className={`${sizeClass} object-contain drop-shadow-md`} alt="flag" />;
    }
    return <span className="text-4xl md:text-5xl drop-shadow-sm">{flagUrl}</span>;
  };

  const renderPublicLogin = () => (
    <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4 min-h-[calc(100vh-64px)]">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-800">
        <div className="text-center mb-8">
          <div className="inline-flex bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
            <Lock className="text-blue-600 dark:text-blue-400" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Acceso Privado</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Ingresa tus datos para ver las transmisiones.</p>
        </div>

        <form onSubmit={handlePublicLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Correo Electrónico</label>
            <input type="email" value={publicEmail} onChange={(e) => setPublicEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
            <input type="password" value={publicPassword} onChange={(e) => setPublicPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none" required />
          </div>
          {publicLoginError && <div className="flex items-center text-red-500 bg-red-50 p-3 rounded-lg text-sm border border-red-100"><AlertCircle size={18} className="mr-2" />{publicLoginError}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl mt-2">Iniciar Sesión</button>
        </form>
      </div>
    </div>
  );

  const renderPublicView = () => (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-950 min-h-[calc(100vh-64px)] w-full overflow-y-auto">
      <div className="w-full bg-black flex justify-center border-b border-gray-800 shadow-xl">
        <div className="w-full max-w-5xl aspect-video flex items-center justify-center bg-black relative">
          {embedCode ? (
            <div className="w-full h-full flex justify-center items-center overflow-hidden" dangerouslySetInnerHTML={{ __html: embedCode }} />
          ) : (
            <div className="text-center text-gray-500 flex flex-col items-center p-6">
              <Code size={64} className="mb-4 opacity-50" />
              <p className="text-xl font-medium">Esperando transmisión...</p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-blue-900 text-blue-100 text-xs sm:text-sm py-2.5 px-4 flex items-center justify-center border-b border-blue-950 shadow-inner">
        <AlertCircle size={18} className="mr-2.5 text-blue-300 flex-shrink-0" />
        <span className="text-center">
          <strong className="text-white">💡 Tip:</strong> La transmisión puede tener ventanas de publicidad externas al hacer clic. Te recomendamos usar el navegador <strong>Brave</strong> o <strong>uBlock Origin</strong>.
        </span>
      </div>

      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Calendar className="mr-3 text-blue-600 dark:text-blue-400" size={28} />
            Calendario de Partidos
          </h2>
          <div className="self-start sm:self-auto text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1.5 rounded-full flex items-center">
            <Clock size={16} className="mr-2" />
            Hora Local
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
                <div key={match.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {formattedDate}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      match.status === 'En Vivo' 
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 animate-pulse ring-1 ring-red-300' 
                        : match.status === 'Finalizado'
                        ? 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-200'
                    }`}>
                      {match.status === 'En Vivo' ? '🔴 EN VIVO' : match.status === 'Finalizado' ? 'FINALIZADO' : formattedTime}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col items-center flex-1 w-1/3">
                      <div className="mb-3">{renderFlag(match.homeFlag)}</div>
                      <span className="font-semibold text-gray-900 dark:text-white text-center text-sm w-full truncate">{match.home}</span>
                    </div>
                    <div className="px-2 font-black text-gray-300 dark:text-gray-600 italic text-xl">VS</div>
                    <div className="flex flex-col items-center flex-1 w-1/3">
                      <div className="mb-3">{renderFlag(match.awayFlag)}</div>
                      <span className="font-semibold text-gray-900 dark:text-white text-center text-sm w-full truncate">{match.away}</span>
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
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Usuario</label>
            <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contraseña</label>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none" required />
          </div>
          {loginError && <div className="flex items-center text-red-500 bg-red-50 p-3 rounded-lg text-sm border border-red-100"><AlertCircle size={18} className="mr-2" />{loginError}</div>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl mt-2">Ingresar</button>
        </form>
      </div>
    </div>
  );

  const renderAdminPanel = () => (
    <div className="flex-1 p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <Shield className="mr-2 text-blue-500" size={24}/> Panel de Control Global
          </h2>
          <button onClick={() => setIsAdminLoggedIn(false)} className="flex items-center text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl font-medium text-sm">
            <LogOut size={16} className="mr-2" /> Salir
          </button>
        </div>

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
            </div>
            <div className="bg-black rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden aspect-video">
               {embedCode ? <div dangerouslySetInnerHTML={{ __html: embedCode }} className="w-full h-full flex justify-center items-center" /> : <span className="text-gray-500 text-sm">Vista previa vacía</span>}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 lg:p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <Calendar className="mr-2 text-blue-500" size={20}/> 2. Gestor de Partidos
          </h3>
          
          <form onSubmit={handleAddMatch} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Añadir Partido desde Base de Datos</p>

            <div className="mb-4 flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2">
              <Search size={18} className="text-gray-400 mr-2" />
              <select
                className="w-full bg-transparent outline-none text-gray-700 dark:text-white"
                onChange={(e) => {
                  const matchId = e.target.value;
                  if (!matchId) return;
                  const template = matchDatabase.find(m => m.id === matchId);
                  if (template) {
                    setNewMatch({ ...newMatch, home: template.home, homeFlag: template.homeFlag, away: template.away, awayFlag: template.awayFlag, date: template.defaultTime });
                  }
                }}
              >
                <option value="">Buscar en la base de datos oficial del Mundial 2026...</option>
                {matchDatabase.map(m => {
                  const localD = m.defaultTime ? new Date(m.defaultTime).toLocaleDateString([], {month:'short', day:'numeric'}) : '';
                  return (
                    <option key={m.id} value={m.id}>
                      {m.home} vs {m.away} ({localD})
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-3 flex gap-2">
                <input type="text" placeholder="URL Bandera/Emoji" value={newMatch.homeFlag} onChange={e=>setNewMatch({...newMatch, homeFlag: e.target.value})} className="w-16 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-center" title="Puede ser Emoji o enlace de imagen" required/>
                <input type="text" placeholder="Local" value={newMatch.home} onChange={e=>setNewMatch({...newMatch, home: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800" required/>
              </div>
              <div className="md:col-span-3 flex gap-2">
                <input type="text" placeholder="URL Bandera/Emoji" value={newMatch.awayFlag} onChange={e=>setNewMatch({...newMatch, awayFlag: e.target.value})} className="w-16 px-2 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs text-center" title="Puede ser Emoji o enlace de imagen" required/>
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

          <div className="space-y-3">
            {matches.map(match => {
              const matchDate = new Date(match.date);
              const formattedDate = `${matchDate.getDate()}/${matchDate.getMonth()+1} - ${matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
              
              return (
                <div key={match.id} className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="text-sm font-mono text-gray-500 w-24">{formattedDate}</span>
                    <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <div className="w-6 h-6 flex items-center justify-center">{renderFlag(match.homeFlag, "w-6 h-6")}</div>
                      <span>{match.home}</span> 
                      <span className="text-gray-400 font-normal mx-1">vs</span> 
                      <div className="w-6 h-6 flex items-center justify-center">{renderFlag(match.awayFlag, "w-6 h-6")}</div>
                      <span>{match.away}</span>
                    </div>
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
              {view === 'public' && firebaseUser && (
                <button onClick={() => signOut(auth)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors mr-2">
                  Salir
                </button>
              )}
              
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
        {view === 'public' && !firebaseUser && renderPublicLogin()}
        {view === 'public' && firebaseUser && renderPublicView()}
        {view === 'admin' && !isAdminLoggedIn && renderLogin()}
        {view === 'admin' && isAdminLoggedIn && renderAdminPanel()}
      </main>
    </div>
  );
}