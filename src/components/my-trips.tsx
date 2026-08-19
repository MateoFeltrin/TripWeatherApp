import { MdOutlineCancel } from "react-icons/md";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

interface Trip {
  tripId: number;
  dateOfTrip: Date;
  startLocation: string;
  destination: string;
}

interface Props {
  trips: Trip[];
  setShowMyTrips: (value: boolean) => void;
  setLoggedIn: (value: boolean) => void;
  onTripClick: (trip: Trip) => void;
}

export const MyTrips = ({ trips, setShowMyTrips, setLoggedIn, onTripClick }: Props) => {
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  const handleTripClick = (trip: Trip) => {
    setSelectedTripId(trip.tripId);
    onTripClick(trip);
  };

  const logOut = () => {
    setShowMyTrips(false);
    setLoggedIn(false);
    localStorage.removeItem("user");
  };

  let firstName;
  let lastName;
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    firstName = user.firstName;
    lastName = user.lastName;
  } else {
    console.log("No user data found in localStorage.");
  }
  return (
    <div className="absolute top-14 right-8 transform h-150 !w-100 !z-200 border-2 border-stone-800 bg-white rounded-xl !px-2 !pb-1 shadow text-center max-h-[80vh] flex flex-col">
      <div className="absolute flex right-0 !z-50 bg-white rounded-4xl !mr-0.5">
        <MdOutlineCancel
          className="ursor-pointer size-5 hover:bg-stone-300 rounded-3xl"
          onClick={() => setShowMyTrips(false)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 bg-stone-300 rounded-lg !p-2 !mt-5 h-12">
        <div className="text-left font-semibold mb-2 self-center">
          {firstName} {lastName}
        </div>
        <button
          className="cursor-pointer h-8 !w-25 bg-red-800 rounded-xl !pb-1 shadow text-center text-white hover:bg-red-900 justify-self-end"
          onClick={logOut}
        >
          Log out
        </button>
      </div>
      <ScrollArea className="flex-grow overflow-auto rounded-md !mr-5 w-full ">
        <ul className="!mt-2 !mx-3 !space-y-1">
          {trips.map((trip) => (
            <li
              key={trip.tripId}
              onClick={() => handleTripClick(trip)}
              className={`cursor-pointer rounded-lg !p-2 hover:bg-stone-400 ${
                selectedTripId === trip.tripId ? "bg-stone-500" : "bg-stone-300"
              }`}
            >
              <div className="text-left font-semibold mb-2">
                Trip on: {trip.dateOfTrip.toLocaleString()}
              </div>
              <div className="!space-y-1">
                <div className="flex justify-between text-sm !px-2">
                  <div>{"Start: " + trip.startLocation}</div>
                  <div>{"End: " + trip.destination}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
};
