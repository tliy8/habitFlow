"use client";

import { Check } from "lucide-react";

interface HabitColorPickerProps {
    colors: string[];
    selected: string;
    onChange: (color: string) => void;
}

export default function HabitColorPicker({
    colors,
    selected,
    onChange,
}: HabitColorPickerProps) {
    return (
        <div className="flex gap-2 flex-wrap">
            {colors.map((color) => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onChange(color)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 ${selected === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                        }`}
                    style={{ backgroundColor: color }}
                >
                    {selected === color && <Check className="h-4 w-4 text-white" />}
                </button>
            ))}
        </div>
    );
}
