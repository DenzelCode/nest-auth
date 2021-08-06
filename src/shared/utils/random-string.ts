export const randomString = (length = 60) => {
  let output = '';

  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    output += characters[Math.floor(Math.random() * length)];
  }

  return output;
};
