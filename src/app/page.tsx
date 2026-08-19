"use client";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Chart } from "@/components/ui/line-chart";
import { getTripsByUser, createTrip, getChartData } from "@/db/controller/db-actions";
import * as React from "react";
import { InputControls } from "@/components/input-controls";
import { useLoadScript, GoogleMap, DirectionsRenderer } from "@react-google-maps/api";
import { useMemo, useState } from "react";
import { FaTemperatureHigh } from "react-icons/fa";
import { FaCloudShowersHeavy } from "react-icons/fa";
import { RiWindyLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { mapOptions } from "@/components/mapOptions";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { MyTrips } from "@/components/my-trips";
import { LoginForm } from "@/components/login-form";
import { RegistrationForm } from "@/components/registration-form";
import { MyAlertDialog } from "@/components/alert-dialog";

interface Trip {
  tripId: number;
  dateOfTrip: Date;
  startLocation: string;
  destination: string;
}

const title = "Temperature through the trip";

const description = "While you will travel the temperature will be fluctuating like this:";

export default function Page() {
  const libraries = useMemo(() => ["places"], []);
  const mapCenter = useMemo(() => ({ lat: 45.8407692, lng: 16.0470026 }), []);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chartData, setChartData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [weatherData, setWeatherData] = useState<any>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showMyTrips, setShowMyTrips] = useState(false);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showAlert, setShowAlert] = React.useState(false);
  const [startDateTime, setStartDateTime] = useState<string>("");
  const [alertTitle, setAlertTitle] = useState<string>("");
  const [alertContent, setAlertContent] = useState<string>("");
  const [alertButton, setAlertButton] = useState<string>("");
  const [showPrevTrip, setShowPrevTrip] = useState(false);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    libraries: libraries as any,
  });

  const handleGetTripsWithLocationsByUser = async () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const id = user.id;
      const data = await getTripsByUser(id);
      setTrips(data);
      setShowMyTrips(true);
    }
  };

  const handleSave = async (startLocation: string, destination: string, dateTime: string) => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && dateTime && startLocation && destination && chartData) {
      const user = JSON.parse(storedUser);
      const id = user.id;
      const success = await createTrip({
        userId: id,
        dateOfTrip: new Date(dateTime),
        startLocation: startLocation, // Replace with actual input
        destination: destination, // Replace with actual input
        chartData: chartData, // Optional
      });
      if (success) {
        setShowAlert(true);
        setAlertTitle("Trip saved!");
        setAlertContent(
          "Your trip is saved, you can view it in 'my trips' windows on the right of your screen."
        );
        setAlertButton("Okay");
      }
    } else {
      console.log(chartData);
      setShowAlert(true);
      setAlertTitle("Please fill out allt the data");
      setAlertContent(
        "To save your trip you need to be logged in, fill out the start location, destination and date."
      );
      setAlertButton("Okay");
    }
  };

  const handleSubmit = async (startLocation: string, destination: string, dateTime: string) => {
    const directionsService = new google.maps.DirectionsService();
    //Generate route
    directionsService.route(
      {
        origin: startLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      async (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setShowPrevTrip(false);
          handleSliderChange([0], result);
          // Generate distance
          if (result && result.routes.length > 0) {
            const distanceMatrixService = new google.maps.DistanceMatrixService();
            const segmentCount = 10;
            const route = result.routes[0].overview_path;

            let distanceValue = 0;

            await distanceMatrixService.getDistanceMatrix(
              {
                origins: [startLocation],
                destinations: [destination],
                travelMode: google.maps.TravelMode.DRIVING,
                unitSystem: google.maps.UnitSystem.METRIC,
              },
              (response, status) => {
                if (status === google.maps.DistanceMatrixStatus.OK && response != null) {
                  distanceValue = response.rows[0].elements[0].distance.value;
                  console.log("Distance: " + distanceValue);
                } else {
                  console.error("DistanceMatrix failed due to: " + status);
                }
              }
            );

            const segmentCoordinates = [];
            let accumulatedDistance = 0;
            let segmentIndex = 1;
            const segmentTargetDistance = distanceValue / segmentCount;
            // When sum of parts is more than 10% create segment
            for (let j = 1; j < route.length; j++) {
              const prev = route[j - 1];
              const current = route[j];
              const segmentDistance = google.maps.geometry.spherical.computeDistanceBetween(
                prev,
                current
              );
              accumulatedDistance += segmentDistance;

              if (accumulatedDistance >= segmentTargetDistance * segmentIndex) {
                segmentCoordinates.push(route[j]);
                segmentIndex++;
              }

              if (segmentCoordinates.length >= segmentCount) {
                break;
              }
            }

            segmentCoordinates.unshift(route[0]); // Start
            segmentCoordinates.push(route[route.length - 1]); // End

            // Start time
            const date = dateTime.split("T")[0];
            const tripStartTime = new Date(dateTime);
            const geoCodeApiKey = process.env.NEXT_PUBLIC_GEOCODING_KEY;

            // Legs has duration time data
            const totalDuration = result.routes[0].legs.reduce(
              (sum, leg) => sum + (leg.duration?.value || 0),
              0
            ); // Total duration in seconds

            // Fetch weather data for each segment
            const weatherPromises = segmentCoordinates.map(async (coord, index) => {
              // Get percentage of the trip
              const segmentProgress = index / (segmentCoordinates.length - 1);
              // Get the time of arrival at the segment
              const estimatedArrival = new Date(
                tripStartTime.getTime() + segmentProgress * totalDuration * 1000
              );

              const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat()}&longitude=${coord.lng()}&hourly=temperature_2m&timezone=Europe%2FLondon&start_date=${date}&end_date=${date}`
              );
              const weatherData = await weatherResponse.json();

              const geocodeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coord.lat()},${coord.lng()}&key=${geoCodeApiKey}`
              );
              const geocodeData = await geocodeResponse.json();

              const townName =
                geocodeData.results[0]?.address_components.find((component: any) =>
                  component.types.includes("locality")
                )?.long_name || "Unknown";

              return { index, coord, townName, weather: weatherData, estimatedArrival };
            });

            // Wait for all the weather promises
            const weatherResults = await Promise.all(weatherPromises);

            const newChartData = weatherResults.map((data) => {
              // Find best time index (0-24)
              const closestTimeIndex = data.weather.hourly.time.reduce(
                (closestIndex: number, time: string, index: number) => {
                  const timeDiff = Math.abs(
                    new Date(time).getTime() - data.estimatedArrival.getTime()
                  );
                  const closestTimeDiff = Math.abs(
                    new Date(data.weather.hourly.time[closestIndex]).getTime() -
                      data.estimatedArrival.getTime()
                  );
                  // Return closest index
                  return timeDiff < closestTimeDiff ? index : closestIndex;
                },
                0
              );
              console.log("closestTimeIndex: " + closestTimeIndex);
              const temperature = data.weather.hourly.temperature_2m[closestTimeIndex] || "No data";
              return { town: data.townName, temperature };
            });

            setChartData(newChartData);
            console.log("Chart data: " + JSON.stringify(newChartData, null, 2));
          } else {
            console.error("Directions request failed due to", status);
          }
        }
      }
    );
  };

  const handleSliderChange = async (
    value: number[],
    customDirections?: google.maps.DirectionsResult | null
  ) => {
    const usedDirections = customDirections ?? directions;
    if (!usedDirections) {
      setShowAlert(true);
      setAlertTitle(" Please fill out the needed information and press GO");
      setAlertContent(
        "Please enter the start location, destination and the date and time of your trip and press GO"
      );
      setAlertButton("Okay");
      return;
    } else {
      const route = usedDirections.routes[0].overview_path;
      // Get the index of route at chosen percentage
      const pointOfRoute = Math.floor(route.length * (value[0] / 100));
      const coord = route[pointOfRoute];
      console.log("route length: " + route.length);

      console.log("latitude: " + coord.lat() + " Longitude: " + coord.lng());

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coord.lat()}&longitude=${coord.lng()}&hourly=temperature_2m,cloud_cover,rain,showers,snowfall,snow_depth,apparent_temperature,wind_speed_10m,visibility,precipitation,precipitation_probability,relative_humidity_2m`
      );
      const weatherData = await weatherResponse.json();
      console.log("Weather data for slider position:", weatherData);

      const tripStartTime = new Date(startDateTime);
      const totalDuration = usedDirections.routes[0].legs.reduce(
        (sum, leg) => sum + (leg.duration?.value || 0),
        0
      ); // seconds
      // leg.duration?.value is in SECONDS!
      const elapsedSeconds = (value[0] / 100) * totalDuration;
      // tripStartTime.getTime()
      const estimatedArrival = new Date(tripStartTime.getTime() + elapsedSeconds * 1000);

      // Find the closest index in weatherData.hourly.time
      const closestTimeIndex = weatherData.hourly.time.reduce(
        (closestIndex: number, time: string, currentIndex: number) => {
          // Date(time).getTime() point of day - estimatedArrival.getTime() time of arrival
          const currentDiff = Math.abs(new Date(time).getTime() - estimatedArrival.getTime());
          // Date(weatherData.hourly.time[closestIndex]).getTime() point of day - estimatedArrival.getTime() time of arrival
          const closestDiff = Math.abs(
            new Date(weatherData.hourly.time[closestIndex]).getTime() - estimatedArrival.getTime()
          );
          return currentDiff < closestDiff ? currentIndex : closestIndex;
        },
        0
      );

      console.log("Closest forecast time:", weatherData.hourly.time[closestTimeIndex]);

      // closestTimeIndex, 0 to 24, closestTimeIndex rounds up on the nearest hour
      const selectedWeatherData = {
        temperature_2m: weatherData.hourly.temperature_2m?.[closestTimeIndex] ?? "No data",
        apparent_temperature:
          weatherData.hourly.apparent_temperature?.[closestTimeIndex] ?? "No data",
        cloud_cover: weatherData.hourly.cloud_cover?.[closestTimeIndex] ?? "No data",
        visibility: weatherData.hourly.visibility?.[closestTimeIndex] ?? "No data",
        wind_speed_10m: weatherData.hourly.wind_speed_10m?.[closestTimeIndex] ?? "No data",
        relative_humidity_2m:
          weatherData.hourly.relative_humidity_2m?.[closestTimeIndex] ?? "No data",
        precipitation_probability:
          weatherData.hourly.precipitation_probability?.[closestTimeIndex] ?? "No data",
        precipitation: weatherData.hourly.precipitation?.[closestTimeIndex] ?? "No data",
        rain: weatherData.hourly.rain?.[closestTimeIndex] ?? "No data",
        showers: weatherData.hourly.showers?.[closestTimeIndex] ?? "No data",
        snowfall: weatherData.hourly.snowfall?.[closestTimeIndex] ?? "No data",
        snow_depth: weatherData.hourly.snow_depth?.[closestTimeIndex] ?? "No data",
      };

      setWeatherData(selectedWeatherData);
    }
  };

  const handleTripClick = async (trip: Trip) => {
    // Get and set chart data
    const data = await getChartData(trip.tripId);
    const chartData = JSON.parse(data[0].ChartData as string);
    setChartData(chartData);
    setShowPrevTrip(true);
    console.log("start: " + trip.startLocation);
    console.log("end: " + trip.destination);

    // Show route using DirectionsService
    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: trip.startLocation,
        destination: trip.destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        } else {
          console.error("Failed to fetch directions:", status);
        }
      }
    );
  };

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  return (
    <main className="w-full min-h-screen relative">
      <MyAlertDialog
        title={alertTitle}
        content={alertContent}
        button={alertButton}
        setShowAlert={setShowAlert}
        showAlert={showAlert}
      />
      {/* Google Map as background */}
      <div className="absolute inset-0 z-0">
        <GoogleMap
          options={mapOptions}
          zoom={9}
          center={mapCenter}
          mapTypeId={google.maps.MapTypeId.ROADMAP}
          mapContainerStyle={{ width: "100%", height: "100%" }}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </div>

      {/* Overlay input controls */}
      <div className="relative z-10 flex justify-center items-start pt-5">
        <InputControls
          onSubmit={handleSubmit}
          onSave={handleSave}
          loggedIn={loggedIn}
          startDateTime={startDateTime}
          setStartDateTime={setStartDateTime}
        />
      </div>
      {!loggedIn && (
        <button
          onClick={() => setShowLogin(true)}
          className="cursor-pointer h-8 !w-15 !z-50 border-2 border-stone-800 absolute top-4 right-8 bg-white rounded-xl !px-2 !pb-1 shadow text-center hover:bg-slate-300"
        >
          Login
        </button>
      )}
      {showLogin && !loggedIn && (
        <LoginForm
          setShowLogin={setShowLogin}
          setLoggedIn={setLoggedIn}
          setShowRegistration={setShowRegistration}
        />
      )}
      {showRegistration && !loggedIn && (
        <RegistrationForm
          setShowRegistration={setShowRegistration}
          setShowLogin={setShowLogin}
          setLoggedIn={setLoggedIn}
        />
      )}
      {loggedIn && (
        <CgProfile
          onClick={handleGetTripsWithLocationsByUser}
          className={`size-8 !z-50 absolute top-4 right-8 shadow bg-white rounded-xl 
            ${showMyTrips ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
        />
      )}
      {showMyTrips && (
        <MyTrips
          trips={trips}
          setShowMyTrips={setShowMyTrips}
          setLoggedIn={setLoggedIn}
          onTripClick={handleTripClick}
        />
      )}

      {/* Drawer always on top */}
      <Drawer>
        <DrawerTrigger
          onClick={() => {
            setShowMyTrips(false);
          }}
          className="cursor-pointer absolute bottom-0 z-20 h-10 w-full flex justify-center items-center rounded-t-lg bg-gray-100 "
        >
          <div className="w-12 h-1 bg-stone-800 rounded-full hover:bg-stone-600 !mb-4"></div>
        </DrawerTrigger>
        <DrawerContent className="z-50">
          <DrawerTitle />
          <DrawerHeader>
            <DrawerClose className="cursor-pointer h-10 justify-center flex">
              <div className="w-12 h-1 bg-stone-800 rounded-full mt-5 hover:bg-stone-600 "></div>{" "}
              {/* Line at the top of the drawer */}
            </DrawerClose>
          </DrawerHeader>
          <DrawerFooter className="flex ">
            <div className="grid w-full grid-cols-10">
              <div className="!ml-5 !mr-5 col-span-1" />
              <div className="!ml-5 !mr-5 col-span-8 !pt-5">
                {!showPrevTrip && (
                  <div className={`${!directions ? "opacity-50 pointer-events-none" : ""}`}>
                    <Slider
                      className="overflow-visible "
                      defaultValue={[0]}
                      max={100}
                      step={1}
                      onValueChange={handleSliderChange}
                      disabled={!directions}
                    />
                  </div>
                )}
                <ScrollArea className="h-[100vh] rounded-md  w-full">
                  {!showPrevTrip && (
                    <div className="grid sm:grid-cols-2 flex-col !pb-10">
                      <dl className="grid  px-5 !mr-4 !mt-4">
                        <div>
                          <Card className="grid gap-4 !p-4 relative">
                            <FaTemperatureHigh
                              className=" !overflow-visible size-7 absolute "
                              style={{
                                transform: "translateY(-50%) translateX(50%)", // Adjust the offset
                              }}
                            />
                            <div className="flex flex-col gap-4">
                              <dt>Temperature: {weatherData?.temperature_2m ?? "No data"} C</dt>
                              <dt>
                                Apparent temperature:{" "}
                                {weatherData?.apparent_temperature ?? "No data"} C
                              </dt>
                            </div>
                          </Card>
                          <Card className="grid gap-4 !p-4 relative !mt-4">
                            <RiWindyLine
                              className=" !overflow-visible size-7 absolute "
                              style={{
                                transform: "translateY(-50%) translateX(50%)", // Adjust the offset
                              }}
                            />
                            <div className="flex flex-col gap-4">
                              <dt>Cloud cover: {weatherData?.cloud_cover ?? "No data"} %</dt>
                              <dt>Visibility: {weatherData?.visibility ?? "No data"} m</dt>
                              <dt>Wind speed: {weatherData?.wind_speed_10m ?? "No data"} km/h</dt>
                              <dt className="flex items-center gap-2">
                                Humidity: {weatherData?.relative_humidity_2m ?? "No data"}%
                              </dt>
                            </div>
                          </Card>
                        </div>
                      </dl>
                      <dl className="!mr-4 !mt-4">
                        <Card className="grid gap-4 !p-4 relative">
                          <FaCloudShowersHeavy
                            className=" !overflow-visible size-7 absolute z-50"
                            style={{
                              transform: "translateY(-50%) translateX(50%)", // Adjust the offset
                            }}
                          />
                          <div className="flex flex-col gap-4">
                            {" "}
                            <dt>
                              Precipitation probability:{" "}
                              {weatherData?.precipitation_probability ?? "No data"} %
                            </dt>
                            <dt>Precipitation: {weatherData?.precipitation ?? "No data"} mm</dt>
                            <dt>Rain: {weatherData?.rain ?? "No data"} mm</dt>
                            <dt>Showers: {weatherData?.showers ?? "No data"} mm</dt>
                            <dt>Snowfall: {weatherData?.snowfall ?? "No data"} cm</dt>
                            <dt>Snow depth: {weatherData?.snow_depth ?? "No data"} m</dt>
                          </div>
                        </Card>
                      </dl>
                    </div>
                  )}
                  <div className="mx-auto !pb-45 !mr-4">
                    <Chart chartData={chartData} title={title} description={description} />
                  </div>
                  <ScrollBar />
                </ScrollArea>
              </div>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
