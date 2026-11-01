// toon.gdshader - EXAMPLE ONLY. One possible look (palette lookup + banded light). Use it only if the user chose this look.
// Not copied by the scaffold. The project's real shaders follow _project/ART_DIRECTION.md; log each one in DECISIONS.md.
// WHAT:  reads color from a palette image and lights it in flat bands.
// USE:   make a ShaderMaterial with this shader and assign it to meshes that should use this look.
shader_type spatial;
render_mode diffuse_toon, specular_disabled;

uniform sampler2D palette : source_color, filter_nearest;   // palette image: one swatch per color
uniform vec4 tint : source_color = vec4(1.0);               // optional per-object tint (keep white by default)

void fragment() {
	ALBEDO = texture(palette, UV).rgb * tint.rgb;
	ROUGHNESS = 1.0;
}
