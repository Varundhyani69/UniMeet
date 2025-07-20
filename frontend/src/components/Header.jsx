import React, { useEffect, useState } from 'react';

const Header = ({ userData }) => {
    const [nextClass, setNextClass] = useState(null);

    const slots = [
        "09-10 AM",
        "10-11 AM",
        "11-12 AM",
        "12-01 PM",
        "01-02 PM",
        "02-03 PM",
        "03-04 PM",
        "04-05 PM",
        "05-06 PM"
    ];

    // Helper to convert slot string to comparable number for current time
    const parseSlotTime = (slot) => {
        const [time, period] = slot.split(' ');
        const [start, end] = time.split('-').map(Number);
        return period === 'PM' && start !== 12 ? start + 12 : start;
    };

    useEffect(() => {
        const now = new Date();
        const hour = now.getHours();

        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const today = days[now.getDay()];
        const timetable = userData?.timetable?.[today];

        if (timetable) {
            for (let slot of slots) {
                const slotHour = parseSlotTime(slot);
                if (slotHour >= hour && timetable[slot] && timetable[slot] !== "No class") {
                    setNextClass({
                        subject: timetable[slot],
                        slot
                    });
                    break;
                }
            }
        }
    }, [userData]);

    return (
        <div>
            <div className="mt-4">
                <h1 className='text-base sm:text-lg' style={{ fontFamily: "'Inter', sans-serif" }}>WELCOME VERTO</h1>
                <h1 className='text-2xl sm:text-4xl' style={{ fontFamily: '"Keania One", cursive' }}>
                    <span>Spend &nbsp;</span>
                    <span className='text-[#FEC674]'>Quality Time</span>
                </h1>
            </div>

            <div className="bg-[#FEC674] rounded-3xl mt-4 flex flex-col sm:flex-row sm:justify-center sm:items-start gap-6 sm:gap-14 lg:gap-20 p-6">

                {/* Profile Picture */}
                <div className="w-full pt-3 sm:w-auto flex items-center justify-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-55 lg:h-55 rounded-full bg-amber-400">
                        <img className='rounded-full object-cover h-full w-full' src={userData.pfp} alt="pfp" />
                    </div>
                </div>

                {/* Info Section */}
                <div className="text-center sm:text-left">
                    <h1 className='text-2xl sm:text-4xl text-[#FFF3E2]' style={{ fontFamily: '"Keania One", cursive' }}>{userData.username}</h1>

                    <div className="mt-3 sm:mt-5" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <i>"{userData.bio}"</i>
                        <h4 className="mb-1">
                            <span className='mr-4'>Course: <span className='text-[#FFF3E2]'>{userData.course}</span></span>
                            <span>Section: <span className='text-[#FFF3E2]'>{userData.section}</span></span>
                        </h4>
                        <h4 className="mb-2">
                            <span className='mr-4'>Gender: <span className='text-[#FFF3E2]'>{userData.gender === 'Male' ? "M" : userData.gender === "Female" ? "F" : userData.gender === "Fighter jet" ? <i className="fa-solid fa-jet-fighter-up"></i> : "User don't know his gender"}</span></span>
                            <span>Reg no: <span className='text-[#FFF3E2]'>{userData.reg_no}</span></span>
                        </h4>

                        <div>
                            <h4>Next Class:</h4>
                            <div className="bg-[#FFF3E2] w-fit px-4 py-2 rounded-xl border-2 border-orange-400 mt-2 text-center mx-auto sm:mx-0">
                                {nextClass ? (
                                    <>
                                        <h4>{nextClass.subject}</h4>
                                        <h4><i className="fa-solid fa-clock text-orange-500"></i> {nextClass.slot}</h4>
                                    </>
                                ) : (
                                    <h4>No more classes today</h4>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
