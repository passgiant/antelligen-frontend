import ConcentratedBuyingSection from "@/features/smart-money/ui/components/ConcentratedBuyingSection";
import USConcentratedBuyingSection from "@/features/smart-money/ui/components/USConcentratedBuyingSection";
import SmartMoneyTab from "@/features/smart-money/ui/components/SmartMoneyTab";
import SmartMoneyBootstrap from "@/features/smart-money/ui/components/SmartMoneyBootstrap";
import GlobalPortfolioBootstrap from "@/features/smart-money/ui/components/GlobalPortfolioBootstrap";
import { smartMoneyStyles as s } from "@/features/smart-money/ui/components/smartMoneyStyles";

export default function SmartMoneyPage() {
  return (
    <div className={s.page}>
      <div className={s.container}>
        <div className={s.header.wrap}>
          <h1 className={s.header.title}>스마트머니</h1>
        </div>
        <SmartMoneyBootstrap />
        <GlobalPortfolioBootstrap />
        <ConcentratedBuyingSection />
        <USConcentratedBuyingSection />
        <SmartMoneyTab />
      </div>
    </div>
  );
}
