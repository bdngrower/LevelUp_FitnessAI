import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../utils/motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StorageService, AppSettings } from '../services/storage';
import { Moon, Sun, LogOut, Bell } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<AppSettings>({ theme: 'system', notifications: true, soundEnabled: true });

    useEffect(() => {
        setSettings(StorageService.getSettings());
    }, []);

    const handleThemeChange = (theme: AppSettings['theme']) => {
        const newSettings = { ...settings, theme };
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);
    };

    const toggleSound = () => {
        const newSettings = { ...settings, soundEnabled: !settings.soundEnabled };
        setSettings(newSettings);
        StorageService.saveSettings(newSettings);
    };

    const handleLogout = () => {
        StorageService.logout();
        navigate('/login');
    };

    const handleClearData = () => {
        if(confirm("Tem certeza? Isso apagará TODOS os seus dados.")) {
            StorageService.clearAll();
            window.location.reload();
        }
    };

    return (
        <motion.div 
            className="p-6 max-w-3xl mx-auto space-y-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            <h1 className="text-3xl font-bold">Configurações</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Aparência</CardTitle>
                    <CardDescription>Personalize como o LevelUp AI se parece no seu dispositivo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div 
                            onClick={() => handleThemeChange('light')}
                            className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${settings.theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                        >
                            <Sun className="w-6 h-6" />
                            <span className="font-medium">Claro</span>
                        </div>
                        <div 
                             onClick={() => handleThemeChange('dark')}
                            className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${settings.theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                        >
                            <Moon className="w-6 h-6" />
                            <span className="font-medium">Escuro</span>
                        </div>
                        <div 
                             onClick={() => handleThemeChange('system')}
                            className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${settings.theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'}`}
                        >
                            <span className="font-bold text-lg">Auto</span>
                            <span className="font-medium">Sistema</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Treino e Sons</CardTitle>
                    <CardDescription>Preferências de áudio durante o exercício.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors cursor-pointer" onClick={toggleSound}>
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${settings.soundEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-medium">Sons do Timer</div>
                                <div className="text-sm text-muted-foreground">Tocar beep ao fim do descanso.</div>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.soundEnabled ? 'bg-primary' : 'bg-input'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Conta</CardTitle>
                    <CardDescription>Gerencie seus dados e sessão.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                            <div className="font-medium">Sair da conta</div>
                            <div className="text-sm text-muted-foreground">Encerre sua sessão atual.</div>
                        </div>
                        <Button variant="outline" onClick={handleLogout}>
                            <LogOut className="w-4 h-4 mr-2" /> Sair
                        </Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border border-destructive/20 bg-destructive/5 rounded-xl">
                        <div>
                            <div className="font-medium text-destructive">Apagar todos os dados</div>
                            <div className="text-sm text-muted-foreground">Essa ação é irreversível.</div>
                        </div>
                        <Button variant="destructive" onClick={handleClearData}>
                            Apagar Tudo
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            <div className="text-center text-sm text-muted-foreground pt-8">
                LevelUp Fitness AI v1.3.0 • Feito com 💚 para quem treina.
            </div>
        </motion.div>
    );
};