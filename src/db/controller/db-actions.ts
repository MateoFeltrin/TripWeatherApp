"use server";
import { db } from "@/db/drizzle";
import { User, Trip } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
const saltRounds = 10;

export const getUser = async () => {
  const data = await db.select().from(User);
  return data;
};

export async function verifyUser(email: string, password: string) {
  const result = await db.select().from(User).where(eq(User.Email, email));

  const foundUser = result[0];

  if (!foundUser) {
    return { success: false, message: "User not found 1" };
  }

  const passwordMatch = await bcrypt.compare(password, foundUser.Password);

  if (!passwordMatch) {
    return { success: false, message: "Invalid password" };
  }

  return {
    success: true,
    user: foundUser,
  };
}

type NewUser = {
  Email: string;
  Password: string;
  FirstName: string;
  LastName: string;
};

export async function createUser(user: NewUser) {
  const hashedPassword = await bcrypt.hash(user.Password, saltRounds);

  const [insertedUser] = await db
    .insert(User)
    .values({
      Email: user.Email,
      Password: hashedPassword,
      FirstName: user.FirstName,
      LastName: user.LastName,
    })
    .$returningId();

  return insertedUser;
}

export const getTripsByUser = async (userId: number) => {
  const rows = await db
    .select({
      tripId: Trip.TripID,
      dateOfTrip: Trip.DateOfTrip,
      startLocation: Trip.StartLocation,
      destination: Trip.Destination,
    })
    .from(Trip)
    .where(eq(Trip.UserID, userId));

  const trips = rows.map((row) => ({
    tripId: row.tripId,
    dateOfTrip: row.dateOfTrip,
    startLocation: row.startLocation ?? "Unknown",
    destination: row.destination ?? "Unknown",
  }));

  return trips;
};

export const getChartData = async (tripId: number) => {
  const chartData = await db
    .select({
      ChartData: Trip.ChartData,
    })
    .from(Trip)
    .where(eq(Trip.TripID, tripId));

  return chartData;
};

export async function createTrip({
  userId,
  dateOfTrip,
  startLocation,
  destination,
  chartData,
}: {
  userId: number;
  dateOfTrip: Date;
  startLocation: string;
  destination: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData?: any;
}) {
  const [newTrip] = await db
    .insert(Trip)
    .values({
      UserID: userId,
      DateOfTrip: dateOfTrip,
      StartLocation: startLocation,
      Destination: destination,
      ChartData: chartData ?? null,
    })
    .$returningId();

  return newTrip;
}
