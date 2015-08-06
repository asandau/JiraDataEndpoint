function EPPromise() {
  this.callback = { "callback": undefined};
}
EPPromise.prototype.success = function(action) {
	this.callback.callback = action;
}
EPPromise.prototype.getCallback = function() {
	return this.callback;
}
module.exports = EPPromise