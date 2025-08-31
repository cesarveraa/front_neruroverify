// app/page.tsx
import NextDynamic from "next/dynamic";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const SPA = NextDynamic(() => import("./_spa-client"), { ssr: true });

export default function Page() {
  return <SPA />;
}
