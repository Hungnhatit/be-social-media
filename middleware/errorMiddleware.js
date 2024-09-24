// Error middleware, next function
// Xử lý các lỗi khác nhau và trả về phản hồi cho người dùng
const errorMiddleware = (err, req, res, next) => {
  // next: hàm chuyển tiếp đến lỗi đến middleware tiếp theo nếu cần
  // cấu trúc mặc định của lỗi
  const defaultError = {
    statusCode: 404,
    success: "failed",
    message: typeof err === "string" ? err : err.message,
  };

  if (err?.name === "ValidationError") {
    defaultError.statusCode = 404;
    defaultError.message = Object.values(err, errors)
      .map((el) => el.message)
      .join(",");
  }

  // duplicate error: xử lý lỗi trùng lặp dữ liệu
  if (err.code && err.code === 11000) {
    defaultError.statusCode = 400;
    defaultError.message = `${Object.values(
      err.keyValue
    )} field has to be unique`
  }

  res.status(defaultError.statusCode).json({
    success: defaultError.success,
    message: defaultError.message,
  });
}

export default errorMiddleware;

