import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { CreateScriptPage } from './pages/CreateScriptPage';
import { EditScriptPage } from './pages/EditScriptPage';
import { ViewScriptPage } from './pages/ViewScriptPage';
import { RawManagerPage } from './pages/RawManagerPage';
import { SettingsPage } from './pages/SettingsPage';
import { DocsPage } from './pages/DocsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function AppContent() {
  const { mode } = useTheme();
  const { user, loading } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle URL Hash navigation (e.g. #/raw-manager?id=fly-speed-v2)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) return;

      const [route, queryStr] = hash.split('?');
      const params = new URLSearchParams(queryStr || '');
      const idParam = params.get('id');

      if (['dashboard', 'create', 'settings', 'docs', 'login', 'register', 'raw-manager'].includes(route)) {
        setCurrentTab(route);
        if (idParam) setSelectedScriptId(idParam);
      } else if (route.startsWith('view/')) {
        setCurrentTab('view');
        setSelectedScriptId(route.replace('view/', ''));
      } else if (route.startsWith('edit/')) {
        setCurrentTab('edit');
        setSelectedScriptId(route.replace('edit/', ''));
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (tab: string, scriptId?: string) => {
    setCurrentTab(tab);
    if (scriptId) {
      setSelectedScriptId(scriptId);
      window.location.hash = `#/${tab}?id=${scriptId}`;
    } else {
      window.location.hash = `#/${tab}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100">
        <div className="w-10 h-10 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">Iniciando LuauRaw Engine...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
        mode === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => navigateTo(tab)}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onNavigate={(tab) => navigateTo(tab)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage onNavigate={navigateTo} searchQuery={searchQuery} />
          )}
          {currentTab === 'create' && (
            <CreateScriptPage onNavigate={navigateTo} />
          )}
          {currentTab === 'edit' && selectedScriptId && (
            <EditScriptPage scriptId={selectedScriptId} onNavigate={navigateTo} />
          )}
          {currentTab === 'view' && selectedScriptId && (
            <ViewScriptPage scriptId={selectedScriptId} onNavigate={navigateTo} />
          )}
          {currentTab === 'raw-manager' && (
            <RawManagerPage initialScriptId={selectedScriptId} onNavigate={navigateTo} />
          )}
          {currentTab === 'docs' && (
            <DocsPage />
          )}
          {currentTab === 'settings' && (
            <SettingsPage />
          )}
          {currentTab === 'login' && (
            <LoginPage onNavigate={navigateTo} />
          )}
          {currentTab === 'register' && (
            <RegisterPage onNavigate={navigateTo} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
