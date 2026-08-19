import { MdOutlineCancel } from "react-icons/md";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { verifyUser } from "@/db/controller/db-actions";
import { useState } from "react";

interface Props {
  setShowLogin: (value: boolean) => void;
  setLoggedIn: (value: boolean) => void;
  setShowRegistration: (value: boolean) => void;
}

export const LoginForm = ({ setShowLogin, setLoggedIn, setShowRegistration }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-70 !w-80 !z-50 border-2 border-stone-800 bg-white rounded-xl !px-2 !pb-1 shadow text-center">
      <div className="flex justify-end">
        <MdOutlineCancel
          className="cursor-pointer size-5 hover:bg-stone-300 rounded-3xl"
          onClick={() => setShowLogin(false)}
        />
      </div>
      <div className="text-xl">Please login</div>
      <div className="w-full h-full grid-rows-2">
        <div className="text-left">
          <Label htmlFor="start-location flex" className="!text-left ">
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
        <div className="grid grid-cols-2 justify-items-center mt-6 gap-4">
          <button
            className="cursor-pointer w-20 !mt-6 rounded-2xl  !py-1 border-2 border-stone-800 hover:bg-stone-300"
            onClick={async () => {
              try {
                const result = await verifyUser(email, password);
                if (result.success && result.user) {
                  const User = {
                    UserID: result.user.UserID,
                    FirstName: result.user.FirstName,
                    LastName: result.user.LastName,
                  };

                  // Spremi podatke u localStorage
                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      id: User.UserID,
                      firstName: User.FirstName,
                      lastName: User.LastName,
                    })
                  );
                  setShowLogin(false); // Ako odmah logiraš korisnika
                  setLoggedIn(true);
                } else {
                  console.error("Login failed:", result.message);
                } // Možeš preusmjeriti ili refreshati page ako želiš
              } catch (error) {
                console.error("Login failed:", error);
              }
            }}
          >
            {" "}
            Login
          </button>
          <button
            className="cursor-pointer border-2 w-20 !mt-6 rounded-2xl bg-slate-800 !py-1 hover:bg-slate-700 text-white"
            onClick={() => {
              setShowRegistration(true);
              setShowLogin(false);
            }}
          >
            {" "}
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
