"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { MyAlertDialog } from "@/components/alert-dialog";

interface InputControlsProps {
  onSubmit: (startLocation: string, destination: string, dateTime: string) => void;
  onSave: (dateTime: string, startLocation: string, destination: string) => void;
  collapsible?: "icon" | "offcanvas" | "none";
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  loggedIn: boolean;
  startDateTime: string;
  setStartDateTime: (dateTime: string) => void;
}

export function InputControls({
  onSubmit,
  onSave,
  loggedIn,
  startDateTime,
  setStartDateTime,
}: InputControlsProps) {
  const [showAlert, setShowAlert] = React.useState(false);
  const [startLocation, setStartLocation] = React.useState("");
  const [startSuggestions, setStartSuggestions] = React.useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [destination, setDestination] = React.useState("");
  const [destinationSuggestions, setDestinationSuggestions] = React.useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isStartFocused, setIsStartFocused] = React.useState(false);
  const [isDestinationFocused, setIsDestinationFocused] = React.useState(false);

  React.useEffect(() => {
    if (startLocation.length > 1) {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input: startLocation }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setStartSuggestions(predictions);
        } else {
          setStartSuggestions([]);
        }
      });
    } else {
      setStartSuggestions([]);
    }
  }, [startLocation]);

  React.useEffect(() => {
    if (destination.length > 1) {
      const autocompleteService = new google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input: destination }, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setDestinationSuggestions(predictions);
        } else {
          setDestinationSuggestions([]);
        }
      });
    } else {
      setDestinationSuggestions([]);
    }
  }, [destination]);

  const handleSubmit = () => {
    if (startLocation && destination && startDateTime)
      onSubmit(startLocation, destination, startDateTime);
    else {
      setShowAlert(true); // This will open the dialog
    }
  };
  const handleSave = () => {
    if (startLocation && destination && startDateTime)
      onSave(startLocation, destination, startDateTime);
    else {
      setShowAlert(true); // This will open the dialog
    }
  };
  return (
    <div>
      <MyAlertDialog
        title=" Please fill out the needed information"
        content="Please enter the start location, destination and the date and time of your trip"
        button="Okay"
        setShowAlert={setShowAlert}
        showAlert={showAlert}
      />
      <div className="h-20 absolute top-4 left-4 !z-50 !w-50">
        <input
          placeholder="Enter start location"
          className="h-8 w-full !z-50 bg-white rounded-xl !px-2 !pb-1 shadow hover:bg-stone-300"
          value={startLocation}
          onChange={(e) => setStartLocation(e.target.value)}
          onFocus={() => setIsStartFocused(true)}
          onBlur={() => setTimeout(() => setIsStartFocused(false), 100)}
        />
        {isStartFocused && startSuggestions.length > 0 && (
          <ul className="!mt-1 bg-white border border-gray-300  shadow-lg w-full rounded-xl">
            {startSuggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="!px-2 cursor-pointer hover:bg-gray-200 !rounded-xl"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents blur from killing interaction
                  setStartLocation(suggestion.description);
                  setStartSuggestions([]);
                }}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="h-20 absolute top-4 left-60 !z-50 !w-50">
        <input
          placeholder="Enter destination"
          className="h-8 w-full !z-50 bg-white rounded-xl !px-2 !pb-1 shadow hover:bg-stone-300"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onFocus={() => setIsDestinationFocused(true)}
          onBlur={() => setTimeout(() => setIsDestinationFocused(false), 100)}
        />
        {isDestinationFocused && destinationSuggestions.length > 0 && (
          <ul className="!mt-1 bg-white border border-gray-300  shadow-lg w-full rounded-xl ">
            {destinationSuggestions.map((suggestion) => (
              <li
                key={suggestion.place_id}
                className="!px-2 cursor-pointer hover:bg-gray-200 !rounded-xl"
                onMouseDown={(e) => {
                  e.preventDefault(); // prevents blur from killing interaction
                  setDestination(suggestion.description);
                  setDestinationSuggestions([]);
                }}
              >
                {suggestion.description}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Input
        id="date-time"
        type="datetime-local"
        className="cursor-text h-8 !w-50 !z-50 absolute top-4 left-115 bg-white rounded-xl !px-2 !pb-1 shadow hover:bg-stone-300"
        value={startDateTime}
        onChange={(e) => setStartDateTime(e.target.value)}
      />
      <button
        className="cursor-pointer h-8 !w-15 !z-50 absolute top-4 left-170 bg-white rounded-xl !px-2 !pb-1 shadow text-center hover:bg-stone-300"
        onClick={handleSubmit}
      >
        GO
      </button>
      {loggedIn && (
        <button
          className="cursor-pointer h-8 !w-25 !z-50 absolute top-4 left-190 bg-slate-900 rounded-xl !px-2 !pb-1 shadow text-center text-white hover:bg-slate-800"
          onClick={handleSave}
        >
          Save trip
        </button>
      )}
    </div>
  );
}
