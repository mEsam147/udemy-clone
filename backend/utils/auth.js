const jwt = require("jsonwebtoken");

// Generate JWT token
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Send token via cookie
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, 
    sameSite: "lax",
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true; 
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
};


module.exports = {
  signToken,
  sendTokenResponse,

};
