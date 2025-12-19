#!/bin/bash
# Instant software brightness via Hyprland shader
# Usage: set-brightness.sh <0-100>

BRIGHTNESS_PCT=${1:-100}
SHADER_DIR="$HOME/.config/hypr/shaders"
SHADER_FILE="$SHADER_DIR/brightness-current.glsl"
NIGHTLIGHT_ACTIVE="/tmp/ags-nightlight-active"

# Convert percentage to 0.0-1.0 range using awk (minimum 0.10 to avoid pure black)
BRIGHTNESS=$(awk "BEGIN {b=$BRIGHTNESS_PCT/100; if(b<0.1) b=0.1; printf \"%.2f\", b}")

# Check if night light is active to combine effects
if [ -f "$NIGHTLIGHT_ACTIVE" ]; then
    # Combined brightness + night light shader
    cat > "$SHADER_FILE" << EOF
precision highp float;
varying vec2 v_texcoord;
uniform sampler2D tex;

void main() {
    vec4 color = texture2D(tex, v_texcoord);

    // Apply brightness
    color.rgb *= $BRIGHTNESS;

    // Apply night light (warm tint)
    color.r = min(color.r * 1.1, 1.0);
    color.g = color.g * 0.95;
    color.b = color.b * 0.75;

    gl_FragColor = color;
}
EOF
    sync  # Ensure file is written before hyprctl reads it
    hyprctl keyword decoration:screen_shader "$SHADER_FILE"
else
    # Brightness only
    if [ "$BRIGHTNESS_PCT" -ge 100 ]; then
        # Full brightness = disable shader using Hyprland's empty syntax
        hyprctl keyword decoration:screen_shader '[[EMPTY]]'
        exit 0
    fi

    cat > "$SHADER_FILE" << EOF
precision highp float;
varying vec2 v_texcoord;
uniform sampler2D tex;

void main() {
    vec4 color = texture2D(tex, v_texcoord);
    color.rgb *= $BRIGHTNESS;
    gl_FragColor = color;
}
EOF
    sync  # Ensure file is written before hyprctl reads it
    hyprctl keyword decoration:screen_shader "$SHADER_FILE"
fi
