// 2026-11-12：从 OnboardingPage 抽出，「我的档案」补填年龄段、修改授权时也要用同一套取值。

// 隐私政策/知情同意书的版本号——以后协议文案有实质性修改，就把这个版本号往上加一位，
// 这样每条同意记录里存的 policyVersion 才能对应到当时用户实际看到、同意的是哪一版文案
export const CONSENT_POLICY_VERSION = 'v1.0-2026-09'

// 2026-10-16 新增：年龄段，取值与后端 human_style_profiles.age_range 枚举、数据字典 01B 一致
export const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const
