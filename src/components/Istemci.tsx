"use client";

// Tarayıcı belleğini (kaydedilmiş cevaplar, kişisel bilgiler) kullanan
// bileşenler yalnızca tarayıcıda çalıştırılır.

import dynamic from "next/dynamic";

function Yukleniyor() {
  return (
    <div className="kart flex justify-center py-12" role="status" aria-label="Yükleniyor">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-marka-100 border-t-marka-600" />
    </div>
  );
}

export const SihirbazIstemci = dynamic(() => import("./Sihirbaz").then((m) => m.Sihirbaz), {
  ssr: false,
  loading: Yukleniyor,
});

export const DuzenleyiciIstemci = dynamic(() => import("./Duzenleyici").then((m) => m.Duzenleyici), {
  ssr: false,
  loading: Yukleniyor,
});
