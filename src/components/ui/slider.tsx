"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { FaCarSide, FaMinus } from "react-icons/fa";
import { useIsMobile } from "@/hooks/use-mobile"; // Import the hook
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
    [value, defaultValue, min, max]
  );
  const isMobile = useIsMobile(); // Use the hook to check if the device is mobile
  const ammountOfLines = isMobile ? 10 : 20; // Use the hook to check if the device is mobile
  const gapInLines = isMobile ? 5 : 10; // Use the hook to check if the device is mobile
  // Calculate the positions for the arrows
  const arrowPositions = Array.from(
    { length: ammountOfLines },
    (_, index) => (index + 1) * (50 / gapInLines)
  );

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "cursor-pointer bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-3 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-4" // Increased height
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-black  absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )}
        />
        {arrowPositions.map((position, index) => (
          <div
            key={index}
            className="absolute top-1/2 transform -translate-y-1/2"
            style={{ left: `${position}%` }}
          >
            <FaMinus className="text-white" />
          </div>
        ))}
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="block size-7 shrink-0 rounded-full shadow-sm transition-[color,box-shadow]  focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center"
          style={{
            transform: "translateY(-50%)", // Adjust the offset
          }}
        >
          <motion.div
            whileHover={{
              y: [0, -5, 0],
              rotate: [0, 5, 0],
              transition: { duration: 0.7, ease: "easeInOut", repeat: Infinity },
            }}
            transition={{ duration: 1 }}
          >
            <FaCarSide className="cursor-pointer size-10 text-emerald-500" />
          </motion.div>
        </SliderPrimitive.Thumb>
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
