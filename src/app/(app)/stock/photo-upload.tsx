"use client";

import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 Mo — au-delà, l'envoi est trop lent sur mobile.

/**
 * Une photo prise avec un iPhone est enregistrée en HEIC par défaut. Ce
 * format s'envoie sans problème vers Supabase Storage, mais aucun
 * navigateur autre que Safari ne l'affiche dans une balise `<img>` : la
 * photo "disparaît" silencieusement pour la boutique (retour utilisateur
 * du 2026-09-17) sans qu'aucune erreur n'apparaisse. On la convertit donc
 * en JPEG avant l'envoi.
 */
function isHeic(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  return /\.(heic|heif)$/i.test(file.name);
}

async function toUploadableFile(file: File): Promise<File> {
  if (!isHeic(file)) return file;

  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  if (!blob) throw new Error("Conversion HEIC vide.");
  const name = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

export function PhotoUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("Photo trop lourde (15 Mo maximum) — reprenez-la en qualité normale.");
      return;
    }

    setUploading(true);
    try {
      const uploadable = await toUploadableFile(file);

      const supabase = createClient();
      const ext = uploadable.name.split(".").pop() ?? "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("phone-photos")
        .upload(path, uploadable, { contentType: uploadable.type || "image/jpeg" });

      if (uploadError) {
        setError("Impossible de téléverser la photo. Vérifiez votre connexion et réessayez.");
        return;
      }

      const { data } = supabase.storage.from("phone-photos").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setError(
        "La photo n'a pas pu être traitée (format non pris en charge ou fichier corrompu).",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">Photo</span>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Photo du téléphone" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              aria-label="Retirer la photo"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border text-muted">
            <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Envoi…" : value ? "Changer la photo" : "Ajouter une photo"}
        </Button>
      </div>
      {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
    </div>
  );
}
