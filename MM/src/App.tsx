/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  WPPost,
  WPPage,
  WPMedia,
  WPCategory,
  WPComment,
  WPUser,
  WPSiteSettings,
  AdminMenuKey,
  Vehicle,
  VehicleBrand,
  VehicleOrder,
  CustomerRecord,
  FaqItem,
  CommercialBankSettings,
  SeoSettings,
  ActivityLog,
} from './types/wordpress';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  firebaseConfig,
  testFirebaseConnection,
  FirebaseConnectionStatus,
  isAuthorizedAdminUser,
  signInAdminWithGoogle,
  signOutFirebaseAdmin,
} from './firebase';
import {
  WordPressFirebaseService,
  initialDefaultSettings,
  initialDefaultCategories,
  initialDefaultPosts,
  initialDefaultPages,
  initialDefaultMedia,
  initialDefaultComments,
  initialDefaultUsers,
  initialDefaultVehicles,
  initialDefaultBrands,
  initialDefaultOrders,
  initialDefaultCustomers,
  initialDefaultFaqs,
  initialDefaultCommercialSettings,
  initialDefaultSeoSettings,
} from './services/wordpressService';

// Dealership Admin Components (Modern ERP VSP)
import { DealershipHeader } from './components/wp-admin/DealershipHeader';
import { DealershipSidebar } from './components/wp-admin/DealershipSidebar';
import { DealershipDashboard } from './components/wp-admin/DealershipDashboard';

// VSP Admin Components
import { WpVehicles } from './components/wp-admin/vsp/WpVehicles';
import { WpOrders } from './components/wp-admin/vsp/WpOrders';
import { WpCustomers } from './components/wp-admin/vsp/WpCustomers';
import { WpCommercialSettings } from './components/wp-admin/vsp/WpCommercialSettings';
import { WpBrands } from './components/wp-admin/vsp/WpBrands';
import { WpFaqs } from './components/wp-admin/vsp/WpFaqs';
import { WpSeo } from './components/wp-admin/vsp/WpSeo';
import { WpActivityLogs } from './components/wp-admin/vsp/WpActivityLogs';

// Front-Office Component
import { FrontOfficeView } from './components/front-office/FrontOfficeView';
import { VehicleSpotlightPage } from './components/front-office/VehicleSpotlightPage';

// Secret Admin Login Portal
import { AdminLoginPortal } from './components/auth/AdminLoginPortal';

export default function App() {
  // Navigation - default to true so visitors land on the public commercial site
  const [activeMenu, setActiveMenu] = useState<AdminMenuKey>('dashboard');
  const [isFrontOffice, setIsFrontOffice] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [frontPostSlug, setFrontPostSlug] = useState<string | null>(null);
  const [frontPageSlug, setFrontPageSlug] = useState<string | null>(null);
  const [frontVehicleSlug, setFrontVehicleSlug] = useState<string | null>(null);

  // Dedicated Spotlight (Landing page unique TikTok / Facebook)
  const [spotlightVehicleId, setSpotlightVehicleId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const vspParam = params.get('vsp') || params.get('spotlight') || params.get('vehicule');
    if (vspParam) return vspParam.trim();
    const hash = window.location.hash || '';
    const match = hash.match(/#(?:vsp[-=]|\/vsp\/)([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return match[1];
    return null;
  });

  // Authentication State for Admin Access
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('vsp_admin_auth') === 'authenticated' ||
        localStorage.getItem('vsp_admin_auth') === 'authenticated'
      );
    } catch {
      return false;
    }
  });

  // Current Hash routing for secret portal #/login
  const [currentHash, setCurrentHash] = useState<string>(() => {
    return typeof window !== 'undefined' ? window.location.hash.toLowerCase().trim() : '';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const h = (window.location.hash || '').toLowerCase().trim();
      setCurrentHash(h);
      if (h === '#/admin' || h === '#admin') {
        if (isAdminAuthenticated) {
          setIsFrontOffice(false);
        }
      }

      // Check for ?vsp= or #vsp-
      const params = new URLSearchParams(window.location.search);
      const vspParam = params.get('vsp') || params.get('spotlight') || params.get('vehicule');
      if (vspParam) {
        setSpotlightVehicleId(vspParam.trim());
      } else {
        const match = h.match(/#(?:vsp[-=]|\/vsp\/)([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          setSpotlightVehicleId(match[1]);
        }
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [isAdminAuthenticated]);

  // Firebase verified admin auth state (controls Cloud Firestore write/PII sync)
  const [isFirebaseAdmin, setIsFirebaseAdmin] = useState<boolean>(() =>
    isAuthorizedAdminUser(auth.currentUser)
  );
  const [googleConnectLoading, setGoogleConnectLoading] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const authorized = isAuthorizedAdminUser(user);
      setIsFirebaseAdmin(authorized);
      if (authorized) {
        setIsAdminAuthenticated(true);
        try {
          sessionStorage.setItem('vsp_admin_auth', 'authenticated');
          localStorage.setItem('vsp_admin_auth', 'authenticated');
          if (user?.email) {
            localStorage.setItem('vsp_admin_user', user.email);
          }
        } catch {}
      }
    });
    return () => unsubAuth();
  }, []);

  const handleConnectGoogleAdmin = async () => {
    setGoogleConnectLoading(true);
    try {
      await signInAdminWithGoogle();
      setIsFirebaseAdmin(true);
      setIsAdminAuthenticated(true);
      await WordPressFirebaseService.seedInitialDataIfEmpty();
    } catch (err) {
      console.error('Google admin connection error:', err);
    } finally {
      setGoogleConnectLoading(false);
    }
  };

  // Logout handler
  const handleAdminLogout = async () => {
    try {
      await signOutFirebaseAdmin();
    } catch (e) {
      console.warn('Firebase signOut warning:', e);
    }
    try {
      sessionStorage.removeItem('vsp_admin_auth');
      localStorage.removeItem('vsp_admin_auth');
      localStorage.removeItem('vsp_admin_user');
    } catch (e) {
      console.warn('Logout cleanup error:', e);
    }
    setIsFirebaseAdmin(false);
    setIsAdminAuthenticated(false);
    setIsFrontOffice(true);
    setCurrentHash('');
    if (window.location.hash) {
      window.location.hash = '';
    }
  };

  // Editing state
  const [isCreatingVehicle, setIsCreatingVehicle] = useState(false);

  // Firestore Data Collections - Content & Site
  const [settings, setSettings] = useState<WPSiteSettings>(initialDefaultSettings);
  const [posts, setPosts] = useState<WPPost[]>(initialDefaultPosts);
  const [pages, setPages] = useState<WPPage[]>(initialDefaultPages);
  const [media, setMedia] = useState<WPMedia[]>(initialDefaultMedia);
  const [categories, setCategories] = useState<WPCategory[]>(initialDefaultCategories);
  const [comments, setComments] = useState<WPComment[]>(initialDefaultComments);
  const [users, setUsers] = useState<WPUser[]>(initialDefaultUsers);

  // Firestore Data Collections - JEAN AUTO VSP Commercial
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialDefaultVehicles);
  const [brands, setBrands] = useState<VehicleBrand[]>(initialDefaultBrands);
  const [orders, setOrders] = useState<VehicleOrder[]>(initialDefaultOrders);
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialDefaultCustomers);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialDefaultFaqs);
  const [commercialSettings, setCommercialSettings] = useState<CommercialBankSettings>(initialDefaultCommercialSettings);
  const [seoSettings, setSeoSettings] = useState<SeoSettings>(initialDefaultSeoSettings);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Firebase connection state
  const [connectionStatus, setConnectionStatus] = useState<FirebaseConnectionStatus>({
    connected: false,
    testing: true,
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });

  // Run connection test on mount
  const runConnectionCheck = async () => {
    setConnectionStatus((prev) => ({ ...prev, testing: true }));
    const res = await testFirebaseConnection();
    setConnectionStatus({
      connected: res.success,
      testing: false,
      latencyMs: res.latencyMs,
      lastChecked: new Date(),
      error: res.error,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
  };

  // Seed Firestore & sync local/server vehicles automatically once verified Google Admin is signed in
  useEffect(() => {
    if (!isFirebaseAdmin) return;
    WordPressFirebaseService.seedInitialDataIfEmpty().then((seeded) => {
      if (seeded) {
        console.log('Firebase initialized & synchronized with dealership collections!');
      }
    });
  }, [isFirebaseAdmin]);

  // Public + non-PII subscriptions + connection check on mount
  useEffect(() => {
    runConnectionCheck();

    const unsubBrands = WordPressFirebaseService.subscribeBrands(
      (data) => {
        if (data.length > 0) setBrands(data);
      },
      (err) => console.warn('Firestore brands sync fallback:', err)
    );

    const unsubFaqs = WordPressFirebaseService.subscribeFaqs(
      (data) => {
        if (data.length > 0) setFaqs(data);
      },
      (err) => console.warn('Firestore faqs sync fallback:', err)
    );

    const unsubCommercialSettings = WordPressFirebaseService.subscribeCommercialSettings(
      (data) => {
        if (data) setCommercialSettings(data);
      },
      (err) => console.warn('Firestore commercial settings sync fallback:', err)
    );

    const unsubSeo = WordPressFirebaseService.subscribeSeoSettings(
      (data) => {
        if (data) setSeoSettings(data);
      },
      (err) => console.warn('Firestore seo sync fallback:', err)
    );

    return () => {
      unsubBrands();
      unsubFaqs();
      unsubCommercialSettings();
      unsubSeo();
    };
  }, []);

  // Role-aware subscriptions (vehicles public vs full admin, orders/customers/logs strictly admin)
  useEffect(() => {
    const unsubVehicles = WordPressFirebaseService.subscribeVehicles(
      (data) => {
        setVehicles(data);
      },
      (err) => console.warn('Firestore vehicles sync fallback:', err),
      isFirebaseAdmin
    );

    const unsubOrders = WordPressFirebaseService.subscribeOrders(
      (data) => {
        setOrders(data);
      },
      (err) => console.warn('Firestore orders sync fallback:', err),
      isFirebaseAdmin
    );

    const unsubCustomers = WordPressFirebaseService.subscribeCustomers(
      (data) => {
        if (data.length > 0) setCustomers(data);
      },
      (err) => console.warn('Firestore customers sync fallback:', err),
      isFirebaseAdmin
    );

    const unsubLogs = WordPressFirebaseService.subscribeActivityLogs(
      (data) => {
        if (data.length > 0) setActivityLogs(data);
      },
      (err) => console.warn('Firestore logs sync fallback:', err),
      isFirebaseAdmin
    );

    return () => {
      unsubVehicles();
      unsubOrders();
      unsubCustomers();
      unsubLogs();
    };
  }, [isFirebaseAdmin]);

  // Keep customers list synchronized from orders when Firestore customers fallback is active
  const derivedCustomers: CustomerRecord[] = React.useMemo(() => {
    if (customers.length > 1) return customers;
    const byEmail = new Map<string, CustomerRecord>();
    for (const c of customers) {
      byEmail.set(c.email.toLowerCase(), c);
    }
    for (const o of orders) {
      const emailKey = o.customer.email.toLowerCase();
      if (!byEmail.has(emailKey)) {
        byEmail.set(emailKey, {
          id: `cust-${emailKey.replace(/[^a-z0-9]/g, '_')}`,
          firstName: o.customer.firstName,
          lastName: o.customer.lastName,
          email: o.customer.email,
          phone: o.customer.phone,
          whatsapp: o.customer.whatsapp || o.customer.phone,
          city: o.customer.city,
          postalCode: o.customer.postalCode,
          address: o.customer.address,
          ordersCount: 1,
          totalSpent: o.amountPaid,
          lastOrderDate: o.createdAt,
          createdAt: o.createdAt,
        });
      }
    }
    return Array.from(byEmail.values());
  }, [customers, orders]);

  const handleNavigate = (key: AdminMenuKey) => {
    setIsFrontOffice(false);
    setActiveMenu(key);
    if (key === 'vehicles-new') {
      setActiveMenu('vehicles');
      setIsCreatingVehicle(true);
    } else {
      setIsCreatingVehicle(false);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'paiement_a_verifier').length;

  const isSecretLoginRoute =
    currentHash === '#/login' ||
    currentHash === '#login' ||
    (typeof window !== 'undefined' && window.location.hash.toLowerCase().includes('login'));

  // 1. If on secret login route and not authenticated: full-screen login portal covering the entire screen
  if (isSecretLoginRoute && !isAdminAuthenticated) {
    return (
      <AdminLoginPortal
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsFrontOffice(false);
          setCurrentHash('#/admin');
          if (window.location.hash !== '#/admin') {
            window.location.hash = '#/admin';
          }
        }}
        onCancelToPublic={() => {
          setCurrentHash('');
          if (window.location.hash) {
            window.location.hash = '';
          }
          setIsFrontOffice(true);
        }}
      />
    );
  }

  // 2. If trying to access admin panel without authentication: full-screen login portal
  if (!isFrontOffice && !isAdminAuthenticated) {
    return (
      <AdminLoginPortal
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsFrontOffice(false);
          setCurrentHash('#/admin');
          if (window.location.hash !== '#/admin') {
            window.location.hash = '#/admin';
          }
        }}
        onCancelToPublic={() => {
          setCurrentHash('');
          if (window.location.hash) {
            window.location.hash = '';
          }
          setIsFrontOffice(true);
        }}
      />
    );
  }

  // 3. EXCLUSIVE SPOTLIGHT ROUTING (TikTok / Facebook ad campaign landing page)
  // When a visitor clicks the ad link, they are directed strictly and solely to the chosen vehicle, with no other site clutter.
  if (spotlightVehicleId) {
    const spotlightVehicle = vehicles.find(
      (v) => v.id === spotlightVehicleId || v.slug === spotlightVehicleId
    );

    if (spotlightVehicle) {
      return (
        <VehicleSpotlightPage
          vehicle={spotlightVehicle}
          commercialSettings={commercialSettings}
          onExitSpotlight={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('vsp');
            url.searchParams.delete('spotlight');
            url.searchParams.delete('vehicule');
            if (window.location.hash.includes('vsp')) {
              window.location.hash = '';
            }
            window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
            setSpotlightVehicleId(null);
          }}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Discreet floating admin indicator visible ONLY to the logged-in administrator */}
      {isAdminAuthenticated && isFrontOffice && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 text-white text-xs py-1.5 px-4 flex items-center justify-between border-b border-blue-500 shadow-md backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200">Session Administrateur Active</span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">(Visible uniquement par vous)</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsFrontOffice(false)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[11px] transition-colors cursor-pointer"
            >
              Accéder au Panneau de Gestion
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-2 py-1 bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-300 rounded text-[11px] transition-colors cursor-pointer border border-slate-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}



      {/* RENDER FRONT-OFFICE OR BACK-OFFICE */}
      {isFrontOffice ? (
        <div className={isAdminAuthenticated ? 'pt-8' : ''}>
          <FrontOfficeView
            posts={posts}
            pages={pages}
            comments={comments}
            settings={settings}
            vehicles={vehicles}
            brands={brands}
            orders={orders}
            faqs={faqs}
            commercialSettings={commercialSettings}
            seoSettings={seoSettings}
            activePostSlug={frontPostSlug}
            activePageSlug={frontPageSlug}
            activeVehicleSlug={frontVehicleSlug}
            onBackToAdmin={() => setIsFrontOffice(false)}
            onSelectPost={(slug) => setFrontPostSlug(slug)}
            onSelectPage={(slug) => setFrontPageSlug(slug)}
            onSelectVehicle={(slug) => setFrontVehicleSlug(slug)}
          />
        </div>
      ) : (
        <div className="min-h-screen flex flex-col bg-slate-100">
          {/* Dealership Dedicated Header */}
          <DealershipHeader
            commercialSettings={commercialSettings}
            connectionStatus={connectionStatus}
            pendingOrdersCount={pendingOrdersCount}
            isFirebaseAdmin={isFirebaseAdmin}
            googleConnectLoading={googleConnectLoading}
            onConnectGoogle={handleConnectGoogleAdmin}
            onNavigate={handleNavigate}
            onTestConnection={runConnectionCheck}
            onToggleFrontOffice={() => setIsFrontOffice(true)}
            onLogout={handleAdminLogout}
            onOpenNewVehicle={() => {
              setActiveMenu('vehicles');
              setIsCreatingVehicle(true);
            }}
            isMobileMenuOpen={mobileSidebarOpen}
            onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          />

          <div className="flex flex-1">
            {/* Dealership Dedicated Sidebar */}
            <DealershipSidebar
              activeMenu={activeMenu}
              onNavigate={(key) => {
                handleNavigate(key);
                setMobileSidebarOpen(false);
              }}
              pendingOrdersCount={pendingOrdersCount}
              vehiclesCount={vehicles.length}
              onToggleFrontOffice={() => setIsFrontOffice(true)}
              isMobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            {/* Main Backoffice Content Area */}
            <main className="flex-1 overflow-x-auto min-h-[calc(100vh-4rem)] pb-16 bg-slate-50">
              {activeMenu === 'dashboard' && (
                <DealershipDashboard
                  vehicles={vehicles}
                  orders={orders}
                  commercialSettings={commercialSettings}
                  onNavigate={handleNavigate}
                  onToggleFrontOffice={() => setIsFrontOffice(true)}
                  onOpenNewVehicle={() => {
                    setActiveMenu('vehicles');
                    setIsCreatingVehicle(true);
                  }}
                />
              )}

              {/* VSP PARC VÉHICULES */}
              {(activeMenu === 'vehicles' || activeMenu === 'vehicles-new') && (
                <WpVehicles
                  vehicles={vehicles}
                  brands={brands}
                  connectionStatus={connectionStatus}
                  isFirebaseAdmin={isFirebaseAdmin}
                  googleConnectLoading={googleConnectLoading}
                  onConnectGoogle={handleConnectGoogleAdmin}
                  isCreating={isCreatingVehicle || activeMenu === 'vehicles-new'}
                  onCloseCreate={() => setIsCreatingVehicle(false)}
                  onVehiclesUpdated={(newVehs) => setVehicles(newVehs)}
                  onViewInFront={(slug) => {
                    setFrontVehicleSlug(slug);
                    setIsFrontOffice(true);
                  }}
                  onViewSpotlight={(vId) => {
                    setSpotlightVehicleId(vId);
                  }}
                />
              )}

              {/* VSP MARQUES */}
              {activeMenu === 'vehicles-brands' && (
                <WpBrands brands={brands} />
              )}

              {/* VSP COMMANDES & VIREMENTS */}
              {(activeMenu === 'orders' || activeMenu === 'orders-pending') && (
                <WpOrders orders={orders} commercialSettings={commercialSettings} />
              )}

              {/* VSP CLIENTS */}
              {activeMenu === 'customers' && (
                <WpCustomers customers={derivedCustomers} />
              )}

              {/* VSP COORDONNÉES BANCAIRES & GARAGE */}
              {activeMenu === 'commercial-settings' && (
                <WpCommercialSettings settings={commercialSettings} />
              )}

              {/* VSP SEO & SITEMAP */}
              {(activeMenu === 'seo' || activeMenu === 'vsp-seo') && (
                <WpSeo seo={seoSettings} />
              )}

              {/* VSP FAQ */}
              {(activeMenu === 'faqs' || activeMenu === 'vsp-faqs') && (
                <WpFaqs faqs={faqs} />
              )}

              {/* VSP JOURNAL D'ACTIVITÉ */}
              {activeMenu === 'activity-logs' && (
                <WpActivityLogs logs={activityLogs} />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
