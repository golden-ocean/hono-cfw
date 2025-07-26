export const generate_password = async (password: string) => {
  const salt = crypto.randomUUID();
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return { hash, salt };
};

export const verify_password = async (
  password: string,
  salt: string,
  hashed_password: string
) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const inputHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return inputHash === hashed_password;
};
