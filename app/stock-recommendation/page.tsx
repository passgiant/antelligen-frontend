import StockQuestionForm from "@/features/stock-recommendation/ui/components/StockQuestionForm";

export default function StockRecommendationPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-50">주식 추천</h1>
        <StockQuestionForm />
      </div>
    </div>
  );
}
