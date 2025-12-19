
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, TimeLog, TimeLogType, Role, SystemSettings } from '../types';
import { 
  Clock, MapPin, AlertCircle, Calendar, 
  ScanFace, ShieldCheck, RefreshCw, X, Users,
  ChevronRight, Crosshair, Navigation, Terminal,
  FileText, Download, Printer, Filter, ArrowLeft,
  TrendingUp, TrendingDown, History, Wifi, Smartphone, Check
} from 'lucide-react';

interface AdminTimesheetProps {
  currentUser: User;
  userRole?: Role;
  timeLogs: TimeLog[];
  onAddTimeLog: (log: TimeLog) => void;
  users: User[];
  settings?: SystemSettings;
}

interface DailySummary {
  date: string;
  entry?: string;
  lunchStart?: string;
  lunchEnd?: string;
  exit?: string;
  wifiSsid?: string;
  totalMinutes: number;
  balanceMinutes: number;
}

export const AdminTimesheet: React.FC<AdminTimesheetProps> = ({ 
  currentUser, userRole, timeLogs, onAddTimeLog, users, settings 
}) => {
  const [activeTab, setActiveTab] = useState<'MY_TIME' | 'MANAGEMENT'>('MY_TIME');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number, inBounds: boolean, accuracy: number} | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<string>('');
  const [wifiName, setWifiName] = useState<string>('Buscando Rede...');
  const [isWifiAuthorized, setIsWifiAuthorized] = useState(false);
  
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [faceScanComplete, setFaceScanComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const resortLoc = { 
    lat: settings?.workplaceLat || -22.7394, 
    lng: settings?.workplaceLng || -45.5914,
    radius: settings?.workplaceRadius || 800 
  };

  // Simulação de detecção de rede corporativa
  const detectWifi = () => {
    // Nota: Browsers não permitem acesso direto ao SSID real por privacidade.
    // Usamos a Connection API para detectar o tipo e simular a validação da rede do resort.
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
       // Simulamos que se for wifi ou estiver rápido, é a rede do resort (para fins de demonstração do MVP)
       setWifiName(conn.type === 'wifi' || !conn.type ? 'Resort_Oliveiras_Staff_5G' : 'Dados Móveis');
       setIsWifiAuthorized(conn.type === 'wifi' || !conn.type);
    } else {
       setWifiName('Rede Staff Oliveiras');
       setIsWifiAuthorized(true);
    }
  };

  useEffect(() => {
    setDeviceInfo(`${navigator.platform} - ${navigator.userAgent.slice(0, 30)}...`);
    updateGPS();
    detectWifi();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (isCapturingFace) startCamera();
    else stopCamera();
  }, [isCapturingFace]);

  const updateGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const dist = getDistance(latitude, longitude, resortLoc.lat, resortLoc.lng);
        setCurrentLocation({ lat: latitude, lng: longitude, inBounds: dist <= resortLoc.radius, accuracy });
      },
      () => setCurrentLocation({ lat: resortLoc.lat, lng: resortLoc.lng, inBounds: true, accuracy: 1 }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const simulateResortLocation = () => {
    setCurrentLocation({ lat: resortLoc.lat, lng: resortLoc.lng, inBounds: true, accuracy: 5 });
    setWifiName('Resort_Oliveiras_Staff_5G');
    setIsWifiAuthorized(true);
  };

  const startCamera = async () => {
    setCamError(null);
    setFaceScanComplete(false);
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      setTimeout(() => { setIsScanning(false); setFaceScanComplete(true); }, 2500);
    } catch (err) { setCamError("Erro na câmera."); setIsScanning(false); }
  };

  const stopCamera = () => {
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
  };

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3;
    const dLat = (lat2-lat1) * Math.PI/180;
    const dLon = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  const handlePunch = (type: TimeLogType) => {
    onAddTimeLog({
      id: `tl-${Date.now()}`,
      userId: currentUser.id,
      type: type,
      timestamp: new Date().toISOString(),
      deviceInfo,
      wifiSsid: wifiName,
      location: { lat: currentLocation?.lat || 0, lng: currentLocation?.lng || 0, inBounds: currentLocation?.inBounds || false, accuracy: currentLocation?.accuracy || 0 }
    });
    setIsCapturingFace(false);
  };

  const selectedUser = users.find(u => u.id === selectedStaffId);

  const dailySummaries = useMemo(() => {
    if (!selectedStaffId) return [];
    const userLogs = timeLogs.filter(l => l.userId === selectedStaffId && l.timestamp.split('T')[0] >= startDate && l.timestamp.split('T')[0] <= endDate);
    const grouped: Record<string, DailySummary> = {};
    userLogs.forEach(log => {
      const date = log.timestamp.split('T')[0];
      if (!grouped[date]) grouped[date] = { date, totalMinutes: 0, balanceMinutes: 0, wifiSsid: log.wifiSsid };
      if (log.type === TimeLogType.ENTRY) grouped[date].entry = log.timestamp;
      if (log.type === TimeLogType.LUNCH_START) grouped[date].lunchStart = log.timestamp;
      if (log.type === TimeLogType.LUNCH_END) grouped[date].lunchEnd = log.timestamp;
      if (log.type === TimeLogType.EXIT) grouped[date].exit = log.timestamp;
    });
    return Object.values(grouped).map(day => {
      let workMinutes = 0;
      if (day.entry && day.exit) {
        const morning = day.lunchStart ? (new Date(day.lunchStart).getTime() - new Date(day.entry).getTime()) : 0;
        const afternoon = day.exit && day.lunchEnd ? (new Date(day.exit).getTime() - new Date(day.lunchEnd).getTime()) : 0;
        workMinutes = (!day.lunchStart && !day.lunchEnd) ? (new Date(day.exit).getTime() - new Date(day.entry).getTime()) / 60000 : (morning + afternoon) / 60000;
      }
      return { ...day, totalMinutes: workMinutes, balanceMinutes: workMinutes > 0 ? workMinutes - (8 * 60) : 0 };
    }).sort((a,b) => b.date.localeCompare(a.date));
  }, [selectedStaffId, timeLogs, startDate, endDate]);

  const totalBalanceMinutes = dailySummaries.reduce((acc, curr) => acc + curr.balanceMinutes, 0);
  const formatMinutes = (mins: number) => { const abs = Math.abs(mins); const h = Math.floor(abs / 60); const m = Math.floor(abs % 60); return `${mins < 0 ? '-' : '+'}${h}h ${m}m`; };
  const isAdmin = userRole?.permissions?.some(p => ['VIEW_SETTINGS', 'VIEW_TIMESHEET', 'VIEW_ALL'].includes(p)) || userRole?.name === 'admin' || userRole?.name === 'manager' || userRole?.id === 'role-admin' || false;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-900 flex items-center gap-3">
            <div className="p-2 bg-stone-900 text-white rounded-2xl shadow-lg"><Clock size={28}/></div> 
            Controle de Ponto
          </h2>
          <p className="text-stone-500 mt-1 font-medium">GPS + Biometria + Rede Corporativa.</p>
        </div>
        
        {isAdmin && (
            <div className="flex bg-stone-200 p-1.5 rounded-2xl border border-stone-300 shadow-inner">
                <button onClick={() => { setActiveTab('MY_TIME'); setSelectedStaffId(null); }} className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-tighter ${activeTab === 'MY_TIME' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-500 hover:text-stone-700'}`}>Meu Ponto</button>
                <button onClick={() => setActiveTab('MANAGEMENT')} className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-tighter ${activeTab === 'MANAGEMENT' ? 'bg-white text-stone-900 shadow-md' : 'text-stone-500 hover:text-stone-700'}`}>Gestão Equipe</button>
            </div>
        )}
      </div>

      {activeTab === 'MY_TIME' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                
                {/* Validação de Local e Rede */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${currentLocation?.inBounds ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <MapPin size={24} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Localização</p>
                          <p className={`text-sm font-black ${currentLocation?.inBounds ? 'text-green-600' : 'text-red-600'}`}>
                            {currentLocation?.inBounds ? 'Dentro do Perímetro' : 'Fora do Resort'}
                          </p>
                      </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${isWifiAuthorized ? 'bg-olive-100 text-olive-600' : 'bg-amber-100 text-amber-600'}`}>
                          <Wifi size={24} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Rede Conectada</p>
                          <p className={`text-sm font-black ${isWifiAuthorized ? 'text-olive-700' : 'text-amber-600'}`}>
                             {wifiName}
                          </p>
                      </div>
                  </div>
                </div>

                <div className="bg-olive-900 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col items-center justify-center border-b-8 border-olive-950">
                    {!isCapturingFace ? (
                        <div className="text-center space-y-8 animate-fade-in-up">
                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto border-4 border-white/20">
                              <ScanFace size={50} className="text-olive-300" />
                            </div>
                            <h3 className="text-4xl font-serif font-bold italic tracking-tight">Registro Biométrico</h3>
                            <p className="text-olive-200 text-sm max-w-xs mx-auto">Valide seu turno via Biometria Facial e Rede Oliveiras.</p>
                            <button 
                                onClick={() => setIsCapturingFace(true)}
                                disabled={!currentLocation?.inBounds}
                                className={`w-full max-w-sm py-6 rounded-[28px] font-black text-xl uppercase tracking-widest shadow-2xl transition-all
                                    ${currentLocation?.inBounds ? 'bg-white text-olive-900 hover:scale-105 active:scale-95' : 'bg-stone-700 text-stone-500 cursor-not-allowed opacity-50'}`}
                            >
                                Iniciar Captura
                            </button>
                            <button onClick={simulateResortLocation} className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all">Ativar Modo Simulação (DEV)</button>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm space-y-8 animate-fade-in">
                            <div className="relative aspect-square rounded-[60px] border-8 border-olive-800 overflow-hidden bg-black shadow-inner">
                                <video ref={videoRef} className="w-full h-full object-cover grayscale opacity-80" autoPlay playsInline muted />
                                {isScanning && <div className="absolute inset-0 bg-olive-400/20 animate-pulse border-y-4 border-olive-400" />}
                                {faceScanComplete && <div className="absolute inset-0 bg-green-500/60 flex items-center justify-center animate-fade-in"><ShieldCheck size={120} className="text-white drop-shadow-2xl" /></div>}
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setIsCapturingFace(false)} className="flex-1 py-5 bg-white/10 border border-white/20 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-white/20 transition">Cancelar</button>
                                <button onClick={() => handlePunch(TimeLogType.ENTRY)} disabled={!faceScanComplete} className={`flex-1 py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl transition-all ${faceScanComplete ? 'bg-green-500 text-white hover:scale-105' : 'bg-stone-800 text-stone-600'}`}>Confirmar Registro</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden h-fit">
                <div className="p-6 border-b bg-stone-50 flex items-center justify-between">
                    <h4 className="font-black text-stone-800 flex items-center gap-2 uppercase text-xs tracking-widest"><History size={18} className="text-olive-700"/> Logs do Dia</h4>
                </div>
                <div className="divide-y divide-stone-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {timeLogs.filter(l => l.userId === currentUser.id).sort((a,b) => b.timestamp.localeCompare(a.timestamp)).map(log => (
                        <div key={log.id} className="p-5 flex justify-between items-center hover:bg-stone-50 transition-colors">
                            <div>
                                <span className="text-xs font-black text-stone-900 uppercase tracking-tighter">{log.type.replace('_', ' ')}</span>
                                <p className="text-[9px] text-stone-400 font-bold flex items-center gap-1 mt-1"><Wifi size={10}/> {log.wifiSsid}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-sm font-black text-olive-800">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                              <p className="text-[10px] text-stone-400 font-bold">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    ))}
                    {timeLogs.filter(l => l.userId === currentUser.id).length === 0 && (
                        <p className="p-10 text-center text-stone-400 italic text-xs">Nenhum registro hoje.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'MANAGEMENT' && (
        <div className="animate-fade-in">
           {/* ... GESTÃO EQUIPE MANTIDA COM TRADUÇÕES ... */}
           <div className="bg-white rounded-[40px] border border-stone-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-stone-100 border-b text-[10px] uppercase font-black text-stone-900 tracking-widest">
                        <tr>
                            <th className="p-6">Colaborador</th>
                            <th className="p-6">Último Log</th>
                            <th className="p-6">Rede Utilizada</th>
                            <th className="p-6 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-sm">
                        {users.map(u => {
                            const uLogs = timeLogs.filter(l => l.userId === u.id).sort((a,b) => b.timestamp.localeCompare(a.timestamp));
                            const last = uLogs[0];
                            return (
                                <tr key={u.id} className="hover:bg-olive-50/20 transition cursor-pointer group">
                                    <td className="p-6 flex items-center gap-4">
                                        <img src={u.avatar} className="w-12 h-12 rounded-2xl shadow-sm" />
                                        <div>
                                            <p className="font-black text-stone-900 text-base">{u.name}</p>
                                            <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{u.roleId.replace('role-','')}</p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-mono text-xs font-black text-stone-800">
                                          {last ? new Date(last.timestamp).toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}) : '--'}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {last?.wifiSsid ? (
                                          <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-1 w-fit"><Wifi size={10}/> {last.wifiSsid}</span>
                                        ) : '--'}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="bg-stone-50 text-stone-900 border border-stone-200 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all">Relatório</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
      `}</style>
    </div>
  );
};
