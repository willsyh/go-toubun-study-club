"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useErrorMood } from "@/lib/auth-mood";
import angryArt from "../../../public/images/itsuki-angry.jpg";
import loginArt from "../../../public/images/auth-login.jpg";
import signupArt from "../../../public/images/auth-signup.jpg";

/** Left-hand artwork on the auth pages: one picture per page, a flustered Itsuki on errors. */
export function AuthArt() {
  const pathname = usePathname();
  const angry = useErrorMood();
  const base = pathname === "/signup" ? "signup" : "login";

  const layers = [
    { key: "login", src: loginArt, alt: "Itsuki Nakano waving hello", position: "50% 30%", visible: !angry && base === "login" },
    { key: "signup", src: signupArt, alt: "Itsuki Nakano smiling in a classroom", position: "50% 40%", visible: !angry && base === "signup" },
    { key: "angry", src: angryArt, alt: "Itsuki Nakano looking flustered", position: "50% 35%", visible: angry },
  ];

  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-[#fdeee6] lg:block">
      {layers.map((l) => (
        <Image
          key={l.key}
          src={l.src}
          alt={l.visible ? l.alt : ""}
          fill
          priority={l.key === base}
          placeholder="blur"
          sizes="50vw"
          className={`object-cover transition-all duration-300 ${
            l.visible ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"
          } ${l.key === "angry" && l.visible ? "shake" : ""}`}
          style={{ objectPosition: l.position }}
        />
      ))}
    </div>
  );
}
