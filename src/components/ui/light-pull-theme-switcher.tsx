"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";

export function LightPullThemeSwitcher() {
    const { theme, setTheme } = useTheme();

    const toggleDarkMode = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
      <div className="relative py-16 p-6 overflow-hidden">
        <motion.div
          drag="y"
          dragDirectionLock
          onDragEnd={(event, info) => {
            if (info.offset.y > 0) {
              toggleDarkMode();
            }
          }}
          dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
          dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
          dragElastic={0.075}
          whileDrag={{ cursor: "grabbing" }}
          className={`relative bottom-0 w-8 h-8 rounded-full
               ${theme === "dark"
                ? "bg-[radial-gradient(circle_at_center,_#4b5563,_#1f2937,_#000)] shadow-[0_0_20px_6px_rgba(255,255,255,0.2)]"
                : "bg-[radial-gradient(circle_at_center,_#facc15,_#fcd34d,_#fef9c3)] shadow-[0_0_20px_8px_rgba(250,204,21,0.5)]"
               }`}
        >
          <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-0.5 h-[9999px] ${theme === "dark" ? "bg-neutral-700" : "bg-neutral-200"}`}></div>
        </motion.div>
      </div>
    );
}