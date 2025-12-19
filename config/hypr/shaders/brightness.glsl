// Software brightness shader - instant response
precision highp float;
varying vec2 v_texcoord;
uniform sampler2D tex;

// Brightness value injected by sed replacement (0.0 to 1.0)
const float brightness = 1.0;

void main() {
    vec4 color = texture2D(tex, v_texcoord);

    // Apply brightness as a multiplier
    color.rgb *= brightness;

    gl_FragColor = color;
}
