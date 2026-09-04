import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

/**
 * Icônes PWA de repli (192/512, y compris maskable) quand aucun logo n'a
 * été téléversé dans Paramètres — générées à la volée pour rester à jour
 * si le nom de la boutique change, référencées depuis `manifest.ts`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size: sizeParam } = await params;
  const size = Number(sizeParam) || 192;

  let initial = "M";
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("settings").select("shop_name").single();
    initial = data?.shop_name?.trim().charAt(0).toUpperCase() || "M";
  } catch {
    // valeur de repli déjà définie
  }

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
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontSize: size * 0.45,
            fontWeight: 800,
            fontFamily: "sans-serif",
          }}
        >
          {initial}
        </div>
      </div>
    ),
    { width: size, height: size },
  );
}
