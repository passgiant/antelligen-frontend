import type { CompanyProfile } from "@/features/company-profile/domain/model/companyProfile";

interface Props {
  profile: CompanyProfile;
}

function formatDate(yyyymmdd: string | null): string | null {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function formatBizrNo(bizr: string | null): string | null {
  if (!bizr || bizr.length !== 10) return bizr;
  return `${bizr.slice(0, 3)}-${bizr.slice(3, 5)}-${bizr.slice(5)}`;
}

function formatJurirNo(jurir: string | null): string | null {
  if (!jurir || jurir.length !== 13) return jurir;
  return `${jurir.slice(0, 6)}-${jurir.slice(6)}`;
}

function formatAccMt(mm: string | null): string | null {
  if (!mm) return null;
  return `${parseInt(mm, 10)}월`;
}

function normalizeUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-sm text-zinc-900 dark:text-zinc-100 break-all">
        {value ?? <span className="text-zinc-400 dark:text-zinc-600">—</span>}
      </dd>
    </div>
  );
}

export default function CompanyProfileCard({ profile }: Props) {
  const homepageUrl = normalizeUrl(profile.hm_url);
  const irUrl = normalizeUrl(profile.ir_url);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          {profile.corp_name}
          {profile.corp_name_eng && (
            <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">
              ({profile.corp_name_eng})
            </span>
          )}
        </h2>
        {profile.stock_code && (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            종목코드 {profile.stock_code}
            {profile.corp_cls_label && ` · ${profile.corp_cls_label}`}
          </p>
        )}
      </div>

      <dl>
        <Row label="종목명" value={profile.stock_name} />
        <Row label="대표자명" value={profile.ceo_nm} />
        <Row label="법인구분" value={profile.corp_cls_label} />
        <Row label="법인등록번호" value={formatJurirNo(profile.jurir_no)} />
        <Row label="사업자등록번호" value={formatBizrNo(profile.bizr_no)} />
        <Row label="주소" value={profile.adres} />
        <Row
          label="홈페이지"
          value={
            homepageUrl ? (
              <a
                href={homepageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {profile.hm_url}
              </a>
            ) : null
          }
        />
        <Row
          label="IR"
          value={
            irUrl ? (
              <a
                href={irUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {profile.ir_url}
              </a>
            ) : null
          }
        />
        <Row label="전화번호" value={profile.phn_no} />
        <Row label="팩스" value={profile.fax_no} />
        <Row label="업종코드" value={profile.induty_code} />
        <Row label="설립일" value={formatDate(profile.est_dt)} />
        <Row label="결산월" value={formatAccMt(profile.acc_mt)} />
        <Row label="고유번호(corp_code)" value={profile.corp_code} />
      </dl>
    </div>
  );
}
