import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GenerationResult, GenerationStatus } from "@/types/canvas";

interface GenerationResultViewProps {
  result: GenerationResult | null;
  status: GenerationStatus;
  onClose: () => void;
}

const statusMessages: Record<GenerationStatus, string> = {
  idle: "",
  analyzing: "🔍 AI 正在识别您的草图...",
  generating: "🎨 正在生成精美图像...",
  complete: "✨ 生成完成!",
  error: "❌ 生成失败，请重试",
};

const GenerationResultView = ({
  result,
  status,
  onClose,
}: GenerationResultViewProps) => {
  const handleDownload = async () => {
    if (!result?.generatedImageUrl) return;

    try {
      const response = await fetch(result.generatedImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `soulcanvas-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {(status !== "idle" || result) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="relative w-full max-w-4xl bg-card rounded-2xl border border-border overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-semibold">AI 生成结果</span>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {status === "analyzing" || status === "generating" ? (
                <div className="flex flex-col items-center justify-center py-20 gap-6">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Sparkles className="h-6 w-6 text-primary" />
                    </motion.div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      {statusMessages[status]}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      请稍候，这可能需要几秒钟...
                    </p>
                  </div>

                  {/* Progress Steps */}
                  <div className="flex items-center gap-4 mt-4">
                    {["识别中", "构思中", "渲染中"].map((step, i) => (
                      <div
                        key={step}
                        className={`flex items-center gap-2 text-sm ${
                          (status === "analyzing" && i === 0) ||
                          (status === "generating" && i <= 1)
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            (status === "analyzing" && i === 0) ||
                            (status === "generating" && i <= 1)
                              ? "bg-primary animate-pulse"
                              : "bg-muted"
                          }`}
                        />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              ) : status === "complete" && result ? (
                <div className="space-y-6">
                  {/* Image Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original Sketch */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        您的草图
                      </h4>
                      <div className="aspect-square rounded-xl overflow-hidden bg-canvas-bg border border-border">
                        <img
                          src={result.sketchDataUrl}
                          alt="Original sketch"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>

                    {/* Generated Image */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        AI 生成
                      </h4>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="aspect-square rounded-xl overflow-hidden border border-primary/30 shadow-glow"
                      >
                        <img
                          src={result.generatedImageUrl}
                          alt="Generated image"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                  </div>

                  {/* Style & Prompt Info */}
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">风格:</span>
                      <span className="font-medium text-foreground">
                        {result.style.icon} {result.style.nameZh}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {result.prompt}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                      继续创作
                    </Button>
                    <Button variant="glow" onClick={handleDownload}>
                      <Download className="h-4 w-4" />
                      下载图像
                    </Button>
                  </div>
                </div>
              ) : status === "error" ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                    <X className="h-8 w-8 text-destructive" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    生成失败
                  </p>
                  <p className="text-sm text-muted-foreground">
                    请检查网络连接后重试
                  </p>
                  <Button variant="outline" onClick={onClose}>
                    返回
                  </Button>
                </div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationResultView;
