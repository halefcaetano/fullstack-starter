const { io } = require("socket.io-client");
const WS = process.env.WS || "http://localhost:4000";

function makeClient() {
  return io(WS, {
    path: "/socket.io",
    reconnection: false,
    timeout: 6000,
  });
}

describe("Socket chat broadcast", () => {
  let a, b;

  afterEach(() => {
    if (a?.connected) a.disconnect();
    if (b?.connected) b.disconnect();
  });

  it("A sends -> A and B both receive", async () => {
    a = makeClient();
    b = makeClient();

    // wait for both to connect
    await Promise.all([
      new Promise((res, rej) => { a.on("connect", res); a.on("connect_error", rej); }),
      new Promise((res, rej) => { b.on("connect", res); b.on("connect_error", rej); }),
    ]);

    const text = `hello-from-jest-${Date.now()}`;

    const bothReceived = new Promise((resolve, reject) => {
      let gotA = false, gotB = false;
      const to = setTimeout(() => reject(new Error("timeout waiting for broadcast")), 6000);

      const check = () => {
        if (gotA && gotB) {
          clearTimeout(to);
          resolve(undefined);
        }
      };

      a.on("chat:message", (m) => { if (m?.text === text) { gotA = true; check(); } });
      b.on("chat:message", (m) => { if (m?.text === text) { gotB = true; check(); } });
    });

    a.emit("chat:message", { text });
    await bothReceived;
  }, 10000);
});
