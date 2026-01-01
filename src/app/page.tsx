import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import BibleDashboard from "@/components/BibleDashboard";
import { getMokpoWeather } from "@/lib/weather";

interface HomeProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isGuest = cookieStore.get('guest_mode')?.value === 'true';

  if (!user && !isGuest) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const todayStrKST = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
  const selectedDate = resolvedSearchParams.date || todayStrKST;

  const weather = await getMokpoWeather();

  // 전체 읽기 계획 가져오기 (365일치)
  const { data: allPlans } = await supabase
    .from("reading_plan")
    .select("*")
    .order("id", { ascending: true });

  const { data: appSettings } = await supabase
    .from("app_settings")
    .select("key, value");

  // 사용자 전체 진행 상황 가져오기 (로그인 유저일 때만)
  let allProgress: any[] = [];
  if (user) {
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("plan_id, completed_at, reading_plan(*)")
      .eq("user_id", user.id);
    allProgress = progressData || [];
  }

  return (
    <BibleDashboard
      user={user}
      allPlans={allPlans || []}
      initialProgress={allProgress || []}
      weather={weather}
      appSettings={appSettings}
      initialDate={selectedDate}
    />
  );
}
