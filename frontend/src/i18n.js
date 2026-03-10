import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: "Dashboard",
      recentEntries: "Recent Entries",
      professional: "Professional",
      personal: "Personal",
      moodCheckin: "Mood Check-in",
      settings: "Settings",
      logout: "Logout",
      
      // Settings
      theme: "Theme",
      notifications: "Notifications",
      emailNotifications: "Email Notifications",
      receiveReminders: "Receive reminders at",
      diaryPreferences: "Diary Preferences",
      autoSaveDraft: "Auto-save Draft",
      autoSaveDescription: "Automatically save unfinished entries",
      general: "General",
      language: "Language",
      save: "Save",
      saving: "Saving...",
      settingsSaved: "Settings saved successfully!",
      settingsFailed: "Failed to save settings",
      
      // Common
      menu: "Menu",
      close: "Close"
    }
  },
  es: {
    translation: {
      dashboard: "Panel",
      recentEntries: "Entradas Recientes",
      professional: "Profesional",
      personal: "Personal",
      moodCheckin: "Registro de Ánimo",
      settings: "Configuración",
      logout: "Cerrar Sesión",
      
      theme: "Tema",
      notifications: "Notificaciones",
      emailNotifications: "Notificaciones por Correo",
      receiveReminders: "Recibir recordatorios en",
      diaryPreferences: "Preferencias del Diario",
      autoSaveDraft: "Guardado Automático",
      autoSaveDescription: "Guardar automáticamente entradas sin terminar",
      general: "General",
      language: "Idioma",
      save: "Guardar",
      saving: "Guardando...",
      settingsSaved: "¡Configuración guardada exitosamente!",
      settingsFailed: "Error al guardar la configuración",
      
      menu: "Menú",
      close: "Cerrar"
    }
  },
  fr: {
    translation: {
      dashboard: "Tableau de Bord",
      recentEntries: "Entrées Récentes",
      professional: "Professionnel",
      personal: "Personnel",
      moodCheckin: "Humeur du Jour",
      settings: "Paramètres",
      logout: "Déconnexion",
      
      theme: "Thème",
      notifications: "Notifications",
      emailNotifications: "Notifications par Email",
      receiveReminders: "Recevoir des rappels à",
      diaryPreferences: "Préférences du Journal",
      autoSaveDraft: "Sauvegarde Automatique",
      autoSaveDescription: "Sauvegarder automatiquement les entrées inachevées",
      general: "Général",
      language: "Langue",
      save: "Enregistrer",
      saving: "Enregistrement...",
      settingsSaved: "Paramètres enregistrés avec succès!",
      settingsFailed: "Échec de l'enregistrement des paramètres",
      
      menu: "Menu",
      close: "Fermer"
    }
  },
  de: {
    translation: {
      dashboard: "Dashboard",
      recentEntries: "Letzte Einträge",
      professional: "Beruflich",
      personal: "Persönlich",
      moodCheckin: "Stimmungs-Check",
      settings: "Einstellungen",
      logout: "Abmelden",
      
      theme: "Design",
      notifications: "Benachrichtigungen",
      emailNotifications: "E-Mail-Benachrichtigungen",
      receiveReminders: "Erinnerungen erhalten unter",
      diaryPreferences: "Tagebuch-Einstellungen",
      autoSaveDraft: "Auto-Speichern",
      autoSaveDescription: "Unfertige Einträge automatisch speichern",
      general: "Allgemein",
      language: "Sprache",
      save: "Speichern",
      saving: "Speichern...",
      settingsSaved: "Einstellungen erfolgreich gespeichert!",
      settingsFailed: "Fehler beim Speichern der Einstellungen",
      
      menu: "Menü",
      close: "Schließen"
    }
  },
  hi: {
    translation: {
      dashboard: "डैशबोर्ड",
      recentEntries: "हाल की प्रविष्टियाँ",
      professional: "व्यावसायिक",
      personal: "व्यक्तिगत",
      moodCheckin: "मूड चेक-इन",
      settings: "सेटिंग्स",
      logout: "लॉग आउट",
      
      theme: "थीम",
      notifications: "सूचनाएं",
      emailNotifications: "ईमेल सूचनाएं",
      receiveReminders: "यहां रिमाइंडर प्राप्त करें",
      diaryPreferences: "डायरी प्राथमिकताएं",
      autoSaveDraft: "ऑटो-सेव ड्राफ्ट",
      autoSaveDescription: "अधूरी प्रविष्टियों को स्वचालित रूप से सहेजें",
      general: "सामान्य",
      language: "भाषा",
      save: "सहेजें",
      saving: "सहेजा जा रहा है...",
      settingsSaved: "सेटिंग्स सफलतापूर्वक सहेजी गईं!",
      settingsFailed: "सेटिंग्स सहेजने में विफल",
      
      menu: "मेनू",
      close: "बंद करें"
    }
  },
  ar: {
    translation: {
      dashboard: "لوحة القيادة",
      recentEntries: "الإدخالات الأخيرة",
      professional: "مهني",
      personal: "شخصي",
      moodCheckin: "فحص المزاج",
      settings: "الإعدادات",
      logout: "تسجيل الخروج",
      
      theme: "المظهر",
      notifications: "الإشعارات",
      emailNotifications: "إشعارات البريد الإلكتروني",
      receiveReminders: "تلقي التذكيرات على",
      diaryPreferences: "تفضيلات اليومية",
      autoSaveDraft: "الحفظ التلقائي",
      autoSaveDescription: "حفظ الإدخالات غير المكتملة تلقائيًا",
      general: "عام",
      language: "اللغة",
      save: "حفظ",
      saving: "جارٍ الحفظ...",
      settingsSaved: "تم حفظ الإعدادات بنجاح!",
      settingsFailed: "فشل حفظ الإعدادات",
      
      menu: "القائمة",
      close: "إغلاق"
    }
  },
  zh: {
    translation: {
      dashboard: "仪表板",
      recentEntries: "最近条目",
      professional: "专业",
      personal: "个人",
      moodCheckin: "心情记录",
      settings: "设置",
      logout: "登出",
      
      theme: "主题",
      notifications: "通知",
      emailNotifications: "电子邮件通知",
      receiveReminders: "接收提醒",
      diaryPreferences: "日记偏好",
      autoSaveDraft: "自动保存",
      autoSaveDescription: "自动保存未完成的条目",
      general: "常规",
      language: "语言",
      save: "保存",
      saving: "保存中...",
      settingsSaved: "设置保存成功！",
      settingsFailed: "设置保存失败",
      
      menu: "菜单",
      close: "关闭"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
