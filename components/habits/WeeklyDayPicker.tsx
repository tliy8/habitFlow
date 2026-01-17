"use client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface WeeklyDayPickerProps {
    selected: number[];
    onChange: (days: number[]) => void;
}

export default function WeeklyDayPicker({ selected, onChange }: WeeklyDayPickerProps) {
    const toggleDay = (dayIndex: number) => {
        if (selected.includes(dayIndex)) {
            onChange(selected.filter((d) => d !== dayIndex));
        } else {
            onChange([...selected, dayIndex].sort());
        }
    };

    return (
        <div className="flex gap-2">
            {DAYS.map((day, index) => (
                <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${selected.includes(index)
                            ? "bg-violet-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    {day[0]}
                </button>
            ))}
        </div>
    );
}
