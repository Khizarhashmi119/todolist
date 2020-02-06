module.exports = () => {
  let date = new Date();
  let option = {
    weekday: "long",
    day: "numeric",
    month: "long"
  };
  return date.toLocaleDateString("en-US", option);
};
