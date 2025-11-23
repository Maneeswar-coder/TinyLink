import jwt from "jsonwebtoken";

export function signToken(data) {
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}
