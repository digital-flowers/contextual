import { useEffect, useRef } from "react";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { listen } from "@tauri-apps/api/event";
import "@xterm/xterm/css/xterm.css";
import * as commands from "../../lib/commands";

interface TerminalProps {
  featureId: string;
  onWaitingForInput?: () => void;
  onSessionEnd?: () => void;
}

export function Terminal({
  featureId,
  onWaitingForInput,
  onSessionEnd,
}: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<XTerm | null>(null);
  const fitRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new XTerm({
      theme: {
        background: "#0e0e10",
        foreground: "#f4f4f5",
        cursor: "#6366f1",
        selectionBackground: "#6366f133",
        black: "#18181b",
        brightBlack: "#3f3f46",
        red: "#ef4444",
        brightRed: "#f87171",
        green: "#22c55e",
        brightGreen: "#4ade80",
        yellow: "#f59e0b",
        brightYellow: "#fbbf24",
        blue: "#6366f1",
        brightBlue: "#818cf8",
        magenta: "#a855f7",
        brightMagenta: "#c084fc",
        cyan: "#06b6d4",
        brightCyan: "#22d3ee",
        white: "#f4f4f5",
        brightWhite: "#ffffff",
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      scrollback: 5000,
    });

    const fit = new FitAddon();
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.open(containerRef.current);
    fit.fit();

    xtermRef.current = term;
    fitRef.current = fit;

    // Resize observer to refit when panel size changes
    const ro = new ResizeObserver(() => fit.fit());
    ro.observe(containerRef.current);

    // Listen to PTY output from Rust
    const unlistenOutput = listen<string>(`pty://output/${featureId}`, (e) => {
      term.write(e.payload);

      // Heuristic: detect when Claude is waiting for input
      // Claude Code shows a prompt ending in "> " or "? " when waiting
      if (onWaitingForInput && /[>?]\s*$/.test(e.payload)) {
        onWaitingForInput();
      }
    });

    const unlistenExit = listen(`pty://exit/${featureId}`, () => {
      term.write("\r\n\x1b[2mSession ended.\x1b[0m\r\n");
      onSessionEnd?.();
    });

    // Forward keyboard input to PTY
    term.onData((data) => {
      commands.writeToSession(featureId, data).catch(console.error);
    });

    // Resize PTY when terminal resizes
    term.onResize(({ cols, rows }) => {
      commands.resizeSession(featureId, cols, rows).catch(console.error);
    });

    return () => {
      ro.disconnect();
      unlistenOutput.then((fn) => fn());
      unlistenExit.then((fn) => fn());
      term.dispose();
    };
  }, [featureId]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ padding: "4px" }}
    />
  );
}
