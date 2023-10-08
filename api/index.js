const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const imageDownloader = require("image-downloader");
const mongoose = require("mongoose");
const multer = require("multer");
const User = require("./models/User");
const fs = require("fs");
const Place = require("./models/Place");
const Booking = require("./models/Booking");

dotenv.config();

const app = express();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET;
const port = process.env.PORT|| 4000;

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5172",
  })
);

app.get("/", (req, res) => {
  res.json("Hello World");
});


function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const { token } = req.cookies;
    if (!token) {
      reject("Token not found");
    } else {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          reject(err);
        } else {
          try {
            const user = await User.findById(userData.id);
            resolve(user);
          } catch (error) {
            reject(error);
          }
        }
      });
    }
  });
}

app.get("/user-data", async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop();
    const filename = `photo_${Date.now()}.${extension}`;
    cb(null, filename);
console.log(filename);
  },
});

const upload = multer({ storage });

app.post("/register", upload.single("photo") , async (req, res) => {

  mongoose.connect(process.env.MONGO_URI);
  const { name, email, password } = req.body;

  let photo = null;
  if (req.file) {
    photo = req.file.filename;
  }
  try {
    const userDocs = await User.create({
      name,
      email,
      photo,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDocs);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email }, null, { maxTimeMS: 5000 });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("not found");
  }
});



app.get("/profile", (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    dest: __dirname + "/uploads/" + newName,
    // cloud storage
    // dest: '/tmp/' +newName,
  });
  // const url = await uploadToS3('/tmp/' +newName, newName, mime.lookup('/tmp/' +newName));
  res.json(newName);
});

// cloud storage
// const photosMiddleware = multer({ dest: "/tmp" });
// local storage
const photosMiddleware = multer({ dest: "uploads/" });
app.post("/upload", photosMiddleware.array("photos", 100),  (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname, mimetype } = req.files[i];
    // const url = await uploadToS3(path, originalname, mimetype);
    // uploadedFiles.push(url);
    const parts = originalname.split(".");
    const ext = parts[parts.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace("uploads", ""));
  }
  res.json(uploadedFiles);
});

app.post("/places", (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    price,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner: userData.id,
      price,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });
    res.json(placeDoc);
  });
});

app.get("/user-places", (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
});

app.get("/places/:id", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { id } = req.params;
  res.json(await Place.findById(id));
});

app.put("/places", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
});


app.delete("/places/:id", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { id } = req.params;
  const userData = await getUserDataFromReq(req);

  try {
    const places = await Place.findById(id);
    if (!places) {
      return res.status(404).json({ error: "Place not found" });
    }

    await Place.findByIdAndDelete(id);
    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/places", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  res.json(await Place.find());
});

app.post("/bookings", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const userData = await getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});


app.delete("/bookings/:id", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const { id } = req.params;
  const userData = await getUserDataFromReq(req);

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.user.toString() !== userData.id) {
      return res.status(403).json({ error: "Unauthorized to delete this booking" });
    }

    await Booking.findByIdAndDelete(id);
    res.status(204).json();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/bookings", async (req, res) => {
  mongoose.connect(process.env.MONGO_URI);
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
});

app.listen(4000, () => console.log(`server listening on port ${port}`));
