module.exports = function errorLogging() {
  return async (err, req, res, next) => {
    console.error('Unexpected error');
    console.error(err);
    return next(err);
  };
};
