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
	
	this.sun = new AstralFeature([255, 153, 0], { Name: "Sol" });
	this.moon = new AstralFeature([51, 204, 255], { Name: "Lua" });
	this.mercury = new AstralFeature([0, 153, 0], { Name: "Mercúrio" });
	this.venus = new AstralFeature([255, 102, 255], { Name: "Venus" });
	this.mars = new AstralFeature([255, 0, 0], { Name: "Marte" });
	this.jupiter = new AstralFeature([153, 51, 153], { Name: "Júpiter" });
	this.saturn = new AstralFeature([0, 0, 1], { Name: "Saturno" });
	this.uranus = new AstralFeature([0, 153, 153], { Name: "Urano" });
	this.neptune = new AstralFeature([51, 51, 204], { Name: "Netuno" });
	this.pluto = new AstralFeature([102, 51, 0], { Name: "Plutão" });
	this.lunarnode = new AstralFeature([179, 179, 0], { Name: "Nodos Lunares" });	

	
	this.features = [this.sun, this.moon, this.mercury, this.venus, this.mars, this.jupiter, this.saturn, this.uranus, this.neptune, this.pluto, this.lunarnode];
}