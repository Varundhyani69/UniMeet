import React from 'react'
import Header from './Header';
import Timetable from './Timetable';
import Friends from './Friends';
const Home = ({ userData }) => {
    return (
        <div>
            <div className="mb-4 ">
                <Header userData={userData} />
            </div>
            <div className="mb-4">
                <Timetable userData={userData} />
            </div>
            <div>
                <Friends userData={userData} />
            </div>
        </div>
    )
}

export default Home
