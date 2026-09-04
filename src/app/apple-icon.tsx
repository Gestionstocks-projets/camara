import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const initial = await getShopInitial();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2E2A6E",
          color: "#FFFFFF",
          fontSize: 96,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        {initial}
      </div>
    ),
    { ...size },
  );
}

async function getShopInitial(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("shop_name").single();
    return data?.shop_name?.trim().charAt(0).toUpperCase() || "M";
  } catch {
    return "M";
  }
}
