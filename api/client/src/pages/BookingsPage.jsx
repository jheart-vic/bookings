import AccountNav from "../AccountNav";
import {useEffect, useState} from "react";
import axios from "axios";
import PlaceImg from "../PlaceImg";
// import {differenceInCalendarDays, format} from "date-fns";
import {Link} from "react-router-dom";
import BookingDates from "../BookingDates";

export default function BookingsPage() {
  const [bookings,setBookings] = useState([]);
  useEffect(() => {
    axios.get('/bookings').then(response => {
      setBookings(response.data);
    });
  }, []);

  function deleteBooking(ev, id) {
    ev.preventDefault();

    axios.delete(`/bookings/${id}`).then((response) => {
      if (response.status === 204) {
        const updatedBookings = bookings.filter((booking) => booking?._id !== id);
        setBookings(updatedBookings);
      }
    });
  }

  return (
    <div>
      <AccountNav />
      <div >
        {bookings?.length > 0 && bookings.map(booking => (
          <Link key={booking?._id} to={`/account/bookings/${booking?._id}`} className="flex gap-4 bg-gray-200 rounded-2xl mb-2 overflow-hidden">
            <div className="w-48 m-auto pl-4 rounded">
              <PlaceImg place={booking?.place} />
            </div>
            <div className="py-3 pr-3 grow">
              <h2 className="text-xl text-start">{booking?.place?.title}</h2>
              <div className="text-xl">
                <BookingDates booking={booking} className="mb-2 mt-4 text-gray-500" />
                <div className="flex gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <span className="text-2xl">
                    Total price: ${booking?.price}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex  items-end">
              <button onClick={ev =>deleteBooking(ev, booking?._id)} className="cursor-pointer right-1 text-w bg-opacity-0  py-2 px-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
             </button>
           </div>
          </Link>
        ))}
      </div>
    </div>
  );
}