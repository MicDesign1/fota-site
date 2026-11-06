import modelLevel from "./modelLevel.js?v=20261106e";

addEventListener("message", ({ data }) => {
  const level = modelLevel(data);
  postMessage(level);
});
