const fastify = require("fastify");
const admin = require("firebase-admin");

const serviceAccount = require("./iv-screen-recorder-server-firebase-adminsdk-cf5m9-d583d0272e.json");

const server = fastify();
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

server.post("/videos", async (req, res) => {
  try {
    const { blob, data } = req.body;
    const { id } = await admin.firestore().collection("videos").add({ blob, data });
    res.send({ id });
  } catch (error) {
    console.error(error);
    res.code(500).send({ error: "Internal server error" });
  }
});

server.get("/videos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const snapshot = await admin.firestore().collection("videos").doc(id).get();
    if (!snapshot.exists) {
      return res.code(404).send({ error: "Video not found" });
    }
    const { blob, data } = snapshot.data();
    const videoBlob = Buffer.from(blob, "base64");

    res.headers({
      "Content-Type": "video/mp4",
      "Content-Length": videoBlob.length,
    });

    res.send(videoBlob);
  } catch (error) {
    console.error(error);
    res.code(500).send({ error: "Internal server error" });
  }
});

server.get("/", async (request, reply) => {
  reply.code(200).send({ message: "Hello world!" });
});

server.listen(process.env.PORT || 8080, '0.0.0.0', (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
