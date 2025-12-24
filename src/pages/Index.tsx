import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import SketchCanvas from "@/components/canvas/SketchCanvas";
import StyleSelector from "@/components/canvas/StyleSelector";
import GenerationResultView from "@/components/canvas/GenerationResultView";
import { STYLE_PRESETS, type StylePreset, type GenerationResult, type GenerationStatus } from "@/types/canvas";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = useCallback(async (sketchDataUrl: string) => {
    setStatus("analyzing");
    setResult(null);

    try {
      // Simulate AI processing (will be replaced with actual API calls)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus("generating");
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock result for demo
      const mockResult: GenerationResult = {
        id: Date.now().toString(),
        sketchDataUrl,
        generatedImageUrl: `https://picsum.photos/seed/${Date.now()}/512/512`,
        prompt: `A ${selectedStyle.name.toLowerCase()} style image: ${selectedStyle.prompt}`,
        style: selectedStyle,
        createdAt: new Date(),
      };

      setResult(mockResult);
      setStatus("complete");

      toast({
        title: "生成成功! ✨",
        description: "您的 AI 艺术作品已准备就绪",
      });
    } catch (error) {
      setStatus("error");
      toast({
        title: "生成失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      });
    }
  }, [selectedStyle, toast]);

  const handleCloseResult = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return (
    <div className="min-h-screen animated-gradient">
      <Header />

      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern bg-grid opacity-5 pointer-events-none" />

      {/* Main Content */}
      <main className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-6"
            >
              <span className="animate-pulse">✦</span>
              <span>草图即灵感，AI 来绘制</span>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              画出想法
              <span className="text-gradient">，</span>
              <br />
              <span className="text-gradient">AI 来实现</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              无需复杂提示词，简单几笔涂鸦，让 AI 理解你的创意并生成专业级图像
            </p>
          </motion.div>

          {/* Main App Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Canvas Section */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                在画板上自由绘制您的想法
              </motion.div>

              <SketchCanvas
                onExport={handleGenerate}
                isGenerating={status === "analyzing" || status === "generating"}
              />
            </div>

            {/* Style Selector */}
            <div className="lg:col-span-1">
              <StyleSelector
                selectedStyle={selectedStyle}
                onSelectStyle={setSelectedStyle}
              />

              {/* Tips Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 rounded-xl bg-card/30 border border-border/50"
              >
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <span>💡</span>
                  小贴士
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    简单的形状也能产生惊艳效果
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    尝试不同风格获得不同效果
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    线条清晰能帮助 AI 更好识别
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Generation Result Modal */}
      <GenerationResultView
        result={result}
        status={status}
        onClose={handleCloseResult}
      />
    </div>
  );
};

export default Index;
