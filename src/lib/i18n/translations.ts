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
        // Zone analysis
        zoneAnalysis: string;
        locationSelected: string;
        confidence: string;
        needsOnSiteCheck: string;
        why: string;
        source: string;
        updated: string;
        logPlotHere: string;
        logPlotAnyway: string;
        noOverlayData: string;
        // Layer info
        layerInformation: string;
        packId: string;
        description: string;
        version: string;
        notes: string;
        // Seed source panel
        seedSource: string;
        reliability: string;
        lastConfirmed: string;
        daysAgo: string;
        availableCrops: string;
        copyLocation: string;
        locationCopied: string;
        hasSeeds: string;
        // Water point panel
        waterPoint: string;
        status: string;
        available: string;
        limited: string;
        unavailable: string;
        // Water legend
        high: string;
        medium: string;
        low: string;
        unknown: string;
    };
    exchange: {
        title: string;
        subtitle: string;
        offer: string;
        request: string;
        offers: string;
        requests: string;
        nearby: string;
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
        verified: string;
        postListing: string;
        generateBundle: string;
        tryAdjustFilters: string;
        sortAiMatch: string;
        sortNewest: string;
        sortClosest: string;
        sortQuantity: string;
        matches: string;
        safety: string;
        verifiedHub: string;
        ngo: string;
        peer: string;
        type: string;
        category: string;
        titleLabel: string;
        quantityLabel: string;
        unit: string;
        urgency: string;
        today: string;
        thisWeek: string;
        flexible: string;
        notesOptional: string;
        additionalDetails: string;
        createListingSubmit: string;
        recommendedMatches: string;
        noMatchesFound: string;
        generateBundleTitle: string;
        crop: string;
        plotSize: string;
        small: string;
        medium: string;
        large: string;
        generatedBundle: string;
        copy: string;
        saveLocally: string;
        essential: string;
        recommended: string;
        bestPractices: string;
        importantWarnings: string;
        fertilizerSafetyTitle: string;
        seedHandlingTitle: string;
        toolSafetyTitle: string;
        waterSafetyTitle: string;
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
    home: {
        farmInsights: string;
        updatedToday: string;
        rainComing: string;
        inDays: string;
        tomorrow: string;
        todayLabel: string;
        rainyDaysInNext: string;
        perfectTimePrepare: string;
        plantNow: string;
        daysToHarvest: string;
        landStatus: string;
        farmablePercent: string;
        regionalAverage: string;
        temperature: string;
        idealForPlanting: string;
        goodGrowingConditions: string;
        plantingWindow: string;
        daysLabel: string;
        beforeNextRain: string;
        plantSeedsNow: string;
        wind: string;
        light: string;
        safeForSpraying: string;
        tenDayRainOutlook: string;
        rainDays: string;
        welcome: string;
        checkLandGuidance: string;
        getCropPlan: string;
        checkPlantability: string;
        exchangeWork: string;
        findWater: string;
        logNewPlot: string;
        helpLocalFarmers: string;
        yourFarm: string;
        totalArea: string;
        hectares: string;
        plotsLogged: string;
        waterPointsNearby: string;
        noPlotLogged: string;
        logPlotInfo: string;
        lastLoggedPlot: string;
        viewOnMap: string;
    };
    drops: {
        title: string;
        subtitle: string;
        searchPlaceholder: string;
        items: string;
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
        findPickupMatch: string;
        highRisk: string;
        medRisk: string;
        lowRisk: string;
        createNewDrop: string;
        todayLabel: string;
        pickupWindow: string;
        quantity: string;
        location: string;
        notes: string;
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
        reliability: string;
        high: string;
        medium: string;
        low: string;
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
            // Zone analysis
            zoneAnalysis: 'Zone Analysis',
            locationSelected: 'Location Selected',
            confidence: 'confidence',
            needsOnSiteCheck: 'Needs on-site check',
            why: 'Why?',
            source: 'Source',
            updated: 'Updated',
            logPlotHere: 'Log plot here',
            logPlotAnyway: 'Log plot anyway',
            noOverlayData: 'No overlay data here (demo pack coverage is limited).',
            // Layer info
            layerInformation: 'Layer Information',
            packId: 'Pack ID',
            description: 'Description',
            version: 'Version',
            notes: 'Notes',
            // Seed source panel
            seedSource: 'Seed Source',
            reliability: 'Reliability',
            lastConfirmed: 'Last confirmed',
            daysAgo: 'days ago',
            availableCrops: 'Available Crops',
            copyLocation: 'Copy Location',
            locationCopied: 'Location copied to clipboard!',
            hasSeeds: 'This source has',
            // Water point panel
            waterPoint: 'Water Point',
            status: 'Status',
            available: 'Available',
            limited: 'Limited',
            unavailable: 'Unavailable',
            // Water legend
            high: 'High',
            medium: 'Medium',
            low: 'Low',
            unknown: 'Unknown',
        },

        // Drops page
        drops: {
            title: 'Drops',
            subtitle: 'Plan harvest pickup without refrigeration',
            searchPlaceholder: 'Search crops, locations...',
            items: 'items',
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
            findPickupMatch: 'Find Pickup Match',
            highRisk: 'High Risk',
            medRisk: 'Med Risk',
            lowRisk: 'Low Risk',
            createNewDrop: 'Create New Drop',
            todayLabel: 'Today',
            pickupWindow: 'Pickup Window',
            quantity: 'Quantity',
            location: 'Location',
            notes: 'Notes',
        },

        // Exchange page
        exchange: {
            title: 'Exchange',
            subtitle: 'Trade seeds and resources',
            offer: 'Offer',
            request: 'Request',
            offers: 'Offers',
            requests: 'Requests',
            nearby: 'Nearby',
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
            verified: 'Verified',
            postListing: 'Post Listing',
            generateBundle: 'Generate Bundle',
            tryAdjustFilters: 'Try adjusting your filters',
            sortAiMatch: 'Sort: AI Match',
            sortNewest: 'Sort: Newest',
            sortClosest: 'Sort: Closest',
            sortQuantity: 'Sort: Quantity',
            matches: 'Matches',
            safety: 'Safety',
            verifiedHub: 'Verified Hub',
            ngo: 'NGO',
            peer: 'Peer',
            type: 'Type',
            category: 'Category',
            titleLabel: 'Title',
            quantityLabel: 'Quantity',
            unit: 'Unit',
            urgency: 'Urgency',
            today: 'Today',
            thisWeek: 'This Week',
            flexible: 'Flexible',
            notesOptional: 'Notes (optional)',
            additionalDetails: 'Additional details...',
            createListingSubmit: 'Create Listing',
            recommendedMatches: 'Recommended Matches',
            noMatchesFound: 'No matches found',
            generateBundleTitle: 'Generate Request Bundle',
            crop: 'Crop',
            plotSize: 'Plot Size',
            small: 'Small',
            medium: 'Medium',
            large: 'Large',
            generatedBundle: 'Generated request bundle',
            copy: 'Copy',
            saveLocally: 'Save Locally',
            essential: 'Essential',
            recommended: 'Recommended',
            bestPractices: 'Best Practices',
            importantWarnings: 'Important Warnings',
            fertilizerSafetyTitle: 'Fertilizer Safety Basics',
            seedHandlingTitle: 'Seed Handling Tips',
            toolSafetyTitle: 'Tool Safety & Maintenance',
            waterSafetyTitle: 'Water Storage & Irrigation Safety',
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
            reliability: 'Reliability',
            high: 'High',
            medium: 'Medium',
            low: 'Low',
        },

        // Home page
        home: {
            farmInsights: 'Farm Insights',
            updatedToday: 'Updated today',
            rainComing: 'Rain Coming',
            inDays: 'In {days} days',
            tomorrow: 'Tomorrow',
            todayLabel: 'Today!',
            rainyDaysInNext: '{count} rainy days in next 10 days',
            perfectTimePrepare: 'Perfect time to prepare soil',
            plantNow: 'Plant Now',
            daysToHarvest: '{days} days to harvest',
            landStatus: 'Land Status',
            farmablePercent: '{percent}% Farmable',
            regionalAverage: 'Regional average',
            temperature: 'Temperature',
            idealForPlanting: 'Ideal for planting',
            goodGrowingConditions: 'Good growing conditions',
            plantingWindow: 'Planting Window',
            daysLabel: '{days} Days',
            beforeNextRain: 'Before next rain',
            plantSeedsNow: 'Plant seeds now for rain benefit',
            wind: 'Wind',
            light: 'Light',
            safeForSpraying: 'Safe for spraying',
            tenDayRainOutlook: '10-Day Rain Outlook',
            rainDays: '{count} rain days',
            welcome: 'Welcome مرحبا',
            checkLandGuidance: 'Check your land and get planting guidance',
            getCropPlan: 'Get Crop Plan',
            checkPlantability: 'Check Plantability',
            exchangeWork: 'Exchange & Work',
            findWater: 'Find Water',
            logNewPlot: 'Log New Plot',
            helpLocalFarmers: 'Help local farmers',
            yourFarm: 'Your Farm',
            totalArea: 'Total Area',
            hectares: 'ha',
            plotsLogged: 'Plots Logged',
            waterPointsNearby: 'Water Points Nearby',
            noPlotLogged: 'No plot logged yet',
            logPlotInfo: 'Log your plot to get personalized recommendations',
            lastLoggedPlot: 'Last Logged Plot',
            viewOnMap: 'View on Map',
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
            loadingMap: 'جار تحميل الخريطة...',
            loadingWater: 'جار تحميل نقاط المياه...',
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
            // Zone analysis
            zoneAnalysis: 'تحليل المنطقة',
            locationSelected: 'تم اختيار الموقع',
            confidence: 'ثقة',
            needsOnSiteCheck: 'يحتاج فحص ميداني',
            why: 'لماذا؟',
            source: 'المصدر',
            updated: 'محدث',
            logPlotHere: 'سجل الأرض هنا',
            logPlotAnyway: 'سجل الأرض على أي حال',
            noOverlayData: 'لا توجد بيانات هنا (التغطية التجريبية محدودة).',
            // Layer info
            layerInformation: 'معلومات الطبقة',
            packId: 'معرف الحزمة',
            description: 'الوصف',
            version: 'الإصدار',
            notes: 'ملاحظات',
            // Seed source panel
            seedSource: 'مصدر البذور',
            reliability: 'الموثوقية',
            lastConfirmed: 'آخر تأكيد',
            daysAgo: 'أيام مضت',
            availableCrops: 'المحاصيل المتاحة',
            copyLocation: 'نسخ الموقع',
            locationCopied: 'تم نسخ الموقع!',
            hasSeeds: 'هذا المصدر لديه',
            // Water point panel
            waterPoint: 'نقطة مياه',
            status: 'الحالة',
            available: 'متاح',
            limited: 'محدود',
            unavailable: 'غير متاح',
            // Water legend
            high: 'عالي',
            medium: 'متوسط',
            low: 'منخفض',
            unknown: 'غير معروف',
        },

        // Drops page
        drops: {
            title: 'التوصيل',
            subtitle: 'تخطيط استلام المحصول بدون تبريد',
            searchPlaceholder: 'ابحث عن المحاصيل، المواقع...',
            items: 'عناصر',
            aiPriority: 'أولوية ذكية',
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
            findPickupMatch: 'ابحث عن مطابقة استلام',
            highRisk: 'خطر عالي',
            medRisk: 'خطر متوسط',
            lowRisk: 'خطر منخفض',
            createNewDrop: 'إنشاء توصيلة جديدة',
            todayLabel: 'اليوم',
            pickupWindow: 'نافذة الاستلام',
            quantity: 'الكمية',
            location: 'الموقع',
            notes: 'ملاحظات',
        },

        // Exchange page
        exchange: {
            title: 'التبادل',
            subtitle: 'تبادل البذور والموارد',
            offer: 'عرض',
            request: 'طلب',
            offers: 'العروض',
            requests: 'الطلبات',
            nearby: 'قريب',
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
            verified: 'موثق',
            postListing: 'نشر إعلان',
            generateBundle: 'إنشاء حزمة',
            tryAdjustFilters: 'حاول تعديل الفلاتر',
            sortAiMatch: 'ترتيب: تطابق ذكي',
            sortNewest: 'ترتيب: الأحدث',
            sortClosest: 'ترتيب: الأقرب',
            sortQuantity: 'ترتيب: الكمية',
            matches: 'التطابقات',
            safety: 'السلامة',
            verifiedHub: 'مركز موثق',
            ngo: 'منظمة',
            peer: 'نظير',
            type: 'النوع',
            category: 'الفئة',
            titleLabel: 'العنوان',
            quantityLabel: 'الكمية',
            unit: 'الوحدة',
            urgency: 'الاستعجال',
            today: 'اليوم',
            thisWeek: 'هذا الأسبوع',
            flexible: 'مرن',
            notesOptional: 'ملاحظات (اختياري)',
            additionalDetails: 'تفاصيل إضافية...',
            createListingSubmit: 'إنشاء إعلان',
            recommendedMatches: 'التطابقات الموصى بها',
            noMatchesFound: 'لا توجد تطابقات',
            generateBundleTitle: 'إنشاء حزمة طلبات',
            crop: 'المحصول',
            plotSize: 'حجم الأرض',
            small: 'صغير',
            medium: 'متوسط',
            large: 'كبير',
            generatedBundle: 'حزمة الطلبات المولدة',
            copy: 'نسخ',
            saveLocally: 'حفظ محلياً',
            essential: 'أساسي',
            recommended: 'موصى به',
            bestPractices: 'أفضل الممارسات',
            importantWarnings: 'تحذيرات مهمة',
            fertilizerSafetyTitle: 'أساسيات سلامة الأسمدة',
            seedHandlingTitle: 'نصائح التعامل مع البذور',
            toolSafetyTitle: 'سلامة وصيانة الأدوات',
            waterSafetyTitle: 'سلامة تخزين المياه والري',
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
            reliability: 'الموثوقية',
            high: 'عالي',
            medium: 'متوسط',
            low: 'منخفض',
        },

        // Home page
        home: {
            farmInsights: 'معلومات المزرعة',
            updatedToday: 'محدث اليوم',
            rainComing: 'أمطار قادمة',
            inDays: 'خلال {days} أيام',
            tomorrow: 'غداً',
            todayLabel: 'اليوم!',
            rainyDaysInNext: '{count} أيام ممطرة في الـ 10 أيام القادمة',
            perfectTimePrepare: 'الوقت المثالي لتجهيز التربة',
            plantNow: 'ازرع الآن',
            daysToHarvest: '{days} يوم للحصاد',
            landStatus: 'حالة الأرض',
            farmablePercent: '{percent}% صالح للزراعة',
            regionalAverage: 'المتوسط الإقليمي',
            temperature: 'درجة الحرارة',
            idealForPlanting: 'مثالي للزراعة',
            goodGrowingConditions: 'ظروف نمو جيدة',
            plantingWindow: 'فترة الزراعة',
            daysLabel: '{days} أيام',
            beforeNextRain: 'قبل المطر القادم',
            plantSeedsNow: 'ازرع البذور الآن للاستفادة من المطر',
            wind: 'الرياح',
            light: 'خفيفة',
            safeForSpraying: 'آمن للرش',
            tenDayRainOutlook: 'توقعات المطر لـ 10 أيام',
            rainDays: '{count} أيام ممطرة',
            welcome: 'مرحبا Welcome',
            checkLandGuidance: 'افحص أرضك واحصل على إرشادات الزراعة',
            getCropPlan: 'احصل على خطة المحاصيل',
            checkPlantability: 'افحص قابلية الزراعة',
            exchangeWork: 'التبادل والعمل',
            findWater: 'ابحث عن الماء',
            logNewPlot: 'سجل قطعة أرض جديدة',
            helpLocalFarmers: 'ساعد المزارعين المحليين',
            yourFarm: 'مزرعتك',
            totalArea: 'المساحة الكلية',
            hectares: 'هكتار',
            plotsLogged: 'الأراضي المسجلة',
            waterPointsNearby: 'نقاط المياه القريبة',
            noPlotLogged: 'لم يتم تسجيل أي أرض بعد',
            logPlotInfo: 'سجل أرضك للحصول على توصيات مخصصة',
            lastLoggedPlot: 'آخر أرض مسجلة',
            viewOnMap: 'عرض على الخريطة',
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
