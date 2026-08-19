import { mysqlTable, int, varchar, datetime, json } from "drizzle-orm/mysql-core";

export const User = mysqlTable("User", {
  UserID: int("UserID").autoincrement().primaryKey(),
  Email: varchar("Email", { length: 255 }).notNull(),
  Password: varchar("Password", { length: 1000 }).notNull(),
  FirstName: varchar("FirstName", { length: 255 }).notNull(),
  LastName: varchar("LastName", { length: 255 }).notNull(),
});

export const Trip = mysqlTable("Trip", {
  TripID: int("TripID").autoincrement().primaryKey(),
  DateOfTrip: datetime("DateOfTrip").notNull(),
  ChartData: json("ChartData"),
  UserID: int("UserID")
    .notNull()
    .references(() => User.UserID),
  StartLocation: varchar("StartLocation", { length: 255 }).notNull(),
  Destination: varchar("Destination", { length: 255 }).notNull(),
});
