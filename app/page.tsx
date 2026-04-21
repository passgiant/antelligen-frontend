import Link from "next/link";
import MarketRiskPanel from "@/features/dashboard/ui/components/MarketRiskPanel";
import SchedulePanel from "@/features/dashboard/ui/components/SchedulePanel";

const FEATURES = [
  {
    icon: "📰",
    title: "뉴스 분석",
    description:
      "최신 뉴스를 실시간으로 수집하고 AI가 투자 심리와 시장 방향성을 분석합니다.",
    badge: "News Agent",
  },
  {
    icon: "📋",
    title: "공시 분석",
    description:
      "사업보고서·분기보고서 등 핵심 공시를 RAG 기반으로 분석해 주요 이벤트를 추출합니다.",
    badge: "Disclosure Agent",
  },
  {
    icon: "📊",
    title: "재무 분석",
    description:
      "DART 재무제표 데이터를 기반으로 ROE·ROA·부채비율 등 핵심 지표를 LLM이 해석합니다.",
    badge: "Finance Agent",
  },
];

const STATS = [
  { value: "3", label: "병렬 AI 에이전트" },
  { value: "20s", label: "평균 분석 시간" },
  { value: "KOSPI", label: "지원 시장" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-blue-950/30" />

        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-36 text-center">
          {/* 팀 배지 */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Antelligen
          </span>

          <h1 className="mt-6 text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
            AI 멀티 에이전트로
            <br />
            <span className="text-blue-600 dark:text-blue-400">주식을 분석하다</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            뉴스 · 공시 · 재무 데이터를 세 개의 전문 AI 에이전트가 동시에 분석합니다.
            종목 코드 하나만 입력하면 30초 안에 종합 투자 인사이트를 제공합니다.
          </p>

          <div className="mx-auto mt-10 max-w-2xl text-left">
            <MarketRiskPanel />
          </div>

          <div className="mx-auto mt-8 max-w-2xl text-left">
            <SchedulePanel />
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/stock-recommendation"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-md hover:bg-blue-700 transition-colors"
            >
              지금 분석하기
              <span>→</span>
            </Link>
            <Link
              href="/board"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-7 py-3.5 text-base font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              커뮤니티 보기
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{stat.value}</p>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            세 가지 전문 에이전트
          </h2>
          <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            각 에이전트는 독립적으로 동작하며 병렬로 실행됩니다
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-3xl">{feature.icon}</span>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-mono text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              사용 방법
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "종목 코드 입력", desc: "분석하고 싶은 종목의 코드를 입력합니다. 예: 005930 (삼성전자)" },
              { step: "02", title: "AI 병렬 분석", desc: "뉴스·공시·재무 에이전트가 동시에 실행되어 20~30초 내 분석을 완료합니다." },
              { step: "03", title: "인사이트 확인", desc: "종합 시그널(매수/중립/매도)과 에이전트별 상세 결과를 확인합니다." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-4xl font-black text-blue-100 dark:text-blue-900/60">
                  {item.step}
                </span>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          지금 바로 시작하세요
        </h2>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
          종목 코드와 질문만 있으면 됩니다
        </p>
        <Link
          href="/stock-recommendation"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-colors"
        >
          종목 분석 시작하기 →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          © 2026 Antelligen — AI 멀티 에이전트 주식 분석 서비스
        </div>
      </footer>
    </div>
  );
}
