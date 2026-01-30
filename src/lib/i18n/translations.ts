// Translation strings for all supported languages

export type Language = 'en' | 'ar';

// Define the shape of translations
interface TranslationSchema {
  app: {
    name: string;
    tagline: string;
    offline: string;
    online: string;
    loading: string;
    loadingMap: string;
    loadingWater: string;
    error: string;
    success: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    back: string;
    next: string;
    search: string;
    filter: string;
    sort: string;
    noResults: string;
    offlineData: string;
    usingLoggedPlot: string;
  };
  menu: {
    title: string;
    readAloud: string;
    readAloudDesc: string;
    language: string;
    languageName: string;
    notifications: string;
    notificationsDesc: string;
    settings: string;
    settingsDesc: string;
    help: string;
    helpDesc: string;
    about: string;
    aboutDesc: string;
  };
  nav: {
    map: string;
    guide: string;
    drops: string;
    exchange: string;
    water: string;
  };
  map: {
    title: string;
    plantability: string;
    seedSources: string;
    waterPoints: string;
    farmable: string;
    restorable: string;
    damaged: string;
    legend: string;
    opacityConfidence: string;
    dashedNeedsCheck: string;
    logThisPlot: string;
    viewDetails: string;
  };
  drops: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    aiPriority: string;
    soonest: string;
    largest: string;
    active: string;
    scheduled: string;
    completed: string;
    sameDay: string;
    timeFilter24h: string;
    timeFilterAny: string;
    sizeSmall: string;
    sizeMedium: string;
    sizeLarge: string;
    noDrops: string;
    noDropsDesc: string;
    createDrop: string;
    loadDemo: string;
    orgBridge: string;
  };
  exchange: {
    title: string;
    subtitle: string;
    offer: string;
    request: string;
    available: string;
    needed: string;
    inputs: string;
    labor: string;
    verifiedHubs: string;
    allInputs: string;
    seeds: string;
    tools: string;
    fertilizer: string;
    irrigation: string;
    allServices: string;
    dayLabor: string;
    harvestHelp: string;
    transport: string;
    containers: string;
    allHubs: string;
    ngoHubs: string;
    coopHubs: string;
    suppliers: string;
    searchPlaceholder: string;
    aiMatch: string;
    newest: string;
    closest: string;
    quantity: string;
    createListing: string;
    noListings: string;
  };
  water: {
    title: string;
    subtitle: string;
    waterPoints: string;
    distance: string;
    quality: string;
    reliable: string;
    intermittent: string;
    dry: string;
    unknown: string;
    well: string;
    tap: string;
    cistern: string;
    spring: string;
    trucked: string;
    other: string;
  };
  guide: {
    title: string;
    subtitle: string;
    recommendations: string;
    alternatives: string;
    findSeeds: string;
    plantingGuide: string;
    harvestTime: string;
    waterNeeds: string;
    difficulty: string;
    yourConditions: string;
    plotArea: string;
    waterAccess: string;
    salinityRisk: string;
    targetHarvest: string;
    priority: string;
    none: string;
    limited: string;
    reliable: string;
    some: string;
    strong: string;
    balanced: string;
    speed: string;
    nutrition: string;
    lowWater: string;
    generatePlan: string;
    analyzing: string;
    findingBest: string;
  };
  assessment: {
    title: string;
    plotSize: string;
    soilType: string;
    waterAccess: string;
    sunExposure: string;
  };
  units: {
    sqm: string;
    kg: string;
    days: string;
    km: string;
    m: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    // Common
    app: {
      name: 'Thamara',
      tagline: 'Farm Recovery & Coordination',
      offline: 'Offline Mode',
      online: 'Online',
      loading: 'Loading...',
      loadingMap: 'Loading map...',
      loadingWater: 'Loading water points...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      noResults: 'No results found',
      offlineData: 'Offline mode - cached data',
      usingLoggedPlot: 'Using logged plot',
    },

    // Menu
    menu: {
      title: 'Menu',
      readAloud: 'Read Aloud',
      readAloudDesc: 'Listen to page content',
      language: 'Language',
      languageName: 'English',
      notifications: 'Notifications',
      notificationsDesc: 'Alerts & updates',
      settings: 'Settings',
      settingsDesc: 'App preferences',
      help: 'Help & Support',
      helpDesc: 'FAQs & tutorials',
      about: 'About Thamara',
      aboutDesc: 'Version & info',
    },

    // Navigation
    nav: {
      map: 'Map',
      guide: 'Guide',
      drops: 'Drops',
      exchange: 'Exchange',
      water: 'Water',
    },

    // Map page
    map: {
      title: 'Map',
      plantability: 'Plantability',
      seedSources: 'Seed Sources',
      waterPoints: 'Water Points',
      farmable: 'Farmable',
      restorable: 'Restorable',
      damaged: 'Damaged',
      legend: 'Legend',
      opacityConfidence: 'Opacity = confidence',
      dashedNeedsCheck: 'Dashed = needs check',
      logThisPlot: 'Log This Plot',
      viewDetails: 'View Details',
    },

    // Drops page
    drops: {
      title: 'Drops',
      subtitle: 'Plan harvest pickup without refrigeration',
      searchPlaceholder: 'Search crops or locations...',
      aiPriority: 'AI Priority',
      soonest: 'Soonest Window',
      largest: 'Largest Quantity',
      active: 'Active',
      scheduled: 'Scheduled',
      completed: 'Completed',
      sameDay: 'Same-Day',
      timeFilter24h: '24h',
      timeFilterAny: 'Any Time',
      sizeSmall: 'Small',
      sizeMedium: 'Medium',
      sizeLarge: 'Large',
      noDrops: 'No harvest drops yet',
      noDropsDesc: 'Create your first drop to coordinate harvest pickup',
      createDrop: 'Create Drop',
      loadDemo: 'Load Demo Data',
      orgBridge: 'OrgBridge',
    },

    // Exchange page
    exchange: {
      title: 'Exchange',
      subtitle: 'Trade seeds and resources',
      offer: 'Offer',
      request: 'Request',
      available: 'Available',
      needed: 'Needed',
      inputs: 'Inputs',
      labor: 'Labor & Transport',
      verifiedHubs: 'Verified Hubs',
      allInputs: 'All Inputs',
      seeds: 'Seeds',
      tools: 'Tools',
      fertilizer: 'Fertilizer',
      irrigation: 'Irrigation',
      allServices: 'All Services',
      dayLabor: 'Day Labor',
      harvestHelp: 'Harvest Help',
      transport: 'Transport',
      containers: 'Containers',
      allHubs: 'All Hubs',
      ngoHubs: 'NGO Hubs',
      coopHubs: 'Co-op Hubs',
      suppliers: 'Suppliers',
      searchPlaceholder: 'Search listings...',
      aiMatch: 'AI Match',
      newest: 'Newest',
      closest: 'Closest',
      quantity: 'Quantity',
      createListing: 'Create Listing',
      noListings: 'No listings found',
    },

    // Water page
    water: {
      title: 'Water',
      subtitle: 'Find water sources nearby',
      waterPoints: 'Water Points',
      distance: 'Distance',
      quality: 'Quality',
      reliable: 'Reliable',
      intermittent: 'Intermittent',
      dry: 'Dry',
      unknown: 'Unknown',
      well: 'Well',
      tap: 'Tap',
      cistern: 'Cistern',
      spring: 'Spring',
      trucked: 'Trucked',
      other: 'Other',
    },

    // Guide/Crop Plan page
    guide: {
      title: 'Crop & Practice Plan',
      subtitle: 'AI-powered recommendations for your land',
      recommendations: 'Top Recommendations',
      alternatives: 'Alternatives',
      findSeeds: 'Find Seeds',
      plantingGuide: 'Planting Guide',
      harvestTime: 'Harvest Time',
      waterNeeds: 'Water Needs',
      difficulty: 'Difficulty',
      yourConditions: 'Your Conditions',
      plotArea: 'Plot Area',
      waterAccess: 'Water Access',
      salinityRisk: 'Salinity Risk',
      targetHarvest: 'Target Harvest Window',
      priority: 'Priority',
      none: 'None',
      limited: 'Limited',
      reliable: 'Reliable',
      some: 'Some',
      strong: 'Strong',
      balanced: 'Balanced',
      speed: 'Speed',
      nutrition: 'Nutrition',
      lowWater: 'Low Water',
      generatePlan: 'Generate Plan',
      analyzing: 'AI is analyzing your conditions...',
      findingBest: 'Finding the best crops for your plot',
    },

    // Assessment
    assessment: {
      title: 'Plot Assessment',
      plotSize: 'Plot Size',
      soilType: 'Soil Type',
      waterAccess: 'Water Access',
      sunExposure: 'Sun Exposure',
    },

    // Units
    units: {
      sqm: 'm²',
      kg: 'kg',
      days: 'days',
      km: 'km',
      m: 'm',
    },
  },

  ar: {
    // Common
    app: {
      name: 'ثمرة',
      tagline: 'استعادة وتنسيق المزرعة',
      offline: 'وضع غير متصل',
      online: 'متصل',
      loading: 'جار التحميل...',
      error: 'خطأ',
      success: 'نجاح',
      cancel: 'إلغاء',
      confirm: 'تأكيد',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      noResults: 'لا توجد نتائج',
      offlineData: 'وضع غير متصل - بيانات مخزنة',
      usingLoggedPlot: 'استخدام قطعة الأرض المسجلة',
    },

    // Menu
    menu: {
      title: 'القائمة',
      readAloud: 'قراءة بصوت عالٍ',
      readAloudDesc: 'استمع لمحتوى الصفحة',
      language: 'اللغة',
      languageName: 'العربية',
      notifications: 'الإشعارات',
      notificationsDesc: 'التنبيهات والتحديثات',
      settings: 'الإعدادات',
      settingsDesc: 'تفضيلات التطبيق',
      help: 'المساعدة والدعم',
      helpDesc: 'الأسئلة الشائعة والدروس',
      about: 'عن ثمرة',
      aboutDesc: 'الإصدار والمعلومات',
    },

    // Navigation
    nav: {
      map: 'الخريطة',
      guide: 'الدليل',
      drops: 'التوصيل',
      exchange: 'التبادل',
      water: 'المياه',
    },

    // Map page
    map: {
      title: 'الخريطة',
      plantability: 'قابلية الزراعة',
      seedSources: 'مصادر البذور',
      waterPoints: 'نقاط المياه',
      farmable: 'صالح للزراعة',
      restorable: 'قابل للاستعادة',
      damaged: 'متضرر',
      legend: 'دليل الألوان',
      opacityConfidence: 'الشفافية = مستوى الثقة',
      dashedNeedsCheck: 'متقطع = يحتاج فحص',
      logThisPlot: 'تسجيل هذه الأرض',
      viewDetails: 'عرض التفاصيل',
    },

    // Drops page
    drops: {
      title: 'التوصيل',
      subtitle: 'تخطيط استلام المحصول بدون تبريد',
      searchPlaceholder: 'ابحث عن المحاصيل أو المواقع...',
      aiPriority: 'أولوية الذكاء الاصطناعي',
      soonest: 'الأقرب وقتاً',
      largest: 'الأكبر كمية',
      active: 'نشط',
      scheduled: 'مجدول',
      completed: 'مكتمل',
      sameDay: 'نفس اليوم',
      timeFilter24h: '24 ساعة',
      timeFilterAny: 'أي وقت',
      sizeSmall: 'صغير',
      sizeMedium: 'متوسط',
      sizeLarge: 'كبير',
      noDrops: 'لا توجد توصيلات حتى الآن',
      noDropsDesc: 'أنشئ أول توصيلة لتنسيق استلام المحصول',
      createDrop: 'إنشاء توصيلة',
      loadDemo: 'تحميل بيانات تجريبية',
      orgBridge: 'جسر المنظمات',
    },

    // Exchange page
    exchange: {
      title: 'التبادل',
      subtitle: 'تبادل البذور والموارد',
      offer: 'عرض',
      request: 'طلب',
      available: 'متوفر',
      needed: 'مطلوب',
      inputs: 'المدخلات',
      labor: 'العمالة والنقل',
      verifiedHubs: 'المراكز الموثقة',
      allInputs: 'كل المدخلات',
      seeds: 'البذور',
      tools: 'الأدوات',
      fertilizer: 'الأسمدة',
      irrigation: 'الري',
      allServices: 'كل الخدمات',
      dayLabor: 'عمالة يومية',
      harvestHelp: 'مساعدة الحصاد',
      transport: 'النقل',
      containers: 'الحاويات',
      allHubs: 'كل المراكز',
      ngoHubs: 'مراكز المنظمات',
      coopHubs: 'المراكز التعاونية',
      suppliers: 'الموردون',
      searchPlaceholder: 'ابحث في القوائم...',
      aiMatch: 'تطابق ذكي',
      newest: 'الأحدث',
      closest: 'الأقرب',
      quantity: 'الكمية',
      createListing: 'إنشاء إعلان',
      noListings: 'لا توجد إعلانات',
    },

    // Water page
    water: {
      title: 'المياه',
      subtitle: 'اعثر على مصادر المياه القريبة',
      waterPoints: 'نقاط المياه',
      distance: 'المسافة',
      quality: 'الجودة',
      reliable: 'موثوق',
      intermittent: 'متقطع',
      dry: 'جاف',
      unknown: 'غير معروف',
      well: 'بئر',
      tap: 'صنبور',
      cistern: 'خزان',
      spring: 'نبع',
      trucked: 'صهريج',
      other: 'أخرى',
    },

    // Guide/Crop Plan page
    guide: {
      title: 'خطة المحاصيل والممارسات',
      subtitle: 'توصيات مدعومة بالذكاء الاصطناعي لأرضك',
      recommendations: 'أفضل التوصيات',
      alternatives: 'البدائل',
      findSeeds: 'ابحث عن البذور',
      plantingGuide: 'دليل الزراعة',
      harvestTime: 'وقت الحصاد',
      waterNeeds: 'احتياجات المياه',
      difficulty: 'الصعوبة',
      yourConditions: 'ظروفك',
      plotArea: 'مساحة الأرض',
      waterAccess: 'توفر المياه',
      salinityRisk: 'خطر الملوحة',
      targetHarvest: 'فترة الحصاد المستهدفة',
      priority: 'الأولوية',
      none: 'لا يوجد',
      limited: 'محدود',
      reliable: 'موثوق',
      some: 'بعض',
      strong: 'شديد',
      balanced: 'متوازن',
      speed: 'السرعة',
      nutrition: 'التغذية',
      lowWater: 'قليل المياه',
      generatePlan: 'إنشاء الخطة',
      analyzing: 'الذكاء الاصطناعي يحلل ظروفك...',
      findingBest: 'البحث عن أفضل المحاصيل لأرضك',
    },

    // Assessment
    assessment: {
      title: 'تقييم قطعة الأرض',
      plotSize: 'حجم الأرض',
      soilType: 'نوع التربة',
      waterAccess: 'توفر المياه',
      sunExposure: 'التعرض للشمس',
    },

    // Units
    units: {
      sqm: 'م²',
      kg: 'كجم',
      days: 'أيام',
      km: 'كم',
      m: 'م',
    },
  },
};

export type TranslationKeys = TranslationSchema;
