import { useState, useEffect } from 'react';
import api from '../services/api';

export const useSiteSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Lumiere Cafe',
    logo: '',
    favicon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    footerText: '© 2024 Lumiere Cafe. All rights reserved.',
    announcementBar: {
      enabled: false,
      message: '',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff'
    },
    maintenanceMode: {
      enabled: false,
      message: 'We are currently under maintenance. Please check back soon.'
    },
    googleAnalyticsId: '',
    facebookPixelId: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/site-settings');
      setSettings(data);
      
      // Apply dynamic styles
      applyBrandColors(data);
      applyFavicon(data.favicon);
      applyTitle(data.siteName);
      applyAnalytics(data);
    } catch (error) {
      console.error('Failed to load site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyBrandColors = (data) => {
    if (data.primaryColor) {
      const primaryShades = generateColorShades(data.primaryColor);
      Object.entries(primaryShades).forEach(([shade, rgb]) => {
        document.documentElement.style.setProperty(`--color-primary-${shade}`, rgb);
      });
    }
    if (data.secondaryColor) {
      const secondaryShades = generateColorShades(data.secondaryColor);
      Object.entries(secondaryShades).forEach(([shade, rgb]) => {
        document.documentElement.style.setProperty(`--color-secondary-${shade}`, rgb);
      });
    }
    if (data.accentColor) {
      const accentShades = generateColorShades(data.accentColor);
      Object.entries(accentShades).forEach(([shade, rgb]) => {
        document.documentElement.style.setProperty(`--color-accent-${shade}`, rgb);
      });
    }
  };

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const lighten = (hex, percent) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const r = rgb.r + (255 - rgb.r) * percent;
    const g = rgb.g + (255 - rgb.g) * percent;
    const b = rgb.b + (255 - rgb.b) * percent;
    return rgbToHex(r, g, b);
  };

  const darken = (hex, percent) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    const r = rgb.r * (1 - percent);
    const g = rgb.g * (1 - percent);
    const b = rgb.b * (1 - percent);
    return rgbToHex(r, g, b);
  };

  const generateColorShades = (baseColor) => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return {};
    
    return {
      50: `${hexToRgb(lighten(baseColor, 0.95)).r} ${hexToRgb(lighten(baseColor, 0.95)).g} ${hexToRgb(lighten(baseColor, 0.95)).b}`,
      100: `${hexToRgb(lighten(baseColor, 0.85)).r} ${hexToRgb(lighten(baseColor, 0.85)).g} ${hexToRgb(lighten(baseColor, 0.85)).b}`,
      200: `${hexToRgb(lighten(baseColor, 0.65)).r} ${hexToRgb(lighten(baseColor, 0.65)).g} ${hexToRgb(lighten(baseColor, 0.65)).b}`,
      300: `${hexToRgb(lighten(baseColor, 0.40)).r} ${hexToRgb(lighten(baseColor, 0.40)).g} ${hexToRgb(lighten(baseColor, 0.40)).b}`,
      400: `${hexToRgb(lighten(baseColor, 0.20)).r} ${hexToRgb(lighten(baseColor, 0.20)).g} ${hexToRgb(lighten(baseColor, 0.20)).b}`,
      500: `${rgb.r} ${rgb.g} ${rgb.b}`,
      600: `${hexToRgb(darken(baseColor, 0.15)).r} ${hexToRgb(darken(baseColor, 0.15)).g} ${hexToRgb(darken(baseColor, 0.15)).b}`,
      700: `${hexToRgb(darken(baseColor, 0.30)).r} ${hexToRgb(darken(baseColor, 0.30)).g} ${hexToRgb(darken(baseColor, 0.30)).b}`,
      800: `${hexToRgb(darken(baseColor, 0.45)).r} ${hexToRgb(darken(baseColor, 0.45)).g} ${hexToRgb(darken(baseColor, 0.45)).b}`,
      900: `${hexToRgb(darken(baseColor, 0.60)).r} ${hexToRgb(darken(baseColor, 0.60)).g} ${hexToRgb(darken(baseColor, 0.60)).b}`,
    };
  };

  const applyFavicon = (faviconUrl) => {
    if (faviconUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  };

  const applyTitle = (siteName) => {
    if (siteName) {
      document.title = siteName;
    }
  };

  const applyAnalytics = (data) => {
    // Google Analytics
    if (data.googleAnalyticsId && !window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${data.googleAnalyticsId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', data.googleAnalyticsId);
    }

    // Facebook Pixel
    if (data.facebookPixelId && !window.fbq) {
      (function(f,b,e,v,n,t,s) {
        if(f.fbq)return;
        n=f.fbq=function(){
          n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments)
        };
        if(!f._fbq)f._fbq=n;
        n.push=n;
        n.loaded=true;
        n.version='2.0';
        n.queue=[];
        t=b.createElement(e);
        t.async=true;
        t.src=v;
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
      })(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', data.facebookPixelId);
      window.fbq('track', 'PageView');
    }
  };

  return { settings, loading, refetch: fetchSettings };
};
