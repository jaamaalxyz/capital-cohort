export default {
  // Common
  common: {
    cancel: 'বাতিল',
    save: 'সংরক্ষণ',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    reset: 'রিসেট',
    discard: 'বাতিল করুন',
    today: 'আজ',
    of: 'এর মধ্যে',
  },

  // Tab Navigation
  tabs: {
    home: 'হোম',
    expenses: 'খরচ',
    settings: 'সেটিংস',
  },

  // Dashboard Screen
  dashboard: {
    monthlyIncome: 'মাসিক আয়',
    setupIncome: 'আপনার আয় সেট করুন →',
    totalSpent: 'মোট খরচ',
    remaining: 'অবশিষ্ট',
  },

  // Expenses Screen
  expenses: {
    title: 'খরচের তালিকা',
    filterAll: 'সব',
    noExpenses: 'কোনো খরচ নেই',
    addFirstExpense: 'হোম স্ক্রিন থেকে\nআপনার প্রথম খরচ যোগ করুন',
    deleteTitle: 'খরচ মুছুন',
    deleteMessage: 'আপনি কি নিশ্চিত যে আপনি এই খরচটি মুছতে চান?',
  },

  // Settings Screen
  settings: {
    title: 'সেটিংস',
    monthlyIncome: 'মাসিক আয়',
    enterIncome: 'আপনার মাসিক আয় লিখুন',
    budgetBreakdown: 'বাজেট বিভাজন',
    incomeSplitAs: 'আপনার আয় ভাগ হবে:',
    needsPercent: '৫০% → প্রয়োজনীয়',
    wantsPercent: '৩০% → ইচ্ছা',
    savingsPercent: '২০% → সঞ্চয়',
    currency: 'মুদ্রা',
    language: 'ভাষা',
    rule503020: '৫০/৩০/২০ নিয়ম',
    ruleDescription:
      'একটি সহজ বাজেট নিয়ম যা আপনার কর-পরবর্তী আয়কে তিনটি বিভাগে ভাগ করে:',
    needsRule: '৫০% প্রয়োজনীয়:',
    needsRuleDesc: 'অপরিহার্য খরচ যা আপনাকে অবশ্যই দিতে হবে',
    wantsRule: '৩০% ইচ্ছা:',
    wantsRuleDesc: 'বিনোদনের জন্য অপ্রয়োজনীয় খরচ',
    savingsRule: '২০% সঞ্চয়:',
    savingsRuleDesc: 'আপনার আর্থিক ভবিষ্যৎ গড়ে তোলা',
    dangerZone: 'বিপদ অঞ্চল',
    resetAllData: 'সব ডেটা রিসেট করুন',
    resetTitle: 'সব ডেটা রিসেট করুন',
    resetMessage:
      'এটি আপনার সমস্ত খরচ মুছে দেবে এবং আপনার আয় রিসেট করবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
    selectCurrency: 'মুদ্রা নির্বাচন করুন',
    searchCurrencies: 'মুদ্রা অনুসন্ধান করুন...',
    noCurrenciesFound: 'কোনো মুদ্রা পাওয়া যায়নি',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    searchLanguages: 'ভাষা অনুসন্ধান করুন...',
    noLanguagesFound: 'কোনো ভাষা পাওয়া যায়নি',
  },

  // Add Expense Screen
  addExpense: {
    title: 'খরচ যোগ করুন',
    amount: 'পরিমাণ',
    description: 'বিবরণ',
    descriptionPlaceholder: 'আপনি কিসে খরচ করেছেন?',
    category: 'বিভাগ',
    date: 'তারিখ',
    addButton: 'খরচ যোগ করুন',
    invalidAmount: 'অবৈধ পরিমাণ',
    required: 'আবশ্যক',
    selectCategory: 'একটি বিভাগ নির্বাচন করুন',
    discardTitle: 'পরিবর্তন বাতিল করবেন?',
    discardMessage:
      'আপনার অসংরক্ষিত পরিবর্তন আছে। আপনি কি নিশ্চিত যে আপনি সেগুলি বাতিল করতে চান?',
    keepEditing: 'সম্পাদনা চালিয়ে যান',
  },

  // Budget Card
  budgetCard: {
    remaining: 'অবশিষ্ট:',
  },

  // Categories
  categories: {
    needs: 'প্রয়োজনীয়',
    wants: 'ইচ্ছা',
    savings: 'সঞ্চয়',
    needsDescription: 'অপরিহার্য: ভাড়া, বিদ্যুৎ, মুদি, বীমা',
    wantsDescription: 'অপ্রয়োজনীয়: বিনোদন, বাইরে খাওয়া, শখ',
    savingsDescription: 'সঞ্চয়, বিনিয়োগ, জরুরি তহবিল',
  },

  // Amount Input
  amountInput: {
    placeholder: '০.০০',
  },

  // Not Found Screen
  notFound: {
    title: 'পৃষ্ঠা পাওয়া যায়নি',
    subtitle: 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা বিদ্যমান নেই।',
    goHome: 'হোমে ফিরে যান',
  },
} as const;
