import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken"

export const hashString = async (useValue) => {
  const salt = await bcrypt.getSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

// Compare string function
export const compareString = async (userPassword, password) => {
  const isMatch = await bcrypt.compare(userPassword, password);
  return isMatch;
}

// JSON webtoken
export function createJWT(id) {
  return JWT.sign({ userId: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "id",
  });
}