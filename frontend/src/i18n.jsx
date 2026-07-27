import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    brandFallback: 'Portfolio',
    navProjects: 'Projects',
    navContact: 'Contact',
    heroEyebrow: 'Engineering & Design Portfolio',
    namePlaceholder: 'Your Name',
    basedOn: (loc) => (loc ? `Based in ${loc}` : 'Based in —'),
    bioPlaceholder: 'Add your bio from the admin panel.',
    viewProjects: 'View Projects',
    downloadResume: 'Download Resume',
    featuredWorks: 'Featured Works',
    bestShowcase: 'Best 3D Showcase',
    allProjects: 'All Projects',
    allTab: 'All',
    emptySegment: 'No projects added in this segment yet.',
    sliderEmpty: 'No featured project added yet.',
    contactHeading: 'Got something in mind?',
    phone: 'Phone',
    email: 'Email',
    notAdded: 'Not added yet',
    footerRights: 'All rights reserved',
    loading: 'Loading...',
    connectionError:
      'Could not connect to the server. Please check that the backend is running and VITE_API_URL is set correctly.',
    driveOrPdf: 'View Drive/PDF',
    githubRepo: 'GitHub Repo',
    langToggleLabel: 'বাংলা',
  },
  bn: {
    brandFallback: 'পোর্টফোলিও',
    navProjects: 'প্রজেক্টস',
    navContact: 'যোগাযোগ',
    heroEyebrow: 'ইঞ্জিনিয়ারিং ও ডিজাইন পোর্টফোলিও',
    namePlaceholder: 'তোমার নাম',
    basedOn: (loc) => (loc ? `অবস্থান: ${loc}` : 'অবস্থান: —'),
    bioPlaceholder: 'এডমিন প্যানেল থেকে এখানে বায়ো যোগ করো।',
    viewProjects: 'প্রজেক্টস দেখুন',
    downloadResume: 'Resume ডাউনলোড',
    featuredWorks: 'ফিচার্ড ওয়ার্কস',
    bestShowcase: 'বেস্ট 3D শোকেস',
    allProjects: 'সব প্রজেক্টস',
    allTab: 'সব',
    emptySegment: 'এই সেগমেন্টে এখনো কোনো প্রজেক্ট যোগ করা হয়নি।',
    sliderEmpty: 'এখনো কোনো ফিচার্ড প্রজেক্ট যোগ করা হয়নি।',
    contactHeading: 'কিছু মাথায় এলো?',
    phone: 'ফোন',
    email: 'ইমেইল',
    notAdded: 'যোগ করা হয়নি',
    footerRights: 'সব রাইট সংরক্ষিত',
    loading: 'লোড হচ্ছে...',
    connectionError:
      'সার্ভারের সাথে সংযোগ করা যায়নি। ব্যাকএন্ড চালু আছে কিনা এবং VITE_API_URL ঠিক আছে কিনা দেখো।',
    driveOrPdf: 'Drive/PDF দেখুন',
    githubRepo: 'GitHub Repo',
    langToggleLabel: 'EN',
  },
};

const LanguageContext = createContext(null);

// Default language for visitors is English. Their choice is remembered
// for the next visit via localStorage.
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('site_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('site_lang', lang);
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === 'en' ? 'bn' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, tr: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
