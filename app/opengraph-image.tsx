/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"

export const alt = "Pasame La Retro"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #111111 0%, #2b2b2b 48%, #f4f4f4 100%)",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          padding: "72px",
          width: "100%",
        }}
      >
        <img
          src="https://pasamelaretro.vercel.app/pasamelaretro-wsp.png"
          alt="Pasame La Retro"
          style={{
            maxHeight: "440px",
            maxWidth: "960px",
            objectFit: "contain",
          }}
        />
      </div>
    ),
    size
  )
}
