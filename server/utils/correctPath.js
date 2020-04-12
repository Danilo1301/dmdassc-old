module.exports.fix = function(req, res) {
  var url = req.originalUrl;
  while (url.endsWith("/")) { url = url.slice(0, url.length-1); }
  if(req.originalUrl != url) {
    res.redirect(url);
    return true;
  }
  return false;
};
