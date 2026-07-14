"use client"

import React, { useState, useMemo, useCallback } from "react"
import { X, Copy, Check, Rocket, ExternalLink, Terminal, Package, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { designSystemRegistry } from "@/lib/designSystems/registry"
import JSZip from "jszip"

interface DeployModalProps {
  isOpen: boolean
  onClose: () => void
  jsonData: string
}

export const DeployModal: React.FC<DeployModalProps> = ({
  isOpen,
  onClose,
  jsonData,
}) => {
  const [copied, setCopied] = useState<string | null>(null)
  const [activeStep, setActiveStep] = useState<"generate" | "deploy">("generate")
  const [zipping, setZipping] = useState(false)

  const deployInfo = useMemo(() => {
    // Generate a basic project name from timestamp
    const projectName = `proyect-ui-${Date.now().toString(36)}`
    const vercelCommand = `npx vercel --prod --yes --name ${projectName}`

    // Count components in the design
    let componentCount = 0
    try {
      const parsed = JSON.parse(jsonData)
      componentCount = Object.keys(parsed).filter(id => id !== "ROOT").length
    } catch { /* ignore */ }

    return { projectName, vercelCommand, componentCount }
  }, [jsonData])

  // Generate a complete Next.js project as a downloadable ZIP
  const downloadZIP = useCallback(async () => {
    setZipping(true)
    try {
      const zip = new JSZip()
      const name = deployInfo.projectName

      // package.json
      zip.file("package.json", JSON.stringify({
        name, version: "0.1.0", private: true,
        scripts: { dev: "next dev", build: "next build", start: "next start" },
        dependencies: { "next": "14.2.0", "react": "^18.3.0", "react-dom": "^18.3.0" },
        devDependencies: {
          "@types/node": "^20.0.0", "@types/react": "^18.3.0", "@types/react-dom": "^18.3.0",
          "typescript": "^5.4.0", "tailwindcss": "^3.4.0", "postcss": "^8.4.0", "autoprefixer": "^10.4.0"
        }
      }, null, 2))

      // tsconfig.json
      zip.file("tsconfig.json", JSON.stringify({
        compilerOptions: {
          target: "es5", lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true, skipLibCheck: true, strict: true, noEmit: true,
          esModuleInterop: true, module: "esnext", moduleResolution: "bundler",
          resolveJsonModule: true, isolatedModules: true, jsx: "preserve",
          incremental: true, plugins: [{ name: "next" }],
          paths: { "@/*": ["./src/*"] }
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        exclude: ["node_modules"]
      }, null, 2))

      // tailwind.config.ts
      zip.file("tailwind.config.ts", `import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: {} },
  plugins: [],
};
export default config;
`)

      // postcss.config.js
      zip.file("postcss.config.js", "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };\n")

      // src/app/layout.tsx
      zip.file("src/app/layout.tsx", `import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "${name}", description: "Generated with Proyect-UI" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
`)

      // src/app/globals.css
      zip.file("src/app/globals.css", `@tailwind base;
@tailwind components;
@tailwind utilities;
`)

      // src/app/page.tsx - the exported component code
      let pageCode = `"use client";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">${name}</h1>
        <p className="mt-4 text-gray-600">Generated with Proyect-UI</p>
      </div>
    </div>
  );
}
`

      // Try to generate proper code from design data
      try {
        const { generateReactCode } = await import("@/lib/codeGenerator")
        const activeDS = designSystemRegistry.getActive()
        const generated = generateReactCode(jsonData, activeDS)
        if (generated && !generated.startsWith("// Error")) {
          pageCode = generated
        }
      } catch { /* use default */ }

      zip.file("src/app/page.tsx", pageCode)

      // vercel.json
      zip.file("vercel.json", JSON.stringify({ framework: "nextjs" }, null, 2))

      // Generate and download
      const blob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${name}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to generate ZIP:", err)
    } finally {
      setZipping(false)
    }
  }, [deployInfo, jsonData])

  if (!isOpen) return null

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Rocket size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deploy to Vercel</h2>
              <p className="text-sm text-gray-500 mt-0.5">Ship your design in one command</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setActiveStep("generate")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
              activeStep === "generate"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Package size={15} /> Generate
          </button>
          <button
            onClick={() => setActiveStep("deploy")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all",
              activeStep === "deploy"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <Rocket size={15} /> Deploy
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {activeStep === "generate" && (
            <>
              {/* Project Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Package size={20} className="text-blue-500 mb-1" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">{deployInfo.componentCount}</span>
                  <span className="text-xs text-gray-500">Components</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <Terminal size={20} className="text-emerald-500 mb-1" />
                  <span className="text-lg font-bold text-gray-900 dark:text-white">1</span>
                  <span className="text-xs text-gray-500">Command</span>
                </div>
              </div>

              {/* Setup Instructions */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Setup</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">1. Install Vercel CLI</span>
                      <button
                        onClick={() => handleCopy("npm install -g vercel", "install")}
                        className={cn(
                          "p-1 rounded transition-colors",
                          copied === "install" ? "text-green-500" : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {copied === "install" ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 rounded-lg px-4 py-3 text-sm font-mono overflow-x-auto">
                      npm install -g vercel
                    </pre>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase">2. Export your design</span>
                      <button
                        onClick={() => handleCopy(jsonData, "export")}
                        className={cn(
                          "p-1 rounded transition-colors",
                          copied === "export" ? "text-green-500" : "text-gray-400 hover:text-gray-600"
                        )}
                      >
                        {copied === "export" ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Your design data is ready. Use the Export button to download the React code, then deploy.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeStep === "deploy" && (
            <>
              {/* Deploy Command */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Deploy Command</h3>
                <div className="p-4 bg-gray-900 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-gray-400" />
                      <span className="text-xs text-gray-400 font-mono">bash</span>
                    </div>
                    <button
                      onClick={() => handleCopy(deployInfo.vercelCommand, "deploy-cmd")}
                      className={cn(
                        "p-1 rounded transition-colors",
                        copied === "deploy-cmd" ? "text-green-500" : "text-gray-400 hover:text-white"
                      )}
                    >
                      {copied === "deploy-cmd" ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                  <code className="text-sm text-green-400 font-mono block whitespace-pre-wrap break-all">
                    {deployInfo.vercelCommand}
                  </code>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Rocket size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">How to deploy</h4>
                    <ol className="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                      <li>Export your design as React code from the Export button</li>
                      <li>Create a new Next.js app: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">npx create-next-app my-design</code></li>
                      <li>Replace the page component with your exported code</li>
                      <li>Run the deploy command above from your project directory</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Quick Deploy Button */}
              <a
                href={`https://vercel.com/new/clone?project-name=${deployInfo.projectName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                <ExternalLink size={16} />
                <span>Open Vercel Dashboard</span>
              </a>

              {/* Download ZIP */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Or download as ZIP</h3>
                <button
                  onClick={downloadZIP}
                  disabled={zipping}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all",
                    zipping
                      ? "bg-gray-300 text-gray-500 cursor-wait"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25"
                  )}
                >
                  <Download size={16} className={zipping ? "animate-pulse" : ""} />
                  <span>{zipping ? "Generating..." : "Download Project ZIP"}</span>
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Complete Next.js project with Tailwind CSS, ready to deploy
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Rocket size={12} />
            <span>Project: {deployInfo.projectName}</span>
          </div>
          <button
            onClick={() => handleCopy(deployInfo.vercelCommand, "final-copy")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              copied === "final-copy"
                ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
            )}
          >
            {copied === "final-copy" ? (
              <><Check size={15} /> Copied!</>
            ) : (
              <><Copy size={15} /> Copy Deploy Command</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
