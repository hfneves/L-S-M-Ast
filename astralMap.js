function AstralFeature(color, attrs) {
	this.enabled = false;
	this.angle = 0;
	this.color = color;
	this.attrs = attrs;
}

AstralFeature.prototype.enable = function(angle) {
	this.enabled = true;
	this.angle = angle;
}

AstralFeature.prototype.disable = function() {
	this.enabled = false;
	this.angle = 0;
}

AstralFeature.prototype.getWidth = function() {
	return Math.sin(this.angle * Math.PI / 180) * 0.7199;
}

AstralFeature.prototype.getHeight = function() {
		return Math.cos(this.angle * Math.PI / 180) * 0.7199;
}

function AstralMap(latitude, longitude) {
	this.latitude = latitude;
	this.longitude = longitude;
	
	this.moon = new AstralFeature([0, 20, 240], { Name: "Lua" });
	this.sun = new AstralFeature([226, 119, 40], { Name: "Sol" });
	
	this.features = [this.moon, this.sun];
}