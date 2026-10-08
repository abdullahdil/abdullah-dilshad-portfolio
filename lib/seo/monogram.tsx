/** "AD" monogram for generated app icons (ImageResponse / Satori). */
export function Monogram({ size, rounded }: { size: number; rounded: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#141416",
        color: "#fbfbfa",
        borderRadius: rounded ? Math.round(size * 0.22) : 0,
        fontSize: Math.round(size * 0.46),
        fontWeight: 700,
        letterSpacing: -Math.max(1, Math.round(size * 0.02)),
        position: "relative",
      }}
    >
      AD
      <div
        style={{
          position: "absolute",
          right: Math.round(size * 0.14),
          bottom: Math.round(size * 0.14),
          width: Math.max(3, Math.round(size * 0.1)),
          height: Math.max(3, Math.round(size * 0.1)),
          borderRadius: 999,
          background: "#10b981",
        }}
      />
    </div>
  );
}
