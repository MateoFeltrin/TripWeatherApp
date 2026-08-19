"use client";
import { MdOutlineCancel } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createUser } from "@/db/controller/db-actions";
import { useState } from "react";

interface Props {
  setShowLogin: (value: boolean) => void;
  setShowRegistration: (value: boolean) => void;
  setLoggedIn: (value: boolean) => void;
}

export const RegistrationForm = ({ setShowLogin, setShowRegistration, setLoggedIn }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 !h-95 !w-80 !z-50 border-2 border-stone-800 bg-white rounded-xl !px-2 !pb-1 shadow text-center">
      <div className="flex justify-end">
        <MdOutlineCancel
          className="cursor-pointer size-5 rounded-3xl hover:bg-stone-300"
          onClick={() => setShowRegistration(false)}
        />
      </div>
      <div className="text-xl">Please register</div>

      <div className="w-full h-full grid-rows-4">
        <div className="text-left">
          <Label htmlFor="start-location flex" className="!text-left">
            E-mial
          </Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter email"
            className="mt-2 !p-2 hover:bg-stone-300"
          />
        </div>
        <div className="text-left">
          <Label htmlFor="start-location flex" className="!text-left">
            First name
          </Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            placeholder="Enter your first name"
            className="mt-2 !p-2 hover:bg-stone-300"
          />
        </div>
        <div className="text-left">
          <Label htmlFor="start-location flex" className="!text-left">
            Last name
          </Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            type="text"
            placeholder="Enter your last name"
            className="mt-2 !p-2 hover:bg-stone-300"
          />
        </div>
        <div className="text-left">
          <Label htmlFor="start-location flex">Password</Label>
          <Input
            id="start-location"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="mt-2 !p-2 hover:bg-stone-300"
          />
        </div>
        <button
          className="cursor-pointer border-2 w-20 !mt-6 rounded-2xl bg-slate-900 !py-1 hover:bg-slate-800 text-white"
          onClick={async () => {
            const newUser = {
              Email: email,
              Password: password,
              FirstName: firstName,
              LastName: lastName,
            };

            try {
              const result = await createUser(newUser);

              // Ako ti Drizzle vraća inserted ID (npr. sa returning), uzmi ga ovako:
              const userId = result; // prilagodi prema tvojoj shemi

              // Spremi podatke u localStorage
              localStorage.setItem(
                "user",
                JSON.stringify({
                  id: userId,
                  firstName,
                  lastName,
                })
              );

              setShowRegistration(false);
              setShowLogin(false); // Ako odmah logiraš korisnika
              setLoggedIn(true);

              // Možeš preusmjeriti ili refreshati page ako želiš
            } catch (error) {
              console.error("Registration failed:", error);
            }
          }}
        >
          {" "}
          Register
        </button>
      </div>
    </div>
  );
};
