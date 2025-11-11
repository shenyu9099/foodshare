// Application Insights Configuration
// This file initializes Azure Application Insights for monitoring

(function() {
  // Application Insights Instrumentation Key
  const instrumentationKey = '1e8e8b1a-4c8e-4edd-9303-b0f07047005e';
  
  // Load Application Insights SDK
  const script = document.createElement('script');
  script.src = 'https://js.monitor.azure.com/scripts/b/ai.2.min.js';
  script.async = true;
  
  script.onload = function() {
    // Initialize Application Insights
    const appInsights = new Microsoft.ApplicationInsights.ApplicationInsights({
      config: {
        instrumentationKey: instrumentationKey,
        enableAutoRouteTracking: true, // Track page views automatically
        enableCorsCorrelation: true, // Track CORS requests
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        enableAjaxPerfTracking: true, // Track AJAX performance
        maxAjaxCallsPerView: 20,
        disableFetchTracking: false,
        enableDebug: false,
        loggingLevelConsole: 0,
        loggingLevelTelemetry: 1
      }
    });
    
    // Load and initialize
    appInsights.loadAppInsights();
    
    // Set authenticated user context
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('displayName') || localStorage.getItem('username');
    if (userId) {
      appInsights.setAuthenticatedUserContext(userId, null, true);
      appInsights.context.user.accountId = username || userId;
    }
    
    // Track initial page view
    appInsights.trackPageView();
    
    // Make appInsights globally available
    window.appInsights = appInsights;
    
    console.log('✅ Application Insights initialized');
    
    // Track custom events
    setupCustomEventTracking();
  };
  
  document.head.appendChild(script);
  
  // Setup custom event tracking
  function setupCustomEventTracking() {
    // Track user registration
    const originalRegister = window.fetch;
    
    // We'll add event tracking in the actual pages
    console.log('📊 Custom event tracking ready');
  }
})();

// Helper functions for custom tracking
window.trackEvent = function(name, properties) {
  if (window.appInsights) {
    window.appInsights.trackEvent({ name: name, properties: properties });
    console.log(`📊 Tracked event: ${name}`, properties);
  }
};

window.trackMetric = function(name, value, properties) {
  if (window.appInsights) {
    window.appInsights.trackMetric({ name: name, average: value, properties: properties });
    console.log(`📈 Tracked metric: ${name} = ${value}`, properties);
  }
};

window.trackException = function(exception, properties) {
  if (window.appInsights) {
    window.appInsights.trackException({ exception: exception, properties: properties });
    console.log(`❌ Tracked exception:`, exception);
  }
};

window.trackTrace = function(message, severityLevel, properties) {
  if (window.appInsights) {
    window.appInsights.trackTrace({ message: message, severityLevel: severityLevel, properties: properties });
    console.log(`📝 Tracked trace: ${message}`);
  }
};

