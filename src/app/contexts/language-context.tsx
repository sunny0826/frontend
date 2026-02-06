import { createContext, useContext, useState, ReactNode } from "react";

export type Language = "zh" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const translations = {
  zh: {
    // Header
    "header.nav.insight": "人才洞察",
    "header.nav.products": "产品矩阵",
    "header.nav.reports": "权威报告",
    "header.nav.ecosystem": "生态价值",
    "header.login": "登录",

    // Hero Section
    "hero.title.line1": "开源的世界里",
    "hero.title.line2": "每一份贡献都值得回报",
    "hero.search.placeholder": "查询平台人才 ID 查看人才画像",
    "hero.stats.platforms": "主流平台接入",
    "hero.stats.developers": "开发者画像",
    "hero.stats.projects": "项目分析",
    "hero.stats.accuracy": "数据准确率",

    // Platforms Section
    "platforms.subtitle": "数据来源平台",
    "platforms.title": "汇聚全球主流开源生态数据",

    // Products Section
    "products.badge": "核心产品矩阵",
    "products.title": "构建完整的开源人才生态",
    "products.description": "从价值发现到精准连接，再到贡献激励，打造开源人才经济闭环",

    "products.insight.name": "OpenTalent Insight",
    "products.insight.subtitle": "开源人才深度洞察",
    "products.insight.description":
      "基于多维度开源贡献数据，构建开发者能力画像与价值评估体系。量化技术能力、协作质量、贡献趋势，为人才决策提供数据支撑。",
    "products.insight.feature1": "多维度贡献评价",
    "products.insight.feature2": "技术领域熟练度分析",
    "products.insight.feature3": "时序能力变化追踪",
    "products.insight.feature4": "开发者排名与对比",

    "products.ads.name": "OpenTalent Ads",
    "products.ads.subtitle": "精准人才触达",
    "products.ads.description":
      "基于开发者画像的智能筛选与定向触达平台。帮助企业和社区高效连接目标人才，实现人才供需的精准匹配。",
    "products.ads.feature1": "智能多维筛选",
    "products.ads.feature2": "定向站内触达",
    "products.ads.feature3": "效果数据追踪",
    "products.ads.feature4": "开发者激励机制",

    "products.credit.name": "OpenTalent Credit",
    "products.credit.subtitle": "贡献激励体系",
    "products.credit.description":
      "构建开源贡献价值流转生态。企业可向核心贡献者发放激励，开发者贡献获得持续认可与回报，形成良性循环。",
    "products.credit.feature1": "贡献价值量化",
    "products.credit.feature2": "激励发放管理",
    "products.credit.feature3": "积分兑换体系",
    "products.credit.feature4": "透明结算机制",

    "products.value1.title": "数据安全可信",
    "products.value1.description": "基于公开开源数据分析，保护隐私，确保中立性",
    "products.value2.title": "持续数据更新",
    "products.value2.description": "实时同步开源平台数据，洞察保持最新",
    "products.value3.title": "智能算法引擎",
    "products.value3.description": "先进的AI算法精准量化开发者能力与贡献价值",

    // Reports Section
    "reports.badge": "权威报告",
    "reports.title": "引领开源生态洞察",
    "reports.description":
      "基于平台海量数据与深度分析，发布行业权威报告，为政府、企业与开发者提供决策参考",

    "reports.global.title": "全球开源深度发展报告",
    "reports.global.year": "2025",
    "reports.global.description":
      "深度剖析全球开源技术发展趋势、关键领域突破与未来演进方向",
    "reports.global.badge": "年度旗舰",
    "reports.global.highlight1": "技术趋势分析",
    "reports.global.highlight2": "领域深度洞察",
    "reports.global.highlight3": "未来方向预测",

    "reports.china.title": "中国开源年度报告",
    "reports.china.year": "2025",
    "reports.china.description":
      "全景呈现中国开源生态发展现状、企业实践与政策环境",
    "reports.china.badge": "权威发布",
    "reports.china.highlight1": "生态全景",
    "reports.china.highlight2": "企业实践",
    "reports.china.highlight3": "政策导向",

    "reports.talent.title": "全球开源人才报告",
    "reports.talent.year": "2025",
    "reports.talent.description":
      "聚焦开源人才供需、能力分布、成长路径与价值变现",
    "reports.talent.badge": "核心洞察",
    "reports.talent.highlight1": "人才画像",
    "reports.talent.highlight2": "供需分析",
    "reports.talent.highlight3": "价值趋势",

    "reports.button": "查看报告",
    "reports.stat1": "年度报告发布",
    "reports.stat2": "企业参考使用",
    "reports.stat3": "政府部门引用",
    "reports.stat4": "报告下载量",

    // Ecosystem Section
    "ecosystem.badge": "生态价值",
    "ecosystem.title": "多方共赢的价值网络",
    "ecosystem.description": "连接开发者、企业与社区，构建开源人才经济的良性循环",

    "ecosystem.developers.title": "开源开发者",
    "ecosystem.developers.description": "技术能力被精准量化与认可",
    "ecosystem.developers.benefit1": "多维能力画像与排名",
    "ecosystem.developers.benefit2": "贡献价值透明展示",
    "ecosystem.developers.benefit3": "获得生态激励回报",
    "ecosystem.developers.benefit4": "连接优质职业机会",

    "ecosystem.enterprises.title": "企业与组织",
    "ecosystem.enterprises.description": "高效发现与连接目标人才",
    "ecosystem.enterprises.benefit1": "精准人才洞察与评估",
    "ecosystem.enterprises.benefit2": "定向触达目标开发者",
    "ecosystem.enterprises.benefit3": "激励核心贡献者",
    "ecosystem.enterprises.benefit4": "提升开源影响力",

    "ecosystem.communities.title": "开源社区",
    "ecosystem.communities.description": "构建健康可持续的生态",
    "ecosystem.communities.benefit1": "社区贡献数据分析",
    "ecosystem.communities.benefit2": "核心成员识别",
    "ecosystem.communities.benefit3": "贡献者激励机制",
    "ecosystem.communities.benefit4": "生态健康度监测",

    "ecosystem.flow.title": "价值流转闭环",
    "ecosystem.flow.step1.title": "价值发现",
    "ecosystem.flow.step1.description":
      "精准量化开发者贡献与能力，构建多维人才画像",
    "ecosystem.flow.step2.title": "精准连接",
    "ecosystem.flow.step2.description":
      "高效匹配人才供需，实现开发者与企业的双向选择",
    "ecosystem.flow.step3.title": "生态激励",
    "ecosystem.flow.step3.description":
      "开源贡献获得回报，持续驱动生态繁荣与价值增长",

    // CTA Section
    "cta.badge": "开启开源人才新篇章",
    "cta.title.line1": "让每一份开源贡献",
    "cta.title.line2": "都获得应有的价值",
    "cta.description":
      "加入 OpenTalent 生态，与全球千万开发者、数千家企业一起，共建开源人才经济的美好未来",
    "cta.partners": "受到行业领先机构的信任",

    // Footer
    "footer.description": "开源人才价值发现与生态激励平台",
    "footer.products": "产品",
    "footer.products.insight": "OpenTalent Insight",
    "footer.products.ads": "OpenTalent Ads",
    "footer.products.credit": "OpenTalent Credit",
    "footer.products.pricing": "定价方案",
    "footer.resources": "资源",
    "footer.resources.reports": "权威报告",
    "footer.resources.docs": "开发者文档",
    "footer.resources.api": "API 文档",
    "footer.resources.cases": "使用案例",
    "footer.company": "公司",
    "footer.company.about": "关于我们",
    "footer.company.careers": "加入我们",
    "footer.company.news": "新闻动态",
    "footer.company.contact": "联系我们",
    "footer.legal": "法律",
    "footer.legal.privacy": "隐私政策",
    "footer.legal.terms": "服务条款",
    "footer.legal.security": "数据安全",
    "footer.legal.compliance": "合规声明",
    "footer.copyright": "© 2026 OpenTalent. 保留所有权利。",
    "footer.slogan": "开源的世界里，每一份贡献都值得回报",
  },
  en: {
    // Header
    "header.nav.insight": "Talent Insight",
    "header.nav.products": "Products",
    "header.nav.reports": "Reports",
    "header.nav.ecosystem": "Ecosystem",
    "header.login": "Login",

    // Hero Section
    "hero.title.line1": "In the world of open source",
    "hero.title.line2": "Every contribution deserves its reward",
    "hero.search.placeholder": "Search developer ID to view talent profile",
    "hero.stats.platforms": "Integrated Platforms",
    "hero.stats.developers": "Developer Profiles",
    "hero.stats.projects": "Project Analysis",
    "hero.stats.accuracy": "Data Accuracy",

    // Platforms Section
    "platforms.subtitle": "Data Sources",
    "platforms.title": "Aggregating Global Open Source Ecosystem Data",

    // Products Section
    "products.badge": "Core Products",
    "products.title": "Building a Complete Open Source Talent Ecosystem",
    "products.description":
      "From value discovery to precise connection and contribution incentives, creating a closed loop of open source talent economy",

    "products.insight.name": "OpenTalent Insight",
    "products.insight.subtitle": "Deep Open Source Talent Insights",
    "products.insight.description":
      "Build developer capability profiles and value assessment systems based on multi-dimensional open source contribution data. Quantify technical capabilities, collaboration quality, and contribution trends to provide data support for talent decisions.",
    "products.insight.feature1": "Multi-dimensional Contribution Assessment",
    "products.insight.feature2": "Technical Domain Proficiency Analysis",
    "products.insight.feature3": "Time-series Capability Tracking",
    "products.insight.feature4": "Developer Ranking & Comparison",

    "products.ads.name": "OpenTalent Ads",
    "products.ads.subtitle": "Precise Talent Outreach",
    "products.ads.description":
      "An intelligent filtering and targeted outreach platform based on developer profiles. Help enterprises and communities efficiently connect with target talents and achieve precise matching of talent supply and demand.",
    "products.ads.feature1": "Smart Multi-dimensional Filtering",
    "products.ads.feature2": "Targeted In-platform Outreach",
    "products.ads.feature3": "Performance Data Tracking",
    "products.ads.feature4": "Developer Incentive Mechanism",

    "products.credit.name": "OpenTalent Credit",
    "products.credit.subtitle": "Contribution Incentive System",
    "products.credit.description":
      "Build an ecosystem for open source contribution value circulation. Enterprises can grant incentives to core contributors, developers receive continuous recognition and rewards for their contributions, forming a virtuous cycle.",
    "products.credit.feature1": "Contribution Value Quantification",
    "products.credit.feature2": "Incentive Distribution Management",
    "products.credit.feature3": "Points Exchange System",
    "products.credit.feature4": "Transparent Settlement Mechanism",

    "products.value1.title": "Secure & Trustworthy Data",
    "products.value1.description":
      "Based on public open source data analysis, protecting privacy and ensuring neutrality",
    "products.value2.title": "Continuous Data Updates",
    "products.value2.description":
      "Real-time synchronization of open source platform data, keeping insights up-to-date",
    "products.value3.title": "Intelligent Algorithm Engine",
    "products.value3.description":
      "Advanced AI algorithms precisely quantify developer capabilities and contribution value",

    // Reports Section
    "reports.badge": "Authoritative Reports",
    "reports.title": "Leading Open Source Ecosystem Insights",
    "reports.description":
      "Based on massive platform data and in-depth analysis, publish industry-leading reports to provide decision-making references for governments, enterprises, and developers",

    "reports.global.title": "Global Open Source In-depth Development Report",
    "reports.global.year": "2025",
    "reports.global.description":
      "In-depth analysis of global open source technology development trends, key domain breakthroughs, and future evolution directions",
    "reports.global.badge": "Annual Flagship",
    "reports.global.highlight1": "Technology Trend Analysis",
    "reports.global.highlight2": "Domain Deep Insights",
    "reports.global.highlight3": "Future Direction Forecast",

    "reports.china.title": "China Open Source Annual Report",
    "reports.china.year": "2025",
    "reports.china.description":
      "Comprehensive presentation of China's open source ecosystem development status, enterprise practices, and policy environment",
    "reports.china.badge": "Official Release",
    "reports.china.highlight1": "Ecosystem Overview",
    "reports.china.highlight2": "Enterprise Practices",
    "reports.china.highlight3": "Policy Guidance",

    "reports.talent.title": "Global Open Source Talent Report",
    "reports.talent.year": "2025",
    "reports.talent.description":
      "Focus on open source talent supply and demand, capability distribution, growth paths, and value monetization",
    "reports.talent.badge": "Core Insights",
    "reports.talent.highlight1": "Talent Profiles",
    "reports.talent.highlight2": "Supply & Demand Analysis",
    "reports.talent.highlight3": "Value Trends",

    "reports.button": "View Report",
    "reports.stat1": "Annual Reports Published",
    "reports.stat2": "Enterprises Using",
    "reports.stat3": "Government Citations",
    "reports.stat4": "Report Downloads",

    // Ecosystem Section
    "ecosystem.badge": "Ecosystem Value",
    "ecosystem.title": "Multi-win Value Network",
    "ecosystem.description":
      "Connecting developers, enterprises, and communities to build a virtuous cycle of open source talent economy",

    "ecosystem.developers.title": "Open Source Developers",
    "ecosystem.developers.description":
      "Technical capabilities precisely quantified and recognized",
    "ecosystem.developers.benefit1": "Multi-dimensional Capability Profiles & Rankings",
    "ecosystem.developers.benefit2": "Transparent Contribution Value Display",
    "ecosystem.developers.benefit3": "Receive Ecosystem Incentive Rewards",
    "ecosystem.developers.benefit4": "Connect with Quality Career Opportunities",

    "ecosystem.enterprises.title": "Enterprises & Organizations",
    "ecosystem.enterprises.description":
      "Efficiently discover and connect with target talents",
    "ecosystem.enterprises.benefit1": "Precise Talent Insights & Assessment",
    "ecosystem.enterprises.benefit2": "Targeted Developer Outreach",
    "ecosystem.enterprises.benefit3": "Incentivize Core Contributors",
    "ecosystem.enterprises.benefit4": "Enhance Open Source Influence",

    "ecosystem.communities.title": "Open Source Communities",
    "ecosystem.communities.description": "Build healthy and sustainable ecosystems",
    "ecosystem.communities.benefit1": "Community Contribution Data Analysis",
    "ecosystem.communities.benefit2": "Core Member Identification",
    "ecosystem.communities.benefit3": "Contributor Incentive Mechanism",
    "ecosystem.communities.benefit4": "Ecosystem Health Monitoring",

    "ecosystem.flow.title": "Value Circulation Loop",
    "ecosystem.flow.step1.title": "Value Discovery",
    "ecosystem.flow.step1.description":
      "Precisely quantify developer contributions and capabilities, build multi-dimensional talent profiles",
    "ecosystem.flow.step2.title": "Precise Connection",
    "ecosystem.flow.step2.description":
      "Efficiently match talent supply and demand, achieve two-way selection between developers and enterprises",
    "ecosystem.flow.step3.title": "Ecosystem Incentives",
    "ecosystem.flow.step3.description":
      "Open source contributions receive rewards, continuously driving ecosystem prosperity and value growth",

    // CTA Section
    "cta.badge": "Ushering in a New Era of Open Source Talent",
    "cta.title.line1": "Let every open source contribution",
    "cta.title.line2": "receive its deserved value",
    "cta.description":
      "Join the OpenTalent ecosystem, together with millions of developers and thousands of enterprises worldwide, to build a brighter future for open source talent economy",
    "cta.partners": "Trusted by industry-leading organizations",

    // Footer
    "footer.description": "Open Source Talent Value Discovery & Ecosystem Incentive Platform",
    "footer.products": "Products",
    "footer.products.insight": "OpenTalent Insight",
    "footer.products.ads": "OpenTalent Ads",
    "footer.products.credit": "OpenTalent Credit",
    "footer.products.pricing": "Pricing",
    "footer.resources": "Resources",
    "footer.resources.reports": "Reports",
    "footer.resources.docs": "Developer Docs",
    "footer.resources.api": "API Docs",
    "footer.resources.cases": "Use Cases",
    "footer.company": "Company",
    "footer.company.about": "About Us",
    "footer.company.careers": "Careers",
    "footer.company.news": "News",
    "footer.company.contact": "Contact",
    "footer.legal": "Legal",
    "footer.legal.privacy": "Privacy Policy",
    "footer.legal.terms": "Terms of Service",
    "footer.legal.security": "Data Security",
    "footer.legal.compliance": "Compliance",
    "footer.copyright": "© 2026 OpenTalent. All rights reserved.",
    "footer.slogan": "In the world of open source, every contribution deserves its reward",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.zh] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
