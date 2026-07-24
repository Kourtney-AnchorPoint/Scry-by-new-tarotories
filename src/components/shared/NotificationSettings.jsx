import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const PREF_KEY = 'notification_prefs';

function getPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREF_KEY)) || { dailyOmens: true, celestialAlerts: true, ritualNudge: true };
  } catch { return { dailyOmens: true, celestialAlerts: true, ritualNudge: true }; }
}

function savePrefs(prefs) {
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

const NOTIF_TYPES = [
  { key: 'dailyOmens', label: 'Daily Omens', emoji: '🌅', desc: '8 AM alert with a specific sign to watch for today.' },
  { key: 'celestialAlerts', label: 'Celestial Alerts', emoji: '🌕', desc: 'Real-time nudges for retrogrades, full & new moons.' },
  { key: 'ritualNudge', label: 'Reading Reminders', emoji: '🔮', desc: 'A gentle nudge if you haven\'t done a reading in 48 hours.' },
];

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState(getPrefs());
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const toggle = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    savePrefs(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="font-heading text-sm font-semibold">Notifications</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Real Talk alerts from the cosmos.</p>
        </div>
        {permission === 'granted' ? (
          <span className="text-xs text-teal flex items-center gap-1"><Bell className="w-3 h-3" /> Enabled</span>
        ) : (
          <button
            onClick={requestPermission}
            className="text-xs text-violet underline underline-offset-2 hover:text-violet-light"
          >
            Enable Notifications
          </button>
        )}
      </div>

      {permission !== 'granted' && (
        <p className="text-xs text-muted-foreground bg-secondary/30 rounded-xl px-4 py-3 border border-border/30">
          Grant notification permission above to receive Daily Omens, Celestial Alerts, and Reading Reminders.
        </p>
      )}

      <div className="space-y-2">
        {NOTIF_TYPES.map(({ key, label, emoji, desc }) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/30">
            <div className="flex items-start gap-3">
              <span className="text-lg leading-none mt-0.5">{emoji}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
            <Switch
              checked={prefs[key]}
              onCheckedChange={() => toggle(key)}
              className="shrink-0 ml-3 data-[state=checked]:bg-violet data-[state=unchecked]:bg-secondary"
            />
          </div>
        ))}
      </div>
    </div>
  );
}