import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

export const fontSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const fontMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const fontSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const fontVariables = `${fontSans.variable} ${fontMono.variable} ${fontSerif.variable}`;
