import { useState } from "react";

const Navigator = ({ selected, setSelected }) => {


    const getIconClass = (id) =>
        `text-xl sm:text-2xl transition duration-200 transform hover:scale-125 cursor-pointer ${selected === id ? "text-[#FEC674]" : "text-white"
        }`;

    const icons = {
        dashboard: { id: "dashboard", class: "fa-solid fa-layer-group" },
        chat: { id: "chat", class: "fa-regular fa-comment" },
        profile: { id: "profile", class: "fa-regular fa-user" },
    };

    const handleClick = (id) => {
        setSelected(id);
    };

    const getSideIcons = () => {
        return Object.keys(icons)
            .filter((key) => key !== selected)
            .map((key) => icons[key]);
    };

    const sideIcons = getSideIcons();

    return (
        <div className="flex items-center justify-center w-full px-4">
            <div className="relative flex items-center gap-4">
                <div className="bg-[#FFF3E2] h-16 w-16 rounded-full absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center shadow-md">
                    <i
                        className={`${icons[selected].class} ${getIconClass(selected)}`}
                        onClick={() => handleClick(selected)}
                    />
                </div>

                <div className="bg-[#FEC674] flex items-center justify-between rounded-3xl w-[260px] sm:w-[320px] md:w-[400px] h-14 px-6 shadow-lg">
                    <div
                        className="ml-5 flex items-center justify-center"
                        onClick={() => handleClick(sideIcons[0].id)}
                    >
                        <i className={`${sideIcons[0].class} ${getIconClass(sideIcons[0].id)}`} />
                    </div>
                    <div
                        className="mr-5 flex items-center justify-center"
                        onClick={() => handleClick(sideIcons[1].id)}
                    >
                        <i className={`${sideIcons[1].class} ${getIconClass(sideIcons[1].id)}`} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navigator;
