const express = require("express");
const { Storage } = require("@google-cloud/storage");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require('mysql');
const PORT = process.env.PORT || 3000

const app = express();
app.use(cors({
  origin: '*', // Allow requests from this origin
  methods: ['GET', 'POST', 'PUT'], // Specify allowed methods
  credentials: false // Include credentials if needed (optional)
}));

app.use(bodyParser.json());

//aa

const connection = mysql.createConnection({
    user: 'sharmasahaj',
    password: 'Helloworld',
    database: 'metadata',
    host: "34.131.169.81"
});

// Endpoint to fetch image metadata from the database
app.get('/get-images', (req, res) => {
    const query = 'SELECT filename, file_size, upload_timestamp FROM file_metadata';
    connection.query(query, (error, results) => {
        if (error) {
            console.error('Error retrieving images: ', error);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Create a storage client using the service account key file
const storage = new Storage({ keyFilename: "servicekey.json" });
const bucketName = "encore11"; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

// Generate a Signed URL for uploading
app.post("/generate-upload-url", async (req, res) => {
  const fileName = req.body.fileName;

  const options = {
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
    contentType: req.body.contentType
  };

  // Get a signed URL for file upload
  const [url] = await bucket.file(fileName).getSignedUrl(options);

  res.status(200).send({ uploadUrl: url });
});

app.listen(PORT, () => {
  console.log("Server started on http://localhost:" + PORT);
});
