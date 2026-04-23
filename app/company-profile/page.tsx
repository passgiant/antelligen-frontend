import CompanyProfileForm from "@/features/company-profile/ui/components/CompanyProfileForm";

export default function CompanyProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">기업 정보</h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          종목코드로 회사 기본 정보(대표자·주소·홈페이지·설립일·법인등록번호 등)를 조회합니다.
        </p>
        <CompanyProfileForm />
      </div>
    </div>
  );
}
