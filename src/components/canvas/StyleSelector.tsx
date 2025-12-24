import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { StylePreset } from "@/types/canvas";
import { STYLE_PRESETS } from "@/types/canvas";

interface StyleSelectorProps {
  selectedStyle: StylePreset;
  onSelectStyle: (style: StylePreset) => void;
}

const StyleSelector = ({ selectedStyle, onSelectStyle }: StyleSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="space-y-4"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">选择风格</h3>
        <p className="text-sm text-muted-foreground">Choose a style for your creation</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {STYLE_PRESETS.map((style, index) => (
          <motion.button
            key={style.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectStyle(style)}
            className={cn(
              "group relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300",
              "bg-gradient-card border border-border/50",
              "hover:border-primary/50",
              selectedStyle.id === style.id && [
                "border-primary shadow-glow-sm",
                "bg-gradient-to-br from-primary/10 to-secondary/10",
              ]
            )}
          >
            {/* Gradient Accent */}
            <div
              className={cn(
                "absolute inset-0 opacity-0 transition-opacity duration-300",
                "group-hover:opacity-10",
                selectedStyle.id === style.id && "opacity-20",
                `bg-gradient-to-br ${style.gradient}`
              )}
            />

            {/* Content */}
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xl transition-transform duration-300",
                    "group-hover:scale-110",
                    selectedStyle.id === style.id && "scale-110"
                  )}
                >
                  {style.icon}
                </span>
                <span className="font-medium text-foreground">{style.nameZh}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {style.description}
              </p>
            </div>

            {/* Selected Indicator */}
            {selectedStyle.id === style.id && (
              <motion.div
                layoutId="selected-style"
                className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-glow-sm"
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default StyleSelector;
