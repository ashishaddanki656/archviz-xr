export default function Viewer({ data }) {
  return (
    <div
      style={{
        margin: "2rem 0",
        background: "#13131f",
        borderRadius: "12px",
        padding: "1.5rem",
      }}
    >
      <h2 style={{ color: "#7c6ff7", marginBottom: "1rem" }}>
        Knowledge Graph nodes
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {data.nodes?.map((node, i) => (
          <span
            key={i}
            style={{
              background: "#1e1e3a",
              border: "1px solid #7c6ff7",
              borderRadius: "20px",
              padding: "0.3rem 0.9rem",
              fontSize: "0.85rem",
              color: "#c0b8ff",
            }}
          >
            {node.label}
          </span>
        ))}
      </div>
      <p style={{ color: "#555", fontSize: "0.8rem", marginTop: "1rem" }}>
        3D AR viewer (Three.js) connects here — Ro's module
      </p>
    </div>
  );
}
