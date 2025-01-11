import bcrypt from "bcryptjs";

export const User_Mocks = [
    {
      firstName: "Dustin",
      lastName: "Greco",
      email: "dkgreco@thetroveofgems.tech",
      password: bcrypt.hashSync("junko_5766_!", 13),
      isAdmin: true,
    },
    {
        firstName: "Brett",
        lastName: "Wright",
        email: "mwsc88@gmail.com",
        password: bcrypt.hashSync("VandalBoof2025##", 13),
        isAdmin: true
    },
    {
        firstName: "Guest",
        lastName: "User",
        email: "guest.app.user@thetroveofgems.tech",
        password: bcrypt.hashSync("r3VnMVgQ129bdGxghtloVrCa9wu", 13),
        isAdmin: false
    }
]