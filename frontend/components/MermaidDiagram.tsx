"use client";
import React, { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  code: string;
  title?: string;
}

export default function MermaidDiagram({ code, title }: MermaidDiagramProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"diagram" | "code">("diagram");
  const [copied, setCopied] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
        // Dynamically load mermaid from CDN if not already on window
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
        background: "#001133",
        border: "3px solid #0066CC",
        boxShadow: "6px 6px 0 #002244",
        padding: "24px",
        marginTop: "16px",
        color: "white",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "2px solid #004488",
          paddingBottom: "16px",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px" }}>⚡</span>
          <div>
            <div
              style={{
                fontFamily: "Press Start 2P",
                fontSize: "12px",
                color: "#38BDF8",
                letterSpacing: "1px",
              }}
            >
              {title || "SYSTEM TOPOLOGY & ARCHITECTURE DIAGRAM"}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: "10px",
                color: "#94A3B8",
                marginTop: "4px",
              }}
            >
              &gt; Interactive reactive flowchart | Edge to Persistence Mesh
            </div>
          </div>
        </div>

        {/* View toggles & copy button */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setViewMode("diagram")}
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "6px 12px",
              background: viewMode === "diagram" ? "#0066CC" : "transparent",
              border: "1px solid #0066CC",
              color: "white",
              cursor: "pointer",
            }}
          >
            🗺️ DIAGRAM
          </button>
          <button
            onClick={() => setViewMode("code")}
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "6px 12px",
              background: viewMode === "code" ? "#0066CC" : "transparent",
              border: "1px solid #0066CC",
              color: "white",
              cursor: "pointer",
            }}
          >
            💻 MERMAID CODE
          </button>
          <button
            onClick={copyCode}
            style={{
              fontFamily: "JetBrains Mono",
              fontSize: "10px",
              fontWeight: "bold",
              padding: "6px 12px",
              background: copied ? "#059669" : "#1E293B",
              border: "1px solid #38BDF8",
              color: "white",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {copied ? "✓ COPIED!" : "📋 COPY CODE"}
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === "diagram" ? (
        <div
          ref={containerRef}
          style={{
            background: "#050B18",
            border: "1px solid #1E293B",
            borderRadius: "4px",
            padding: "24px",
            minHeight: "360px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflowX: "auto",
          }}
        >
          {loading ? (
            <div
              style={{
                fontFamily: "JetBrains Mono",
                fontSize: "12px",
                color: "#38BDF8",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span className="blink">●</span> Synthesizing architecture flowchart...
            </div>
          ) : error || !svgContent ? (
            <div style={{ width: "100%" }}>
              <div
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: "11px",
                  color: "#F59E0B",
                  marginBottom: "12px",
                }}
              >
                ⚠ Visual render fallback active. Raw Mermaid definition:
              </div>
              <pre
                style={{
                  fontFamily: "JetBrains Mono",
                  fontSize: "11px",
                  color: "#38BDF8",
                  background: "#020617",
                  padding: "16px",
                  borderRadius: "4px",
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
      ) : (
        <div style={{ position: "relative" }}>
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
