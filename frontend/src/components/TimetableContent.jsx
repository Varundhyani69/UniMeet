import { useState } from "react";

const TimetableContent = ({ userData }) => {
    const timetable = userData.timetable || {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [selectedDay, setSelectedDay] = useState("Monday");

    const periods = timetable[selectedDay] || {};

    return (
        <div className="p-4 ">
            {/* Day Selector Tabs */}
            <div className="p-4 overflow-x-auto scrollbar-hide ">
                <div className="flex gap-4 mb-6 sm:grid sm:grid-cols-6">
                    <style>{`div::-webkit-scrollbar { display: none; }`}</style>
                    {days.map(day => (
                        <div
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`min-w-[120px] h-12 rounded-lg flex items-center justify-center font-semibold shadow transition cursor-pointer  ${selectedDay === day
                                ? "bg-[#FEC674] text-white scale-105 "
                                : "bg-white text-gray-700 border border-gray-300"
                                }`}
                        >
                            {day}
                        </div>
                    ))}
                </div>
            </div>

            {/* Selected Day's Periods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ">
                {Object.entries(periods).map(([slot, subject], index) => (
                    <div
                        key={`${selectedDay}-${slot}-${index}`}
                        className="bg-white/30 backdrop-blur-lg w-full h-28 px-4 py-2 rounded-xl border-2 border-[#FEC674] flex flex-col items-center justify-center gap-2 text-center shadow"
                    >
                        <h4 className="font-semibold">{subject}</h4>
                        <h4 className="text-sm text-gray-700">
                            <i className="fa-solid fa-clock mr-1 text-blue-500"></i>
                            {slot}
                        </h4>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimetableContent;
