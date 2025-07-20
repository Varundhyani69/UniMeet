import React from 'react'
import TimetableContent from './TimetableContent'

const Timetable = ({ userData }) => {
    return (
        <div className='' >
            <div>
                <h1 className='text-4xl ml-4 mb-3' style={{ fontFamily: '"Keania One", cursive' }}>
                    <span >Time</span>
                    <span className='text-[#FEC674]'>Table</span>
                </h1>
            </div>
            <div >
                <TimetableContent userData={userData} />
            </div>
        </div>
    )
}

export default Timetable
