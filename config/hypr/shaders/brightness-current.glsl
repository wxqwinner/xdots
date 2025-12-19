precision highp float;
varying vec2 v_texcoord;
uniform sampler2D tex;

void main() {
    vec4 color = texture2D(tex, v_texcoord);

    // Apply brightness
    color.rgb *= 1.00;

    // Apply night light (warm tint)
    color.r = min(color.r * 1.1, 1.0);
    color.g = color.g * 0.95;
    color.b = color.b * 0.75;

    gl_FragColor = color;
}
