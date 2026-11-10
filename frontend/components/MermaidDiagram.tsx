"use client";
import React, { useEffect, useRef, useState } from "react";
import SpotlightCard from "@/components/SpotlightCard/SpotlightCard";
import DecryptedText from "@/components/DecryptedText/DecryptedText";

export interface ArchitectureComponent {
  id: string;
  name: string;
  responsibility: string;
  data_ownership?: {
    storage: string;
    schema_tables?: string[];
  };
}

interface MermaidDiagramProps {
  code: string;
  title?: string;
  components?: ArchitectureComponent[];
  deploymentRecommendation?: string;
  bespokeRationale?: string;
}

export default function MermaidDiagram({
  code,
  title,
  components = [],
  deploymentRecommendation,
  bespokeRationale,
}: MermaidDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"interactive" | "mermaid" | "code">("interactive");
  const [copied, setCopied] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<ArchitectureComponent | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "edge" | "services" | "storage">("all");

  // Group storage targets
  const storageNodes = React.useMemo(() => {
    const map = new Map<string, { storage: string; tables: string[]; components: string[] }>();
    components.forEach((c) => {
      const storage = c.data_ownership?.storage || "PostgreSQL";
      if (!map.has(storage)) {
        map.set(storage, {
          storage,
          tables: [...(c.data_ownership?.schema_tables || [])],
          components: [c.name],
        });
      } else {
        const item = map.get(storage)!;
        item.tables = Array.from(new Set([...item.tables, ...(c.data_ownership?.schema_tables || [])]));
        item.components.push(c.name);
      }
    });
    return Array.from(map.values());
  }, [components]);

  // Render Mermaid SVG
  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const renderMermaid = async () => {
      try {
        if (!(window as any).mermaid) {
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.getElementById("mermaid-cdn-script");
            if (existingScript) {
              existingScript.addEventListener("load", () => resolve());
              existingScript.addEventListener("error", () => reject(new Error("Failed to load mermaid")));
              return;
            }
            const script = document.createElement("script");
            script.id = "mermaid-cdn-script";
            script.src = "https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load mermaid script"));
            document.head.appendChild(script);
          });
        }

        const mermaid = (window as any).mermaid;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#001133",
            primaryColor: "#0066CC",
            primaryTextColor: "#FFFFFF",
            primaryBorderColor: "#38BDF8",
            lineColor: "#38BDF8",
            secondaryColor: "#1E293B",
            tertiaryColor: "#0F172A",
            fontFamily: "JetBrains Mono, monospace",
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
          },
          securityLevel: "loose",
        });

        const id = "mermaid-" + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(id, code);
        if (isMounted) {
          setSvgContent(svg);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn("Mermaid render error:", err);
          setError("Diagram rendering unavailable; raw code available.");
          setLoading(false);
        }
      }
    };

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        background: "#000E26",
        border: "3px solid #0066CC",
        boxShadow: "8px 8px 0 #001A40",
        padding: "28px",
        marginTop: "16px",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 4px #38BDF8); }
          50% { opacity: 1; filter: drop-shadow(0 0 10px #00EE55); }
        }
        @keyframes flowSignal {
          to { stroke-dashoffset: -32; }
        }
        .signal-beam {
          stroke-dasharray: 6 6;
          animation: flowSignal 1.2s linear infinite;
        }
        .node-hover-card {
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), border-color 0.2s, box-shadow 0.2s;
        }
        .node-hover-card:hover {
          transform: translateY(-3px) scale(1.01);
          border-color: #38BDF8 !important;
          box-shadow: 0 8px 24px rgba(56, 189, 248, 0.25) !important;
        }
      `,
        }}
      />

      {/* Cyberpunk HUD Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "2px solid #003366",
          paddingBottom: "20px",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ flex: 1, minWidth: "300px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "16px", animation: "pulseGlow 2s infinite" }}>⚡</span>
            <div style={{ fontFamily: "Press Start 2P", fontSize: "13px", color: "#38BDF8" }}>
              <DecryptedText
                text={title ? `[ ${title.toUpperCase()} ]` : "[ SYSTEM DESIGN TOPOLOGY ]"}
                speed={30}
                maxIterations={12}
                animateOn="view"
                revealDirection="start"
              />
            </div>
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "11px",
              color: "#94A3B8",
              lineHeight: 1.5,
              marginTop: "4px",
            }}
          >
            {deploymentRecommendation ||
              "Global Edge routing -> Multi-tier domain processing mesh -> Polyglot persistence."}
          </div>
        </div>

        {/* View Switchers & Actions */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => setViewMode("interactive")}
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "8px 14px",
              background: viewMode === "interactive" ? "#0066CC" : "#0A192F",
              border: `1px solid ${viewMode === "interactive" ? "#38BDF8" : "#004488"}`,
              color: "white",
              cursor: "pointer",
              boxShadow: viewMode === "interactive" ? "0 0 10px rgba(56, 189, 248, 0.4)" : "none",
            }}
          >
            ⚡ INTERACTIVE MESH
          </button>
          <button
            onClick={() => setViewMode("mermaid")}
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "8px 14px",
              background: viewMode === "mermaid" ? "#0066CC" : "#0A192F",
              border: `1px solid ${viewMode === "mermaid" ? "#38BDF8" : "#004488"}`,
              color: "white",
              cursor: "pointer",
            }}
          >
            🗺️ MERMAID GRAPH
          </button>
          <button
            onClick={() => setViewMode("code")}
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "8px 14px",
              background: viewMode === "code" ? "#0066CC" : "#0A192F",
              border: `1px solid ${viewMode === "code" ? "#38BDF8" : "#004488"}`,
              color: "white",
              cursor: "pointer",
            }}
          >
            💻 SPEC CODE
          </button>
          <button
            onClick={copyCode}
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "8px 14px",
              background: copied ? "#059669" : "#1E293B",
              border: "1px solid #10B981",
              color: "white",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {copied ? "✓ COPIED!" : "📋 COPY"}
          </button>
        </div>
      </div>

      {/* Realtime Architecture HUD Indicators */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "24px",
          flexWrap: "wrap",
          fontFamily: "JetBrains Mono",
          fontSize: "10px",
          background: "#051329",
          padding: "10px 18px",
          border: "1px solid #0B2545",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#00EE55", display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00EE55", display: "inline-block" }}></span>
          MESH STATUS: ACTIVE
        </span>
        <span style={{ color: "#94A3B8" }}>
          COMPONENTS: <strong style={{ color: "#FFFFFF" }}>{components.length} DOMAIN SERVICES</strong>
        </span>
        <span style={{ color: "#94A3B8" }}>
          PERSISTENCE: <strong style={{ color: "#38BDF8" }}>{storageNodes.length} ENGINES</strong>
        </span>
        <span style={{ color: "#94A3B8" }}>
          PROTOCOL: <strong style={{ color: "#F59E0B" }}>WSS / REST / ASYNC</strong>
        </span>
        <span style={{ marginLeft: "auto", color: "#CC0066", fontWeight: "bold" }}>
          ZERO-OPS FACTOR: 98%
        </span>
      </div>

      {/* VIEW 1: INTERACTIVE ARCHITECTURE CANVAS */}
      {viewMode === "interactive" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Layer Filter Toolbar */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#64748B" }}>FOCUS:</span>
            {[
              { id: "all", label: "ALL TIERS" },
              { id: "edge", label: "EDGE & CLIENT" },
              { id: "services", label: "DOMAIN SERVICES" },
              { id: "storage", label: "PERSISTENCE" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: "9px",
                  padding: "4px 10px",
                  background: activeFilter === f.id ? "#0066CC" : "transparent",
                  border: `1px solid ${activeFilter === f.id ? "#38BDF8" : "#1E293B"}`,
                  color: activeFilter === f.id ? "white" : "#94A3B8",
                  cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Interactive Topology Board */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.6fr 1fr",
              gap: "24px",
              position: "relative",
            }}
            className="flex flex-col lg:grid"
          >
            {/* TIER 1: Edge & Ingestion Gateway */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                opacity: activeFilter === "all" || activeFilter === "edge" ? 1 : 0.3,
                transition: "opacity 0.3s",
              }}
            >
              <div
                style={{
                  fontFamily: "Press Start 2P",
                  fontSize: "9px",
                  color: "#38BDF8",
                  borderBottom: "1px dashed #004488",
                  paddingBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>🌐 TIER 01: EDGE &amp; INGESTION</span>
                <span style={{ fontSize: "8px", color: "#00EE55" }}>LIVE</span>
              </div>

              {/* Edge Node 1: Client Canvas */}
              <div
                className="node-hover-card"
                style={{
                  background: "#071630",
                  border: "2px solid #004488",
                  padding: "16px",
                  boxShadow: "3px 3px 0 #002244",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: "bold", color: "#FFFFFF" }}>
                    Web &amp; Mobile Client Surface
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "9px", color: "#38BDF8", background: "#002244", padding: "2px 6px" }}>
                    REACT / NEXT.JS
                  </span>
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#94A3B8", lineHeight: "1.5" }}>
                  Client application interface, reactive canvas interactions &amp; local optimistic state.
                </div>
              </div>

              {/* Edge Node 2: Gateway */}
              <div
                className="node-hover-card"
                style={{
                  background: "#071630",
                  border: "2px solid #0066CC",
                  padding: "16px",
                  boxShadow: "3px 3px 0 #002244",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: "bold", color: "#FFFFFF" }}>
                    Global Edge Gateway
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "9px", color: "#00EE55", background: "#002244", padding: "2px 6px" }}>
                    TLS / WSS ROUTER
                  </span>
                </div>
                <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#94A3B8", lineHeight: "1.5" }}>
                  Sub-50ms connection termination, edge caching, DDoS filtering &amp; token verification.
                </div>
              </div>
            </div>

            {/* TIER 2: Domain Processing & Workers */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                opacity: activeFilter === "all" || activeFilter === "services" ? 1 : 0.3,
                transition: "opacity 0.3s",
              }}
            >
              <div
                style={{
                  fontFamily: "Press Start 2P",
                  fontSize: "9px",
                  color: "#CC0066",
                  borderBottom: "1px dashed #660033",
                  paddingBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>⚡ TIER 02: DOMAIN SERVICES</span>
                <span style={{ fontSize: "8px", color: "#38BDF8" }}>{components.length} NODES</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {components.map((comp) => {
                  const isSelected = selectedNode?.id === comp.id;
                  return (
                    <div
                      key={comp.id}
                      onClick={() => setSelectedNode(isSelected ? null : comp)}
                      className="node-hover-card"
                      style={{
                        background: isSelected ? "#110E2E" : "#091326",
                        borderTop: `2px solid ${isSelected ? "#CC0066" : "#1E3A5F"}`,
                        borderRight: `2px solid ${isSelected ? "#CC0066" : "#1E3A5F"}`,
                        borderBottom: `2px solid ${isSelected ? "#CC0066" : "#1E3A5F"}`,
                        borderLeft: `5px solid ${isSelected ? "#38BDF8" : "#CC0066"}`,
                        padding: "14px 16px",
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 0 16px rgba(204, 0, 102, 0.4)" : "2px 2px 0 #001122",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: "bold", color: "#FFFFFF" }}>
                          {comp.name}
                        </span>
                        {comp.data_ownership?.storage && (
                          <span
                            style={{
                              fontFamily: "JetBrains Mono",
                              fontSize: "9px",
                              color: "#10B981",
                              background: "#06281E",
                              padding: "2px 6px",
                              border: "1px solid #10B981",
                            }}
                          >
                            {comp.data_ownership.storage}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#94A3B8", lineHeight: "1.5" }}>
                        {comp.responsibility}
                      </div>

                      {/* Schema badges */}
                      {comp.data_ownership?.schema_tables && comp.data_ownership.schema_tables.length > 0 && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                          {comp.data_ownership.schema_tables.map((t) => (
                            <span
                              key={t}
                              style={{
                                fontFamily: "JetBrains Mono",
                                fontSize: "8px",
                                background: "#0D2040",
                                color: "#38BDF8",
                                padding: "1px 6px",
                                borderRadius: "2px",
                              }}
                            >
                              table: {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TIER 3: Polyglot Persistence */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                opacity: activeFilter === "all" || activeFilter === "storage" ? 1 : 0.3,
                transition: "opacity 0.3s",
              }}
            >
              <div
                style={{
                  fontFamily: "Press Start 2P",
                  fontSize: "9px",
                  color: "#10B981",
                  borderBottom: "1px dashed #064E3B",
                  paddingBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>💾 TIER 03: PERSISTENCE</span>
                <span style={{ fontSize: "8px", color: "#10B981" }}>POLYGLOT</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {storageNodes.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="node-hover-card"
                    style={{
                      background: "#041C14",
                      border: "2px solid #059669",
                      padding: "16px",
                      boxShadow: "3px 3px 0 #020F0B",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontFamily: "JetBrains Mono", fontSize: "11px", fontWeight: "bold", color: "#34D399" }}>
                        🗄️ {st.storage}
                      </span>
                      <span
                        style={{
                          fontFamily: "JetBrains Mono",
                          fontSize: "8px",
                          background: "#064E3B",
                          color: "#A7F3D0",
                          padding: "2px 6px",
                        }}
                      >
                        {st.tables.length} TABLES
                      </span>
                    </div>

                    <div style={{ fontFamily: "JetBrains Mono", fontSize: "9px", color: "#6EE7B7", marginBottom: "8px" }}>
                      Connected Services: {st.components.join(", ")}
                    </div>

                    {st.tables.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {st.tables.map((tbl) => (
                          <span
                            key={tbl}
                            style={{
                              fontFamily: "JetBrains Mono",
                              fontSize: "8px",
                              background: "#022C22",
                              color: "#6EE7B7",
                              border: "1px solid #065F46",
                              padding: "1px 6px",
                            }}
                          >
                            {tbl}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Node Inspector Drawer when a component is clicked */}
          {selectedNode && (
            <div
              style={{
                background: "#061329",
                border: "2px solid #38BDF8",
                padding: "20px 24px",
                marginTop: "8px",
                position: "relative",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontFamily: "Press Start 2P", fontSize: "10px", color: "#38BDF8" }}>
                    [ INSPECTED SERVICE: {selectedNode.name.toUpperCase()} ]
                  </span>
                  <span style={{ fontFamily: "JetBrains Mono", fontSize: "9px", background: "#0066CC", color: "white", padding: "2px 8px" }}>
                    ID: {selectedNode.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94A3B8",
                    fontFamily: "JetBrains Mono",
                    fontSize: "16px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
                <div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#94A3B8", marginBottom: "4px" }}>
                    RESPONSIBILITY:
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#E2E8F0", lineHeight: "1.6" }}>
                    {selectedNode.responsibility}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#94A3B8", marginBottom: "4px" }}>
                    DATA OWNERSHIP:
                  </div>
                  <div style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#10B981" }}>
                    Storage: <strong>{selectedNode.data_ownership?.storage || "None"}</strong>
                  </div>
                  {selectedNode.data_ownership?.schema_tables && (
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: "10px", color: "#64748B", marginTop: "4px" }}>
                      Tables: {selectedNode.data_ownership.schema_tables.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: FORMAL MERMAID FLOWCHART */}
      {viewMode === "mermaid" && (
        <div
          style={{
            background: "#030A17",
            border: "1px solid #1E293B",
            padding: "24px",
            minHeight: "360px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowX: "auto",
          }}
        >
          {loading ? (
            <div style={{ fontFamily: "JetBrains Mono", fontSize: "12px", color: "#38BDF8" }}>
              <span className="blink">●</span> Rendering reactive Mermaid canvas...
            </div>
          ) : error || !svgContent ? (
            <div style={{ width: "100%" }}>
              <div style={{ fontFamily: "JetBrains Mono", fontSize: "11px", color: "#F59E0B", marginBottom: "12px" }}>
                ⚠ Visual render fallback active. Raw Mermaid definition:
              </div>
              <pre
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: "11px",
                  color: "#38BDF8",
                  background: "#020617",
                  padding: "16px",
                  overflowX: "auto",
                  lineHeight: "1.6",
                }}
              >
                {code}
              </pre>
            </div>
          ) : (
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}
        </div>
      )}

      {/* VIEW 3: SPECIFICATION & RAW CODE */}
      {viewMode === "code" && (
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              color: "#94A3B8",
              marginBottom: "8px",
            }}
          >
            // Use this definition directly in GitHub Markdown, Notion, or Cursor prompts:
          </div>
          <pre
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "12px",
              color: "#38BDF8",
              background: "#020617",
              border: "1px solid #1E293B",
              padding: "20px",
              borderRadius: "4px",
              overflowX: "auto",
              lineHeight: "1.7",
              margin: 0,
            }}
          >
            {code}
          </pre>
        </div>
      )}
    </div>
  );
}
