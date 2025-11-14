// Analytics and Monitoring Configuration
export interface AnalyticsConfig {
  googleAnalytics?: {
    measurementId: string;
    enabled: boolean;
  };
  customAnalytics?: {
    endpoint: string;
    enabled: boolean;
  };
  performanceMonitoring?: {
    enabled: boolean;
    sampleRate: number;
  };
  errorTracking?: {
    enabled: boolean;
    endpoint?: string;
  };
}

export class AnalyticsManager {
  private static instance: AnalyticsManager;
  private config: AnalyticsConfig;
  private isInitialized = false;

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  static getInstance(config?: AnalyticsConfig): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      if (!config) {
        throw new Error('AnalyticsManager must be initialized with config');
      }
      AnalyticsManager.instance = new AnalyticsManager(config);
    }
    return AnalyticsManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Google Analytics
      if (this.config.googleAnalytics?.enabled) {
        await this.initializeGoogleAnalytics();
      }

      // Initialize Performance Monitoring
      if (this.config.performanceMonitoring?.enabled) {
        await this.initializePerformanceMonitoring();
      }

      // Initialize Error Tracking
      if (this.config.errorTracking?.enabled) {
        await this.initializeErrorTracking();
      }

      this.isInitialized = true;
      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  private async initializeGoogleAnalytics(): Promise<void> {
    if (!this.config.googleAnalytics?.measurementId) return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.config.googleAnalytics.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
      custom_map: {
        dimension1: 'user_type',
        dimension2: 'device_type',
        dimension3: 'connection_speed'
      }
    });

    // Track page views
    this.trackPageView();
  }


  private async initializePerformanceMonitoring(): Promise<void> {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.trackEvent('performance', 'fcp', fcpEntry.startTime);
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.trackEvent('performance', 'lcp', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            this.trackEvent('performance', 'fid', fid);
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.trackEvent('performance', 'cls', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Monitor page load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const ttfb = navigation.responseStart - navigation.fetchStart;
        
        this.trackEvent('performance', 'page_load_time', loadTime);
        this.trackEvent('performance', 'ttfb', ttfb);
      }
    });
  }

  private async initializeErrorTracking(): Promise<void> {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackEvent('error', 'javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('error', 'unhandled_promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack
      });
    });

    // Track fetch errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          this.trackEvent('error', 'fetch_error', {
            url: args[0],
            status: response.status,
            statusText: response.statusText
          });
        }
        return response;
      } catch (error) {
        this.trackEvent('error', 'fetch_error', {
          url: args[0],
          error: (error as Error).message
        });
        throw error;
      }
    };
  }

  // Public methods for tracking
  trackPageView(page?: string): void {
    const pagePath = page || window.location.pathname;
    
    if ((window as any).gtag) {
      gtag('config', this.config.googleAnalytics?.measurementId, {
        page_path: pagePath,
        page_title: document.title
      });
    }

    // Send to custom analytics
    this.sendToCustomAnalytics('page_view', {
      page: pagePath,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now()
    });
  }

  trackEvent(category: string, action: string, value?: any): void {
    if ((window as any).gtag) {
      gtag('event', action, {
        event_category: category,
        event_label: typeof value === 'object' ? JSON.stringify(value) : value,
        value: typeof value === 'number' ? value : undefined
      });
    }

    // Send to custom analytics
    this.sendToCustomAnalytics('event', {
      category,
      action,
      value,
      timestamp: Date.now()
    });
  }

  trackUserAction(action: string, properties?: Record<string, any>): void {
    this.trackEvent('user_action', action, properties);
  }

  trackBusinessEvent(eventName: string, properties?: Record<string, any>): void {
    this.trackEvent('business', eventName, properties);
  }

  private async sendToCustomAnalytics(eventType: string, data: any): Promise<void> {
    if (!this.config.customAnalytics?.enabled) return;

    try {
      await fetch(this.config.customAnalytics.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          data,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
          sessionId: this.getSessionId()
        })
      });
    } catch (error) {
      console.warn('Failed to send analytics data:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Business-specific tracking methods
  trackGraderView(graderId: string, graderData: any): void {
    this.trackEvent('grader', 'view', {
      grader_id: graderId,
      brand: graderData.brand,
      model: graderData.model,
      year: graderData.year,
      price: graderData.price
    });
  }

  trackGraderSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent('search', 'grader_search', {
      search_term: searchTerm,
      results_count: resultsCount
    });
  }

  trackPartView(partId: string, partData: any): void {
    this.trackEvent('part', 'view', {
      part_id: partId,
      name: partData.name,
      brand: partData.brand,
      price: partData.price
    });
  }

  trackContactFormSubmission(formType: string): void {
    this.trackEvent('contact', 'form_submission', {
      form_type: formType
    });
  }

  trackUserRegistration(userType: 'user' | 'admin'): void {
    this.trackEvent('user', 'registration', {
      user_type: userType
    });
  }

  trackUserLogin(userType: 'user' | 'admin'): void {
    this.trackEvent('user', 'login', {
      user_type: userType
    });
  }
}

// React Hook for Analytics
export const useAnalytics = () => {
  const analytics = AnalyticsManager.getInstance();

  return {
    trackPageView: (page?: string) => analytics.trackPageView(page),
    trackEvent: (category: string, action: string, value?: any) => 
      analytics.trackEvent(category, action, value),
    trackUserAction: (action: string, properties?: Record<string, any>) => 
      analytics.trackUserAction(action, properties),
    trackBusinessEvent: (eventName: string, properties?: Record<string, any>) => 
      analytics.trackBusinessEvent(eventName, properties),
    trackGraderView: (graderId: string, graderData: any) => 
      analytics.trackGraderView(graderId, graderData),
    trackGraderSearch: (searchTerm: string, resultsCount: number) => 
      analytics.trackGraderSearch(searchTerm, resultsCount),
    trackPartView: (partId: string, partData: any) => 
      analytics.trackPartView(partId, partData),
    trackContactFormSubmission: (formType: string) => 
      analytics.trackContactFormSubmission(formType),
    trackUserRegistration: (userType: 'user' | 'admin') => 
      analytics.trackUserRegistration(userType),
    trackUserLogin: (userType: 'user' | 'admin') => 
      analytics.trackUserLogin(userType)
  };
};

// Default configuration
export const defaultAnalyticsConfig: AnalyticsConfig = {
  googleAnalytics: {
    measurementId: process.env.REACT_APP_GA_MEASUREMENT_ID || '',
    enabled: !!process.env.REACT_APP_GA_MEASUREMENT_ID
  },
  customAnalytics: {
    endpoint: '/api/analytics',
    enabled: true
  },
  performanceMonitoring: {
    enabled: true,
    sampleRate: 1.0
  },
  errorTracking: {
    enabled: true,
    endpoint: '/api/errors'
  }
};
