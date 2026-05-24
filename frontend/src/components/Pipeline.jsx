export default function Pipeline({ data }) {
  return (
    <div
      style={{
        margin: "2rem 0",
        background: "#13131f",
        borderRadius: "12px",
        padding: "1.5rem",
      }}
    >
      <h2 style={{ color: "#7c6ff7", marginBottom: "1rem" }}>What we found</h2>
      <p style={{ lineHeight: 1.7, marginBottom: "1rem" }}>
        {data.explanation}
      </p>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>NODES</p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#7c6ff7" }}>
            {data.nodes?.length || 0}
          </p>
        </div>
        <div>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>EDGES</p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#7c6ff7" }}>
            {data.edges?.length || 0}
          </p>
        </div>
        <div>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>QUIZ QUESTIONS</p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#7c6ff7" }}>
            {data.quiz?.length || 0}
          </p>
        </div>
      </div>
    </div>
  );
}
